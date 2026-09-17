---
title: Writing a New Task
---

# Writing a new task

A task for this pipeline is two pieces:

1. A **YAML config** (`long_tamp.config.yaml_loader` format) describing the scene: objects, their
   grasp/dock handles, the grippers involved, and which joints to freeze during planning.
2. A small **Python module** that subclasses `long_tamp.tasks.ManipulationTask`, points a
   `YamlTaskLoader` at that config, and defines a `GRASP_SEQUENCE` — the ordered list of
   `(handle, target)` pairs the phase graph should satisfy (`target=None` meaning release).

`plan.py` (`CubePickPlaceTask`) is the reference implementation — copy it as a starting point. Everything
downstream of a manifest (`replay.py`, `execute.py`, the dashboard, calibration, execution tuning) is
task-agnostic: it reads a `runs/<name>/` directory and doesn't know what produced it.

## Step 1: confirm the pipeline with a TCP reach

Before authoring a task, run `plan_tcp.py` — it proves the whole pipeline end to end with no task-specific
setup. See [Example: Cube Pick-and-Place](/task-and-motion-planning/example-walkthrough) for the command.

## Step 2: build your task

**The YAML config** follows `config/cube_pick_place.yaml`'s shape: object definitions (URDF/SRDF pair +
a handle with a `<mask>`, see below), the grippers involved, and `freeze_joints` for anything that stays
locked at its initial value for the whole plan.

**The task module:**

```python
from long_tamp.config.yaml_loader import YamlTaskLoader
from long_tamp.tasks import ManipulationTask

_YAML_PATH = _HERE / "config" / "my_task.yaml"
_loader = YamlTaskLoader(_YAML_PATH)

class MyTask(ManipulationTask):
    FREEZE_JOINT_SUBSTRINGS = [...]

    def __init__(self, backend="pyhpp", viewer_type="auto"):
        super().__init__(
            task_name="my task", backend=backend,
            FILE_PATHS=_loader.file_paths,
            joint_bounds=_loader.joint_bounds_class,
            viewer_type=viewer_type,
        )
        self.task_config = _loader.task_config
        self.use_factory = True

    def build_initial_config(self) -> list[float]:
        return _loader.build_initial_config(objects=self.task_config.OBJECTS)
```

Then define the phase sequence:

```python
GRASP_SEQUENCE: list[tuple[str, str | None]] = [
    ("so101/grasp", "cube/top"),      # pick up at A
    ("cube/foot",   "table/spot_b"),  # dock at B
    ("so101/grasp", None),            # release
]
```

**Two gotchas that make a phase graph invalid:**

- Don't narrow the loaded objects with `with_grasp_goals()`-style filtering unless every object you need
  in the graph is also a grasp target — `plan.py` keeps `table` in `OBJECTS` because it's only ever the
  handle side of a dock, never grasped, and filtering it out would remove `spot_b` from the graph too.
- Every object your gripper closes on needs an entry in `COLLISION_EXCLUSIONS` (rooted at the hand's own
  subtree, e.g. `wrist_roll`) — grasping requires the fingers to occupy the same space as the object, so
  without the exclusion every grasp pose is invalid by construction.

## Invoking it

While the task is new, use the generic escape hatch (no script changes needed):

```bash
./scripts/hpp_container.sh exec python3 -u -m soarm_tamp.plan_mytask --out runs/mytask01
```

Once stable, add a named subcommand to `scripts/hpp_container.sh` matching `plan`/`tcp`'s shape, then:

```bash
./scripts/hpp_container.sh mytask --out runs/mytask01
```

Output is the same manifest format `plan.py`/`plan_tcp.py` write — `replay.py`, `execute.py`, and the
dashboard consume it unchanged.

## 5-DOF grasp constraint

The SO-101 has five arm joints, so a full 6-DOF grasp constraint (six equations) is solvable only where
the system happens to be degenerate. A handle should free one rotational DOF — the reference cube handle
carries `<mask>1 1 1 1 1 0</mask>`, freeing rotation about the approach axis, the DOF a parallel-jaw grip
doesn't care about for a symmetric object. A 600k-sample sweep found ~170° of usable yaw at every candidate
grasp spot with this mask, so it costs no reachability.

## Reachable workspace

At x = 0.22 m with the hand vertical, IK solves for TCP z from 0.03–0.08 m and finds nothing at 0.10 m or
above; tilting the approach 30° off vertical finds nothing at any of those heights at that radius. The
verified top-down-reachable annulus (hand within 10° of vertical) is **radius 0.10–0.30 m** from the base
axis — keep new task geometry inside it.

## Execution tuning

Streaming a HPP-certified path to the servos open-loop isn't enough on its own — see
[TAMP planning & execution, step by step § 6](/deep-dives/tamp-pipeline) for the full incident and the
`--max-step`/`--servo-clamp`/`--sync-tol`/`--speed-scale` knobs it produced. Keep `--sync-tol` above
`--max-step` so the arm always chases a target slightly ahead of it instead of stopping at every waypoint.
`joint_test.py --single` isolates one joint to check its URDF-to-servo mapping independent of those knobs.

## Planning from where the arm actually is

```bash
python -m soarm_tamp.read_pose --port /dev/cu.usbmodemXXXX --out runs/start.json      # host
./scripts/hpp_container.sh tcp --start runs/start.json --xyz 0.22 0.0 0.08 --out runs/tcp06   # container
```

A plan whose first waypoint is the URDF zero pose assumes the arm starts there — it usually doesn't. With
`--start`, the leg from the arm's actual pose becomes part of the validated trajectory instead of an
unchecked gap before it. `plan.py` takes the same flag.

## Adding a dashboard tab for the new task

The dashboard's plan/replay/execute wiring is shared: every planning tab is a `Panel` built around one
`PlanControls` instance. A new tab follows `tcp.py`/`pickplace.py`'s shape:

```python
from soarm_sdk.dashboard.app import Panel
from ._common import Console, PlanControls

def build_mytask_panel(fk_update=None, fk_update_ghost=None) -> Panel:
    def _build(server, ctx) -> None:
        _build_mytask(server, ctx, fk_update, fk_update_ghost)
    return Panel("My Task", _build)

def _build_mytask(server, ctx, fk_update, fk_update_ghost=None) -> None:
    ...  # goal controls, a Plan button, PlanControls(...) wiring
```

Register it in `soarm_tamp/dashboard/app.py`'s `_register_plan_and_run(app)`:

```python
from .panels.mytask import build_mytask_panel
app.register(build_mytask_panel(fk_update=app.fk_update, fk_update_ghost=app.fk_update_ghost))
```

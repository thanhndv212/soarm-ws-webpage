---
title: "Example: Cube Pick-and-Place"
---

# Example: cube pick-and-place

The reference example: pick up a cube at point A and dock it at point B, a three-phase grasp sequence
(`GRASP_SEQUENCE` in `plan.py`):

```
1. so101/grasp -> cube/top       pick the cube up at A
2. cube/foot   -> table/spot_b   dock it onto the named spot at B
3. so101/grasp -> (release)      let go; the cube stays on its spot
```

Defined in `config/cube_pick_place.yaml` (the task config) and `plan.py` (the `CubePickPlaceTask` that
drives it) — see [Writing a New Task](/task-and-motion-planning/writing-a-new-task) for how those two
pieces work together.

## Physical setup

The arm is bolted to a flat surface (`z = 0`). The cube starts at **A = (0.22, −0.10)** and must end at
**B = (0.22, +0.10)**, both in meters in the robot base frame, both inside the verified top-down-reachable
annulus (radius 0.10–0.30 m).

Use a **30 mm** cube — matched to the jaws, not arbitrary: the planner freezes the jaw at 20° (36.5 mm
open, 6.5 mm clear of the cube) for approach; execution commands 5° (25.2 mm) to close — 4.8 mm past
contact, so the position-controlled servo grips by stalling against its torque limit rather than by
reaching a precise "closed" angle. Changing these constants needs
`python -m soarm_tamp.build_assets` to regenerate `generated/` before they take effect.

## Confirm the pipeline first: a TCP reach

Before running the full pick-and-place, `plan_tcp.py` proves the whole pipeline — container, planner,
manifest handoff, host execution — with no task-specific setup:

```bash
./scripts/hpp_container.sh tcp --out runs/tcp01 --xyz 0.22 0.0 0.05 --rpy 180 0 0
```

The default `--rpy 180 0 0` points the hand straight down; the default `--mask 111110` frees rotation
about the approach axis (five constraints on five joints — the SO-101 has 5 arm joints, so a full 6-DOF
grasp constraint is over-determined). Coverage across a reachability sweep: **17 of 20** top-down targets
plan successfully; the three failures are self-collisions at the tight end of the reach envelope, not a
missing planner fallback.

## Watching a run

```bash
./scripts/hpp_container.sh replay --run runs/tcp01 --follow   # container
python -m soarm_tamp.execute runs/tcp01 --port /dev/cu...     # host
```

Start the follower first — it waits for the live command trace to appear and stops when the run reports
done. With no arm to hand, `--dry-run --pace` streams nothing to the servos but drives the mirror at true
speed.

## Status

Planned and dry-run verified (3 phases, 6 segments, 0 seam violations, 0 of 623 commands clamped) but
**not yet executed on the physical arm** — the "run on hardware" milestone documented in
[TAMP planning & execution, step by step](/deep-dives/tamp-pipeline) (7.0 mm / 2.2°) covers the generic
TCP-reach example, not this task. A manifest records a scene fingerprint of the task's constants (cube
size, grasp frame, pick/place points); `execute.py` refuses to run one whose fingerprint no longer matches
`geometry.py`.

## Extending this example

- **More cubes** — add another object to the YAML with its own handle and a `foot` gripper, and extend
  `GRASP_SEQUENCE` in `plan.py`.
- **More destinations** — add handles to `table.srdf` (`spot_c`, …) and the matching `valid_pairs` entries.
- **Stacking** — put the destination handle on a cube rather than the table; the "place at a named spot"
  mechanism doesn't care whether the spot is furniture or another block.

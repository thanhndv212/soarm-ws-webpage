---
title: "TAMP planning & execution, step by step"
---

# TAMP planning & execution, step by step

*(on hardware)*

The third way of moving the arm is *deliberative* rather than reactive: given a goal, compute a full
collision-checked trajectory once, then execute it open-loop with the machinery needed to actually get it onto a
real servo bus — no human operator after the goal is set, no learned policy, no MuJoCo/GPU training involved at
all. `soarm_tamp` plans with [long_tamp](https://github.com/thanhndv212/long-tamp), a constraint-graph
task-and-motion planner built on [HPP](https://github.com/humanoid-path-planner) (the Humanoid Path Planner), and
is deliberately split across a process boundary: `pyhpp` exists only inside an HPP container, the servos exist
only on the host, and the only thing that crosses between them is a waypoint manifest on disk. Unlike the RL track,
this one has already put the physical arm through a full pick-and-place, and the numbers below are measured on
that arm, not simulated.

| Stage | State |
|---|---|
| Scene, grasp semantics, masked 5-DOF handle | working |
| Planning — 3 phases, 6 segments, 0 seam violations | working |
| Trajectory within servo-reachable bounds | verified, 0 clamped |
| TCP-pose reach (`plan_tcp.py`) | 0.0000 mm goal error |
| Live Viser mirror of a run (`replay.py --follow`) | working |
| **Run on hardware** | **TCP within 7.0 mm / 2.2°** |
| Joint sign calibration | validated on the arm |

The first live attempt drove the hand into the table — the plan was fine, every waypoint HPP certified
collision-free, but streaming waypoints at a fixed rate is not the same thing as making the arm follow them. Stages
5 and 6 below exist because of that run.

![soarm_tamp pipeline: scene and grasp semantics, HPP constraint-graph planning, waypoint manifest, dashboard preview with a ghost mesh, servo-limit safety preflight, streamed execution with sync and gripper-hold handling](/img/soarm_ws_tamp_pipeline.svg)

## 1. Scene & grasp semantics

*`config/cube_pick_place.yaml`, `geometry.py` — container*

The task: pick a cube from A and place it at B. The SO-101 has five arm joints, so a full 6-DOF grasp constraint is
six equations on five unknowns — solvable only where the system happens to be degenerate. The cube's handle
carries `<mask>1 1 1 1 1 0</mask>`, freeing rotation about the approach axis — the one DOF a parallel-jaw grip on a
cube never cares about. A 600k-sample sweep found ~170° of usable yaw at every candidate spot, so this costs
nothing in reachability. The cube size (25 mm) isn't arbitrary either — the jaw has 29 mm of clearance to approach
it and 19.8 mm of room to squeeze past contact, measured against the gripper's own opening curve.

## 2. HPP constraint-graph planning

*`plan.py`, `plan_tcp.py` — `GraspSequencePlanner.plan_loop()`, container*

A phase graph is built scoped to whichever grasps are currently held, and each edge is planned through the library
rather than as a raw straight line: projection onto the edge's constraint leaf, a direct path tried first with a
sampling planner behind it, the YAML's own optimizer stack, and time parameterization. The difference between
going through the graph and a raw direct path is visible in the manifest for the exact same motion:

| | waypoints | per-step joint delta |
|---|---|---|
| raw `ps.directPath` | 8 over 0.3146 rad | 0.157 rad × 7 — constant speed, instant start/stop |
| `plan_loop` | 28 over 1.3477 s | 0.000 → 0.114 → 0.000 rad — a symmetric ramp |

A time-parameterized segment is marked as such in the manifest, and `execute.py` replays its waypoint spacing as
time rather than flattening it to a constant rate — measured on the same plan: 1.4 s replaying the real profile
against 2.5 s flattened. Coverage across a top-down reachability sweep is 17 of 20 targets; the three failures are
all self-collisions (`shoulder_link` vs `gripper_link`) at the tight end of the reach envelope, not a missing
planner fallback.

## 3. Waypoint manifest

*`runs/<name>/manifest.json` — the only channel between container and host*

Planning and execution deliberately never share a process: `pyhpp` exists only inside the HPP container, the
servos exist only on the host. The container bind-mounts the workspace, so a plain file is the whole contract in
both directions — the same shape is reused for the live command trace in stage 4, rather than inventing a second
channel for it.

## 4. Dashboard preview

*`replay.py`, the TAMP dashboard's Plan/TCP tabs — Viser, host or container*

`execute.py` appends every command it issues to `<run>/live.jsonl`, and a follower tails that file to mirror a run
live, rendering only the newest command of each batch so the picture stays on the arm instead of drifting behind
it. The dashboard's own preview used to fight that live mirror for the same mesh — playing back a planned path and
watching the real arm move used to draw both through the same callback, so one visibly stole the other's pixels. A
second, independent ghost mesh now carries preview playback, and a persistent Catmull-Rom trail through the
gripper frame is drawn the moment a plan succeeds — a static "where was this supposed to go" reference that
survives past whatever the ghost or live mirror do next.

## 5. Safety preflight

*`conventions.phantom_range()`, `waypoints_beyond_servo_limits()` — host, before a single command is sent*

Every bound above this point — the calibration's travel, the planner's YAML — is a belief derived from the
calibration file. None of them ever asked the servo itself, which carries its own `MIN/MAX_ANGLE_LIMIT` in EEPROM
and enforces it beneath everything software can see. That gap is not theoretical: it let a real plan ask
`wrist_flex` to move 0.41 rad past what its servo would actually allow. Nothing errors when that happens — no
status flag, no current draw, the joint just stops contributing to the trajectory while every other joint keeps
going, which looks exactly like a badly-tuned, stuttering arm. `execute.py` now reads every servo's live EEPROM
limits and checks the manifest's own waypoints against them before streaming anything, and refuses the run —
naming the joint and the overshoot — the moment either the calibration or the connect-time check disagrees with
what the servo reports today.

## 6. Streamed execution

*`execute.py` — host, now a subprocess of the dashboard rather than a background thread*

Four knobs, previously conflated into one, now do four separate jobs — keeping the sync tolerance above the
sampling step means the arm never has to stop dead, it always chases a target a little ahead of it:

| knob | job | default |
|---|---|---|
| `--max-step` | how finely the path is sampled (fidelity) | 0.02 rad |
| `--servo-clamp` | how far the command may *lead* the measurement | 0.10 rad |
| `--sync-tol` | how far the arm may trail the stream | 0.08 rad |
| `--speed-scale` | GOAL_SPEED as a multiple of the plan's own velocity | 1.5 |

Measured across four hardware runs of the same motion, settling at speed rather than creeping closed the last
error a slow re-command cannot break stiction on: **0 of 57 waypoints stopped to wait, settled to 0.034 rad, 9.5 mm
TCP error** — against 7 of 7 stops and 7.0 mm error for the naive stop-at-every-waypoint version. Beyond timing,
three fixes came out of running this on real hardware rather than in simulation:

- **The gripper no longer reopens itself.** HPP treats a grasp as a rigid constraint, so the plan freezes the jaw
  angle at whatever it measured at the start pose, in every waypoint of every segment. `execute.py` injects the
  real open/close between segments, but the very next segment's own per-waypoint loop used to re-send its frozen
  value on its first command — undoing a close before the arm had moved at all with anything gripped. A tracked
  "current gripper angle" now overrides that frozen value on every command issued after a jaw action fires, and the
  jaw move itself waits for arrival rather than a flat `sleep(0.6)`.
- **A stalled joint stops the run instead of drifting further behind it.** A joint that cannot reach one waypoint
  within its sync timeout will not reach the next one either — each further waypoint just adds another whole step
  of unreachable distance on top of a gap that was never closing. Past 3× the sync tolerance the run now aborts
  outright, naming the worst joint, rather than continuing to stream commands into a trajectory nothing has
  collision-checked past that point.
- **The dashboard's own execution job runs as a real subprocess**, not an in-process background thread sharing the
  dashboard's GIL — the same few milliseconds of FK math and Viser network sends that keep the 3-D view live were
  blurring the servo bus's own 5 ms polling and wall-clock command pacing. The command trace this all feeds also
  moved off the control loop onto its own thread, since a bind-mounted filesystem can stall a write for tens of
  milliseconds at exactly the wrong moment.

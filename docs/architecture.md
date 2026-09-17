---
title: Architecture
---

# Architecture

![soarm-ws dependency graph](/img/soarm_ws_architecture.svg)

`imu_sdk` and the vendored `SO-ARM100` robot description feed into `m5teleop`, the integration point that runs the
real-time teleoperation loop — the five-stage pipeline broken down step by step in [Teleoperation control loop,
step by step](/deep-dives/teleoperation-loop). Recording is opt-in: pass `--record` and `m5teleop` hands frames to
`soarm_lerobot`, which buffers episodes into a LeRobotDataset for ACT / Diffusion Policy training — with no
import-level dependency back the other way.

`soarm_sdk` and `camera_calibration` are otherwise standalone: the former is a parallel, self-contained Feetech
servo SDK (used by its own calibration/dashboard tools, not currently wired into the teleop loop), the latter a
Rerun-based camera intrinsics/ArUco toolkit with no shared dependencies at all.

`soarm_tamp` is the third way of moving the arm — deliberative, plan-then-execute task-and-motion planning on top
of `long_tamp`/HPP, executing through `soarm_sdk`'s own `ServoRobot` and calibration layer rather than lerobot's
follower, with planning (inside an HPP container) and execution (on the host) deliberately kept in separate
processes joined only by a waypoint manifest on disk.

`soarm_mjlab` is the newest branch — RL training of SO-ARM100 in MuJoCo via [mjlab](https://github.com/mujocolab/mjlab),
still in progress, planned to deploy trained policies through the same `soarm_sdk.RobotInterface` that drives real
hardware.

---
title: Packages
---

# Packages

### soarm_sdk — *stable*

Python SDK for the Feetech STS/SCS serial bus servo protocol — port handling, packet framing, batch calibration
planning (ID reassignment, limits, torque, baud rate), and the tick↔radian conversion layer everything else builds
on. Ships a 7-tab Viser browser dashboard with live 3-D FK for homing, PID tuning, and monitoring. Its guided
calibration workflow now also tracks each servo's own EEPROM angle limits (refusing to connect if they drift from
what a calibration recorded), and can recentre a joint whose travel straddles the encoder's 4095/0 wrap directly
from the dashboard.

### imu_sdk — *stable*

Transport + firmware for M5StickC/ESP32 IMU boards (MPU6050/6500/6886/9250, 6- or 9-axis). Firmware streams JSON
over serial at ~100 Hz with on-device gyro bias calibration; orientation itself is computed host-side by
`m5teleop`'s error-state Kalman filter.

### m5teleop — *active*

The integration point: a 50 Hz real-time loop wiring IMU → ESKF → cascade orientation controller → IK
(pink/pinocchio) → the arm over lerobot's `SO100Follower`, with a parallel Viser sim and full Rerun logging.
`--record` optionally streams frames into `soarm_lerobot`.

### soarm_lerobot — *active*

Dataset recording and imitation-learning training. `TeleopRecorder` detects episode boundaries and writes
LeRobotDataset episodes; `dataset.py` loads them into normalized, chunked torch datasets for ACT and Diffusion
Policy. Operates purely on recorded data — decoupled from how it was captured.

### camera_calibration — *stable*

Standalone camera intrinsics and ArUco tooling: chessboard calibration, live detection monitor, marker generation,
webcam parameter estimation — a unified CLI, Rerun for all visualization (no `cv2.imshow`, works headless). Not
wired into the teleop pipeline; built for future eye-in-hand and workspace-calibration work.

### soarm_mjlab — *in progress*

RL training of SO-ARM100 in MuJoCo via [mjlab](https://github.com/mujocolab/mjlab), targeting deployment through
`soarm_sdk.RobotInterface` — the same interface real hardware uses, so a trained policy won't care whether it's
driving sim or the physical arm. The "Reach" task end to end, a CI-safe test pyramid (32 tests), and two-job CI/CD
are done (Phases 0–3). Tooling for a real training run is ready (Phase 4): a step-by-step
[rented-GPU guide](https://github.com/thanhndv212/soarm_mjlab/blob/main/docs/vast_ai_training.md) with Weights &
Biases tracking, and `scripts/push_to_hub.py` to publish a promoted checkpoint to the Hugging Face Hub — the run
itself and sim2real deployment (Phase 5) are still ahead. See the
[roadmap](https://github.com/thanhndv212/soarm-ws/blob/main/SOARM_MJLAB_ROADMAP.md).

### soarm_tamp — *on hardware*

Long-horizon task-and-motion planning on [long_tamp](https://github.com/thanhndv212/long-tamp)/HPP, driving the
physical SO-101 through `soarm_sdk`'s own `ServoRobot`. Planning (inside an HPP container) and execution (on the
host) deliberately never share a process — a waypoint manifest on disk is the entire contract between them. First
task, pick-and-place, has run end to end on hardware (TCP within 7.0 mm / 2.2° of the commanded pose); see
[TAMP planning & execution, step by step](/deep-dives/tamp-pipeline) for the full pipeline and the
safety/execution work that came out of running it for real.

### SO-ARM100 — *vendored, read-only*

The hardware vendor's repo ([TheRobotStudio](https://github.com/TheRobotStudio/SO-ARM100)), tracked as-is:
URDF/MJCF robot descriptions consumed by `soarm_sdk`'s dashboard and `m5teleop`'s IK solver, plus CAD, 3D-print
notes, and BOM/assembly docs for the physical arm.

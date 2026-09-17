---
title: Release Notes
---

# Release notes

Every package keeps its own `CHANGELOG.md` in [Keep a Changelog](https://keepachangelog.com/en/1.1.0/)
format — this page summarizes current status and links to each. Treat the linked file as authoritative;
this page is a snapshot.

| Package | Latest version | Currently unreleased / in progress |
|---|---|---|
| [`soarm_sdk`](https://github.com/thanhndv212/soarm_sdk/blob/main/CHANGELOG.md) | 0.4.0 | A dashboard-wide **Home** button (recovers a stuck arm to a known folded-flat pose) and **Shutdown** button |
| [`imu_sdk`](https://github.com/thanhndv212/imu_sdk/blob/main/CHANGELOG.md) | 0.2.0 | License file added; core `ImuReader`/`ImuData` and both firmware variants shipped in 0.1.0 |
| [`m5teleop`](https://github.com/thanhndv212/m5teleop/blob/main/CHANGELOG.md) | 0.1.0 | `ArmInterface` now delegates transport to `soarm_sdk` (`LeRobotRobot`/`NullRobot`) instead of wrapping lerobot directly; `--dry-run` now tracks commanded state instead of reporting zeros |
| [`soarm_lerobot`](https://github.com/thanhndv212/soarm_lerobot/blob/main/CHANGELOG.md) | 0.1.0 | License + packaging metadata added; recording/data pipeline shipped in 0.1.0, **training loops remain stubs** |
| [`camera_calibration`](https://github.com/thanhndv212/camera_calibration/blob/main/CHANGELOG.md) | 0.1.0 | License file added; calibration/detection/generation/estimation tooling shipped in 0.1.0 |
| [`soarm_mjlab`](https://github.com/thanhndv212/soarm_mjlab/blob/main/CHANGELOG.md) | 0.1.0 | Phase 0–1 scaffolding and the Reach task shipped; see [Roadmap](/reinforcement-learning/roadmap) for phase-by-phase status |
| [`soarm_tamp`](https://github.com/thanhndv212/soarm_tamp/blob/main/CHANGELOG.md) | 0.1.0 | Initial development — nothing released yet; dashboard `--rerun` flag and shared CLI wiring with `soarm_sdk.cli.dashboard` landed most recently |

## Notable cross-package changes

- **`m5teleop` ↔ `soarm_sdk` convergence:** `m5teleop`'s `ArmInterface` used to wrap lerobot's
  `SOFollower` directly; it now delegates to `soarm_sdk.LeRobotRobot`/`NullRobot`, so teleop's arm object
  satisfies the same `RobotInterface` a planner or an RL policy would drive — the two servo stacks in this
  workspace are no longer parallel implementations.
- **`soarm_sdk` joint-limit hardening:** EEPROM angle limits are now read and checked at connect time
  (`read_angle_limits()`), and `soarm-widen-limit` formalizes the procedure for correcting a limit that's
  narrower than the physical mechanism allows — see
  [Troubleshooting § A joint silently stops moving](/troubleshooting-and-faq#a-joint-silently-stops-moving-mid-trajectory-no-error).

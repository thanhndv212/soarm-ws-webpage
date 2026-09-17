---
title: Troubleshooting & FAQ
---

# Troubleshooting & FAQ

Real gotchas pulled from this workspace's own incident write-ups — not a generic checklist.

## A joint silently stops moving mid-trajectory, no error

**Symptom:** every other joint keeps going, only one stalls. No status flag, no current draw, nothing in
the logs.

**Cause:** the servo's own EEPROM `MIN/MAX_ANGLE_LIMIT` is stricter than what the calibration file or
planner believes. Software layers above the servo (calibration, planner YAML, URDF) are all *beliefs*
about where the mechanism stops — only the EEPROM register and the physical hard stop are real, and
nothing compares them by default. One real incident: a TCP plan asked `wrist_flex` to move 0.41 rad past
its actual EEPROM cap.

**Fix:** `execute.py` reads every servo's live EEPROM limits and checks the manifest's waypoints against
them before streaming anything — it now refuses the run and names the joint and overshoot. If you hit this
during development, `soarm-widen-limit` walks a limit outward (toward the URDF's own bound, never further)
in small steps while watching current, and records the result so future connects catch a mismatch
immediately. See `soarm_tamp/docs/joint-limits-architecture.md` for the full layer map.

## The arm sits at an arbitrary pose — never assume zero before enabling torque

The SO-101 doesn't return to a known pose when powered off. Before enabling torque on a freshly connected
arm, park it at a *measured* pose (or use a dashboard's **Home** button, which moves to a known folded-flat
pose via the arm's own calibration) rather than assuming it's near zero.

## IMU yaw drifts even after calibration

The gyro bias calibration at boot only removes a constant bias — see
[IMU Setup § Gyro bias calibration](/teleoperation/imu-setup#gyro-bias-calibration). If the device was
moved during the ~2.5 s calibration window, the bias estimate is wrong and drift will be visible;
power-cycle and keep it still. Beyond that, `m5teleop`'s ESKF corrects yaw *at rest* via ZARU — sustained
rotation can still drift, since there's no magnetometer fusion in the current pipeline. See
[Tuning Guide § Known limitations](/teleoperation/tuning-guide#known-limitations).

## Teleop arm oscillates, is sluggish, or won't track after zero-reset

These all have specific config knobs — see the full symptom → fix table in
[Teleoperation → Tuning Guide](/teleoperation/tuning-guide).

## Servo bus / hardware issues

- **Baud rate mismatch** — confirm controller and servos agree; some adapters top out below 1 Mbps.
- **Mixed firmware revisions** — update all servos to the same version before chaining them.
- **Power polarity** — double-check barrel jack wiring (5.5/2.1 mm vs. 5.5/2.5 mm) before powering up.
- **A joint moves the wrong direction** — direction signs are per-joint and must be verified against the
  physical robot: command +0.1 rad on each joint and confirm it moves the expected way
  (`soarm_sdk.conversions.SOARM100_DIRECTION_SIGNS`).

See [Specifications → Hardware](/specifications/hardware) for the full hardware reference.

## TAMP execution: arm drove into the table / joints fell out of sync

A HPP-certified collision-free plan is not automatically a plan the servos can *track* — streaming
waypoints at a fixed rate without waiting for arrival lets joints desynchronize from the checked path. This
is a real documented incident with the full root-cause and fix — see
[TAMP planning & execution, step by step § 6](/deep-dives/tamp-pipeline) and
`soarm_tamp/docs/execution-tuning.md` for the complete account, including why "settle slowly" makes the
last-centimeter error *worse*, not better.

## Calibrate before a first real run

Before running `m5teleop` or `soarm_tamp` against real hardware for the first time: calibrate the arm (see
[Quick Start → Calibration](/quick-start/calibration)), and confirm which serial port is the servo bus vs.
the IMU (`ls /dev/cu.usbserial-*` with only one plugged in at a time is the reliable way to tell them apart).

---
title: Running Teleop
---

# Running teleop

All modes run from `m5teleop/teleop.py`. See [Teleoperation control loop, step by step](/deep-dives/teleoperation-loop)
for what the loop actually does each tick.

## Dry-run (no hardware)

```bash
cd m5teleop
python teleop.py --dry-run
# opens http://localhost:8080 for the viser sim
```

## Simulation + IMU (no arm)

```bash
python teleop.py --no-rerun
# plug in the M5StickC with firmware flashed — port is auto-detected
```

## Full pipeline (hardware + simulation + logging)

```bash
ls /dev/cu.usbserial-*                       # find the port NOT used by the M5StickC
python teleop.py --servo-port /dev/cu.usbserial-XXXX
```

## Runtime controls

| Control | Action |
|---|---|
| BTN_A (side, on the IMU) | Toggle teleoperation on/off; auto zero-resets on activation |
| BTN_B (top) | Toggle gripper open/closed |
| **⊕ Zero IMU** (viser GUI) | Manual zero-reset — aligns the EE target to the current EE pose |
| Ctrl-C | Graceful shutdown |

## CLI flags

| Flag | Default | Description |
|---|---|---|
| `--imu-port` | auto-detect | M5StickC serial port |
| `--servo-port` | none | SO-101 servo bus port |
| `--dry-run` | off | Skip all serial; IMU feeds zeros |
| `--no-sim` | off | Disable the viser window |
| `--no-rerun` | off | Disable Rerun logging |
| `--no-rerun-spawn` | off | Don't auto-launch the Rerun viewer |
| `--hz` | 50 | Control loop frequency |
| `--record` | off | Stream frames to `soarm_lerobot`'s `TeleopRecorder` — see [Recording Demonstrations](/teleoperation/recording-demonstrations) |

**Before a first real run:** calibrate the SO-101 (see [Calibration](/quick-start/calibration)) and confirm
`--servo-port` with the arm plugged in — running against an uncalibrated or wrong-port arm is the most
common first-run failure.

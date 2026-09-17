---
title: Bringup & Dashboard
---

# Bringup & dashboard

`soarm_sdk` ships a browser-based operator dashboard built on [Viser](https://viser.studio), with live
3-D forward-kinematics visualization.

```bash
soarm-dashboard-setup --device /dev/ttyUSB0
# starts on http://localhost:8080 by default
```

`soarm-dashboard-calibration` launches the guided, four-step calibration workflow instead — see
[Calibration](/quick-start/calibration).

## The 7 tabs

| Tab | Description |
|---|---|
| **Start Up** | Connect/disconnect the polling thread; quick torque on/off; scan servos by ID range |
| **Homing Wizard** | Automatic motor-sweep ROM detection or manual hand-teach; writes offsets + angle limits to EEPROM; saves `soarm100_rom.json` |
| **PID Tuning** | Read/write P/D/I gains; step-response chart with a live 20 Hz position trace and automatic metrics |
| **Command Panel** | Per-joint position/speed/acceleration sliders; servo and wheel mode; sync-write to all joints |
| **Recorder** | Record joint trajectories from hardware to CSV; replay at configurable speed and loop count |
| **Monitor** | 20 s rolling charts (position + speed); joint telemetry table; temp/current health; full register inspector |
| **Reconfigure** | Calibration: scan, assign IDs, angle limits, acc/speed/mode/torque/baud; export/import register snapshots as JSON |

A shared sidebar (visible on every tab) holds serial device, baud rate, polling interval, and connection
status. Every dashboard also gets a **Home** button (moves the arm to a known folded-flat pose via its own
calibration) and a **Shutdown** button, by construction — no per-dashboard opt-in.

### 3-D FK visualization

When a URDF is available (default: `SO-ARM100/Simulation/SO101/so101_new_calib.urdf`), all link meshes load
into the Viser scene and update at ~3 Hz from live encoder positions (`yourdfpy` + `trimesh`):

```bash
pip install yourdfpy trimesh
```

### Homing Wizard

**Automatic mode** drives each joint in wheel mode, detects stall at both limits, records min/max ticks,
restores servo mode, and moves to midpoint — a **Dry-run** checkbox simulates the sweep with FK animation
without touching hardware. **Manual mode** disables torque so you can move joints by hand and record
min/max via per-joint buttons. Both modes share the same *Apply* (write EEPROM) and *Save JSON* actions.

### PID Tuning — step response

After writing new gains: set a step target, speed, acceleration, and duration; press **Send Step**; the
chart shows reference vs. actual position at 20 Hz and computes steady-state error, overshoot, peak time,
rise time, and settling time automatically.

### Monitor

Two 20-second rolling charts (position, speed) update every 100 ms from a shared buffer. Temperature and
current are sampled every 5th iteration to reduce bus load; the background daemon thread issues one
`GroupSyncRead` per interval for all joints in a single bus transaction, falling back to per-servo reads on
failure.

## Command-line tools

Installing `soarm_sdk` puts these on `$PATH`: `soarm-reconfigure` (and `--ui` for a guided text UI),
`soarm-dashboard-setup`, `soarm-dashboard-calibration`, `soarm-calibrate-rom`, `soarm-widen-limit`,
`soarm-monitor`.

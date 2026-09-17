---
title: Recording Demonstrations
---

# Recording demonstrations

Recording happens *inside* teleop — `soarm_lerobot` supplies the recorder, not a separate control loop.

```bash
cd m5teleop
python teleop.py --servo-port /dev/cu.usbserial-XXXX --record

# equivalent convenience wrapper (re-launches teleop.py --record under the hood):
soarm-record --repo-id thanhndv212/soarm100-teleop-v1 --task "pick the cube"
```

`soarm-record` flags: `--repo-id` (default `thanhndv212/soarm100-teleop-v1`), `--root` (default
`~/soarm_datasets/<repo-name>`), `--task`, `--fps` (default 50), `--imu-port`, `--servo-port`, `--dry-run`,
`--no-sim`, `--no-rerun` — all forwarded to `teleop.py` rather than duplicating its loop.

## How episodes are captured

- **Episode boundaries are BTN_A** on the M5StickC — the same button that toggles teleoperation on/off.
  Turning teleop on starts an episode; turning it off ends one.
- Recording runs at 50 Hz, matching the control loop.
- `TeleopRecorder` buffers per-frame joint, gripper, and task data, and writes completed episodes as a
  LeRobotDataset (parquet + metadata) — short or noisy episodes are discarded automatically.
- The `TeleopRecorder` import in `teleop.py` is wrapped in `try/except ImportError`: recording is an
  optional add-on, and teleop keeps running for anyone who hasn't installed `soarm_lerobot`.

## Where it goes next

Recorded episodes land in a `LeRobotDataset` under `--root`, ready for `soarm_lerobot`'s data pipeline —
see [Dataset Recording & Format](/imitation-learning/dataset-recording-and-format).

> **Frame note:** joint values recorded here come through teleop's `ArmInterface`, i.e. **lerobot's frame**
> — not the URDF frame `soarm_tamp` or `soarm_mjlab` use. Anything that later feeds a planner or a sim
> policy needs to go through `soarm_sdk.calibration.frame` first.

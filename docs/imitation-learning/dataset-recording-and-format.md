---
title: Dataset Recording & Format
---

# Dataset recording & format

Recording is covered in [Teleoperation → Recording Demonstrations](/teleoperation/recording-demonstrations)
— this page covers what `soarm_lerobot` does with the result.

## The data pipeline (`dataset.py`) — real, tested code

| Function/class | Role |
|---|---|
| `load_dataset(...)` | Open a `LeRobotDataset` by repo-id or local root |
| `compute_joint_stats(ds)` | Per-joint mean/std arrays |
| `JointNormalizer` | Normalize/denormalize joint vectors from those stats |
| `ChunkedActionDataset` | A `torch.utils.data.Dataset` yielding action chunks (the ACT window; `--chunk-size` default 100) |
| `create_dataloader(...)` | Batching on top of the above |

`recorder.py`'s `TeleopRecorder` (the only symbol re-exported at package level) buffers per-frame joint,
gripper, and task data from the teleop loop, detects episode boundaries from BTN_A toggling, and writes
LeRobotDataset episodes as parquet + metadata — discarding short or noisy episodes automatically.

## Package facts

- `soarm_lerobot` v0.1.0 · setuptools, flat layout · Python ≥3.10
- Hard dependencies: `numpy`, `torch>=2.0`, `lerobot>=0.4`, `datasets`
- Extras: `[train]` (diffusers, accelerate, wandb), `[dev]` (pytest, ruff)
- **No tests yet** — `tests/` contains only `__init__.py`; the data pipeline is pure torch/numpy and
  hardware-free, so it's straightforward to cover.

See [Training](/imitation-learning/training) for the current state of the training loops that would
consume this pipeline.

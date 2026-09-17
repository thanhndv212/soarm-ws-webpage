---
title: Software
---

# Software specifications

## Package version matrix

| Package | Version | Python | Install | Key deps |
|---|---|---|---|---|
| `soarm_sdk` | 0.4.0 | ≥3.9 | `pip install -e .` | `pyserial`; optional `viser`, `yourdfpy`, `trimesh` |
| `imu_sdk` | 0.2.0 | ≥3.10 | `pip install -e .` | `pyserial` |
| `m5teleop` | 0.1.0 | ≥3.10 | `pip install -e .` | `pinocchio` (conda-forge), `pin-pink`, `quadprog`, `viser`, `rerun-sdk`, lerobot |
| `soarm_lerobot` | 0.1.0 | ≥3.10 | `pip install -e .` | `numpy`, `torch>=2.0`, `lerobot>=0.4`, `datasets`; extras `[train]`, `[dev]` |
| `camera_calibration` | 0.1.0 | ≥3.10 | `pip install -e .` | `opencv-python>=4.7`, `numpy>=1.24`, `rerun-sdk>=0.22` |
| `soarm_mjlab` | 0.1.0 | ≥3.10 | `uv sync --extra cpu\|cu128` | `mjlab`, `mujoco-warp==3.10.0.3`, `torch` (CPU/CUDA routed by extra) |
| `soarm_tamp` | 0.1.0 | ≥3.11 | `pip install -e ".[host]"` (host) / container image (planning) | `soarm_sdk` (host); `long_tamp` + `pyhpp` (container) |

`soarm_mjlab` is the one package in the workspace installed with [uv](https://docs.astral.sh/uv/) instead
of plain pip — see [Workspace Installation](/quick-start/workspace-installation) for why. `soarm_tamp`
deliberately has no hard dependencies shared between its container (planning) and host (execution) sides —
see [Task & Motion Planning](/task-and-motion-planning).

## Licenses

| Package | License |
|---|---|
| `soarm_sdk` | MIT |
| `imu_sdk` | Apache-2.0 |
| `camera_calibration` | Apache-2.0 |
| `soarm_lerobot` | MIT |
| `soarm_tamp` | MIT |
| `soarm_mjlab` | MIT |

See [Open Source](/open-source) for the full picture, including workspace-level conventions.

## Where to find more

Every package keeps its own `CHANGELOG.md` (Keep a Changelog format) — see [Release Notes](/release-notes)
for a summary of what's currently unreleased/in progress in each.

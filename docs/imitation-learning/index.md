---
title: Imitation Learning
---

# Imitation learning

Record teleop demonstrations through `m5teleop --record`, then train ACT or Diffusion Policy models on the resulting LeRobotDataset — both consuming the vendored `SO-ARM100/Simulation` assets (URDF for FK, MJCF for physics).

> **Status:** the recording and data pipeline (`soarm_lerobot`) are real and tested-by-construction; the training loops are stubs. See [Training](/imitation-learning/training) for exactly what that means.

- [Dataset Recording & Format](/imitation-learning/dataset-recording-and-format) — `TeleopRecorder`, LeRobotDataset episodes, joint normalization, action chunking
- [Training](/imitation-learning/training) — `soarm-train act`/`soarm-train diffusion`, currently stubs

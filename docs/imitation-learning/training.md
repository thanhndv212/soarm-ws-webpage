---
title: Training
---

# Training

> **Status: the training CLI is a stub.** `soarm-train act` and `soarm-train diffusion` both print their
> hyperparameters and then exit with `"... training not yet implemented."` (a `TODO(build)` in each). The
> recording and data pipeline described in [Dataset Recording & Format](/imitation-learning/dataset-recording-and-format)
> is real; the training loops that would consume it are not. Do not report a trained imitation-learning
> policy from this package. RL training that *does* run end to end lives in `soarm_mjlab` — see
> [Reinforcement Learning & Simulation](/reinforcement-learning).

## Intended CLI shape (once implemented)

```bash
soarm-train {act,diffusion} --repo-id <repo> [--root PATH] \
    --epochs 500 --batch-size 64 --lr 1e-4 --chunk-size 100
```

Wiring up a real ACT training loop against the existing `ChunkedActionDataset`/`JointNormalizer` pipeline
is the obvious next step here — the data plumbing needed for it already exists and is tested-by-construction
(pure torch/numpy, no hardware).

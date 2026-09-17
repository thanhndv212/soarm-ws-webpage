---
title: Training Runs
---

# Training runs

## Local (CPU smoke tests)

```bash
make sync-cpu                                          # uv sync --extra cpu --group dev
uv run python scripts/list_envs.py                      # see registered tasks
uv run python scripts/train.py SoArm100-Reach --env.scene.num-envs=4 --agent.max-iterations=2 --gpu-ids None
```

This is the "pipeline doesn't crash" bar, not "the policy works" — CI runs the same shape (layers 1–4 of
the validation ladder) on every push.

## Real training runs (rented GPU)

`soarm_mjlab` has no local-GPU dependency: train on a rented box, tracked live via Weights & Biases (the
default logger), then play the checkpoint back locally on any machine.

**Instance sizing** (this task has no vision and a tiny 128×128×64 MLP — don't over-provision):

- **GPU:** RTX 3090/4090 or A4000/A5000 tier; skip A100/H100.
- **VRAM:** 16 GB comfortable, 24 GB gives headroom to push `num_envs` to 8192+.
- **vCPUs:** 4–8 — physics and PPO both run on GPU via `mujoco_warp`/torch.
- **Disk:** ~30 GB (repo + vendored meshes ≈ 20 MB; the rest is torch/CUDA wheels + checkpoints).
- Prefer **interruptible** pricing (checkpoints save every 100 iterations and resume via `--agent.resume`)
  unless you'd rather avoid dealing with preemption.

```bash
# One-time setup + W&B auth in one SSH round-trip:
WANDB_API_KEY=$(grep -A2 api.wandb.ai ~/.netrc | grep password | awk '{print $2}')
ssh -p <PORT> root@<HOST> "WANDB_API_KEY=$WANDB_API_KEY bash -s" < scripts/setup_remote.sh

# Launch inside tmux — SSH sessions drop, training must not die with them:
tmux new -s train
cd soarm_mjlab
uv run python scripts/train.py SoArm100-Reach --env.scene.num-envs=4096
```

Detach with `Ctrl-b d`; reattach with `tmux attach -t train`. The run's W&B URL (printed at startup) has
the reward curve and all `Episode_Reward`/`Episode_Termination`/`Metrics/ee_pose` scalars live.

**Decide the promotion bar before looking at the finished curve** — e.g. `episode_success ≥ 0.90` over the
last ~100 episodes, `joint_limit_violated ≈ 0`, small `position_error` relative to the target box. Set it
in `docs/vast_ai_training.md` step 7's shape, before the run finishes, not after.

**Retrieve and play back:**

```bash
uv run python scripts/play.py SoArm100-Reach --wandb-run-path <entity>/<project>/<run_id>
```

**Publish a promoted checkpoint** (only once it clears the bar):

```bash
uv run python scripts/push_to_hub.py --repo-id <user>/soarm100-reach --wandb-run-path <entity>/<project>/<run_id>
```

**Shut the instance down** — vast.ai bills while running, and *stopped* instances still bill for disk.
Destroy it once you have the checkpoint.

Full walkthrough (troubleshooting, cost notes, host selection): `soarm_mjlab/docs/vast_ai_training.md`.

## First campaign results (v1–v11)

11 runs on a rented RTX 3090 (`num_envs=4096`, `max_iterations=1500`), tracked in W&B project `mjlab`:

| | v1 (broken baseline) | v9 (best) |
|---|---|---|
| `episode_success` | 0% | ~30% avg, 75% peak |
| `position_error` | 0.34 m | 0.03–0.04 m |
| `orientation_error` | 2.12 rad | 0.7 rad (untracked by success) |

**Did not clear the ≥90% promotion bar.** The plateau reproduced identically at 56× the data (v11:
`num_envs=230,000`, 7.6B env steps), confirming it's a real limit of the current reward/action setup, not
a "needs more samples" problem. Untested leads for pushing past it: joint-velocity observation noise,
two-scale reward shaping, LR/action-scale annealing, performance-gated curriculum. See
`soarm_mjlab/docs/reach_training_debug_log.md` for the full v1–v12 tuning case study.

## Common tasks

```bash
make lint       # ruff check
make test-cpu   # pytest, forced CPU
make check      # lint + test-cpu
```

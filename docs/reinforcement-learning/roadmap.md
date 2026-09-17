---
title: Roadmap
---

# Roadmap

Status as of 2026-07-23 (see the live [`SOARM_MJLAB_ROADMAP.md`](https://github.com/thanhndv212/soarm-ws/blob/main/SOARM_MJLAB_ROADMAP.md)
for updates): **Phases 0–3 done, Phase 4 in progress.**

**Goal:** one sample task ("Reach") carried end-to-end through train → validate → sim-deploy → real
hardware, with scaffolding (CI, tests, config layering) built to hold a second and third task later
without rework.

| Phase | Status | What it covers |
|---|---|---|
| 0 — Repo scaffolding & DevOps baseline | ✅ Done | `uv`-based install (the one package in the workspace that isn't plain pip), CI, lint, changelog |
| 1 — Sample task MVP "Reach" | ✅ Done | Task directory shape, reward/observation/termination terms, `train.py`/`play.py` |
| 2 — Testing & validation strategy | ✅ Done | 7-layer test pyramid (see [RL training pipeline § 4](/deep-dives/rl-training-pipeline)) |
| 3 — CI/CD | ✅ Done | `fast` job (blocks merge, CPU, layers 1–4) + `train-smoke` job (post-merge, doesn't block) |
| 4 — Real training run & promotion criteria | 🔄 In progress | Tooling done (vast.ai guide, HF Hub publish script); first campaign (v1–v11) done but did not clear the ≥90% promotion bar |
| 5 — Sim2real deployment via `RobotInterface` | ⏳ Gated | Blocked on Phase 4 clearing its bar — nothing to deploy yet |
| 6 — Scale beyond Reach | ⏳ Gated, unscheduled | A second task only once Reach has cleared Phase 5 on real hardware |

## Deliberate deviations from `unitree_rl_mjlab`

The manager-based config split (task cfg / `mdp/` functions / per-robot asset module / task registry) is
copied as-is. Two things are **not**:

1. **No C++ deployment stack.** A 6-DOF arm's ~50 Hz control loop already runs comfortably in Python
   (`m5teleop/teleop.py`); a legged robot's balance controller needs the hard real-time guarantees a C++
   FSM provides, this arm doesn't.
2. **No terrain/locomotion machinery.** Terrain generators, height-scan sensors, gait/contact rewards, and
   push-perturbation events are locomotion-specific and dropped rather than carried as unused scaffolding.

## Phase 4 in detail

**Tooling (done):** `docs/vast_ai_training.md` (rent/run/retrieve on a rented GPU), `scripts/setup_remote.sh`
(idempotent one-time remote setup), `scripts/push_to_hub.py` (publish a promoted checkpoint to the HF Hub).
The promotion bar (`episode_success ≥ 0.90`, `joint_limit_violated ≈ 0`, small `position_error`) was
written down *before* the first campaign finished.

**First campaign (done, bar not cleared):** see [Training Runs](/reinforcement-learning/training-runs) for
the v1→v9 results table. The plateau (~30% success) reproduced at 56× the data, confirming it's a real
limit of the current reward/action setup rather than a sample-count problem.

**Remaining:** a later campaign starting from the v9 config and the debug log's open leads; only then does
`scripts/push_to_hub.py` get run against a real promoted checkpoint.

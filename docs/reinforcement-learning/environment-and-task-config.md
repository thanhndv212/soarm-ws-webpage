---
title: Environment & Task Config
---

# Environment & task config

`soarm_mjlab` follows the manager-based config pattern from `unitree_rl_mjlab`: a task is assembled from
independent observation/action/reward/termination/event *terms* rather than one monolithic environment
class. See [RL training pipeline, step by step](/deep-dives/rl-training-pipeline) for the tick-by-tick
mechanics — this page covers the task's directory shape.

## The `reach` task layout

```
soarm_mjlab/
├── assets/robots/so_arm100/
│   ├── so_arm100_constants.py    # STS3215 actuator gains, home keyframe, collision cfg
│   └── xmls/                     # MJCF + meshes, vendored from SO-ARM100/Simulation/SO101
├── tasks/reach/
│   ├── reach_env_cfg.py          # make_reach_env_cfg() factory
│   ├── mdp/
│   │   ├── observations.py       # ee_pose_error
│   │   ├── rewards.py            # distance_to_target
│   │   ├── terminations.py       # task_success, joint_limit_violated
│   │   └── commands.py           # UniformPoseCommand — random reachable target
│   ├── rl/runner.py
│   └── config/so_arm100/
│       ├── env_cfgs.py           # per-robot placeholder fill-in + play=True override
│       └── rl_cfg.py             # PPO hyperparams (RSL-RL)
```

The MJCF and meshes are vendored **directly into this package** (not referenced from the `SO-ARM100`
submodule at runtime) — cloning `soarm_mjlab` alone is enough to train.

## Adding a new task

The same `tasks/<name>/` shape (env cfg + `mdp/` + per-robot config + registry entry) repeats for a new
task — this is deliberately *not* built speculatively (see [Roadmap](/reinforcement-learning/roadmap)'s
Phase 6): a second task gets scaffolded only once Reach has cleared real-hardware deployment.

## Validation ladder

Before any checkpoint touches hardware, changes pass through a 7-layer test pyramid (unit tests →
config/asset validation → env smoke test → training smoke test → full training run → sim-replay validation
→ staged real-hardware validation) — see [RL training pipeline, step by step § 4](/deep-dives/rl-training-pipeline)
for the full table. Layers 1–4 run in CI on every push; layer 5+ is manual/GPU work, covered in
[Training Runs](/reinforcement-learning/training-runs).

---
title: "RL training pipeline, step by step"
---

# RL training pipeline, step by step

Teleoperation is *reactive and human-driven*: a person supplies the target every tick, a cascade PID tracks it.
`soarm_mjlab` is this workspace's second way of moving the arm — *reactive but learned*: a neural network policy,
trained by trial and error in MuJoCo, maps observations straight to joint targets with no explicit IK or controller
in the loop at inference time. The third way — *deliberative*, plan-then-execute task-and-motion planning — is
covered in [TAMP planning & execution, step by step](/deep-dives/tamp-pipeline), and unlike this one is already
running on the physical arm.

| Pipeline | Decision maker | Computed | Status |
|---|---|---|---|
| Teleoperation | human + cascade PID | every tick, 50 Hz | active |
| RL policy (this page) | PPO-trained network | every tick, sim @ training time | in progress |
| TAMP planning | HPP constraint-graph planner | once per goal, offline | on hardware |

`soarm_mjlab` follows the manager-based RL config pattern shared by Isaac Lab and
[unitree_rl_mjlab](https://github.com/unitreerobotics): a task is assembled from independent
observation/action/reward/termination/event *terms*, each a small typed function, rather than one monolithic
environment class. The whole loop below runs inside MuJoCo via [mjlab](https://github.com/mujocolab/mjlab), trains
with [RSL-RL](https://github.com/leggedrobotics/rsl_rl)'s PPO implementation, and — once a checkpoint clears
validation — is meant to deploy through the same `soarm_sdk.RobotInterface` that `m5teleop` already drives real
hardware with.

![soarm_mjlab RL training loop: task setup, rollout, PPO update, checkpoint, planned sim2real deploy](/img/soarm_ws_rl_pipeline.svg)

## 1. Task & command setup

*`soarm_mjlab/tasks/reach/reach_env_cfg.py`, `config/so_arm100/env_cfgs.py`*

The Reach task's target isn't a hand-picked box — it's derived from the robot itself. A throwaway MuJoCo model is
compiled once, 20,000 random joint configurations are sampled within the arm's hard limits, forward kinematics
gives the end-effector position for each, and after discarding near-ground samples the 10th–90th percentile box
per axis becomes the command-sampling range: a reliably reachable region instead of the full, mostly-unreachable-in-
practice workspace envelope. Every episode reset also applies domain randomization — joint positions offset ±0.1
rad from default, zero initial velocity — so the policy never sees the exact same start state twice.

```python
samples = rng.uniform(joint_ranges[:, 0], joint_ranges[:, 1], size=(20_000, ndof))
for i in range(20_000):
    data.qpos[:] = samples[i]
    mujoco.mj_kinematics(model, data)
    positions[i] = data.site_xpos[ee_site_id]

positions = positions[positions[:, 2] > min_ground_clearance]
lo, hi = np.percentile(positions, [10.0, 90.0], axis=0)   # → per-axis command range
```

## 2. Manager-based MDP tick

*`tasks/reach/mdp/{observations,rewards,terminations}.py`*

Every simulation step, five managers run in order: observations are assembled, the action term applies the
policy's output, physics steps, rewards are summed from independent terms, and terminations are checked.
Observations come in two flavors — an **actor** group with injected uniform noise (what the policy trains and
infers on, since real sensors are noisy) and a clean **critic** group (privileged, noise-free — the value function
can use ground truth because it never runs at deployment):

| Observation | Noise (actor) |
|---|---|
| `joint_pos_rel`, `joint_vel_rel` | ±0.01 rad, ±1.5 rad/s uniform |
| `target_pose` (commanded EE pose) | none |
| `ee_pose_error` | ±0.01 uniform |
| `last_action` | none |

The action term is a joint-position offset around each joint's default, and the reward is deliberately the
smallest set that produces a non-degenerate policy — orientation error is observed but not yet scored
(`orientation_weight=0.0`, raised only once orientation targets matter):

```text
r = −‖p_target − p_ee‖              (distance_to_target, position only today)
    − 0.01 · ‖a_t − a_{t−1}‖²      (action_rate_l2 — discourage jerky actions)
    − 10 · 1[near joint limit]      (joint_pos_limits penalty)

episode ends on:  time_out  |  task_success (‖error‖ < 0.03 m for 10 steps)
                 |  joint_limit_violated  |  ee_ground_collision (contact force > 10 N)
```

```python
def distance_to_target(env, command_name, asset_cfg):
    ee_pos_b, _ = subtract_frame_transforms(root_pos_w, root_quat_w, ee_pos_w, ee_quat_w)
    position_error = torch.norm(command[:, :3] - ee_pos_b, dim=-1)
    return -position_error          # reward is negative error, orientation_weight=0.0
```

## 3. PPO update

*`tasks/reach/config/so_arm100/rl_cfg.py`* — [RSL-RL](https://github.com/leggedrobotics/rsl_rl)

After collecting 24 steps of rollout per parallel environment, RSL-RL computes generalized advantage estimates and
updates a 3-layer (128, 128, 64) ELU actor-critic with the standard PPO clipped-surrogate objective, 5 epochs over
4 minibatches per update:

```text
Â_t = Σ_l (γλ)ˡ δ_{t+l}                  δ_t = r_t + γ V(s_{t+1}) − V(s_t)     (GAE, γ=0.99, λ=0.95)

r_t(θ) = π_θ(a_t|s_t) / π_θ_old(a_t|s_t)
L(θ)   = E_t[ min( r_t(θ) Â_t,  clip(r_t(θ), 1−ε, 1+ε) Â_t ) ]              (ε = clip_param = 0.2)
```

```python
algorithm=RslRlPpoAlgorithmCfg(
    clip_param=0.2, entropy_coef=0.005, gamma=0.99, lam=0.95,
    num_learning_epochs=5, num_mini_batches=4, learning_rate=1.0e-3,
    schedule="adaptive", desired_kl=0.01, max_grad_norm=1.0,
)
# actor/critic: hidden_dims=(128, 128, 64), activation="elu", obs_normalization=True
```

The learning rate adapts to keep the policy's KL divergence per update near `desired_kl` rather than using a fixed
schedule. CI's own training smoke tests run CPU-only (2 iterations, no GPU in the loop); a real run — thousands of
parallel envs, full iteration count — targets a rented GPU instead, since none of this workspace's own dev machines
has one. Weights & Biases tracking is on by default (reward curve, all episode termination/reward/metric scalars);
see the [vast.ai training guide](https://github.com/thanhndv212/soarm_mjlab/blob/main/docs/vast_ai_training.md) for
instance sizing and the full walkthrough.

## 4. Validation ladder — before any checkpoint touches hardware

*Test pyramid, shaped around one constraint: real physics and GPU training can't run in CI*

| Layer | Checks | Runs where |
|---|---|---|
| Unit tests | reward/observation/termination math, synthetic tensors, no MuJoCo | CI, every push |
| Config/asset validation | MJCF compiles, actuator regexes match joints, obs/action dims correct | CI, every push |
| Env smoke test | `reset()` + a few `step()`s, no NaN/Inf | CI, every push |
| Training smoke test | full RSL-RL wrapper → PPO update path, 2 iterations, CPU | CI, every push |
| Full training run | real hyperparameters, thousands of envs, tensorboard | manual / GPU runner |
| Sim-replay validation | checkpoint through the *deploy* code path, not the training wrapper | manual |
| Real-hardware validation | torque-limited dry run → supervised run → unattended soak test | manual, physical arm |

A checkpoint is promoted to real hardware only after clearing a numeric bar decided before the run (e.g. ≥90%
`task_success` over 100 held-out seeds) — set in advance so the goalposts can't move to match whatever the run
happened to produce.

## 5. Sim2real deployment — planned

*`deploy/reach_policy_runner.py` — not yet written*

The deployment script is designed to be trivial by construction: it loads a promoted checkpoint and calls the same
`RobotInterface` protocol regardless of whether the concrete implementation underneath is a MuJoCo
`SimRobotInterface` or `soarm_sdk.ServoRobot` talking to the real bus — one code path, no train/deploy consistency
problem to solve because there's only one implementation. Unlike a legged robot's balance controller, a 6-DOF arm's
~50 Hz loop already runs comfortably in Python, so there's deliberately no C++ deployment stack to maintain in
parallel. Promotion already has a publish step ready ahead of this script: `scripts/push_to_hub.py` pushes a
promoted checkpoint (ONNX export, resolved configs, a generated model card with training provenance) to a Hugging
Face Hub model repo, so this deployment script — or anyone else — can load one without needing access to the
original training run.

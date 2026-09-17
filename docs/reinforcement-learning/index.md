---
title: Reinforcement Learning & Simulation
---

# Reinforcement learning & simulation

Reinforcement learning (`soarm_mjlab`, in progress) trains in MuJoCo via [mjlab](https://github.com/mujocolab/mjlab), following the manager-based config pattern from [unitree_rl_mjlab](https://github.com/unitreerobotics) — no C++ deployment stack or terrain/locomotion machinery, since a 6-DOF arm's control loop already runs comfortably in Python at ~50 Hz. Deploys through `soarm_sdk.RobotInterface` so trained policies drive sim and real hardware identically. See [RL training pipeline, step by step](/deep-dives/rl-training-pipeline) for the full algorithmic walkthrough.

Beyond this workspace's own tracks, the broader SO-ARM ecosystem has useful options worth knowing about if you want to go further in a given direction: [MoveIt](https://moveit.picknik.ai/)/OMPL for classical motion planning, [ros2_so_arm100](https://github.com/JafarAbdi/ros2_so_arm100) for a ROS2 description/control bring-up, [IsaacSim/IsaacLab](https://wiki.seeedstudio.com/lerobot_so100m_isaacsim/) for GPU-accelerated, photorealistic RL at larger scale.

> **Status:** Phases 0–3 done, Phase 4 (real training run) in progress — the first campaign didn't clear the promotion bar yet. See [Roadmap](/reinforcement-learning/roadmap) for the phase-by-phase detail.

- [Environment & Task Config](/reinforcement-learning/environment-and-task-config) — MDP terms, rewards/observations, adding a new task
- [Training Runs](/reinforcement-learning/training-runs) — local CPU smoke tests, vast.ai GPU campaigns, the v1–v11 results
- [Roadmap](/reinforcement-learning/roadmap) — phase-by-phase status

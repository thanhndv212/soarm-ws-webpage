---
title: Introduction
slug: /
---

# soarm-ws: a full-stack workspace for SO-ARM100 manipulator research

[SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100) (and its SO-ARM101 refresh) is an open-source 6-DOF
manipulator that anchors a growing community of full-stack robotics work: teleoperation, imitation learning, and
reinforcement learning, all on hardware you can 3D-print yourself. `soarm-ws` is an ongoing, modular workspace for
that stack — a thin umbrella repository over independently-versioned packages, each its own GitHub remote tracked
as a git submodule, with no shared build system forcing them into lockstep. That structure is deliberate: hardware
transport (servo and IMU SDKs), the teleoperation loop, dataset recording, camera tooling, task-and-motion planning,
and simulation/RL training all evolve at different speeds, and keeping them decoupled means a change in one doesn't
force a release of the others.

This site tracks the workspace as it stands today, and will keep changing as the packages do.

## Three ways of moving the arm

| Pipeline | Decision maker | Computed | Status |
|---|---|---|---|
| [Teleoperation](/deep-dives/teleoperation-loop) | human + cascade PID | every tick, 50 Hz | active |
| [RL policy](/deep-dives/rl-training-pipeline) | PPO-trained network | every tick, sim @ training time | in progress |
| [TAMP planning](/deep-dives/tamp-pipeline) | HPP constraint-graph planner | once per goal, offline | on hardware |

See [Architecture](/architecture) for how the packages fit together, and [Packages](/packages) for what each one does.

## Where to go next

- New to the workspace → [Quick Start](/quick-start/getting-your-so-101)
- Want the algorithmic detail behind teleop / RL / TAMP → [Deep Dives](/deep-dives/teleoperation-loop)
- Looking for servo/joint specs → [Specifications](/specifications/hardware)
- Something's not working → [Troubleshooting & FAQ](/troubleshooting-and-faq)

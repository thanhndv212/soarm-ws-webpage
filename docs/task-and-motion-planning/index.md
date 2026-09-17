---
title: Task & Motion Planning
---

# Task & motion planning

`soarm_tamp` designs, builds, and validates a long-horizon TAMP mission (`long_tamp` on HPP) on the
physical SO-101: plan in the HPP container, then execute and watch it run on the host. See
[TAMP planning & execution, step by step](/deep-dives/tamp-pipeline) for the full algorithmic walkthrough —
this section is the operational how-to counterpart.

It ships two worked examples: a minimal single-goal reach (`plan_tcp.py`) and a full grasp-sequence
pick-and-place (`plan.py`). The pick-and-place is the reference example — see
[Example: Cube Pick-and-Place](/task-and-motion-planning/example-walkthrough).

## Installation

Planning and execution deliberately run in environments that don't share a dependency set:

| Side | Needs | How |
|---|---|---|
| Container (planning) | `long_tamp` + `pyhpp` | built into the image `scripts/hpp_container.sh` manages |
| Host (execution + dashboard) | `soarm_sdk` | `pip install soarm_tamp[host]` |

```bash
pip install -e ".[host]"   # from a checkout, host-side
```

## Calibration is a prerequisite, not a stage

The planning URDF, `soarm_sdk`, and lerobot each use a different joint-angle zero. That mapping is measured
once per arm — see [Calibration](/quick-start/calibration) — and consumed read-only here. `soarm_tamp`'s
dashboard has an **Execution Watchdog** that flags calibration/model drift before you plan.

## Sub-pages

- [Dashboard](/task-and-motion-planning/dashboard) — the Viser plan-and-run UI
- [Example: Cube Pick-and-Place](/task-and-motion-planning/example-walkthrough) — the reference task, end to end
- [Writing a New Task](/task-and-motion-planning/writing-a-new-task) — the two-piece shape (YAML config + task module) for building your own

---
title: Workspace Installation
---

# Workspace installation

Clone the workspace with all submodules:

```bash
git clone --recurse-submodules https://github.com/thanhndv212/soarm-ws.git
cd soarm-ws
```

Each package installs independently — `pip install -e .` is the default:

```bash
cd soarm_sdk && pip install -e .
cd ../imu_sdk && pip install -e .
cd ../m5teleop && pip install -e .
cd ../soarm_lerobot && pip install -e .
cd ../camera_calibration && pip install -e .
```

`soarm_mjlab` is the one exception — it uses [uv](https://docs.astral.sh/uv/) because `mjlab` gates `torch` behind
mutually-exclusive CPU/CUDA extras routed to different package indices, which plain pip can't express:

```bash
cd soarm_mjlab
make sync-cpu   # or: uv sync --extra cpu --group dev
```

`soarm_tamp` installs like the rest on the host side, but planning needs the separate HPP container (its own
image, not pip-installable) since `pyhpp` only exists there:

```bash
cd soarm_tamp && pip install -e .
./scripts/hpp_container.sh plan --out runs/cube01 --viewer none   # container
python -m soarm_tamp.execute runs/cube01 --dry-run                # host
```

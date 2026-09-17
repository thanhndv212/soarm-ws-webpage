---
title: Open Source
---

# Open source

## Licenses

| Package | License |
|---|---|
| `soarm_sdk` | MIT |
| `imu_sdk` | Apache-2.0 |
| `camera_calibration` | Apache-2.0 |
| `soarm_lerobot` | MIT |
| `soarm_tamp` | MIT |
| `soarm_mjlab` | MIT |
| `SO-ARM100` (vendored) | see [upstream repo](https://github.com/TheRobotStudio/SO-ARM100) |
| This site | [CC BY-SA 4.0](http://creativecommons.org/licenses/by-sa/4.0/) |

## Workspace conventions

`soarm-ws` is a thin umbrella repository over independently-versioned packages, each its own GitHub remote
tracked as a git submodule — no shared build system forces them into lockstep. See
[Architecture](/architecture) for why that structure is deliberate, and
[Workspace Installation](/quick-start/workspace-installation) for the submodule clone/install workflow.

### Agent skills

The workspace ships a set of [Claude Code skills](https://github.com/thanhndv212/soarm-ws/tree/main/skills)
— one per submodule, a router (`soarm-start`), and a dedicated calibration skill — so a session can find
the right context without re-deriving the workspace layout by hand. Two conventions worth knowing if you're
contributing:

- Skills are **mirrored file-for-file** into `.claude/skills/` and `.github/skills/`; a change to `skills/`
  gets copied into both mirrors in the same commit.
- Skills are kept **factual about state**, including what's *not* implemented — e.g. `soarm-lerobot`'s
  documented training stubs (see [Imitation Learning → Training](/imitation-learning/training)) and
  `soarm-mjlab`'s unimplemented deploy phase (see [Roadmap](/reinforcement-learning/roadmap)). A skill (or
  a doc) that overstates readiness is treated as worse than none.

## Contributing

Each package is installed and tested independently — see that package's own `README.md`/`CHANGELOG.md` as
the source of truth (this site links to them throughout rather than duplicating their content). Lint and
test commands follow the same pattern per package, typically:

```bash
ruff check <package>       # lint
pytest                      # tests
```

`soarm_mjlab` additionally has `make lint`/`make test`/`make check` wrapping the same tools.

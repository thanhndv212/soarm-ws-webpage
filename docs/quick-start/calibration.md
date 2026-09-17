---
title: Calibration
---

# Calibration

Calibration maps this arm's raw servo ticks to the planning URDF's frame. It belongs to `soarm_sdk` — a
one-time, per-arm prerequisite done before working with teleop, RL, or TAMP, not a pipeline stage of any
of them.

```bash
soarm-dashboard-calibration --device /dev/cu.usbmodemXXXX --stream
```

## Safety rules

- Never command the physical arm until the operator confirms it's clear and the joint being moved is safe.
- Raw ticks, lerobot-normalized values, and URDF radians are distinct frames — every recorded value states
  which one it's in.
- Never infer a zero from a ROM-sweep midpoint on an asymmetric mechanism.
- Never mark a joint `reference_pose`-calibrated unless the selected pose explicitly covers that joint.
- Acceptance tolerances must be set explicitly per arm — no code path infers one. The dashboard pre-fills
  suggested starting values (3° pose repeatability, 3° model deviation, 30-tick ROM repeatability) as a
  form default for the operator to review and commit, never as a silent fallback.
- A failed validation step preserves the prior saved calibration.

## The procedure

The Calibration tab is one linear pass: a live arm-state panel, then six numbered steps. The acceptance
record in Step 6 grades the evidence each step produces and names which folder to reopen if a row is
blocked.

0. **Load and inspect.** Confirm the SO-101 URDF, calibration path, arm ID, and servo IDs; connect and
   confirm the 3-D mirror shows live readings.
1. **Record acceptance tolerances.** Set reference-pose repeatability, model-deviation watchdog threshold,
   and ROM endpoint repeatability explicitly. Nothing downstream can be graded until these exist.
2. **Verify direction signs.** Jog one joint at a time by a small safe amount; confirm the physical and
   URDF model motions match, and record the check.
3. **Measure ROM.** Run an automatic sweep (with clearance and approval) or record endpoints manually.
   Stores `tick_min`/`tick_max` as hardware facts — doesn't change zero offsets.
4. **Pin reference-pose zeros.** Physically establish a named pose (e.g. `folded_flat`, which covers
   `shoulder_lift` and `elbow_flex` only), wait for stability, capture samples, and re-zero only the
   joints that pose covers.
5. **Nudge a single zero** (optional). Only when one joint is visibly off after step 4, and only against
   an independent measurement — this discards that joint's pose provenance.
6. **Review the report.** Must pass explicit tolerances, signs, ROM, zero-source provenance, and
   reference-pose repeatability before it's accepted.
7. **Save and archive.** The dashboard backs up the previous calibration before writing, and refuses to
   write while any row is blocked.
8. **Use in TAMP.** `soarm_tamp` consumes the saved calibration read-only; its Execution Watchdog can
   block planning/execution on large model/real-arm deviations — fix calibration here, not in TAMP.

## What's automated vs. manual

Automated: ROM measurement, stability sampling, validation, provenance capture, backup, reporting, and
effective-bound calculation. Kept manual, deliberately: sign semantics, physical reference-pose placement,
and safety-clearance approval.

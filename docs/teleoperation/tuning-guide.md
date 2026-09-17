---
title: Tuning Guide
---

# Tuning guide

All tunable parameters live in `m5teleop/m5teleop/config.py`.

| Group | Parameter | Default | Description |
|---|---|---|---|
| EKF | `EKF_SIGMA_GYRO` | 0.005 rad/s | Gyro noise std |
| EKF | `EKF_SIGMA_BIAS` | 0.0001 rad/s² | Bias-drift noise std |
| EKF | `EKF_SIGMA_ACC` | 0.05 g | Accelerometer noise std |
| EKF | `EKF_ACC_GATE` | 0.30 g | Skip accel update if `\|‖a‖−1\| >` this |
| EKF | `EKF_ZARU_THRESHOLD` | 0.08 rad/s | ZARU active when `\|ω\| <` this |
| EKF | `EKF_SIGMA_ZARU` | 0.02 rad/s | ZARU measurement noise |
| Controller | `ORIENT_KP_OUTER` | 2.5 /s | Outer error→ω gain |
| Controller | `ORIENT_KP_INNER` | 0.5 | Inner velocity-error gain |
| Controller | `ORIENT_MAX_OMEGA` | 1.2 rad/s | Output clamp |
| IK | `POSTURE_COST` | 0.1 | Neutral-pose regularization |
| Loop | `CONTROL_HZ` | 50 | Loop rate |

## Symptom → fix

- **Arm oscillates / overshoots** → lower `ORIENT_KP_OUTER` (e.g. 1.5) or `ORIENT_MAX_OMEGA`.
- **Arm too sluggish** → raise `ORIENT_KP_OUTER`; if still slow, raise `ORIENT_KP_INNER`.
- **Small tremors when holding still** → raise `EKF_ZARU_THRESHOLD` to suppress more motion, or lower
  `EKF_SIGMA_ZARU` to trust ZARU more.
- **EKF yaw drifts in the controller** → confirm ZARU is active (`|ω| < EKF_ZARU_THRESHOLD` while
  stationary); raise `EKF_SIGMA_GYRO` if the gyro is noisier than expected.
- **IK jumps to strange poses** → increase `POSTURE_COST`.
- **Servo overload warning** → lower `MAX_RELATIVE_TARGET`.
- **Tracking error stays large after zero-reset** → confirm the console prints `[OrientController] Zero
  reset`; if not, the `on_zero_reset` callback isn't wired up.

## Automated EKF tuning (`tune_ekf.py`)

Rather than hand-tuning the EKF constants, `m5teleop/tune_ekf.py` finds the parameter set that minimizes
stationary yaw drift and pitch/roll error:

| Mode | Description |
|---|---|
| `live` | Stream live orientation/bias/ZARU status in real time |
| `stationary` | Record N seconds of still data; score the current `config.py` |
| `sweep` | Grid-search ~240 combinations offline; print the top 5 + a config snippet |
| `optimize` | Nelder-Mead fine-tune from the sweep winner (requires `scipy`) |

Recommended offline workflow:

```bash
cd m5teleop
python tune_ekf.py stationary --duration 90 --save rec.npz   # 1. record (device must be still)
python tune_ekf.py sweep --load rec.npz                       # 2. grid search
python tune_ekf.py optimize --load rec.npz                    # 3. fine-tune (optional)
```

No hardware handy? `--dry-run` runs any of the above against synthetic bias data.

On a synthetic benchmark (1.5 dps Z-axis bias, 30 s), a sweep improved score from 15.77 to 7.18 — yaw drift
from 4.4°/min down to 1.6°/min.

## Known limitations

- No magnetometer fusion — yaw can still drift during *sustained* rotation; ZARU only corrects bias while
  the device is at rest. For long sessions, an external heading reference (e.g. an ArUco marker) would be
  needed.
- Linear position teleoperation isn't implemented — the controller drives orientation only; the
  end-effector position stays at its value from the last zero-reset.

---
title: Servo Control Table (STS3215)
---

# STS3215 servo control table

A general reference for the Feetech STS3215 serial bus servo's memory map — every SO-101 joint uses one
of these. This is the *generic* register set (same for any STS3215), not a live reading from a specific
arm; addresses and field meanings below are the ones `soarm_sdk` actually reads and writes
(`soarm_sdk.protocol.registers`), cross-referenced against Feetech's published memory table.

The memory is split into two regions with very different write semantics:

- **EEPROM** — persists across power cycles. Writable only while `Lock` (addr 55, in SRAM) is set to `0`;
  writing through EEPROM wear-levels far fewer times than SRAM, so these are meant to be set once at
  bench-configuration time, not every control tick.
- **SRAM** — volatile, resets to firmware defaults on power-cycle. This is where `soarm_sdk`'s control
  loop writes goal position every tick and reads present position/speed/load back.

## EEPROM — read-only

| Addr | Size | Name | Meaning |
|---:|---:|---|---|
| 3–4 | 2 | Model Number | Servo model ID, set at the factory |

## EEPROM — read/write

| Addr | Size | Name | Range / units | Meaning |
|---:|---:|---|---|---|
| 5 | 1 | ID | 0–253 (254 = broadcast) | Servo bus address. `soarm_sdk.bus.discovery` scans this range to find connected servos |
| 6 | 1 | Baud Rate | code 0–7 | See [baud rate codes](#baud-rate-codes) below |
| 9–10 | 2 | Min Angle Limit | ticks, 0–4095 | Software-enforced lower position bound, firmware-side |
| 11–12 | 2 | Max Angle Limit | ticks, 0–4095 | Software-enforced upper position bound, firmware-side. Both limits are read by `soarm_sdk.ServoHardwareInterface.read_angle_limits()` and are the ultimate authority on how far a joint can move — a planner or calibration file can *believe* a wider range, but the servo will silently refuse to go past this one (see [Troubleshooting § A joint silently stops moving](/troubleshooting-and-faq#a-joint-silently-stops-moving-mid-trajectory-no-error)) |
| 21 | 1 | P Coefficient | 0–254, default ~32 | Position-loop proportional gain |
| 22 | 1 | D Coefficient | 0–254, default ~32 | Position-loop derivative gain |
| 23 | 1 | I Coefficient | 0–254, default 0 | Position-loop integral gain |
| 26 | 1 | CW Dead Band | ticks | Minimum error (clockwise) before the servo reacts — a deadzone against jitter |
| 27 | 1 | CCW Dead Band | ticks | Same, counter-clockwise |
| 31–32 | 2 | Homing Offset (`OFS`) | signed, sign-magnitude (bit 11 = sign) | Applied by firmware *before* any host ever sees a tick: `reported = raw − OFS`. This is what "zeroing" a joint actually writes |
| 33 | 1 | Mode | 0 or 1 | `0` = position/servo mode (closed-loop to `Goal Position`), `1` = wheel mode (continuous rotation, used during ROM sweeps to find hard stops) |

## SRAM — read/write

| Addr | Size | Name | Range / units | Meaning |
|---:|---:|---|---|---|
| 40 | 1 | Torque Enable | 0 / 1 | `0` = free-spinning (backdrivable), `1` = holding/driving position. **Defaults off** on every `soarm_sdk` connection (`torque_on_start=False`) — nothing enables it without an explicit command |
| 41 | 1 | Acceleration | 0–254 | Motion-profile acceleration for the next `Goal Position` move |
| 42–43 | 2 | Goal Position | ticks, 0–4095 | Target position in position mode |
| 44–45 | 2 | Goal Time | ms | Optional move duration (alternative to speed-based profiles) |
| 46–47 | 2 | Goal Speed | ticks/s, signed | Target speed — in wheel mode, this *is* the command; in position mode, it caps the move's velocity |
| 55 | 1 | Lock | 0 / 1 | `0` = EEPROM unlocked (writable), `1` = locked. `soarm_sdk` unlocks immediately before an EEPROM write and re-locks after, so a servo spends almost all its time locked |

## SRAM — read-only (live telemetry)

| Addr | Size | Name | Range / units | Meaning |
|---:|---:|---|---|---|
| 56–57 | 2 | Present Position | ticks, sign-magnitude (bit 15 = sign) | Current measured position |
| 58–59 | 2 | Present Speed | ticks/s, sign-magnitude (bit 15 = sign) | Current measured speed |
| 60–61 | 2 | Present Load | sign-magnitude (bit 10 = sign), magnitude 0–1000 | PWM duty cycle applied, in units of 0.1% — a proxy for how hard the servo is pushing, not a true torque/current sensor reading |
| 62 | 1 | Present Voltage | 0.1 V / LSB | Bus voltage at the servo |
| 63 | 1 | Present Temperature | °C | Internal temperature |
| 65 | 1 | Status | bitfield | Active-alarm bitfield (per Feetech's status-byte convention: voltage, sensor/angle, temperature, current, overload flags) |
| 66 | 1 | Moving | 0 / 1 | Whether the servo is currently executing a move |
| 69–70 | 2 | Present Current | sign-magnitude (bit 15 = sign), 6.5 mA / LSB | Measured bus current draw |

Addresses 56–70 form one contiguous block (`soarm_sdk`'s `STS_TELEMETRY_START`/`STS_TELEMETRY_LENGTH`,
with addresses 64/67/68 as unused gaps read-and-discarded) — this lets a single `GroupSyncRead` pull all
of a joint's live telemetry in one bus transaction instead of six separate reads. See
[soarm_sdk usage § GroupSyncRead for bulk state reads](https://github.com/thanhndv212/soarm_sdk/blob/main/docs/usage.md)
for the pattern.

## Baud rate codes

| Code | Baud |
|---:|---|
| 0 | 1,000,000 |
| 1 | 500,000 |
| 2 | 250,000 |
| 3 | 128,000 |
| 4 | 115,200 |
| 5 | 76,800 |
| 6 | 57,600 |
| 7 | 38,400 |

`soarm_sdk` defaults to 1 Mbps (code `0`) — confirm both the controller board and every servo on the bus
agree, since some USB-serial adapters top out below 1 Mbps (see
[Troubleshooting § Servo bus / hardware issues](/troubleshooting-and-faq#servo-bus--hardware-issues)).

## Sign-magnitude registers

Position, speed, and current are **sign-magnitude**, not two's-complement: the sign lives in a single high
bit (bit 15) and the rest is a plain magnitude. Present Load uses the same convention but with the sign at
bit 10, since its magnitude only needs 10 bits (0–1000, in 0.1% steps). Decoding these requires masking out
the sign bit and negating separately — you cannot just cast the raw register to a signed integer.

## Where this is read/written in soarm_sdk

- `soarm_sdk.protocol.registers` — the address constants themselves (source of every address above)
- `soarm_sdk.protocol.sts` — the typed read/write methods (`ReadPosition`, `ReadStatus`, `IsMoving`, …)
- `soarm_sdk.calibration.recentre` — writes `Homing Offset` to re-zero a joint
- `soarm_sdk.calibration.rom_sweep` — switches `Mode` to wheel mode to find hard stops
- `soarm_sdk.calibration.widen_limit` — writes `Min/Max Angle Limit` after empirically finding the true
  mechanical stop (see [Troubleshooting](/troubleshooting-and-faq#a-joint-silently-stops-moving-mid-trajectory-no-error))
- The dashboard's **Monitor → Servo Inspector** panel reads the full telemetry block per servo on demand —
  see [Bringup & Dashboard](/quick-start/bringup-and-dashboard)

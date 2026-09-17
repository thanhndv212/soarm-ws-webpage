---
title: Hardware
---

# Hardware specifications

## Mechanical fabrication

- **Printing cost:** roughly €50 for a follower arm, €105 for a leader–follower pair within the EU when
  outsourcing prints.
- **Materials:** PLA+ by default; PETG or nylon for higher temperature tolerance, >35% infill on load-bearing
  links.
- Follow the official STL pack and BOM in the [SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100) repo; check
  the LeRobot Discord for community upgrades (metal joint inserts, cable harnesses).

## Actuation and electronics

| Component | Notes |
|---|---|
| FEETECH STS3215 servos | Follower arm: six identical servos (7.4 V/20 Nm or 12 V/30 Nm). Leader arm gears: 3× 1/147 (C046), 2× 1/191 (C044), 1× 1/345 (C001). |
| Servo bus adapter | [Waveshare Serial Bus Servo Driver Board](https://www.waveshare.com/bus-servo-adapter-a.htm) with USB-UART bridge. |
| Debug tools | Official FEETECH Windows software, [FT_SCServo_Debug_Qt](https://github.com/Kotakku/FT_SCServo_Debug_Qt), and `soarm_sdk`'s own Viser dashboard. |
| Power | 7.4–12 V DC, sized for peak current (~6 A per arm). Match barrel jack polarity (5.5/2.1 mm or 5.5/2.5 mm). |

See [Servo Control Table](/specifications/servo-control-table) for the STS3215's full register map (EEPROM
vs. SRAM, what each address means) — useful reference if you're debugging at the register level rather than
through the dashboard.

## Sensing and peripherals

- **Cameras:** UVC webcams, Intel RealSense D405/D435, or any RGB-D sensor supported via
  [LeRobot camera adapters](https://huggingface.co/docs/lerobot/cameras); calibrate with this workspace's own
  `camera_calibration` package.
- **IMU:** M5StickC/ESP32 boards via `imu_sdk`, mounted on the wrist for inertial feedback in the teleop loop.

## Compute, networking, and safety

- **Control workstation:** Ubuntu 22.04 LTS or macOS ≥12, 8+ CPU cores, 16 GB RAM; an NVIDIA GPU if training
  diffusion/RL policies locally (required for `soarm_mjlab`'s CUDA path).
- **Safety:** hardware e-stop, safety relay, over-voltage protection; power servos down before swapping end
  effectors.

## Calibration and troubleshooting

- **Homing vs. kinematics:** LeRobot's calibration routine sets a consistent zero; for accuracy-critical geometric
  calibration from motion capture or camera data, use the [FIGAROH toolbox](https://github.com/thanhndv212/figaroh-plus).
- Serial bus baud rate mismatches — confirm both controller and servos agree (some adapters top out below 1 Mbps).
- Mixed firmware revisions — update all servos to the same version before chaining them.
- Power polarity mistakes — double-check barrel jack wiring before powering up.

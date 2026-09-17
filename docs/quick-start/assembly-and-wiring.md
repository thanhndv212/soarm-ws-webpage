---
title: Assembly & Wiring
---

# Assembly & wiring

Full step-by-step assembly follows the official [LeRobot SO-101 guide](https://huggingface.co/docs/lerobot/so101).
This page covers printing the parts and the optional add-ons available in the vendored
[SO-ARM100](https://github.com/TheRobotStudio/SO-ARM100) repo.

## Printing the parts

**Step 1 — choose a printer.** Tested settings: PLA+, 0.4 mm nozzle at 0.2 mm layer height (or 0.6 mm
nozzle at 0.4 mm layer height), 15% infill. Tested on Prusa MINI+, UP Plus 2, Creality Ender 3, and the
Bambu Lab A/P/X series.

**Step 2 — set up the printer.** Level the bed, clean it, apply glue stick if your printer needs it,
load filament, and match the settings above. Enable supports everywhere except slopes >45° from
horizontal, and disable supports in horizontal screw holes.

**Step 3 — check printer accuracy.** Print a calibration gauge from the `STL/Gauges` folder (one variant
for a standard 4×2 Lego block, one for an STS3215 servo) and test the fit before committing to a full
print run.

**Step 4 — print the parts.** Each arm (follower or leader) is a single pre-oriented STL file:

| Printer bed | Follower | Leader |
|---|---|---|
| 220×220 mm (Ender-class) | `Ender_Follower_SO101.stl` | `Ender_Leader_SO101.stl` |
| 205×250 mm (Prusa/Up-class) | `Prusa_Follower_SO101.stl` | `Prusa_Leader_SO101.stl` |

Individual part files (base, motor holders, upper/under arm, wrist, handle, trigger, jaw, etc.) are also
available separately in `STL/SO101/Individual/` if you need to reprint just one piece.

**Step 5 — remove supports.** Scrape parts off the bed with a putty knife and clean up support material.

Don't own a printer? See the SO-ARM100 repo's [printing services list](https://github.com/TheRobotStudio/SO-ARM100/blob/main/3DPRINT.md).

## Optional hardware add-ons

The vendored repo ships several drop-in extensions:

| Add-on | Purpose |
|---|---|
| Mount Helper | 3D-printed jig for easier alignment during assembly |
| Overhead Camera Mount | Bird's-eye view for single or bimanual setups (webcam or 32×32 UVC module) |
| Raised Leader Base / 4040 Aluminum Profile Mount | Ergonomic or rig-mounted base options |
| AnySkin Tactile Sensor | Adds touch sensing to the gripper |
| Wrist-mount cameras | UVC hex-nut, UVC integrated, RealSense D405/D435, or webcam variants |
| Compliant Gripper (TPU) | Flexible fingertip for better grasp precision and power |
| XLeRobot | Dual-arm mobile base built from 2× SO-101 + LeKiwi + wrist/head cameras |

See the [SO-ARM100 README's Optional Hardware section](https://github.com/TheRobotStudio/SO-ARM100#optional-hardware)
for build instructions and STL links for each.

## This workspace's own wiring notes

- **IMU:** mount the M5StickC/ESP32 board on the wrist for inertial feedback in the teleop loop — see
  [Teleoperation → IMU Setup](/teleoperation/imu-setup).
- **Servo bus and power:** see [Specifications → Hardware](/specifications/hardware) for the servo bus
  adapter, power sizing, and polarity notes used across this workspace's arms.

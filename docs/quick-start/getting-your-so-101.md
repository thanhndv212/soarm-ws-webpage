---
title: Getting Your Own SO-101
---

# Getting your own SO-101

The SO-101 is the current generation of the SO-ARM100/101 line, designed by
[The Robot Studio](https://www.therobotstudio.com) with [Hugging Face](https://huggingface.co/lerobot).
Full upstream docs live in the [SO-ARM100 repo](https://github.com/TheRobotStudio/SO-ARM100); this page
summarizes the two paths to owning one.

## Build it yourself

1. Source the components from the bill of materials below.
2. 3D print the parts (or order the prints) — see [Assembly & Wiring](/quick-start/assembly-and-wiring).
3. Follow the official [LeRobot SO-101 assembly guide](https://huggingface.co/docs/lerobot/so101).

## Buy a kit

Assembled arms or parts kits are available from several vendors — check current pricing/availability
directly, this list moves:

- RobotEd (Switzerland) — 3D-printed frame, electronics, and complete-arm kits
- Robonine (international) — parts kits
- PartaBot (US) — assembled versions
- ForgeMotion Labs (US) — frame/electronics/complete kits
- Seeed Studio (international/CN/JP) — 3D-printed kits
- WowRobo (international/CN) — assembled versions
- RoboSEasy (South Korea), NeoBot (China), Autodiscovery (EU)

A follower-only kit (no leader arm) is also available from Phospho — useful if you're teleoperating
with a VR headset instead of a leader arm.

## Sourcing parts (build-it-yourself)

Follower and leader arms share almost all the same off-the-shelf parts, except the servos. Pricing below
is indicative (varies by region/time — see the [SO-ARM100 README](https://github.com/TheRobotStudio/SO-ARM100#sourcing-parts)
for current vendor links):

| Setup | Approx. cost (EU) |
|---|---|
| Follower + leader pair | ~€226 |
| Follower only | ~€124 |

> **Servo torque note:** STS3215 servos come in a 7.4 V (16.5 kg·cm stall) and 12 V (30 kg·cm stall)
> variant. The leader arm is always 7.4 V on the SO-101; a 12 V follower needs a matching 12 V/5 A+
> power supply.

Core parts for one follower arm: 6× STS3215 servo (7.4 V, 1/345 gear), one motor control board
([Waveshare serial bus servo driver](https://www.waveshare.com/bus-servo-adapter-a.htm)), a USB-C cable,
a power supply, table clamps, and a small Phillips screwdriver set (#0 and #1).

## Debugging motors

Any Windows PC can connect over USB to program and debug servos using the
[official Feetech software](https://www.feetechrc.com/software.html). On Linux, use
[FT_SCServo_Debug_Qt](https://github.com/Kotakku/FT_SCServo_Debug_Qt). This isn't required — servos can be
configured through the LeRobot library or this workspace's own [`soarm_sdk` dashboard](/quick-start/bringup-and-dashboard)
— but it's useful for low-level debugging.

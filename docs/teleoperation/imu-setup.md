---
title: IMU Setup
---

# IMU setup

`imu_sdk` reads IMU data from MPU-family devices over USB serial: 6-axis (MPU6050/6500/6886) or 9-axis
(MPU9250/9265 + AK8963 magnetometer), on any ESP32 or M5StickC board. Firmware streams JSON at ~100 Hz;
all variants run at **115200 baud**.

| Board / module | Chip | Axes | Firmware |
|---|---|---|---|
| M5StickC Plus 1.1 | MPU6886 | 6 | `firmware/m5imu_firmware/` |
| Generic ESP32 + MPU6050/6500 | MPU6050/6500 | 6 | `firmware/esp32_mpu/` (`IMU_HAS_MAG 0`) |
| Generic ESP32 + MPU9250/9265 | MPU9250/9265 + AK8963 | 9 | `firmware/esp32_mpu/` (`IMU_HAS_MAG 1`) |

## Flashing firmware

**M5StickC Plus 1.1:** install the Arduino IDE + M5Stack board package
(`https://m5stack.oss-cn-shenzhen.aliyuncs.com/resource/arduino/package_m5stack_index.json`) and the
**M5StickCPlus** library, open `firmware/m5imu_firmware/m5imu_firmware.ino`, select board
**M5Stick-C-Plus**, and upload. The LCD shows Hz, temperature, and Z-axis gyro bias once running.

**Generic ESP32:** install the Arduino IDE with the esp32 board package (no extra libraries needed beyond
`Wire`), open `firmware/esp32_mpu/esp32_mpu.ino`, and edit the config block at the top:

```cpp
#define IMU_HAS_MAG  0      // 0 = MPU6050/6500 (6-axis), 1 = MPU9250/9265 (9-axis)
#define IMU_ADDR     0x68   // 0x68 when AD0 low, 0x69 when AD0 high
#define IMU_SDA      21
#define IMU_SCL      22
#define LED_PIN      2      // heartbeat LED (-1 to disable)
```

Wiring: `VCC→3.3V`, `GND→GND`, `SDA→GPIO21`, `SCL→GPIO22`, `AD0→GND` (address 0x68). For MPU9250, leave
the PS pin floating or pull it low for I2C mode.

## Python side

```bash
pip install -e /path/to/imu_sdk   # or: pip install -e . from that directory
```

```python
from imu_sdk import ImuReader

with ImuReader("/dev/ttyUSB0") as reader:   # or ImuReader() to auto-detect
    for sample in reader:
        print(sample.accel(), sample.gyro(), sample.temp)
```

`find_port()` auto-detects the serial port; a callback/background-thread form (`reader.start(callback)`)
is also available for integration into a control loop like `m5teleop`'s.

## Gyro bias calibration

Both firmware variants auto-calibrate gyro bias at boot: **keep the device still for ~2.5 s** while it
averages 500 samples, then subtracts that per-axis bias from every subsequent reading. Moving the device
during this window produces a wrong bias estimate and visible drift — power-cycle and try again.

`ImuData.pitch/roll/yaw` are always `0.0` — the firmware no longer computes orientation; that's done
host-side by `m5teleop`'s ESKF (see [Teleoperation control loop, step by step](/deep-dives/teleoperation-loop)).

## 6-axis vs. 9-axis

The 9-axis magnetometer data (`mx`, `my`, `mz`) is decoded when present but **not currently used** by the
teleop pipeline's attitude estimate — the ESKF corrects yaw drift via ZARU (zero angular-rate updates) at
rest, not a magnetic heading reference. `sample.has_mag` reports whether it's available on your board.

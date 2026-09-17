---
title: Vision & Camera Calibration
---

# Vision & camera calibration

`camera_calibration` is a standalone package for camera calibration and ArUco marker detection —
independent of the rest of the workspace (nothing here imports the teleop or SDK packages). All
visualization goes through [Rerun](https://rerun.io/) — no `cv2.imshow`, no matplotlib windows, works
headless with `--no-spawn`.

```bash
pip install -e .   # requires Python ≥3.10, opencv-python>=4.7, numpy>=1.24, rerun-sdk>=0.22
```

## CLI

```
camera-calibration <subcommand> [options]
python -m camera_calibration <subcommand> [options]
```

| Subcommand | Description |
|---|---|
| `capture` | Capture chessboard images from webcam and calibrate |
| `calibrate` | Load an existing calibration file; optionally run a live undistortion test |
| `detect` | Live ArUco detection monitor |
| `generate` | Generate ArUco marker PNG files |
| `estimate` | Estimate camera intrinsics from a preset or auto-detection |
| `record` | Stream raw camera feed to Rerun |
| `view` | Load a calibration JSON and display its summary in Rerun |

Every subcommand accepts `--no-spawn` (don't open the Rerun viewer window) and `--rerun-save FILE` (save
the recording to `.rrd`).

```bash
camera-calibration capture --images 20                       # auto-mode chessboard capture
camera-calibration capture --images 20 --manual               # press Enter per frame instead
camera-calibration view --calibration-file data/my_calibration.json
camera-calibration detect --highlight-ids 0 1 2 3              # live ArUco, DICT_6X6_250
camera-calibration generate --marker-ids 0 1 2 3 4              # marker PNGs
camera-calibration capture --images 15 --no-spawn --rerun-save capture.rrd   # headless
```

## Calibration data format

Results are saved to `data/` as JSON:

```json
{
  "camera_matrix": [[fx, 0, cx], [0, fy, cy], [0, 0, 1]],
  "dist_coeffs": [k1, k2, p1, p2, k3],
  "resolution": [width, height],
  "rpe": 0.42,
  "num_images": 20,
  "metadata": { "timestamp": "..." }
}
```

## Status

Not currently wired into the teleop pipeline — built for future eye-in-hand and workspace-calibration
work. See [Architecture](/architecture) for how it fits (or doesn't yet) into the rest of the workspace's
data flow.

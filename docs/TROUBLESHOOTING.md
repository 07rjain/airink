# Troubleshooting

## Camera Turns On but No Webcam Feed

AirInk starts the webcam first, then loads hand tracking. If the camera light turns on but the feed does not show:

1. Hard refresh the page with `Cmd + Shift + R`.
2. Confirm the page is running at `http://127.0.0.1:5173`.
3. Confirm browser camera permission is allowed for `127.0.0.1`.
4. Restart the dev server if needed:

```sh
npm run dev
```

## Hand Tracking Fails

AirInk serves MediaPipe assets locally from:

```text
public/mediapipe/wasm
public/mediapipe/models/hand_landmarker.task
```

If you see an error like `Unable to open zip archive`, the `.task` model file is corrupt or truncated. Verify it with:

```sh
unzip -t public/mediapipe/models/hand_landmarker.task
```

The valid model is about `7.5M` and should contain:

```text
hand_detector.tflite
hand_landmarks_detector.tflite
```

## Drawing Works in AirInk but Not in Google Meet

Check the chain in this order:

1. AirInk browser window: confirm drawing works.
2. OBS preview: confirm the drawing appears there.
3. Google Meet: confirm camera is `OBS Virtual Camera`.

If drawing is missing in OBS preview, OBS is probably capturing the wrong source.

Use:

```text
OBS -> Sources -> + -> Window Capture -> AirInk browser window
```

Avoid `Browser Source` for the MVP. It runs in OBS's embedded browser and may not have the same camera permission or hand-tracking session as your real browser.

## OBS Shows Black Screen

On macOS, enable OBS screen recording:

```text
System Settings -> Privacy & Security -> Screen & System Audio Recording -> OBS
```

Then quit and reopen OBS.

## Meet Shows Plain Webcam Instead of Drawing

Google Meet is using the wrong camera.

In Meet settings, choose:

```text
OBS Virtual Camera
```

Do not choose the MacBook camera directly. AirInk should own the physical webcam; Meet should only consume the OBS virtual camera.

## Controls Disappear

`Hide UI` is intended for OBS. Press:

```text
H
```

to show the controls again.

## Tracking Accidentally Draws or Erases

- Pinch thumb + index finger to draw.
- Release pinch to stop drawing.
- Hold index + middle fingers up to erase nearby strokes.
- Press `T` or click `Stop Tracking` if you want to pause tracking while keeping the camera feed on.

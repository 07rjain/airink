# AirInk

AirInk is a local-first prototype for drawing directly inside a webcam feed using finger gestures, then sending that annotated feed into video calls through OBS Virtual Camera.

## What It Does

AirInk lets you:

- Draw on top of your live webcam feed with a thumb + index-finger pinch.
- Erase nearby strokes by holding index + middle fingers up.
- Pause hand tracking without turning off the camera.
- Send the annotated camera feed into Google Meet through OBS Virtual Camera.

## Status

MVP implemented as a local browser app.

- [Product requirements](docs/PRD.md)
- [OBS and Google Meet setup](docs/OBS_MEET_SETUP.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Requirements

- macOS, Chrome, Brave, or another Chromium-based browser.
- Node.js and npm.
- OBS Studio for use inside Google Meet or other call apps.
- A webcam with browser camera permission enabled.

## Run Locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`, click `Start camera`, then allow camera access.

Before using it in a call, confirm drawing works inside the AirInk browser window.

## Use in a Call

AirInk does not replace your camera directly. The working call path is:

```text
AirInk browser window -> OBS Window Capture -> OBS Virtual Camera -> Google Meet
```

Use `Window Capture` in OBS for the real browser window where AirInk is running. Do not use OBS `Browser Source` for the MVP unless you have confirmed camera permission works inside OBS's embedded browser.

Short setup:

1. Run AirInk and confirm drawing works in the browser.
2. Click `Hide UI` in AirInk.
3. In OBS, add `Window Capture` for the AirInk browser window.
4. Start `OBS Virtual Camera`.
5. In Google Meet, choose `OBS Virtual Camera`.

## Controls

- Move index finger: position cursor.
- Pinch thumb + index finger: draw.
- Release pinch: stop drawing.
- Hold index + middle fingers up: erase nearby marker strokes.
- `Undo`: remove the last stroke.
- `Clear`: clear all strokes.
- `Stop Tracking`: pause hand tracking while keeping the camera feed on.
- `Mirror`: mirror the webcam feed.
- `Cursor`: show or hide the fingertip cursor.
- `Hide UI`: enter OBS-friendly presentation mode.
- `Cmd/Ctrl + Z`: undo.
- `C`: clear.
- `T`: toggle tracking.
- `H`: toggle presentation mode.

## Tech Stack

- TypeScript
- Vite
- MediaPipe Tasks Vision / Hand Landmarker
- HTML Canvas
- OBS Virtual Camera for call integration

## Troubleshooting

- Drawing works in AirInk but not in Meet: check that OBS is using `Window Capture` and Meet is using `OBS Virtual Camera`.
- OBS preview is black: enable OBS under macOS Screen Recording permissions and restart OBS.
- Camera turns on but tracking fails: see [Troubleshooting](docs/TROUBLESHOOTING.md).

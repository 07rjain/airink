# AirInk

AirInk is a local-first prototype for drawing directly inside a webcam feed using finger gestures, then sending that annotated feed into video calls through OBS Virtual Camera.


## Current Status

MVP implemented as a local browser app.

- [Product requirements](docs/PRD.md)
- [OBS and Google Meet setup](docs/OBS_MEET_SETUP.md)
- [Troubleshooting](docs/TROUBLESHOOTING.md)

## Run Locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`, click `Start camera`, then allow camera access.

## Use in a Call

AirInk does not replace your camera directly. The working call path is:

```text
AirInk browser window -> OBS Window Capture -> OBS Virtual Camera -> Google Meet
```

Use `Window Capture` in OBS for the real browser window where AirInk is running. Do not use OBS `Browser Source` for the MVP unless you have confirmed camera permission works inside OBS's embedded browser.

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

## MVP Direction

The first build should be a browser app:

1. Capture webcam video.
2. Track index finger and thumb with browser hand tracking.
3. Draw on a canvas overlay when the user pinches.
4. Compose webcam + drawing into a presentation view.
5. Capture that view in OBS and publish it as `OBS Virtual Camera` for Google Meet.

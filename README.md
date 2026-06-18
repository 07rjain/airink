# AirInk

AirInk is a local-first prototype for drawing directly inside a webcam feed using finger gestures, then sending that annotated feed into video calls through OBS Virtual Camera.

## Repo Name Options

Recommended: `airink`

Other good options:

- `airdraw-cam`
- `gesturecam`
- `camcanvas`
- `fingerframe`
- `meet-sketch`
- `webcam-ink`
- `airdraw`
- `drawcam`

## Current Status

MVP implemented as a local browser app. See [docs/PRD.md](docs/PRD.md) for the product requirements and [docs/OBS_MEET_SETUP.md](docs/OBS_MEET_SETUP.md) for the Google Meet setup path.

## Run Locally

```sh
npm install
npm run dev
```

Open `http://127.0.0.1:5173/`, click `Start camera`, then allow camera access.

## Controls

- Move index finger: position cursor.
- Pinch thumb + index finger: draw.
- Release pinch: stop drawing.
- `Undo`: remove the last stroke.
- `Clear`: clear all strokes.
- `Mirror`: mirror the webcam feed.
- `Cursor`: show or hide the fingertip cursor.
- `Hide UI`: enter OBS-friendly presentation mode.
- `Cmd/Ctrl + Z`: undo.
- `C`: clear.
- `H`: toggle presentation mode.

## MVP Direction

The first build should be a browser app:

1. Capture webcam video.
2. Track index finger and thumb with browser hand tracking.
3. Draw on a canvas overlay when the user pinches.
4. Compose webcam + drawing into a presentation view.
5. Capture that view in OBS and publish it as `OBS Virtual Camera` for Google Meet.

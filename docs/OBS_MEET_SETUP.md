# OBS and Google Meet Setup

This is the MVP path for making AirInk appear as your camera inside Google Meet.

## Prerequisites

- Chrome or another Chromium-based browser.
- OBS Studio installed.
- AirInk running locally.

## Steps

1. Start AirInk with `npm run dev`.
2. Open the local URL shown by Vite, usually `http://127.0.0.1:5173`.
3. Click `Start camera` and allow browser camera access.
4. Confirm finger tracking works:
   - Move your index finger to move the cursor.
   - Pinch thumb + index finger to draw.
   - Release the pinch to stop drawing.
5. Click `Hide UI` in AirInk when you are ready to send the clean feed.
6. Open OBS Studio.
7. Add AirInk as a source:
   - Preferred for MVP: use Window Capture for the browser window running AirInk.
   - Alternative: add a Browser Source pointing to `http://127.0.0.1:5173`, but camera permission support can vary in OBS Browser Source.
8. In OBS, start `Virtual Camera`.
9. Open Google Meet.
10. In Meet camera settings, choose `OBS Virtual Camera`.

## Troubleshooting

- If Meet does not show `OBS Virtual Camera`, restart the browser after starting OBS Virtual Camera.
- If macOS blocks camera access, check System Settings for browser and OBS camera permissions.
- If drawing feels shaky, improve lighting and keep your drawing hand within the camera frame.
- If accidental drawing happens, use slower pinch gestures and avoid keeping thumb/index close while pointing.
- If OBS captures the toolbar, click `Hide UI` or crop the source in OBS.
- If you need the controls back after hiding them, press `H`.

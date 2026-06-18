# OBS and Google Meet Setup

This is the MVP path for making AirInk appear as your camera inside Google Meet.

## Prerequisites

- Chrome or another Chromium-based browser.
- OBS Studio installed.
- AirInk running locally.
- macOS Screen Recording permission enabled for OBS.

## Signal Chain

```text
Physical webcam
-> AirInk browser window
-> OBS Window Capture
-> OBS Virtual Camera
-> Google Meet camera setting
```

Google Meet should use `OBS Virtual Camera`, not the physical MacBook camera. AirInk needs the physical camera so it can do hand tracking and draw into the composed feed.

## Steps

1. Start AirInk with `npm run dev`.
2. Open the local URL shown by Vite, usually `http://127.0.0.1:5173`.
3. Click `Start camera` and allow browser camera access.
4. Confirm finger tracking works:
   - Move your index finger to move the cursor.
   - Pinch thumb + index finger to draw.
   - Release the pinch to stop drawing.
   - Hold index + middle fingers up to erase nearby strokes.
5. Click `Hide UI` in AirInk when you are ready to send the clean feed. Press `H` to show the controls again.
6. Open OBS Studio.
7. Add AirInk as a source:
   - Preferred for MVP: use `Window Capture` for the browser window running AirInk.
   - Avoid `Browser Source` for the MVP unless you specifically test it; OBS's embedded browser may not have the same camera permission/session as your real browser.
   - Right-click the source, then choose `Transform` -> `Fit to Screen`.
8. In OBS, start `Virtual Camera`.
9. Open Google Meet.
10. In Meet camera settings, choose `OBS Virtual Camera`.

## macOS Permissions

When OBS first opens, it may ask for permissions. For this setup:

- **Screen Recording**: required for OBS `Window Capture`.
- **Camera**: optional unless you capture a webcam directly inside OBS.
- **Microphone**: optional unless OBS is handling audio.
- **Input Monitoring / Accessibility**: optional unless you want OBS hotkeys while OBS is in the background.

If you enable Screen Recording after OBS is already open, macOS may require you to quit and reopen OBS.

## OBS Source Checklist

In OBS preview, you should see the same AirInk video that appears in your browser.

- If drawing appears in AirInk but not in OBS preview, the OBS source is wrong.
- If drawing appears in OBS preview but not in Meet, Meet is using the wrong camera.
- If Meet shows your plain webcam without drawing, Meet is using the physical camera instead of `OBS Virtual Camera`.

## Troubleshooting

- If Meet does not show `OBS Virtual Camera`, restart the browser after starting OBS Virtual Camera.
- If macOS blocks camera access, check System Settings for browser and OBS camera permissions.
- If OBS shows a black screen, check System Settings -> Privacy & Security -> Screen & System Audio Recording, enable OBS, then restart OBS.
- If drawing works in AirInk but not in Meet, confirm OBS is using `Window Capture` of the AirInk browser window.
- If Meet shows OBS but no drawing, first confirm the drawing appears inside OBS preview.
- If drawing feels shaky, improve lighting and keep your drawing hand within the camera frame.
- If accidental drawing happens, use slower pinch gestures and avoid keeping thumb/index close while pointing.
- If OBS captures the toolbar, click `Hide UI` or crop the source in OBS.
- If you need the controls back after hiding them, press `H`.

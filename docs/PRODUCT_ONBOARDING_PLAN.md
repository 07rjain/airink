# Product Onboarding Plan

## Goal

Turn AirInk from a developer prototype into a product a non-technical user can install, open, and use in a call without touching a terminal or understanding OBS setup details.

The current MVP proves the core interaction, but setup is too technical:

```text
npm install -> npm run dev -> browser permissions -> OBS install -> OBS Window Capture -> OBS Virtual Camera -> meeting app camera settings
```

The product goal is:

```text
Download app -> open AirInk -> follow setup checklist -> choose AirInk Camera in the call
```

## Product Principles

- **No terminal**: users should never run `npm`, `brew`, or local dev-server commands.
- **One visible workflow**: app launch should guide the user from camera permission to call readiness.
- **Progressive complexity**: ship a reliable assisted-OBS version before investing in a native virtual camera driver.
- **Local-first**: camera frames and hand landmarks stay on the user's machine.
- **Explicit permissions**: explain why camera, screen recording, and virtual camera permissions are needed before macOS asks.

## Recommended Strategy

### Phase 1: Packaged AirInk App With Guided OBS Setup

This is the fastest product-shaped version.

Build a signed macOS desktop app that wraps the existing AirInk experience and removes developer setup. The app includes a guided setup checklist for OBS rather than trying to replace OBS immediately.

User flow:

1. User downloads `AirInk.dmg`.
2. User drags AirInk into Applications.
3. User opens AirInk.
4. AirInk asks for camera permission.
5. AirInk shows the live camera and gesture test.
6. AirInk detects whether OBS is installed.
7. If OBS is missing, AirInk offers a clear "Install OBS" step.
8. AirInk opens OBS setup instructions inside the app.
9. User starts OBS Virtual Camera.
10. AirInk shows "Ready for Google Meet" with exact call-app instructions.

Why this first:

- It removes Node/npm/dev-server setup immediately.
- It keeps the current working camera/gesture implementation.
- It avoids native virtual camera engineering before we know retention.
- It teaches us which onboarding step is still painful.

Technical shape:

- Desktop shell: Tauri or Electron.
- Frontend: current Vite/TypeScript app.
- Local assets: current bundled MediaPipe WASM and model files.
- OBS integration: guided setup first; optional automation later.
- Distribution: signed and notarized macOS app distributed as DMG.

Acceptance criteria:

- A non-technical user can open AirInk without a terminal.
- App shows webcam + drawing within 60 seconds after install.
- App clearly tells users whether OBS is installed.
- App contains a one-screen OBS/Meet checklist.
- User can complete a test Google Meet setup in under 5 minutes.

### Phase 2: Setup Assistant and Health Checks

Make setup feel product-grade even while OBS remains the virtual camera provider.

Add an onboarding wizard:

1. **Camera Check**: confirms webcam access and shows live preview.
2. **Gesture Check**: user pinches to draw and holds two fingers to erase.
3. **OBS Check**: detects OBS app presence.
4. **Permission Check**: explains macOS Screen Recording permission for OBS.
5. **Virtual Camera Check**: verifies user started OBS Virtual Camera.
6. **Meet Check**: shows final instruction to choose `OBS Virtual Camera`.

Add health indicators:

- Camera: ready / blocked / used by another app.
- Tracking: ready / loading / failed.
- OBS: installed / missing.
- Capture: not configured / likely configured.
- Call output: user-confirmed ready.

Acceptance criteria:

- User always knows the next action.
- App explains every macOS permission in plain language.
- Common failures have recovery steps in-app, not only in docs.
- Users can retry checks without restarting the app.

### Phase 3: Optional OBS Automation

Reduce OBS setup friction without building a driver yet.

Possible automation:

- Open OBS automatically.
- Create or select an `AirInk` scene.
- Add a Window Capture source for AirInk.
- Start OBS Virtual Camera.
- Show the user exactly what still needs manual approval.

Risks:

- OBS automation can be brittle across versions and OS permissions.
- Some macOS permissions still require user action.
- A partially automated setup may be more confusing than a clear manual checklist.

Use this phase only after Phase 2 reveals that OBS setup is the dominant blocker.

### Phase 4: Native AirInk Virtual Camera

Long-term product version: AirInk appears directly as a camera in Meet, Zoom, Discord, etc.

User flow:

1. Install AirInk.
2. Open AirInk and grant camera permission.
3. Grant/enable AirInk virtual camera component.
4. In the call app, choose `AirInk Camera`.

Technical direction on macOS:

- Build a native desktop app.
- Implement a macOS camera extension with Core Media I/O.
- Feed the composed camera + drawing frames into that virtual camera.
- Sign, notarize, and handle system extension installation/update flows.

Why this is later:

- Native virtual camera work is substantially more complex than the current browser app.
- macOS system extensions introduce signing, entitlement, installation, and support complexity.
- Debugging call-app compatibility becomes a major product surface.

Acceptance criteria:

- `AirInk Camera` appears in Google Meet, Zoom, Discord, and browser camera pickers.
- No OBS dependency.
- Install/update flow is stable on supported macOS versions.
- User can get from download to call-ready in under 2 minutes.

## Recommended Product Roadmap

### Milestone 1: Desktop Wrapper MVP

Deliverable:

- `AirInk.app` running the current camera/drawing experience.
- No local dev server required.
- README and docs updated for desktop users.

Engineering tasks:

- Choose Tauri or Electron.
- Package existing Vite build.
- Bundle MediaPipe assets.
- Add app icon and app metadata.
- Add camera permission copy.
- Build a DMG artifact.

### Milestone 2: Onboarding Wizard

Deliverable:

- First-run checklist inside AirInk.
- Setup status panel.
- User-tested OBS/Meet flow.

Engineering tasks:

- Add onboarding state machine.
- Add environment checks.
- Add "Open OBS", "Open setup docs", and "I see drawing in OBS" actions.
- Add persistent "setup complete" state.

### Milestone 3: Product Beta

Deliverable:

- Signed/notarized DMG.
- Quick-start landing page.
- Support docs.
- Feedback capture.

Engineering tasks:

- Code signing and notarization.
- Auto-update decision.
- Crash/error logging decision.
- Beta installer QA on clean macOS machine.

### Milestone 4: Native Virtual Camera Spike

Deliverable:

- Technical prototype proving AirInk frames can be exposed as a virtual camera without OBS.

Engineering tasks:

- Core Media I/O camera extension spike.
- Frame-pipe design from AirInk renderer to extension.
- Call-app compatibility matrix.
- Installation and permissions spike.

## UX Copy Direction

Avoid technical wording like:

- "Start Vite dev server"
- "Window Capture source"
- "MediaPipe model"
- "Virtual camera component"

Use product wording:

- "Start camera"
- "Test drawing"
- "Send AirInk to calls"
- "Choose AirInk in Google Meet"
- "Fix camera permission"

## First-Run Wizard Draft

```text
Welcome to AirInk

Step 1: Turn on your camera
[Start camera]

Step 2: Test drawing
Pinch your thumb and index finger. Draw a short line.
[I can draw]

Step 3: Send AirInk to your call
AirInk uses OBS for the beta virtual camera.
[Install OBS] [Open OBS]

Step 4: Confirm OBS sees AirInk
In OBS, add AirInk as a Window Capture source.
[I see AirInk in OBS]

Step 5: Choose OBS Virtual Camera
In Google Meet, select OBS Virtual Camera.
[I'm ready]
```

## Decision

The recommended next build is **not** a native virtual camera immediately.

The next build should be:

```text
Packaged AirInk desktop app + first-run setup wizard + guided OBS integration
```

That moves AirInk from a developer prototype to a usable beta while keeping the native virtual camera as a deliberate, validated investment.

## References

- [OBS Virtual Camera Guide](https://obsproject.com/kb/virtual-camera-guide)
- [OBS macOS Permissions Guide](https://obsproject.com/kb/macos-permissions-guide)
- [OBS Virtual Camera Troubleshooting](https://obsproject.com/kb/virtual-camera-troubleshooting)
- [Tauri distribution docs](https://v2.tauri.app/distribute/)
- [Apple Core Media I/O camera extension docs](https://developer.apple.com/documentation/coremediaio/creating-a-camera-extension-with-core-media-i-o)

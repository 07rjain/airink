# Product Requirements Document (PRD)

## 1. Executive Summary

**Product Name**: AirInk

**Product Vision**: Enable people on video calls to explain ideas visually by drawing directly inside their webcam feed using natural finger gestures.

**Core Problem**: During calls, users often need to point, sketch, circle, or annotate an idea quickly, but switching to screen sharing, whiteboards, or external drawing tools interrupts the conversation.

**Solution Overview**: AirInk captures the user's webcam feed, tracks hand/finger gestures, draws strokes over the live camera image, and outputs the composed result to video-call software. The current MVP uses OBS Virtual Camera; the product direction is a packaged desktop app with guided setup first, then a native AirInk virtual camera later.

**Target Market**:
- Remote workers explaining concepts during calls.
- Teachers, tutors, and coaches.
- Designers, engineers, and founders discussing visual ideas.
- Support and sales teams explaining workflows or product screens.

**Key Success Metrics**:
- User can draw a visible line on the webcam feed within 60 seconds of launching the app.
- Finger-to-stroke latency stays under 100 ms on a modern laptop.
- Gesture draw state has less than 5% accidental activation during a 5-minute test.
- Beta setup works with Google Meet in the target desktop environment.
- A non-technical user can get from app launch to call-ready without terminal commands.
- Users can complete a test explanation with draw, pause, clear, and undo without touching keyboard shortcuts.

## 2. Product Overview

### 2.1 Product Description

AirInk is a local-first web application that turns a normal webcam feed into an annotated camera feed. The first version runs in the browser, uses hand tracking to locate the user's index finger and thumb, and draws on a canvas layered over the camera image. The composed video is then captured by OBS as a browser/window source and published to meeting software through OBS Virtual Camera.

The MVP prioritizes proving the end-to-end experience over building a native virtual camera driver. This keeps implementation risk low while still achieving the user's actual goal: the other participant sees the drawing inside the camera view.

### 2.2 Product Goals & Objectives

**Primary Goal**: Create a reliable experience that lets a user draw over their webcam feed using finger gestures and show that feed in Google Meet with minimal setup friction.

**Secondary Goals**:
- Provide intuitive gesture controls that do not require extra hardware.
- Support basic drawing tools: pen, color, size, undo, clear, mirror mode.
- Keep setup lightweight, local, and understandable.
- Establish a path from browser MVP to packaged desktop app to native virtual camera.

**SMART Goals**:
- Build a browser MVP within the first development phase that displays webcam + drawing overlay at 30 FPS where hardware permits.
- Implement pinch-to-draw, cursor preview, undo, and clear before the first internal demo.
- Verify the composed feed in OBS Virtual Camera and Google Meet by the end of the MVP phase.
- Design the next product milestone so a non-technical user can use AirInk without Node, npm, or local dev-server setup.
- Document setup steps so a new user can run the app locally in under 10 minutes.

## 3. Product Requirements

### 3.1 Functional Requirements

#### Epic 1: Webcam Capture and Live Preview

**Description**: The app must access the user's camera and render a live preview that becomes the base layer for drawing.

**User Stories**:
- As a caller, I want to see my live webcam feed so that I can confirm what others will see.
- As a caller, I want mirror mode so that finger movement feels natural on a selfie camera.
- As a caller, I want camera permission errors to be clear so that I can fix browser or OS settings.

**Acceptance Criteria**:
- The app requests camera permission using browser media APIs.
- The app displays the selected camera feed on page load after permission is granted.
- The app supports toggling mirror mode without restarting.
- The app shows a clear empty/error state when camera permission is denied or no camera is found.

#### Epic 2: Finger Tracking and Gesture Detection

**Description**: The app must track the user's hand and identify when the user intends to draw.

**User Stories**:
- As a caller, I want my fingertip to control a cursor so that I know where drawing will appear.
- As a caller, I want to pinch my thumb and index finger to draw so that normal hand movement does not create marks.
- As a caller, I want tracking to feel stable enough for simple shapes, arrows, underlines, and circles.

**Acceptance Criteria**:
- The app uses a hand landmark model to detect index fingertip and thumb tip positions.
- The app displays a cursor preview when the index fingertip is visible.
- Pinch distance below a configurable threshold enters drawing mode.
- Pinch distance above a configurable threshold exits drawing mode.
- Cursor coordinates are smoothed to reduce jitter.
- Tracking state is visible through subtle UI indicators.

#### Epic 3: Drawing Overlay

**Description**: The app must draw persistent strokes over the live camera feed.

**User Stories**:
- As a caller, I want to draw lines over my webcam feed so that I can visually explain ideas.
- As a caller, I want to change brush color and size so that drawings remain visible against different backgrounds.
- As a caller, I want to undo or clear drawings so that I can reset the explanation quickly.

**Acceptance Criteria**:
- The app renders camera video and drawing strokes into a composed canvas.
- Strokes persist until undone or cleared.
- Brush color can be changed from a small preset palette.
- Brush size can be adjusted from small, medium, and large options.
- Undo removes the most recent stroke.
- Clear removes all strokes.
- Drawing does not resize or shift the video layout.

#### Epic 4: Meeting Integration Through OBS

**Description**: The app must support the practical path to appear as a camera feed in Google Meet.

**User Stories**:
- As a caller, I want to use this annotated feed inside Google Meet so that the other person sees it as my camera.
- As a caller, I want simple OBS setup instructions so that I can connect the app to a virtual camera.

**Acceptance Criteria**:
- The app layout includes a full-screen/composition mode suitable for OBS capture.
- Documentation explains how to add the app as an OBS source.
- Documentation explains how to start OBS Virtual Camera.
- Documentation explains how to choose OBS Virtual Camera in Google Meet.
- The MVP verification includes at least one successful local test of the virtual camera route.

#### Epic 5: Local App Controls and Settings

**Description**: The app must include minimal controls needed for live use without cluttering the composed camera view.

**User Stories**:
- As a caller, I want controls that do not distract from the camera feed.
- As a caller, I want keyboard shortcuts for fast reset and undo.
- As a caller, I want to hide controls before sending the feed to OBS.

**Acceptance Criteria**:
- The app includes controls for mirror, color, brush size, undo, clear, and hide UI.
- Keyboard shortcuts support undo and clear.
- Hidden UI mode leaves only webcam, drawing, and cursor/tracking indicators visible.
- Controls remain usable on common laptop screen sizes.

#### Epic 6: Product Onboarding

**Description**: The product must guide non-technical users through install, camera permission, drawing test, and call setup.

**User Stories**:
- As a first-time user, I want AirInk to tell me the next setup step so that I do not need developer documentation.
- As a caller, I want to test drawing before joining a real call so that I know it will work.
- As a caller, I want clear guidance for OBS/Meet setup so that I can get ready quickly.

**Acceptance Criteria**:
- User can launch AirInk without using a terminal.
- First-run flow includes camera check, gesture check, OBS/virtual-camera check, and call-app instructions.
- App explains macOS permissions before asking the user to grant them.
- Setup errors include clear recovery actions.
- Product docs distinguish beta OBS setup from long-term native virtual camera support.

### 3.2 Non-Functional Requirements

#### Performance Requirements
- End-to-end visual latency target: under 100 ms on a recent MacBook or comparable laptop.
- Rendering target: 30 FPS minimum where hardware and browser permit.
- Hand tracking should degrade gracefully if frame rate drops.
- Drawing should remain responsive while the model is running.

#### Security Requirements
- Camera access must stay local to the user's browser.
- No webcam frames or hand tracking data should be uploaded in the MVP.
- The app must not require account creation for local usage.
- Documentation must clearly state that OBS and the browser have camera/screen capture access.

#### Usability Requirements
- First-run flow should be understandable without a tutorial.
- Main actions must be reachable with visible controls and keyboard shortcuts.
- Brush presets must remain visible against typical webcam backgrounds.
- The app should work in current Chromium-based browsers for MVP.

#### Technical Requirements
- Use browser webcam capture for the MVP.
- Use MediaPipe Hand Landmarker or equivalent browser-compatible hand tracking.
- Use Canvas for composition and drawing.
- Use Vite or a similarly lightweight frontend setup.
- Use OBS Virtual Camera for MVP camera output into Google Meet.

## 4. User Experience & Design

### 4.1 User Journey Map

**Primary User Flow**:
1. **Discovery**: User opens the local app while preparing for a call.
2. **Onboarding**: Browser asks for webcam permission; user grants access.
3. **Core Usage**: User sees webcam preview, raises hand, pinches to draw, releases pinch to stop drawing.
4. **Meeting Setup**: User opens OBS, captures the app window, starts OBS Virtual Camera, and selects it in Google Meet.
5. **Retention**: User returns because drawing inside the camera feed is faster than switching to screen share or whiteboard.

### 4.2 Design Requirements
- The first screen is the working camera/drawing tool, not a marketing page.
- Controls should be compact and utilitarian.
- The canvas should dominate the viewport.
- UI should support a presentation mode where controls can be hidden.
- Status indicators should be subtle but readable: tracking active, drawing active, camera unavailable.

### 4.3 Accessibility & Inclusion
- Controls must be keyboard accessible.
- Buttons must have accessible names.
- Color controls should include high-contrast options.
- Gesture-only control should not be the only way to clear or undo.

## 5. Technical Architecture

### 5.1 System Architecture

**Architecture Pattern**: Client-side single-page web app for MVP; packaged desktop app for product beta; native virtual camera extension for long-term product.

**Technology Stack**:
- Frontend: TypeScript, Vite, React or vanilla TypeScript depending on implementation simplicity.
- Computer vision: MediaPipe Hand Landmarker for browser.
- Rendering: HTML video element + Canvas 2D or WebGL-backed canvas if needed.
- Output: OBS Browser Source or Window Capture + OBS Virtual Camera.
- Product beta: packaged desktop wrapper with guided OBS setup.
- Long-term: native virtual camera output.

**Third-Party Services**:
- MediaPipe model assets loaded locally or from a documented CDN during development.
- OBS Studio for virtual camera output.

**Infrastructure**:
- Local dev server for development.
- Static build for local hosting.
- No backend required for MVP.

### 5.2 Data Requirements
- No persistent personal data in MVP.
- Optional local settings may be stored in browser local storage: brush color, brush size, mirror mode.
- Drawing strokes exist in memory during a session and can be cleared by the user.

### 5.3 Integration Requirements
- Browser camera permission integration.
- OBS source capture integration through browser/window capture.
- Google Meet camera selection through OBS Virtual Camera.

## 6. Implementation Plan

### 6.1 MVP Definition

**MVP Scope - Must Have for Prototype Launch**:
- Webcam preview.
- Hand/finger tracking.
- Pinch-to-draw gesture.
- Canvas drawing overlay.
- Cursor preview.
- Brush color and size controls.
- Undo and clear.
- Mirror mode.
- Full-screen/presentation mode for OBS.
- Setup documentation for Google Meet via OBS Virtual Camera.

**Product Beta Scope - Must Have for Non-Technical Users**:
- Packaged desktop app.
- First-run setup wizard.
- Camera permission explanation.
- Gesture test step.
- OBS installed/missing guidance.
- Meet/Zoom/Discord camera selection instructions.
- No Node/npm/dev-server requirement.

**Post-Beta Features - Nice to Have**:
- Better gesture calibration.
- Shape recognition for arrows, circles, and boxes.
- Multi-color quick gestures.
- Recording/export of annotated sessions.
- Background blur or segmentation.
- Direct native virtual camera without OBS.

### 6.2 Development Phases

**Phase 1: Foundation** (Timeline: 1-2 days)
- Initialize frontend project.
- Implement camera permission and live preview.
- Implement canvas composition.
- Add base UI controls.

**Phase 2: Hand Tracking and Drawing** (Timeline: 2-4 days)
- Add MediaPipe Hand Landmarker.
- Map hand landmarks to canvas coordinates.
- Implement pinch detection and smoothing.
- Implement persistent strokes, undo, clear, color, and size.

**Phase 3: OBS and Meet Verification** (Timeline: 1-2 days)
- Add presentation mode.
- Verify OBS Browser Source or Window Capture.
- Start OBS Virtual Camera and test in Google Meet.
- Document setup and troubleshooting.

**Phase 4: Polish** (Timeline: 2-3 days)
- Improve gesture thresholds.
- Add calibration controls.
- Improve performance and frame scheduling.
- Add browser compatibility notes.

**Phase 5: Product Onboarding Beta** (Timeline: 1-2 weeks)
- Package AirInk as a desktop app.
- Add first-run setup wizard.
- Add setup health checks.
- Add user-friendly permission guidance.
- Validate the OBS/Meet flow on a clean macOS machine.

**Phase 6: Native Virtual Camera Spike** (Timeline: 2-4 weeks)
- Prototype native virtual camera output.
- Validate macOS signing/extension requirements.
- Test compatibility with Meet, Zoom, Discord, and browser camera pickers.
- Decide whether replacing OBS is worth the support burden.

### 6.3 Release Strategy
- Start as a local developer preview.
- Test with one real Google Meet call.
- Collect notes on latency, gesture false positives, and setup friction.
- Package the app after the OBS route is proven.
- Treat the native virtual camera as a separate validated investment, not part of the prototype MVP.

## 7. Quality Assurance & Testing

### 7.1 Testing Strategy
- **Unit Testing**: Test gesture threshold helpers, stroke state management, and coordinate mapping.
- **Integration Testing**: Test camera initialization, model loading, and render loop startup.
- **User Acceptance Testing**: Verify a user can draw, pause, undo, clear, and show the result in Meet.
- **Performance Testing**: Measure approximate frame rate and latency under normal laptop conditions.
- **Security Testing**: Confirm no network upload of camera frames in MVP app logic.

### 7.2 Quality Standards
- No uncaught errors during camera permission denial.
- UI must remain usable when hand tracking is unavailable.
- The render loop must clean up camera tracks when the page is closed or stopped.
- Documentation must include known limitations and troubleshooting.

## 8. Risk Assessment & Mitigation

### 8.1 Technical Risks

| Risk | Impact | Probability | Mitigation Strategy |
| --- | --- | --- | --- |
| Hand tracking is unstable in poor lighting | High | Medium | Add smoothing, calibration, and clear user guidance for lighting/camera placement. |
| Pinch gesture causes accidental drawing | High | Medium | Use hysteresis thresholds and require stable pinch for a few frames before drawing. |
| OBS setup is confusing | Medium | Medium | Provide step-by-step docs and a dedicated presentation mode. |
| Browser performance drops on older machines | Medium | Medium | Limit model frequency, lower processing resolution, and keep drawing render lightweight. |
| Google Meet does not show virtual camera due to OS/app permissions | High | Low | Document OS permissions and OBS virtual camera troubleshooting. |

### 8.2 Business Risks

| Risk | Impact | Probability | Mitigation Strategy |
| --- | --- | --- | --- |
| Users prefer built-in whiteboards | Medium | Medium | Focus on the unique value: drawing inside the camera feed without switching context. |
| Setup friction limits adoption | High | Medium | Start with OBS for feasibility, then consider desktop packaging. |
| Use case is too niche | Medium | Medium | Test with teachers, founders, designers, and support calls before expanding scope. |

### 8.3 Operational Risks

| Risk | Impact | Probability | Mitigation Strategy |
| --- | --- | --- | --- |
| Native virtual camera work becomes too large | High | Medium | Treat native output as post-MVP and rely on OBS initially. |
| Dependency changes affect model loading | Medium | Medium | Pin versions and document model asset handling. |
| Browser permission differences create support load | Medium | Medium | Target Chrome first and document supported environments. |

## 9. Open Questions & Future Considerations

### 9.1 Open Questions
- Should the MVP use React or plain TypeScript for the smallest reliable implementation?
- Should MediaPipe model files be bundled locally from the start or loaded from a CDN during early development?
- What is the minimum acceptable setup flow for non-technical users?
- Should the default camera view be mirrored in the output, or only in the local preview?
- Which exact gestures should be reserved for erase, clear, and tool switching?

### 9.2 Future Enhancements
- Native desktop app with one-click virtual camera output.
- Gesture calibration wizard.
- Automatic shape cleanup for arrows, circles, rectangles, and underlines.
- Shared pointer mode without drawing.
- On-screen annotations that fade after a configurable duration.
- Multi-hand support for additional controls.

### 9.3 Long-term Vision

AirInk can evolve into a lightweight visual communication layer for video calls: a camera-native annotation tool that supports drawing, pointing, teaching aids, live diagrams, and eventually collaborative visual overlays without forcing users to leave the normal rhythm of a conversation.

## 10. Assumptions

- The first target platform is macOS with Chrome or another Chromium-based browser.
- OBS Studio is acceptable for the MVP virtual camera path.
- Google Meet is the first meeting app to verify.
- The app will remain local-first with no backend in the MVP.
- The user is comfortable starting with a technical prototype before packaging the experience for broader use.

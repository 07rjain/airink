import {
  FilesetResolver,
  HandLandmarker,
  type HandLandmarkerResult,
  type NormalizedLandmark,
} from "@mediapipe/tasks-vision";
import "./style.css";

type Point = {
  x: number;
  y: number;
};

type Stroke = {
  color: string;
  size: number;
  points: Point[];
};

function requiredElement<T extends Element>(selector: string) {
  const element = document.querySelector<T>(selector);

  if (!element) {
    throw new Error(`AirInk UI element not found: ${selector}`);
  }

  return element;
}

const video = requiredElement<HTMLVideoElement>("#camera");
const canvas = requiredElement<HTMLCanvasElement>("#ink-canvas");
const cursor = requiredElement<HTMLDivElement>("#cursor");
const permissionPanel = requiredElement<HTMLDivElement>("#permission-panel");
const startButton = requiredElement<HTMLButtonElement>("#start-camera");
const errorText = requiredElement<HTMLParagraphElement>("#camera-error");
const statusPill = requiredElement<HTMLDivElement>("#status-pill");
const notice = requiredElement<HTMLDivElement>("#notice");
const mirrorToggle = requiredElement<HTMLInputElement>("#mirror");
const showCursorToggle = requiredElement<HTMLInputElement>("#show-cursor");
const hideUiButton = requiredElement<HTMLButtonElement>("#hide-ui");
const undoButton = requiredElement<HTMLButtonElement>("#undo");
const clearButton = requiredElement<HTMLButtonElement>("#clear");

function requiredCanvasContext(target: HTMLCanvasElement) {
  const context = target.getContext("2d", { alpha: false });

  if (!context) {
    throw new Error("Canvas rendering is not available.");
  }

  return context;
}

const ctx = requiredCanvasContext(canvas);

const state = {
  brushColor: "#3cf2b5",
  brushSize: 9,
  strokes: [] as Stroke[],
  activeStroke: null as Stroke | null,
  smoothedPoint: null as Point | null,
  isPinched: false,
  stablePinchFrames: 0,
  stableReleaseFrames: 0,
  handLandmarker: null as HandLandmarker | null,
  lastVideoTime: -1,
  running: false,
  trackingReady: false,
  trackingLoading: false,
  trackingFailed: false,
};

const pinchStartThreshold = 0.055;
const pinchEndThreshold = 0.075;
const requiredStableFrames = 2;
const smoothing = 0.38;
const wasmAssetPath = "/mediapipe/wasm";
const handModelAssetPath = "/mediapipe/models/hand_landmarker.task";

function setStatus(message: string, mode: "idle" | "ready" | "draw" | "warn" = "idle") {
  statusPill.textContent = message;
  statusPill.dataset.mode = mode;
}

function setNotice(message: string) {
  notice.textContent = message;
  notice.classList.toggle("is-visible", message.length > 0);
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;

  try {
    return JSON.stringify(error);
  } catch {
    return String(error);
  }
}

function resizeCanvas() {
  const rect = canvas.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const width = Math.max(1, Math.round(rect.width * dpr));
  const height = Math.max(1, Math.round(rect.height * dpr));

  if (canvas.width !== width || canvas.height !== height) {
    canvas.width = width;
    canvas.height = height;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
}

function normalizedToCanvas(landmark: NormalizedLandmark): Point {
  const rect = canvas.getBoundingClientRect();
  const rawX = landmark.x * rect.width;
  const x = mirrorToggle.checked ? rect.width - rawX : rawX;
  return {
    x,
    y: landmark.y * rect.height,
  };
}

function getDistance(a: NormalizedLandmark, b: NormalizedLandmark) {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = (a.z ?? 0) - (b.z ?? 0);
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function getSmoothedPoint(point: Point) {
  if (!state.smoothedPoint) {
    state.smoothedPoint = point;
    return point;
  }

  state.smoothedPoint = {
    x: state.smoothedPoint.x + (point.x - state.smoothedPoint.x) * smoothing,
    y: state.smoothedPoint.y + (point.y - state.smoothedPoint.y) * smoothing,
  };

  return state.smoothedPoint;
}

function beginStroke(point: Point) {
  state.activeStroke = {
    color: state.brushColor,
    size: state.brushSize,
    points: [point],
  };
  state.strokes.push(state.activeStroke);
}

function continueStroke(point: Point) {
  if (!state.activeStroke) {
    beginStroke(point);
    return;
  }

  const previous = state.activeStroke.points[state.activeStroke.points.length - 1];
  const dx = point.x - previous.x;
  const dy = point.y - previous.y;

  if (Math.hypot(dx, dy) >= 1.5) {
    state.activeStroke.points.push(point);
  }
}

function endStroke() {
  if (state.activeStroke && state.activeStroke.points.length < 2) {
    state.strokes.pop();
  }

  state.activeStroke = null;
}

function updatePinchState(pinchedNow: boolean) {
  if (pinchedNow) {
    state.stablePinchFrames += 1;
    state.stableReleaseFrames = 0;
  } else {
    state.stableReleaseFrames += 1;
    state.stablePinchFrames = 0;
  }

  if (!state.isPinched && state.stablePinchFrames >= requiredStableFrames) {
    state.isPinched = true;
  }

  if (state.isPinched && state.stableReleaseFrames >= requiredStableFrames) {
    state.isPinched = false;
    endStroke();
  }
}

function drawStroke(stroke: Stroke) {
  if (stroke.points.length === 0) return;

  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = stroke.color;
  ctx.lineWidth = stroke.size;
  ctx.shadowBlur = Math.max(4, stroke.size * 0.8);
  ctx.shadowColor = "rgba(0, 0, 0, 0.35)";

  ctx.beginPath();
  ctx.moveTo(stroke.points[0].x, stroke.points[0].y);

  if (stroke.points.length === 1) {
    ctx.lineTo(stroke.points[0].x + 0.1, stroke.points[0].y + 0.1);
  } else {
    for (let index = 1; index < stroke.points.length - 1; index += 1) {
      const current = stroke.points[index];
      const next = stroke.points[index + 1];
      ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2);
    }

    const last = stroke.points[stroke.points.length - 1];
    ctx.lineTo(last.x, last.y);
  }

  ctx.stroke();
  ctx.restore();
}

function drawFrame() {
  resizeCanvas();

  const rect = canvas.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  ctx.save();

  if (mirrorToggle.checked) {
    ctx.translate(rect.width, 0);
    ctx.scale(-1, 1);
  }

  if (video.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
    ctx.drawImage(video, 0, 0, rect.width, rect.height);
  } else {
    ctx.fillStyle = "#11171d";
    ctx.fillRect(0, 0, rect.width, rect.height);
  }

  ctx.restore();

  for (const stroke of state.strokes) {
    drawStroke(stroke);
  }
}

function updateCursor(point: Point | null, drawing: boolean) {
  if (!point || !showCursorToggle.checked) {
    cursor.classList.remove("is-visible", "is-drawing");
    return;
  }

  cursor.style.transform = `translate(${point.x}px, ${point.y}px)`;
  cursor.classList.toggle("is-drawing", drawing);
  cursor.classList.add("is-visible");
}

function handleHandResult(result: HandLandmarkerResult) {
  const landmarks = result.landmarks[0];

  if (!landmarks) {
    state.smoothedPoint = null;
    updatePinchState(false);
    updateCursor(null, false);
    setStatus("Show your hand", "warn");
    return;
  }

  const indexTip = landmarks[8];
  const thumbTip = landmarks[4];
  const point = getSmoothedPoint(normalizedToCanvas(indexTip));
  const distance = getDistance(indexTip, thumbTip);

  const pinchedNow = state.isPinched
    ? distance < pinchEndThreshold
    : distance < pinchStartThreshold;

  updatePinchState(pinchedNow);

  if (state.isPinched) {
    continueStroke(point);
  }

  updateCursor(point, state.isPinched);
  setStatus(state.isPinched ? "Drawing" : "Tracking", state.isPinched ? "draw" : "ready");
}

async function createHandLandmarker(
  vision: Awaited<ReturnType<typeof FilesetResolver.forVisionTasks>>,
  delegate: "GPU" | "CPU",
) {
  return HandLandmarker.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath: handModelAssetPath,
      delegate,
    },
    runningMode: "VIDEO",
    numHands: 1,
    minHandDetectionConfidence: 0.55,
    minHandPresenceConfidence: 0.55,
    minTrackingConfidence: 0.5,
  });
}

async function loadHandTracker() {
  if (state.trackingLoading || state.trackingReady) return;

  state.trackingLoading = true;
  state.trackingFailed = false;
  setStatus("Loading hand tracker", "idle");

  const vision = await FilesetResolver.forVisionTasks(wasmAssetPath);

  try {
    state.handLandmarker = await createHandLandmarker(vision, "GPU");
  } catch (gpuError) {
    console.warn("GPU hand tracker failed; retrying with CPU.", gpuError);
    state.handLandmarker = await createHandLandmarker(vision, "CPU");
  }

  state.trackingReady = true;
  state.trackingLoading = false;
  setStatus("Show your hand", "warn");
}

async function initializeHandTracker() {
  try {
    await loadHandTracker();
  } catch (error) {
    const message = getErrorMessage(error) || "Hand tracking could not start.";
    console.error("Hand tracking failed.", error);
    state.trackingFailed = true;
    state.trackingLoading = false;
    setNotice(`Camera is on, but hand tracking failed: ${message}`);
    setStatus("Tracking unavailable", "warn");
  }
}

async function startCamera() {
  errorText.textContent = "";
  setNotice("");
  startButton.disabled = true;
  startButton.textContent = "Starting...";

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 },
        facingMode: "user",
      },
      audio: false,
    });

    video.srcObject = stream;
    await video.play();
    permissionPanel.classList.add("is-hidden");
    startButton.textContent = "Camera on";

    if (!state.running) {
      state.running = true;
      requestAnimationFrame(loop);
    }

    setStatus("Camera ready", "ready");
    void initializeHandTracker();
  } catch (error) {
    const message = getErrorMessage(error) || "Camera could not start.";
    errorText.textContent = message;
    startButton.disabled = false;
    startButton.textContent = "Start camera";
    setStatus("Camera unavailable", "warn");
  }
}

function loop() {
  if (!state.running) return;

  drawFrame();

  if (state.handLandmarker && video.currentTime !== state.lastVideoTime) {
    state.lastVideoTime = video.currentTime;
    try {
      const result = state.handLandmarker.detectForVideo(video, performance.now());
      handleHandResult(result);
    } catch (error) {
      console.error("Hand tracking frame failed.", error);
      state.handLandmarker = null;
      state.trackingReady = false;
      state.trackingFailed = true;
      setNotice("Camera is on, but hand tracking stopped. Reload the page to retry.");
      setStatus("Tracking stopped", "warn");
    }
  } else if (!state.handLandmarker && !state.trackingLoading && !state.trackingFailed) {
    setStatus("Camera ready", "ready");
  }

  requestAnimationFrame(loop);
}

function clearDrawing() {
  state.strokes = [];
  state.activeStroke = null;
}

function undoStroke() {
  state.strokes.pop();
  state.activeStroke = null;
}

document.querySelectorAll<HTMLButtonElement>("[data-color]").forEach((button) => {
  button.style.setProperty("--swatch-color", button.dataset.color ?? "#ffffff");
  button.addEventListener("click", () => {
    state.brushColor = button.dataset.color ?? state.brushColor;
    document.querySelectorAll("[data-color]").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });
});

document.querySelectorAll<HTMLButtonElement>("[data-size]").forEach((button) => {
  button.addEventListener("click", () => {
    state.brushSize = Number(button.dataset.size ?? state.brushSize);
    document.querySelectorAll("[data-size]").forEach((item) => item.classList.remove("is-selected"));
    button.classList.add("is-selected");
  });
});

startButton.addEventListener("click", () => {
  void startCamera();
});

undoButton.addEventListener("click", undoStroke);
clearButton.addEventListener("click", clearDrawing);

hideUiButton.addEventListener("click", () => {
  document.body.classList.toggle("presentation-mode");
  hideUiButton.textContent = document.body.classList.contains("presentation-mode") ? "Show UI" : "Hide UI";
});

window.addEventListener("keydown", (event) => {
  const key = event.key.toLowerCase();

  if ((event.metaKey || event.ctrlKey) && key === "z") {
    event.preventDefault();
    undoStroke();
  }

  if (key === "c" && !event.metaKey && !event.ctrlKey) {
    clearDrawing();
  }

  if (key === "h" && !event.metaKey && !event.ctrlKey) {
    document.body.classList.toggle("presentation-mode");
  }
});

window.addEventListener("resize", drawFrame);

setStatus("Camera idle");

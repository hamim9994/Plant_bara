import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9333;
const PROFILE = path.join(process.env.TEMP, `chrome-cdp-plant-${Date.now()}`);
const OUT = path.join(process.env.TEMP, "plant-qa-cdp");
const BASE = "http://127.0.0.1:5173";

const ROUTES = [
  { name: "home", route: "/" },
  { name: "scan", route: "/scan" },
  { name: "diseases", route: "/diseases" },
  { name: "detail", route: "/diseases/Tomato___Late_blight" },
  { name: "about", route: "/about" },
  { name: "notfound", route: "/missing-page" },
];

const VIEWPORTS = [
  { name: "desktop", width: 1440, height: 900, mobile: false },
  { name: "mobile", width: 390, height: 844, mobile: true },
];

fs.mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
    "--no-default-browser-check",
    `--remote-debugging-port=${PORT}`,
    `--user-data-dir=${PROFILE}`,
    "about:blank",
  ],
  { stdio: "ignore" },
);

async function devtoolsVersion() {
  for (let i = 0; i < 60; i += 1) {
    try {
      const res = await fetch(`http://127.0.0.1:${PORT}/json/version`);
      if (res.ok) return res.json();
    } catch {
      // not ready yet
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error("DevTools endpoint did not start");
}

const version = await devtoolsVersion();
const ws = new WebSocket(version.webSocketDebuggerUrl);
await new Promise((resolve, reject) => {
  ws.onopen = resolve;
  ws.onerror = reject;
});

let nextId = 0;
const pending = new Map();
ws.onmessage = (event) => {
  const message = JSON.parse(event.data);
  if (message.id && pending.has(message.id)) {
    const { resolve, reject, method } = pending.get(message.id);
    pending.delete(message.id);
    if (message.error)
      reject(new Error(`${method ?? "session"} failed: ${JSON.stringify(message.error)}`));
    else resolve(message.result);
  }
};

function send(method, params = {}, sessionId) {
  return new Promise((resolve, reject) => {
    const id = (nextId += 1);
    pending.set(id, { resolve, reject, method });
    ws.send(JSON.stringify({ id, method, params, ...(sessionId ? { sessionId } : {}) }));
  });
}

const { targetId } = await send("Target.createTarget", { url: "about:blank" });
const { sessionId } = await send("Target.attachToTarget", { targetId, flatten: true });
const call = (method, params) => send(method, params, sessionId);

await call("Page.enable");
await call("Runtime.enable");

async function waitForReady(route, timeoutMs = 20000) {
  const expectedPath = JSON.stringify(route);
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { result } = await call("Runtime.evaluate", {
      expression: `location.pathname === ${expectedPath} && document.readyState === 'complete' && !!document.querySelector('.site-footer')`,
      returnByValue: true,
    });
    if (result.value === true) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`Page did not become ready: ${route}`);
}

async function waitForData(route, timeoutMs = 20000) {
  const needsDiseases = route === "/diseases" || route.startsWith("/diseases/");
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const expression = needsDiseases
      ? `!Array.from(document.querySelectorAll('.status-note')).some((n) => n.querySelector('.status-note__label')?.textContent === 'LOADING') && !!(document.querySelector('.disease-card') || document.querySelector('.detail__title') || document.querySelector('.status-note__label')?.textContent === 'NOTICE')`
      : "!Array.from(document.querySelectorAll('.status-note')).some((n) => n.querySelector('.status-note__label')?.textContent === 'LOADING')";
    const { result } = await call("Runtime.evaluate", { expression, returnByValue: true });
    if (result.value) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  // Not fatal: the page may legitimately show a long-loading state.
}

for (const viewport of VIEWPORTS) {
  await call("Emulation.setDeviceMetricsOverride", {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.mobile,
  });

  for (const item of ROUTES) {
    await call("Page.navigate", { url: BASE + item.route });
    await waitForReady(item.route);
    await waitForData(item.route);
    await new Promise((r) => setTimeout(r, 1200));

    const metrics = await call("Page.getLayoutMetrics");
    const { data } = await call("Page.captureScreenshot", {
      format: "png",
      fromSurface: true,
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: Math.max(viewport.height, Math.ceil(metrics.cssContentSize.height)),
        scale: 1,
      },
    });
    const file = path.join(OUT, `${item.name}-${viewport.name}.png`);
    fs.writeFileSync(file, Buffer.from(data, "base64"));
    const { result } = await call("Runtime.evaluate", {
      expression: "JSON.stringify({ w: innerWidth, h: innerHeight, sw: document.documentElement.scrollWidth, cw: document.documentElement.clientWidth })",
      returnByValue: true,
    });
    console.log(`${item.name}-${viewport.name}: ${result.value}`);
  }
}

ws.close();
chrome.kill();
console.log(`Saved to ${OUT}`);

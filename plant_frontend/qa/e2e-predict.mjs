import fs from "node:fs";
import path from "node:path";
import { spawn } from "node:child_process";

const CHROME = "C:/Program Files/Google/Chrome/Application/chrome.exe";
const PORT = 9334;
const PROFILE = path.join(process.env.TEMP, `chrome-e2e-plant-${Date.now()}`);
const OUT = path.join(process.env.TEMP, "plant-qa-e2e");
const IMAGE = path.join(process.env.TEMP, "opencode-plantbara-test.jpg");
const BASE = "http://127.0.0.1:5173";

if (!fs.existsSync(IMAGE)) throw new Error(`Missing test image: ${IMAGE}`);
fs.mkdirSync(OUT, { recursive: true });

const chrome = spawn(
  CHROME,
  [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--no-first-run",
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
      // not ready
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
await call("DOM.enable");
await call("Runtime.enable");
await call("Emulation.setDeviceMetricsOverride", {
  width: 1440,
  height: 900,
  deviceScaleFactor: 1,
  mobile: false,
});

await call("Page.navigate", { url: `${BASE}/scan` });

async function waitFor(expression, timeoutMs = 30000, label = "condition") {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    const { result } = await call("Runtime.evaluate", { expression, returnByValue: true });
    if (result.value) return;
    await new Promise((r) => setTimeout(r, 300));
  }
  throw new Error(`Timed out waiting for ${label}`);
}

await waitFor(
  "document.readyState === 'complete' && !!document.querySelector('#home-scan-file')",
  30000,
  "scan input",
);

const { root } = await call("DOM.getDocument", { depth: 1 });
const { nodeId } = await call("DOM.querySelector", { nodeId: root.nodeId, selector: "#home-scan-file" });
await call("DOM.setFileInputFiles", { nodeId, files: [IMAGE] });
await call("Runtime.evaluate", {
  expression:
    "document.querySelector('#home-scan-file').dispatchEvent(new Event('change', { bubbles: true }))",
});

await waitFor("!!document.querySelector('.home-scan__filename')", 15000, "file preview");
const filename = await call("Runtime.evaluate", {
  expression: "document.querySelector('.home-scan__filename')?.textContent",
  returnByValue: true,
});
console.log(`selected file: ${filename.result.value}`);

await call("Runtime.evaluate", {
  expression:
    "Array.from(document.querySelectorAll('button')).find((b) => b.textContent.includes('ANALYZE LEAF'))?.click()",
});

await waitFor(
  "!!document.querySelector('.home-result__title') || !!document.querySelector('.status-note__label') && Array.from(document.querySelectorAll('.status-note__label')).some((n) => n.textContent === 'NOTICE')",
  90000,
  "prediction result",
);

const result = await call("Runtime.evaluate", {
  expression: `JSON.stringify({
    title: document.querySelector('.home-result__title')?.textContent,
    labels: document.querySelector('.home-result__labels')?.textContent?.replace(/\\s+/g, ' ').trim(),
    confidence: document.querySelector('.conf-meter__value, .confidence-meter__value')?.textContent,
    alternatives: Array.from(document.querySelectorAll('.home-result__alternative')).map((li) => li.textContent?.replace(/\\s+/g, ' ').trim()),
    error: Array.from(document.querySelectorAll('.status-note')).map((n) => n.textContent?.replace(/\\s+/g, ' ').trim())
  })`,
  returnByValue: true,
});
console.log(result.result.value);

const metrics = await call("Page.getLayoutMetrics");
const { data } = await call("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: {
    x: 0,
    y: 0,
    width: 1440,
    height: Math.max(900, Math.ceil(metrics.cssContentSize.height)),
    scale: 1,
  },
});
fs.writeFileSync(path.join(OUT, "scan-result-desktop.png"), Buffer.from(data, "base64"));

await call("Emulation.setDeviceMetricsOverride", {
  width: 390,
  height: 844,
  deviceScaleFactor: 1,
  mobile: true,
});
await new Promise((r) => setTimeout(r, 1200));
const mobileMetrics = await call("Page.getLayoutMetrics");
const mobile = await call("Page.captureScreenshot", {
  format: "png",
  fromSurface: true,
  captureBeyondViewport: true,
  clip: {
    x: 0,
    y: 0,
    width: 390,
    height: Math.max(844, Math.ceil(mobileMetrics.cssContentSize.height)),
    scale: 1,
  },
});
fs.writeFileSync(path.join(OUT, "scan-result-mobile.png"), Buffer.from(mobile.data, "base64"));

ws.close();
chrome.kill();
console.log(`Saved to ${OUT}`);

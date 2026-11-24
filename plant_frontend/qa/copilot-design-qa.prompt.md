You are the design-QA reviewer for the Plant BARA frontend at D:\Hamim\project\Plant_bara\plant_frontend.

A Vite dev server is ALREADY running at http://127.0.0.1:5173 — do not start another one.

Read fully:
- ../design.md (the A-WARE style reference)
- FRONTEND_PLAN.md (design rules and contracts)
- every file under src/ (tsx and css)

Audit the implementation against the A-WARE system:
- only #ffffff page canvas, #f7f5ee parchment showcase zones, #ece9df linen footer, #205f4b announcement bar
- black ink hairline rules, graphite secondary text, bronze #a77a41 only as a physical seal accent — never buttons/links/text
- every action is a ghost pill: 32px radius, 1px black outline, transparent fill, uppercase practice 600, 0.04em tracking, trailing arrow
- uppercase labels 0.10em tracking; body copy left-aligned max 640–720px; display type plantin/Cormorant 300 with tight tracking
- 96px section rhythm, 1400px max width, 32px card padding, 24px element gap
- no gradients, no heavy card shadows, soft diffuse shadow only under product-like images
- section rhythm alternates full-bleed photo / centred editorial / split / three-column; no two identical adjacent layouts
- responsive at 640/900/1200px, mobile nav and grids
- accessibility: focus states, labels, aria, heading order

You may use the Chrome binary at C:\Program Files\Google\Chrome\Application\chrome.exe for headless screenshots if useful, e.g.:
chrome.exe --headless=new --disable-gpu --hide-scrollbars --window-size=1440,2400 --screenshot="qa/screenshots/home-desktop.png" "http://127.0.0.1:5173/"

STRICT: do NOT edit src/, package.json, configs, or any application file. You may write ONLY:
- qa/copilot-design-qa.md
- qa/screenshots/*.png

Deliver a concise report:
1. Verdict: PASS or NEEDS FIXES
2. Findings sorted by severity (blocker / major / minor), max 10, each with file:line and the exact recommended fix
3. A short "what works well" list (3 bullets)

Write the report to qa/copilot-design-qa.md and print a short summary. No nitpicks about copy you would personally phrase differently; focus on design-system violations, responsiveness, and usability.

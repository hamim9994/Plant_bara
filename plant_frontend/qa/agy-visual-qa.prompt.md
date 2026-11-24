You are the visual and responsive QA reviewer for the Plant BARA frontend at D:\Hamim\project\Plant_bara\plant_frontend.

A Vite dev server is ALREADY running at http://127.0.0.1:5173 — do not start another one and do not stop it.

Capture real screenshots with Chrome headless (binary: C:\Program Files\Google\Chrome\Application\chrome.exe). Use absolute output paths. Suggested viewports:
- desktop: 1440 x 2600
- mobile: 390 x 2200

Routes to capture (URL-encode where needed):
- /
- /scan
- /diseases
- /diseases/Tomato___Late_blight
- /about
- /missing-page (404)

Example:
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --headless=new --disable-gpu --hide-scrollbars --window-size=1440,2600 --screenshot="D:\Hamim\project\Plant_bara\plant_frontend\qa\screenshots\home-desktop.png" "http://127.0.0.1:5173/"

Then inspect the screenshots. Check:
- hero photo loads, white wordmark is legible, CTA visible, no unwanted gradient overlay
- header transparent at top / solid after scroll, nav not overlapping
- homepage rhythm: photo band, stats, scan split, process, three-card row
- scan page: upload zone, select control, empty "AWAITING SPECIMEN" panel, result layout after a scan (you may not be able to complete a scan; review the empty state)
- library: filters usable, 3-column grid, cards aligned, no clipping
- detail: long names wrap, photo split, guidance blocks readable
- about: full-bleed photo, stats, copy width
- 404: centred and minimal
- mobile: nav wraps, grids collapse to 1 column, no horizontal scrolling, text not clipped
- footer: linen band, columns, fine print

STRICT: do NOT edit src/, package.json, configs, or any application file. You may write ONLY:
- qa/agy-visual-qa.md
- qa/screenshots/*.png

Report:
1. Verdict: PASS or NEEDS FIXES
2. Issues by severity (blocker / major / minor), max 10, each with route, viewport, what you saw, and exact fix
3. Note any missing font/image loading caused by network restrictions separately — do not count that as an app bug.
4. "What works well" (3 bullets)

Write the report to qa/agy-visual-qa.md and print a short summary.

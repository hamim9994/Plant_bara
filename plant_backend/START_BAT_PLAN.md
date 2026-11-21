# Plan — `start.bat` portable backend launcher

## Goal
One Windows batch file that can be copied with the project folder to any machine and started with a double-click. It must install dependencies only when needed, then run the backend.

## Flow (exact order)
1. **Locate project** — `cd /d "%~dp0"` so the script works regardless of the caller's current directory.
2. **Find an interpreter**
   - If `.venv\Scripts\python.exe` already exists, use it and skip the rest of interpreter discovery.
   - Otherwise look for `python` on PATH; if absent, try the Windows `py -3` launcher.
   - Fail with a clear message if neither exists; verify version >= 3.10.
3. **Create the virtual environment** — `.venv` if it does not already contain `python.exe`. All packages stay local; nothing is installed globally.
4. **Check requirements**
   - Compute SHA-256 of `requirements.txt` with the venv Python.
   - Compare it with `.venv\.requirements.sha256` (written after a successful install).
   - Match → skip installation. Missing/different → run `python -m pip install -r requirements.txt`.
   - Save the new hash only after pip succeeds.
5. **Verify imports** — `fastapi, uvicorn, tensorflow, PIL, numpy`; on failure, reinstall once with `--force-reinstall`.
6. **Warn about artifacts** — if `phase1_artifacts/best_model.keras` is missing, print a warning (the API still starts; `/predict` will return 503).
7. **Start the server** — `python -m uvicorn app.main:app --host 127.0.0.1 --port 8000`. Keep the window open; `Ctrl+C` stops it.
8. **Failure handling** — every error path prints a readable cause and `pause`s so a double-clicked window does not vanish.

## Design notes
- No hard-coded Python path and no reliance on an activated shell; paths are quoted so folders with spaces work.
- The hash marker makes the check deterministic: changing `requirements.txt` on another machine triggers a reinstall automatically.
- The launcher does not use `--reload`; add it manually if live code reloading is wanted during development.

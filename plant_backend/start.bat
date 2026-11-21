@echo off
setlocal EnableExtensions EnableDelayedExpansion
title AI Crop Disease Detection - Backend

REM Always run from the folder that contains this script.
cd /d "%~dp0"

set "VENV_DIR=.venv"
set "VENV_PY=%VENV_DIR%\Scripts\python.exe"
set "REQ_FILE=requirements.txt"
set "MARKER=%VENV_DIR%\.requirements.sha256"
set "HASH_TMP=%VENV_DIR%\.requirements.hash.tmp"
set "HOST=127.0.0.1"
set "PORT=8000"

echo ===========================================================
echo   AI Crop Disease Detection - Backend Launcher
echo ===========================================================
echo.

REM --- 1. Find a Python interpreter ------------------------------------
if exist "%VENV_PY%" goto VENV_READY

where python >nul 2>&1
if errorlevel 1 goto TRY_PY_LAUNCHER
set "PY_CMD=python"
goto PY_FOUND

:TRY_PY_LAUNCHER
where py >nul 2>&1
if errorlevel 1 goto PY_MISSING
set "PY_CMD=py -3"
goto PY_FOUND

:PY_MISSING
echo [ERROR] Python was not found on PATH.
echo         Install Python 3.10+ from https://www.python.org/downloads/
echo         and tick "Add Python to PATH" during installation.
pause
exit /b 1

:PY_FOUND
%PY_CMD% -c "import sys;sys.exit(0 if sys.version_info >= (3,10) else 1)" >nul 2>&1
if errorlevel 1 goto PY_OLD
echo [OK] Python found: %PY_CMD%
goto VENV_CREATE

:PY_OLD
echo [ERROR] Python 3.10 or newer is required.
pause
exit /b 1

:VENV_CREATE
echo Creating virtual environment in %VENV_DIR% ...
%PY_CMD% -m venv "%VENV_DIR%"
if errorlevel 1 goto VENV_FAILED
if not exist "%VENV_PY%" goto VENV_FAILED

:VENV_READY
echo [OK] Virtual environment: %VENV_DIR%

REM --- 2. Check whether requirements are installed ---------------------
set "CURRENT_HASH="
"%VENV_PY%" -c "import hashlib,pathlib;print(hashlib.sha256(pathlib.Path('requirements.txt').read_bytes()).hexdigest())" > "%HASH_TMP%" 2>nul
if errorlevel 1 goto HASH_FAILED
set /p CURRENT_HASH=<"%HASH_TMP%"
del "%HASH_TMP%" >nul 2>&1
if not defined CURRENT_HASH goto HASH_FAILED

set "SAVED_HASH="
if exist "%MARKER%" set /p SAVED_HASH=<"%MARKER%"

if /i "%CURRENT_HASH%"=="%SAVED_HASH%" goto DEPS_OK

echo Requirements are missing or have changed. Installing...
"%VENV_PY%" -m pip install -r "%REQ_FILE%"
if errorlevel 1 goto PIP_FAILED
> "%MARKER%" echo(%CURRENT_HASH%
echo [OK] Requirements installed into the local virtual environment.
goto DEPS_DONE

:DEPS_OK
echo [OK] Requirements already installed (requirements.txt unchanged).

:DEPS_DONE
REM --- 3. Verify that the core packages really import ------------------
"%VENV_PY%" -c "import fastapi,uvicorn,tensorflow,PIL,numpy" >nul 2>&1
if not errorlevel 1 goto IMPORTS_OK
echo Installed packages failed to import. Reinstalling...
"%VENV_PY%" -m pip install --force-reinstall -r "%REQ_FILE%"
if errorlevel 1 goto PIP_FAILED
> "%MARKER%" echo(%CURRENT_HASH%

:IMPORTS_OK
echo [OK] Core packages import successfully.

REM --- 4. Check model artifacts ----------------------------------------
if exist "phase1_artifacts\best_model.keras" goto ARTIFACTS_OK
echo [WARNING] phase1_artifacts\best_model.keras is missing.
echo           The API will start, but /api/v1/predict will return 503.
:ARTIFACTS_OK

REM --- 5. Run the backend ----------------------------------------------
echo.
echo Starting backend at http://%HOST%:%PORT%/docs
echo Press Ctrl+C to stop the server.
echo.
"%VENV_PY%" -m uvicorn app.main:app --host %HOST% --port %PORT%
set "EXIT_CODE=%ERRORLEVEL%"
if not "%EXIT_CODE%"=="0" goto SERVER_FAILED
exit /b 0

REM --- Error handlers ---------------------------------------------------
:HASH_FAILED
echo [ERROR] Could not read requirements.txt or compute its checksum.
pause
exit /b 1

:VENV_FAILED
echo [ERROR] Failed to create the virtual environment.
pause
exit /b 1

:PIP_FAILED
echo [ERROR] pip install failed. Check your internet connection and retry.
pause
exit /b 1

:SERVER_FAILED
echo.
echo [ERROR] The backend exited with code %EXIT_CODE%.
echo         Check whether port %PORT% is already in use.
pause
exit /b 1

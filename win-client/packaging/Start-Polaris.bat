@echo off
cd /d "%~dp0"
powershell -NoProfile -ExecutionPolicy Bypass -Command "Get-ChildItem -LiteralPath '%~dp0' -Recurse -ErrorAction SilentlyContinue | Unblock-File"
if exist "%~dp0Polaris.exe" (
  start "" "%~dp0Polaris.exe"
) else (
  echo Polaris.exe not found. Extract the whole zip first.
  pause
)

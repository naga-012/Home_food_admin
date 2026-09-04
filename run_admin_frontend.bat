@echo off
echo ========================================================
echo Starting INTI RUCHI Admin Portal (Vite on Port 5174)...
echo ========================================================
cd /d "%~dp0\frontend"
npx vite --port 5174
pause

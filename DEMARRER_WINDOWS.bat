@echo off
title Nova Pay - Serveur local
cd /d "%~dp0"
echo.
echo  NOVA PAY - DEMARRAGE
echo  Ouvrez ensuite http://localhost:8000
echo  Pour Android : utilisez l'adresse IP locale de ce PC.
echo.
where py >nul 2>nul
if %errorlevel%==0 (
  start "" http://localhost:8000
  py -m http.server 8000 --bind 0.0.0.0
) else (
  start "" http://localhost:8000
  python -m http.server 8000 --bind 0.0.0.0
)
pause

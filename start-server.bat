@echo off
setlocal
cd /d "%~dp0"
title Maneyindha Marukatte - Server & Email OTP Delivery
echo ======================================================
echo  🌿 MANEYINDA MARUKATTE (ಮನೆಯಿಂದ ಮಾರುಕಟ್ಟೆ)
echo  🚀 Starting Local Server on Port 5000...
echo ======================================================

rem Determine Node.js path
set NODE_CMD=
where node >nul 2>nul
if %errorlevel% equ 0 (
    set "NODE_CMD=node"
) else if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
) else if exist "C:\Program Files\heroku\client\bin\node.exe" (
    set "NODE_CMD=C:\Program Files\heroku\client\bin\node.exe"
) else (
    echo [ERROR] Node.js executable was not found. Please install Node.js.
    pause
    exit /b 1
)

rem Launch browser automatically after giving server 2 seconds to initialize
start "" /b cmd /c "timeout /t 2 /nobreak >nul && start http://localhost:5000"

echo Running server with: %NODE_CMD%
echo Opening application at: http://localhost:5000
echo Real OTP email delivery enabled via Gmail SMTP & Resend.
echo Unique 6-digit verification codes generated on every request.
echo Do not close this terminal while using the application.
echo ======================================================
"%NODE_CMD%" backend/server.js
pause
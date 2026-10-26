@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"
title Maneyindha Marukatte - Port 5000 Server

echo ======================================================
echo  Maneyindha Marukatte - Server Starting on Port 5000
echo ======================================================

rem 1. Terminate any previous stale process on port 5000
for /f "tokens=5" %%a in ('netstat -aon ^| findstr /R /C:":5000 " 2^>nul') do (
    if not "%%a"=="" if not "%%a"=="0" (
        echo Freeing port 5000 (terminating previous PID %%a)...
        taskkill /F /PID %%a >nul 2>&1
    )
)

rem 2. Detect Node.js
set "NODE_CMD="
if exist "C:\Program Files\heroku\client\bin\node.exe" (
    set "NODE_CMD=C:\Program Files\heroku\client\bin\node.exe"
) else if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
) else (
    where node >nul 2>nul
    if !errorlevel! equ 0 set "NODE_CMD=node"
)

if "%NODE_CMD%"=="" (
    echo [ERROR] Node.js was not found on your system.
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo Starting server with Node: %NODE_CMD%
echo Opening application at: http://localhost:5000
echo Real email OTP delivery active via Gmail SMTP and Resend.
echo ======================================================

rem 3. Launch browser directly to http://localhost:5000
start "" "http://localhost:5000"

rem 4. Start backend server
"%NODE_CMD%" backend/server.js
pause
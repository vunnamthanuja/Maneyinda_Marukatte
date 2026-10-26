@echo off
cd /d "%~dp0"
title Maneyindha Marukatte - Port 5000 Server

echo ======================================================
echo  Maneyindha Marukatte - Local Server on Port 5000
echo ======================================================

set "NODE_CMD="
if exist "C:\Program Files\heroku\client\bin\node.exe" (
    set "NODE_CMD=C:\Program Files\heroku\client\bin\node.exe"
) else if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_CMD=C:\Program Files\nodejs\node.exe"
) else (
    set "NODE_CMD=node"
)

echo Starting server with Node: %NODE_CMD%
echo Opening application at http://localhost:5000
echo ======================================================

"%NODE_CMD%" backend/server.js
pause

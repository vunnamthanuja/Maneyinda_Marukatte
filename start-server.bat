@echo off
title Maneyinda Marukatte REST API Server
echo ======================================================
echo Starting Maneyinda Marukatte REST Server (Port 5000)...
echo ======================================================
if exist "C:\Program Files\heroku\client\bin\node.exe" (
    "C:\Program Files\heroku\client\bin\node.exe" backend/server.js
) else (
    node backend/server.js
)
pause

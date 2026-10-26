@echo off
title Maneyindha Marukatte - Server & Payments
echo ======================================================
echo Maneyindha Marukatte Server Starting (Port 5000)
echo Razorpay Key ID: rzp_test_TsQLb79rNRq4zF
echo Opening app at: http://localhost:5000
echo ======================================================

timeout /t 1 /nobreak >nul
start "" http://localhost:5000

if exist "C:\Program Files\heroku\client\bin\node.exe" (
    "C:\Program Files\heroku\client\bin\node.exe" backend/server.js
) else (
    node backend/server.js
)
pause

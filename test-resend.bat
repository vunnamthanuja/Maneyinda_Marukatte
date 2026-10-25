@echo off
set EMAIL=%1
if "%EMAIL%"=="" (
    set /p EMAIL="Enter your destination email address: "
)
if exist "C:\Program Files\heroku\client\bin\node.exe" (
    "C:\Program Files\heroku\client\bin\node.exe" backend/test-resend.js %EMAIL%
) else (
    node backend/test-resend.js %EMAIL%
)
if "%1"=="" pause

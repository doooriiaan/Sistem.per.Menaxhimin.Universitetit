@echo off
set ROOT=%~dp0

start "UMS Backend" cmd /k "cd /d %ROOT%backend && npm start"
timeout /t 3 >nul
start "UMS Frontend" cmd /k "cd /d %ROOT%frontend && npm run dev"

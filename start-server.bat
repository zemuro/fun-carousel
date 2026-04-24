@echo off
cd /d "%~dp0"
npx http-server -p 8088 -a 0.0.0.0 -c-1

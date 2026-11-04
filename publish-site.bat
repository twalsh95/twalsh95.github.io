@echo off
REM Saves your changes and publishes walshclassroom.com.
REM The site updates about 1-2 minutes after this finishes.
cd /d "%~dp0"

git add -A
git commit -m "Update site" >nul 2>&1
if errorlevel 1 echo No new changes to save. Pushing anyway.

echo Uploading to GitHub. A sign-in window may open the first time.
git push -u origin main

echo.
echo Done. Check progress at https://github.com/twalsh95/twalsh95.github.io/actions
echo The live site is https://walshclassroom.com
pause

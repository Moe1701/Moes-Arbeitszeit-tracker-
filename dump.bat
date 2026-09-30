@echo off
echo Erstelle repomix.config.json...

echo { > repomix.config.json
echo   "output": { >> repomix.config.json
echo     "filePath": "repomix-dev.txt", >> repomix.config.json
echo     "style": "markdown" >> repomix.config.json
echo   }, >> repomix.config.json
echo   "include": [ >> repomix.config.json
echo     "src/**/*", >> repomix.config.json
echo     "index.html", >> repomix.config.json
echo     "package.json", >> repomix.config.json
echo     "vite.config.js" >> repomix.config.json
echo   ], >> repomix.config.json
echo   "ignore": { >> repomix.config.json
echo     "useGitignore": true, >> repomix.config.json
echo     "customPatterns": [ >> repomix.config.json
echo       "node_modules/**", >> repomix.config.json
echo       "dist/**", >> repomix.config.json
echo       ".git/**", >> repomix.config.json
echo       "public/**", >> repomix.config.json
echo       "package-lock.json" >> repomix.config.json
echo     ] >> repomix.config.json
echo   } >> repomix.config.json
echo } >> repomix.config.json

echo.
echo Starte Repomix...
call npx repomix
echo.
echo ===================================================
echo ERFOLG: Der Code-Dump liegt in 'repomix-dev.txt'
echo ===================================================
pause
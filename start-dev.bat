@echo off
echo Starting development servers...
echo.

echo Starting server on port 3000...
start "Server" cmd /k "cd server && npm start"

echo Waiting 3 seconds for server to start...
timeout /t 3 /nobreak > nul

echo Starting client on port 5173...
start "Client" cmd /k "cd client && npm run dev"

echo.
echo Both servers are starting...
echo Server: http://localhost:3000
echo Client: http://localhost:5173
echo.
pause

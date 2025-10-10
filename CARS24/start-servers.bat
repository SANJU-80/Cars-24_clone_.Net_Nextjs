@echo off
echo Starting Cars24 Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd cars24Api && dotnet run --urls http://localhost:5092"

echo.
echo Waiting 5 seconds for backend to start...
timeout /t 5 /nobreak > nul

echo.
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd cars24 && npm run dev"

echo.
echo Both servers are starting...
echo Backend: http://localhost:5092
echo Frontend: http://localhost:3000
echo.
echo Press any key to exit...
pause > nul


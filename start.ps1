# PowerShell script to start the Event Management System
Write-Host "Starting Event Management System..." -ForegroundColor Green
Write-Host ""

# Install dependencies if needed
Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing root dependencies" -ForegroundColor Red
    exit 1
}

Set-Location client
npm install
if ($LASTEXITCODE -ne 0) {
    Write-Host "Error installing client dependencies" -ForegroundColor Red
    exit 1
}
Set-Location ..

Write-Host ""
Write-Host "Starting the application..." -ForegroundColor Green
Write-Host "Backend will run on http://localhost:5000" -ForegroundColor Cyan
Write-Host "Frontend will run on http://localhost:3000" -ForegroundColor Cyan
Write-Host ""

# Start both servers
Start-Process powershell -ArgumentList "-Command", "npm run server"
Start-Sleep -Seconds 3
Start-Process powershell -ArgumentList "-Command", "cd client; npm start"

Write-Host "Application started! Check the browser at http://localhost:3000" -ForegroundColor Green
Write-Host "Press any key to stop the servers..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")




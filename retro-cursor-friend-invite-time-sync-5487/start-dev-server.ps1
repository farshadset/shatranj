Write-Host "Starting Retro Digital Menu Development Server..." -ForegroundColor Green
Write-Host ""
Write-Host "This will start the development server on http://localhost:3000" -ForegroundColor Yellow
Write-Host "The server will automatically reload when you make changes to the code." -ForegroundColor Yellow
Write-Host ""
Write-Host "Press Ctrl+C to stop the server" -ForegroundColor Red
Write-Host ""

# Change to the script directory
Set-Location $PSScriptRoot

# Start the development server
npm run dev

Write-Host ""
Write-Host "Server stopped. Press any key to exit..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

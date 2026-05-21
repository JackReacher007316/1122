# ─── PM2 Startup Persistence for Windows ──────────────────────────────────────
# Saves the active PM2 processes and registers a Windows Task Scheduler task
# to run 'pm2 resurrect' automatically on user logon.
# ─────────────────────────────────────────────────────────────────────────────

Write-Host "Saving current PM2 process list..." -ForegroundColor Green
pm2 save

$taskName = "PM2_Resurrect"
$taskRun = "cmd.exe /c pm2 resurrect"

Write-Host "Registering Windows Scheduled Task '$taskName'..." -ForegroundColor Green

# Check if the task already exists and delete it to prevent duplicates
$existingTask = schtasks /query /tn $taskName 2>$null
if ($existingTask) {
    Write-Host "Task '$taskName' already exists. Updating it..." -ForegroundColor Yellow
    schtasks /delete /tn $taskName /f
}

# Create the task to run at logon with highest privileges
schtasks /create /tn $taskName /tr $taskRun /sc onlogon /rl highest /f

Write-Host "`n[SUCCESS] PM2 Startup Configuration Complete!" -ForegroundColor Green
Write-Host "The FOFA GP website services will now start automatically whenever the computer boots and you log in." -ForegroundColor Green

# Run All Tests for CLASHCODE Services

$services = @(
    @{ Name = "Core"; Path = "services/core"; Command = "python manage.py test" },
    @{ Name = "AI"; Path = "services/ai"; Command = "python -m pytest" },
    @{ Name = "Chat"; Path = "services/chat"; Command = "python -m pytest" },
    @{ Name = "Executor"; Path = "services/executor"; Command = "python -m pytest" }
)

$failed = @()

foreach ($service in $services) {
    Write-Host "`n>>> Running tests for $($service.Name)..." -ForegroundColor Cyan
    Push-Location $service.Path
    
    Invoke-Expression $service.Command
    
    if ($LASTEXITCODE -ne 0) {
        $failed += $service.Name
        Write-Host "!!! $($service.Name) tests failed!" -ForegroundColor Red
    } else {
        Write-Host "--- $($service.Name) tests passed." -ForegroundColor Green
    }
    
    Pop-Location
}

Write-Host "`n========================================" -ForegroundColor Yellow
if ($failed.Count -eq 0) {
    Write-Host "ALL SERVICES PASSED!" -ForegroundColor Green
} else {
    Write-Host "The following services failed: $($failed -join ', ')" -ForegroundColor Red
    exit 1
}
Write-Host "========================================`n" -ForegroundColor Yellow

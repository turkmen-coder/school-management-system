# Docker Desktop Otomatik Kurulum Scripti
# Yönetici olarak çalıştırın: PowerShell'i "Run as Administrator" ile açın

Write-Host "🐳 Docker Desktop Otomatik Kurulum Başlıyor..." -ForegroundColor Green

# Chocolatey kurulu mu kontrol et
if (!(Get-Command choco -ErrorAction SilentlyContinue)) {
    Write-Host "📦 Chocolatey kuruluyor..." -ForegroundColor Yellow
    Set-ExecutionPolicy Bypass -Scope Process -Force
    [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072
    iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))
    
    # PATH'i yenile
    $env:PATH = [System.Environment]::GetEnvironmentVariable("PATH","Machine") + ";" + [System.Environment]::GetEnvironmentVariable("PATH","User")
}

Write-Host "🐳 Docker Desktop kuruluyor..." -ForegroundColor Yellow
try {
    choco install docker-desktop -y
    Write-Host "✅ Docker Desktop kuruldu!" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Chocolatey ile kurulamadı. Manuel kurulum başlatılıyor..." -ForegroundColor Yellow
    
    # Manuel indirme ve kurulum
    $dockerUrl = "https://desktop.docker.com/win/main/amd64/Docker%20Desktop%20Installer.exe"
    $dockerInstaller = "$env:TEMP\DockerDesktopInstaller.exe"
    
    Write-Host "📥 Docker Desktop indiriliyor..." -ForegroundColor Yellow
    Invoke-WebRequest -Uri $dockerUrl -OutFile $dockerInstaller
    
    Write-Host "🔧 Docker Desktop kuruluyor..." -ForegroundColor Yellow
    Start-Process -FilePath $dockerInstaller -ArgumentList "install", "--quiet" -Wait
    
    Remove-Item $dockerInstaller
}

Write-Host "🔄 Sistem yeniden başlatılması gerekebilir..." -ForegroundColor Yellow
Write-Host ""
Write-Host "✅ Docker Desktop kurulumu tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "Sonraki adımlar:" -ForegroundColor Cyan
Write-Host "1. Bilgisayarı yeniden başlatın" -ForegroundColor White
Write-Host "2. Docker Desktop'ı açın ve WSL 2 backend'ini etkinleştirin" -ForegroundColor White
Write-Host "3. Ardından şu komutu çalıştırın:" -ForegroundColor White
Write-Host "   pnpm setup" -ForegroundColor Yellow
Write-Host ""

# Otomatik olarak Docker Desktop'ı başlat
if (Test-Path "C:\Program Files\Docker\Docker\Docker Desktop.exe") {
    Write-Host "🚀 Docker Desktop başlatılıyor..." -ForegroundColor Yellow
    Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
}

Read-Host "Devam etmek için Enter'a basın..."
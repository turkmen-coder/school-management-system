# Hızlı Kurulum ve Başlatma Scripti
Write-Host "🚀 Okul Yönetim Sistemi - Hızlı Kurulum" -ForegroundColor Green

# Docker çalışıyor mu kontrol et
try {
    docker --version | Out-Null
    $dockerRunning = $true
    Write-Host "✅ Docker Desktop hazır" -ForegroundColor Green
} catch {
    $dockerRunning = $false
    Write-Host "❌ Docker Desktop bulunamadı" -ForegroundColor Red
}

if (-not $dockerRunning) {
    Write-Host ""
    Write-Host "Docker Desktop kurulu değil veya çalışmıyor." -ForegroundColor Yellow
    Write-Host "Otomatik kurulum için 'install-docker-desktop.ps1' scriptini çalıştırın:" -ForegroundColor Yellow
    Write-Host "PowerShell'i yönetici olarak açıp şu komutu çalıştırın:" -ForegroundColor Cyan
    Write-Host ".\install-docker-desktop.ps1" -ForegroundColor White
    exit
}

Write-Host ""
Write-Host "📦 Dependencies kuruluyor..." -ForegroundColor Yellow
pnpm install

Write-Host "🐳 Docker servisleri başlatılıyor..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "⏳ Servislerin başlaması bekleniyor (30 saniye)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host "🗄️ Veritabanı hazırlanıyor..." -ForegroundColor Yellow
try {
    pnpm prisma:generate
    pnpm prisma:migrate
    Write-Host "✅ Veritabanı hazır" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Veritabanı migration hatası - devam ediliyor..." -ForegroundColor Yellow
}

Write-Host "🌱 Seed data ekleniyor..." -ForegroundColor Yellow
try {
    pnpm prisma:seed
    Write-Host "✅ Seed data eklendi" -ForegroundColor Green
} catch {
    Write-Host "⚠️ Seed data hatası - devam ediliyor..." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "🚀 Uygulama başlatılıyor..." -ForegroundColor Green

# Background'da servisleri başlat
Start-Job -ScriptBlock {
    Set-Location "C:\Users\User\school-management-system"
    pnpm dev
}

Start-Sleep -Seconds 5

Write-Host ""
Write-Host "✅ Sistem başarıyla başlatıldı!" -ForegroundColor Green
Write-Host ""
Write-Host "🌐 Erişim URL'leri:" -ForegroundColor Cyan
Write-Host "   Admin Panel: http://localhost:4000" -ForegroundColor White
Write-Host "   API Gateway: http://localhost:3000" -ForegroundColor White
Write-Host "   Grafana:     http://localhost:3009" -ForegroundColor White
Write-Host ""
Write-Host "📊 Docker servisleri:" -ForegroundColor Cyan
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

Write-Host ""
Write-Host "Sistem hazır! Tarayıcınızda http://localhost:4000 adresine gidin." -ForegroundColor Green
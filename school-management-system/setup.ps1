Write-Host "🚀 Okul Yönetim Sistemi Kurulumu Başlıyor..." -ForegroundColor Green

# 0. Önceki container'ları temizle
Write-Host "🐳 Önceki Docker container'ları temizleniyor..." -ForegroundColor Yellow
docker-compose down --volumes

# 1. Dependency'leri yükle
Write-Host "📦 Bağımlılıklar yükleniyor..." -ForegroundColor Yellow
pnpm install

# 2. Prisma migration'ları çalıştır
Write-Host "🗄️ Veritabanı migration'ları çalıştırılıyor..." -ForegroundColor Yellow
pnpm prisma:generate

# 3. Docker servisleri başlat
Write-Host "🐳 Docker servisleri başlatılıyor..." -ForegroundColor Yellow
docker-compose up -d

Write-Host "⏳ Waiting for PostgreSQL to be ready..." -ForegroundColor Yellow
Start-Sleep -Seconds 10
.\wait-for-postgres.ps1

pnpm prisma:migrate

# 4. S3 bucket oluştur (LocalStack)
Write-Host "📁 S3 bucket oluşturuluyor..." -ForegroundColor Yellow
aws --endpoint-url=http://localhost:4566 s3 mb s3://school-management-files 2>$null

# 5. Seed data ekle
Write-Host "🌱 Seed data ekleniyor..." -ForegroundColor Yellow
pnpm prisma:seed

# 6. Build işlemi
Write-Host "🔨 Proje build ediliyor..." -ForegroundColor Yellow
pnpm build

Write-Host "✅ Kurulum tamamlandı!" -ForegroundColor Green
Write-Host ""
Write-Host "Servisleri başlatmak için:" -ForegroundColor Cyan
Write-Host "  pnpm dev"
Write-Host ""
Write-Host "Admin paneline erişim:" -ForegroundColor Cyan
Write-Host "  http://localhost:4000"
Write-Host ""
Write-Host "API Gateway:" -ForegroundColor Cyan
Write-Host "  http://localhost:3000"
Write-Host ""
Write-Host "Grafana Dashboard:" -ForegroundColor Cyan
Write-Host "  http://localhost:3009 (admin/admin)"
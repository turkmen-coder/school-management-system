#!/bin/bash

echo "🚀 Okul Yönetim Sistemi Kurulumu Başlıyor..."

# Renklendirme
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Dependency'leri yükle
echo -e "${YELLOW}📦 Bağımlılıklar yükleniyor...${NC}"
pnpm install

# 2. Prisma migration'ları çalıştır
echo -e "${YELLOW}🗄️ Veritabanı migration'ları çalıştırılıyor...${NC}"
pnpm prisma:generate
pnpm prisma:migrate

# 3. Docker servisleri başlat
echo -e "${YELLOW}🐳 Docker servisleri başlatılıyor...${NC}"
docker-compose up -d

# Servislerin başlamasını bekle
echo -e "${YELLOW}⏳ Servislerin başlaması bekleniyor (30 saniye)...${NC}"
sleep 30

# 4. S3 bucket oluştur (LocalStack)
echo -e "${YELLOW}📁 S3 bucket oluşturuluyor...${NC}"
aws --endpoint-url=http://localhost:4566 s3 mb s3://school-management-files 2>/dev/null || true

# 5. Seed data ekle
echo -e "${YELLOW}🌱 Seed data ekleniyor...${NC}"
pnpm prisma:seed

# 6. Build işlemi
echo -e "${YELLOW}🔨 Proje build ediliyor...${NC}"
pnpm build

echo -e "${GREEN}✅ Kurulum tamamlandı!${NC}"
echo ""
echo "Servisleri başlatmak için:"
echo "  pnpm dev"
echo ""
echo "Admin paneline erişim:"
echo "  http://localhost:4000"
echo ""
echo "API Gateway:"
echo "  http://localhost:3000"
echo ""
echo "Grafana Dashboard:"
echo "  http://localhost:3009 (admin/admin)"
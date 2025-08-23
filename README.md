# Özel Okul Kayıt ve Tahsilat Sistemi

Özel okulların öğrenci kayıt süreçlerini, sınav organizasyonlarını ve mali işlemlerini dijital ortamda yönetebilmesi için geliştirilmiş kapsamlı bir yazılım sistemi.

## 🚀 Özellikler

- **Çoklu Tenant Desteği**: Birden fazla okul kampüsünün aynı platform üzerinde işlem yapabilmesi
- **CRM ve Aday Yönetimi**: Potansiyel öğrenci takibi ve dönüşüm süreçleri
- **Bursluluk Sınavı Organizasyonu**: Sınav başvuru, salon atama ve sonuç yönetimi
- **Öğrenci/Veli Kayıt Süreçleri**: e-Okul entegrasyonu ile otomatik kayıt
- **Gelişmiş Taksit Algoritması**: Hafta sonu ve tatil günlerini dikkate alan akıllı taksitlendirme
- **Sanal POS Entegrasyonları**: Iyzico, PayTR, Param entegrasyonları
- **OTS (Otomatik Tahsilat Sistemi)**: Banka entegrasyonları
- **PDF Belge Üretimi**: Sözleşme, taksit planı, giriş belgesi
- **SMS/E-posta Bildirimleri**: Otomatik hatırlatma ve bilgilendirme
- **Mobil Uygulamalar**: Veli ve yönetici mobil uygulamaları

## 🏗️ Teknoloji Stack

### Backend
- **Runtime**: Node.js 20 LTS
- **Framework**: NestJS 10 (TypeScript)
- **Database**: PostgreSQL 16
- **Cache**: Redis 7
- **Message Queue**: Apache Kafka
- **File Storage**: AWS S3 (LocalStack for dev)

### Frontend
- **Admin Web**: Next.js 14 (App Router)
- **Mobile**: React Native with Expo SDK 49

### DevOps
- **Containerization**: Docker
- **Orchestration**: Kubernetes (Helm)
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus + Grafana

## 📁 Proje Yapısı

```
school-management-system/
├── apps/                    # Uygulamalar
│   ├── admin-web/          # Next.js Admin Dashboard
│   ├── mobile/             # React Native Mobil Uygulama
│   └── api-gateway/        # BFF (Backend for Frontend)
├── services/               # Mikroservisler
│   ├── iam/               # Identity & Access Management
│   ├── crm/               # Customer Relationship Management
│   ├── exam/              # Sınav Organizasyonu
│   ├── enrollment/        # Öğrenci Kayıt
│   ├── billing/           # Faturalama ve Taksitlendirme
│   ├── payments/          # Ödeme İşlemleri
│   ├── documents/         # Belge Üretimi
│   └── notifications/     # Bildirimler
├── packages/              # Paylaşılan Kütüphaneler
│   ├── kernel/           # Domain entities ve value objects
│   ├── auth/             # Authentication utilities
│   ├── messaging/        # Kafka integration
│   ├── persistence/      # Database utilities
│   └── pdf/             # PDF generation
└── infra/               # Altyapı
    ├── docker/          # Docker yapılandırması
    ├── helm/            # Kubernetes charts
    └── terraform/       # Infrastructure as Code
```

## 🛠️ Kurulum

### Ön Gereksinimler

- Node.js 20+
- pnpm 8+
- Docker ve Docker Compose
- PostgreSQL 16 (Docker ile kurulabilir)
- Redis 7 (Docker ile kurulabilir)

### Adımlar

1. **Repoyu klonlayın**
```bash
git clone https://github.com/your-org/school-management-system.git
cd school-management-system
```

2. **Bağımlılıkları yükleyin**
```bash
pnpm install
```

3. **Environment dosyasını oluşturun**
```bash
cp .env.example .env
# .env dosyasını düzenleyin ve gerekli değerleri girin
```

4. **Docker container'ları başlatın**
```bash
pnpm docker:dev
```

5. **Veritabanı migration'larını çalıştırın**
```bash
pnpm db:migrate
pnpm db:seed
```

6. **Servisleri başlatın**
```bash
pnpm dev
```

## 🔧 Geliştirme

### Komutlar

- `pnpm dev` - Tüm servisleri development modunda başlatır
- `pnpm build` - Production build oluşturur
- `pnpm test` - Testleri çalıştırır
- `pnpm lint` - Kod kalitesi kontrolü
- `pnpm docker:dev` - Docker container'ları başlatır
- `pnpm docker:down` - Docker container'ları durdurur

### Servis Portları

- **API Gateway**: http://localhost:3000
- **IAM Service**: http://localhost:3001
- **CRM Service**: http://localhost:3002
- **Billing Service**: http://localhost:3003
- **Payments Service**: http://localhost:3004
- **Admin Web**: http://localhost:3010
- **PostgreSQL**: localhost:5432
- **Redis**: localhost:6379
- **Kafka**: localhost:9092
- **Adminer**: http://localhost:8080

## 📊 Taksit Algoritması

Sistemin en önemli özelliklerinden biri olan taksit algoritması şu özelliklere sahiptir:

- **Kuruş hassasiyetinde hesaplama**: Floating point problemlerini önler
- **Kalan kuruşların adil dağıtımı**: İlk taksitlere dağıtılır
- **Hafta sonu kontrolü**: Vade tarihleri otomatik olarak pazartesiye ertelenir
- **Tatil günü kontrolü**: Resmi tatiller sonraki iş gününe ertelenir
- **Burs desteği**: Burs tutarı düşüldükten sonra taksitlendirme
- **Erken ödeme indirimi**: Belirli taksitlere indirim uygulama

### Örnek Kullanım

```typescript
const installmentPlan = installmentCalculator.createInstallmentPlan({
  netAmount: 12000,
  installmentCount: 12,
  firstDueDate: new Date('2024-09-15'),
  monthlyInterval: 1
});
```

## 🔐 Güvenlik

- **SMS OTP Authentication**: Telefon numarası ile güvenli giriş
- **JWT Token Management**: Access ve refresh token yönetimi
- **RBAC + ABAC**: Rol ve attribute bazlı yetkilendirme
- **PCI-DSS Uyumlu**: Ödeme güvenliği standartları
- **Row Level Security**: PostgreSQL RLS politikaları
- **Data Encryption**: Hassas verilerin şifrelenmesi

## 📝 API Dokümantasyonu

API dokümantasyonuna Swagger üzerinden erişebilirsiniz:
- http://localhost:3000/api/docs

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın.

## 📞 İletişim

Proje Yöneticisi - [@yourname](https://twitter.com/yourname) - email@example.com

Proje Linki: [https://github.com/your-org/school-management-system](https://github.com/your-org/school-management-system)

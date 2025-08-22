# School Management System API Documentation

Bu belge, Okul Yönetim Sistemi'nin REST API'larının kapsamlı dokumentasyonunu içerir.

## Genel Bilgiler

- **Base URL**: `http://localhost:3000/api/v1`
- **Kimlik Doğrulama**: Bearer Token (JWT)
- **İçerik Türü**: `application/json`
- **API Versiyonu**: v1

## Kimlik Doğrulama

Sistemdeki tüm korumalı endpoint'ler için JWT token gereklidir.

### Token Alma

```http
POST /api/v1/auth/request-otp
Content-Type: application/json

{
  "phone": "+905551234567"
}
```

```http
POST /api/v1/auth/verify-otp
Content-Type: application/json

{
  "phone": "+905551234567",
  "otp": "123456"
}
```

### Token Kullanımı

```http
Authorization: Bearer <your-jwt-token>
```

## Servisler

### 1. IAM (Identity & Access Management)
- **Port**: 3001
- **Sorumluluğu**: Kullanıcı kimlik doğrulama, yetkilendirme, rol yönetimi
- **Endpoints**: `/api/v1/auth/*`, `/api/v1/users/*`, `/api/v1/roles/*`

### 2. CRM (Customer Relationship Management)
- **Port**: 3002
- **Sorumluluğu**: Aday öğrenci takibi, müşteri ilişkileri yönetimi
- **Endpoints**: `/api/v1/prospects/*`, `/api/v1/interactions/*`

### 3. Billing (Faturalama)
- **Port**: 3003
- **Sorumluluğu**: Sözleşme yönetimi, taksit hesaplama
- **Endpoints**: `/api/v1/contracts/*`, `/api/v1/installments/*`

### 4. Payments (Ödeme)
- **Port**: 3004
- **Sorumluluğu**: Ödeme işlemleri, sanal POS entegrasyonu
- **Endpoints**: `/api/v1/payments/*`

### 5. Notifications (Bildirimler)
- **Port**: 3005
- **Sorumluluğu**: SMS, e-posta bildirimleri
- **Endpoints**: `/api/v1/notifications/*`

### 6. Documents (Belgeler)
- **Port**: 3006
- **Sorumluluğu**: PDF belge üretimi
- **Endpoints**: `/api/v1/documents/*`

### 7. Enrollment (Kayıt)
- **Port**: 3007
- **Sorumluluğu**: Öğrenci ve veli kayıtları
- **Endpoints**: `/api/v1/students/*`, `/api/v1/parents/*`

### 8. Exam (Sınav)
- **Port**: 3008
- **Sorumluluğu**: Sınav organizasyonu
- **Endpoints**: `/api/v1/exams/*`

## Hata Kodları

| HTTP Status | Açıklama |
|-------------|----------|
| 200 | OK - İstek başarılı |
| 201 | Created - Kaynak oluşturuldu |
| 400 | Bad Request - Geçersiz istek |
| 401 | Unauthorized - Kimlik doğrulama gerekli |
| 403 | Forbidden - Yetki yok |
| 404 | Not Found - Kaynak bulunamadı |
| 422 | Unprocessable Entity - Validasyon hatası |
| 429 | Too Many Requests - Rate limit aşıldı |
| 500 | Internal Server Error - Sunucu hatası |

## Rate Limiting

- **Window**: 15 dakika
- **Limit**: 100 istek/kullanıcı
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

## Pagination

Listeleme endpoint'lerinde sayfalama parametreleri:

```http
GET /api/v1/students?page=1&limit=20&sort=createdAt&order=desc
```

Yanıt formatı:
```json
{
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## Multi-Tenant Desteği

Tüm istekler tenant bağlamında çalışır. JWT token içinde `tenantId` bilgisi bulunur.

## Webhook Desteği

Önemli olaylar için webhook bildirimleri desteklenir:

- Öğrenci kaydı tamamlandı
- Ödeme alındı
- Sınav sonucu yayınlandı
- Taksit vadesi geldi

## SDK ve Örnek Kodlar

### JavaScript/TypeScript
```typescript
import { SchoolManagementAPI } from '@school-management/client';

const client = new SchoolManagementAPI({
  baseURL: 'http://localhost:3000/api/v1',
  token: 'your-jwt-token'
});

const students = await client.students.list({
  page: 1,
  limit: 20
});
```

### cURL Örnekleri

#### Öğrenci Listesi
```bash
curl -X GET \
  'http://localhost:3000/api/v1/students' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json'
```

#### Öğrenci Oluşturma
```bash
curl -X POST \
  'http://localhost:3000/api/v1/students' \
  -H 'Authorization: Bearer your-jwt-token' \
  -H 'Content-Type: application/json' \
  -d '{
    "firstName": "Ahmet",
    "lastName": "Yılmaz",
    "tcNo": "12345678901",
    "birthDate": "2010-01-01",
    "classLevel": 5
  }'
```

## Postman Collection

Postman collection dosyasını [buradan](./postman/school-management.postman_collection.json) indirebilirsiniz.

## GraphQL (Gelecek Sürüm)

GraphQL endpoint'i gelecek sürümde `/graphql` adresinde sunulacaktır.

## Güvenlik

- HTTPS zorunlu (production'da)
- JWT token süreleri: Access 7 gün, Refresh 30 gün
- Rate limiting aktif
- CORS politikaları konfigüre edilmiş
- Input validation aktif
- SQL injection koruması

## İletişim

- **API Sorunları**: api-support@school-management.com
- **Dokümantasyon**: docs@school-management.com
- **Genel Destek**: support@school-management.com
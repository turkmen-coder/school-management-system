# CLAUDE.md - School Management System

## Dil Tercihi
DAIMA Türkçe konuş ve yanıtla. Türkçe iletişim zorunludur.

## Sık Kullanılan Komutlar

### Geliştirme
- `pnpm dev` - Geliştirme sunucusunu başlat
- `pnpm build` - Projeyi derle  
- `pnpm lint` - Kod kalitesi kontrolü
- `pnpm test` - Testleri çalıştır
- `pnpm test:coverage` - Test kapsamı raporu

### Docker İşlemleri
- `pnpm docker:dev` - Docker servislerini başlat
- `pnpm docker:down` - Docker servislerini durdur
- `pnpm docker:logs` - Docker loglarını görüntüle

### Veritabanı İşlemleri
- `pnpm prisma:generate` - Prisma client oluştur
- `pnpm prisma:migrate` - Veritabanı migration çalıştır
- `pnpm db:seed` - Veritabanını test verisiyle doldur

## Proje Yapısı
- `apps/` - Frontend uygulamaları (admin-web, mobile)
- `services/` - Backend mikroservisler
- `packages/` - Paylaşılan kütüphaneler
- `infra/` - Altyapı konfigürasyonları

## Geliştirme Tercihleri
- TypeScript zorunlu
- Türkçe değişken isimleri kabul edilebilir
- Test coverage minimum %80
- Prettier ve ESLint kurallarına uygunluk zorunlu
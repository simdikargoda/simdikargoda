# Kargo Operasyon ve Dağıtım Platformu

Yönetici ve müşteri self-service panelleri üzerinden kargo operasyonlarını yöneten üretim kalitesinde bir SaaS platformu. Müşteri yönetimi, bakiye/cari hesaplar, müşteriye özel fiyatlandırma, çoklu kargo firma entegrasyonu (Aras, DHL, HepsiJET, PTT), gönderi oluşturma, Excel ile toplu yükleme, barkod/etiket, kargo takibi, Netgsm SMS bildirimleri ve finansal/operasyonel raporlama tek sistemden gerçekleştirilir.

---

## Tech Stack

- **Next.js 15** (App Router + Server Actions + Route Handlers)
- **TypeScript** (strict)
- **React 19**
- **Drizzle ORM** + **node-postgres (`pg`)**
- **PostgreSQL** (production: Supabase)
- **Tailwind CSS 4** + **Lucide** + **Framer Motion** + **Recharts** + **Sonner**
- **Vitest** (test) · **zod** (validation) · **jose/bcryptjs** (auth) · **ExcelJS** (Excel)

> Deploy hedefi **Vercel (serverless)** + **Supabase PostgreSQL**. Literal package sürümleri için [`package.json`](package.json:1)'e bakın.

---

## Mimari Özet

- **Server/client ayrımı**: Veritabanı ve secret kullanan tüm kod `server-only` içinde tutulur; DB ve secret'lar client bundle'a girmez.
- **Provider/adapter katmanı**: Her kargo firması ortak `CargoProvider` contract'ının arkasında çalışır. Provider'a özel detay domain'i kirletmez; durum kodları ortak shipment status modeline normalize edilir.
- **Config-driven entegrasyonlar**: Kargo provider'ları ve Netgsm **key girildiğinde aktifleşir**; key yokken ilgili özellik "yapılandırılmadı" durumunda güvenli biçimde devre dışı kalır, sistem crash olmaz. (Detay: [Provider entegrasyon yapılandırması](#provider-entegrasyon-config-yaklaşımı))
- **Transactional finansal süreçler**: Bakiye/cari hareketleri ledger mantığıyla ve transaction sınırları içinde tutulur; idempotency ile çift işlem engellenir.

---

## Lokal Kurulum (Local Setup)

Ön koşullar: Node.js 20+, PostgreSQL (local) veya Supabase connection string.

```bash
# 1) Bağımlılıkları kur
npm install

# 2) Ortam değişkenlerini hazırla
# .env.example dosyasını kopyalayıp değerleri doldur; secret'ları asla commit etme.
cp .env.example .env.local

# 3) Veritabanı şemasını migrate et
npm run db:generate   # schema'dan migration üretir (schema değiştiyse)
npm run db:migrate    # migration'ları uygular

# 4) Geliştirme seed'ini çalıştır (yalnızca local/dev! Production'da ÇALIŞTIRMA)
npm run db:seed

# 5) Geliştirme sunucusunu başlat
npm run dev
```

Uygulama varsayılan olarak `http://localhost:3000` üzerinde çalışır.

---

## Environment Variables

`.env.example` içinde her değişkenin amacı ve **hangi ortamda nereye girileceği** belgelenmiştir. Gerçek secret değerleri bu dosyada veya repository'de yer **almaz**.

### Public / Private ayrımı

- `NEXT_PUBLIC_` **prefix'i alan her değişken browser bundle'a gidebilir.** Yalnızca gerçekten public olması gereken değerler kullanır (ör. `NEXT_PUBLIC_APP_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
- Aşağıdakiler `NEXT_PUBLIC_` almamalıdır (yalnızca **server-side** kullanılır):
  - `DATABASE_URL`, `DIRECT_URL`
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `AUTH_SECRET`
  - Kargo provider key'leri (`ARAS_API_KEY` / `*_API_SECRET` vb.)
  - `NETGSM_PASSWORD`
  - `WEBHOOK_SECRET`, `CRON_SECRET`

### Core required vs Optional integrations

Config iki sınıfa ayrılır (bkz. [`lib/config.ts`](lib/config.ts:1)):

| Sınıf                     | Değişkenler                                          | Eksikse ne olur                                                                                                      |
| ------------------------- | ---------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **Core required**         | `AUTH_SECRET`, `DATABASE_URL`                        | **Production**'da uygulama açılışta erken ve anlaşılır biçimde hata verir (`getServerConfig`)                        |
| **Optional integrations** | `ARAS_*`, `DHL_*`, `HEPSIJET_*`, `PTT_*`, `NETGSM_*` | Uygulama başlar; yalnızca ilgili entegrasyon "Yapılandırılmadı" durumunda disabled kalır (`isIntegrationConfigured`) |

`getServerConfig()` production'da core değişkenleri doğrular; `isIntegrationConfigured()` ise bir entegrasyon setinin boş/placeholder olup olmadığını kontrol ederek opsiyonel özelliklerin devreye girip girmeyeceğini belirler.

---

## Veritabanı Kurulumu ve Migration

- Şema tanımları: [`db/schema/`](db/schema/) · Client: [`db/client.ts`](db/client.ts:1)
- Migration'lar `db/migrations` altında version controlled tutulur.
- Connection yapılandırması **environment-aware**, serverless uyumludur:

```bash
npm run db:generate   # Drizzle schema'dan migration üretir
npm run db:migrate    # Bekleyen migration'ları uygular
npm run db:push       # (yalnızca hızlı dev iterate için; production migration akışında kullanma)
npm run db:studio     # Drizzle Studio arayüzü
```

**Production migration kuralları:**

- Migration'ları **request runtime içinde çalıştırma**; Vercel'in çok instance başlatması paralel migration yarışına yol açabilir.
- Production migration'ı, `DATABASE_URL` (veya `DIRECT_URL`) production Supabase project'e işaret ederken **local makinadan** `npm run db:migrate` ile manuel/CI içinde çalıştır.
- Destructive/reset komutları production'da kullanılmaz; mevcut production verisi dikkate alınarak güvenli migration uygulanır.

**Veritabanı bağlantı stratejisi** ([`db/client.ts`](db/client.ts:30)):

- Normal/runtime bağlantısı için **pooled** connection URL (`DATABASE_URL`).
- Migration/yönetim işlemleri için opsiyonel **direct** connection URL (`DIRECT_URL`).
- Vercel production ortamında pool boyutu serverless modeline uygun şekilde `1`'e düşürülür; geliştirmede global cache ile pool şişmesi önlenir.

---

## Seed

Dev verisi: bir yönetici, bakiyeli/cari örnek müşteriler, müşteri kullanıcıları ve örnek kargo fiyatları oluşturur.

```bash
npm run db:seed
```

> **Uyarı:** Seed komutu **yalnızca local/geliştirme içindir**. Supabase production database'ine asla çalıştırılmaz; güvenli değildir (örnek sıfırlar ve demo verileri üretir). Production'da otomatik demo verisi oluşturulmaz.

---

## Test ve Build

```bash
npm run typecheck   # tsc --noEmit
npm test            # vitest run
npm run build       # next build (production build)
npm run lint        # next lint
```

- Kritik domain kuralları (fiyat hesaplama, bakiye/cari, izolasyon, provider status mapping, idempotency, finansal kontrat) için Vitest testleri `tests/` altında bulunur.
- Gerçek dış API'ye bağımlı test suite kurulmaz; provider entegrasyonları deterministic/fake adapter'lar ile test edilir.

---

## Provider Entegrasyon Config Yaklaşımı

Kargo firmaları (Aras, DHL, HepsiJET, PTT) ve Netgsm **config-driven** çalışır (bkz. [`lib/providers/cargo/registry.ts`](lib/providers/cargo/registry.ts:1) ve [`lib/services/notifications/netgsm.service.ts`](lib/services/notifications/netgsm.service.ts:1)).

- Bir entegrasyon için gerekli credential setinin tamamı dolduğunda `isIntegrationConfigured()` `true` döner ve ilgili provider/özellik **aktif** olur.
- Credential eksikse o provider "Yapılandırılmadı" görünür; kullanıcı o firma üzerinden gerçek gönderi oluşturamaz; **diğer aktif provider'lar ve uygulama çalışmaya devam eder**.
- Availability kod içinde hard-coded boolean değildir; `config + connection test` sonucundan hesaplanır.
- "Bağlantıyı Test Et" işlemi yalnızca **server-side** çalışır; secret değerleri UI'da düz metin gösterilmez.
- Gerçek kargo API client'ı React component veya client bundle içinde bulunmaz.

Her provider için Vercel'e girilecek key seti:

- Aras: `ARAS_API_URL`, `ARAS_API_KEY`, `ARAS_API_SECRET`
- DHL: `DHL_API_URL`, `DHL_API_KEY`, `DHL_API_SECRET`
- HepsiJET: `HEPSIJET_API_URL`, `HEPSIJET_API_KEY`, `HEPSIJET_API_SECRET`
- PTT: `PTT_API_URL`, `PTT_API_KEY`, `PTT_API_SECRET`

---

## Netgsm SMS Config

SMS entegrasyonu aynı config-driven mantıkla çalışır:

- Vercel'e girilecek key'ler: `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER`.
- Bu üç key tanımlı değilse `netgsmConfigured()` `false` döner, SMS gönderimi yapılmaz ve sistem crash olmaz; sonuçlar SMS log'una işlenir (`lib/services/notifications/sms-log.service.ts`).
- SMS ana HTTP isteğini yavaşlatmayacak şekilde enqueue edilir; gönderim sonuçları retry/failure izlenebilirliği için kayıt altına alınır.

---

## Production Deployment

Canlıya alma akışı **Supabase (DB) + GitHub (repo) + Vercel (deploy)** üzerinden yürür. Aşağıdaki adımlarda credential **değerleri** verilmez; yalnızca **hangi key'in nereye** girileceği açıklanır.

### 1) Supabase project oluşturma

1. [Supabase](https://supabase.com) hesabıyla yeni bir **Project** oluştur. Bu, production veritabanıdır.
2. Region ihtiyaca göre seçilir; veritabanı PostgreSQL'tir.

### 2) Database connection string alma

- Supabase Dashboard → **Project Settings → Database** bölümünden connection bilgilerini al.
- **Pooled connection URL**: uygulama runtime'ının `DATABASE_URL` değeridir.
- **Direct connection URL**: migration/yönetim için `DIRECT_URL` değeridir; ayrıca Supabase connection pooler (port 6543) yapılandırması çevrimiçi okunur.

### 3) Pooled / direct URL ayrımı

| Amaç                             | Kullanılacak URL          | Vercel key     |
| -------------------------------- | ------------------------- | -------------- |
| Uygulama runtime (ORM/`pg` pool) | **Pooled** connection URL | `DATABASE_URL` |
| Migration / yönetim (local/CI)   | **Direct** connection URL | `DIRECT_URL`   |

Serverless ortamında pooled bağlantı tercih edilir; migration request runtime içinde çalıştırılmaz.

### 4) Vercel project oluşturma

- [Vercel](https://vercel.com) üzerinden yeni project oluştur veya GitHub import akışını kullan.

### 5) GitHub repository bağlama

- Repo GitHub'da tutulur; Vercel repository'ye bağlanır.
- **Production branch açıkça belirlenir** (ör. `main`).
- Önerilen akış: feature branch → PR → Preview deployment → typecheck/test/build kontrolü → production branch'e merge → otomatik production deploy. Her push'ta production deploy yapan yanlış branch ayarı oluşturulmaz.
- İsteğe bağlı kalite kontrolü için GitHub Actions'ta `npm ci` → `npm run typecheck` → `npm run lint` → `npm test` → `npm run build` gibi kontroller değerlendirilebilir. CI secret'ları GitHub Secrets/Variables üzerinden yönetilir, dosyaya yazılmaz.

### 6) Vercel environment variables girme

Vercel → Project → **Settings → Environment Variables** üzerinden (Production / Preview / Development ayrı veya ortak) şu key'ler tanımlanır:

- **Core:** `AUTH_SECRET`, `DATABASE_URL` (pooled)
- **Public:** `NEXT_PUBLIC_APP_URL` (production domain/URL; Preview için environment'a göre farklılaştır)
- **Migration/yönetim:** `DIRECT_URL`
- **Kargo provider:** `ARAS_API_URL/KEY/SECRET`, `DHL_API_URL/KEY/SECRET`, `HEPSIJET_API_URL/KEY/SECRET`, `PTT_API_URL/KEY/SECRET`
- **Netgsm:** `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER`
- **Opsiyonel servis:** `WEBHOOK_SECRET`, `CRON_SECRET`

**Secret/public ayrımı:** Service role, DB URL, kargo secret, Netgsm password, webhook/auth secret kesinlikle `NEXT_PUBLIC_` prefix'i almaz (bkz. [Environment Variables](#environment-variables)).

**Preview güvenliği:** Preview deployment'ları production Supabase database'ine kontrolsüz yazmamalıdır. Preview için ayrı Supabase project/DB kullanılmalı ve production provider/SMS credential'ları Preview environment'a girilmemelidir; test gönderileri gerçek kargo kaydı veya SMS üretmemelidir.

### 7) Database migration çalıştırma

- Migration'ları repository'den, `DATABASE_URL`/`DIRECT_URL` production'a işaret ederken **local makina veya CI üzerinden** `npm run db:migrate` ile çalıştır.
- Migration'ı request runtime içinde çalıştırma; Vercel instance'ları arasında paralel migration yarışı riskine karşı manuel/tek seferlik uygula.
- Production seed/reset komutlarına izin verilmez; Supabase backup/restore stratejisi incelenir.

### 8) Production deployment

- Production branch'e push/merge → Vercel production build (Next.js) tetiklenir.
- Build'in sorunsuz üretildiği doğrulanır (`npm run build` yerel olarak da kontrol edilebilir).
- Vercel request timeout'larına bağımlı uzun senkron işlemler tasarlanmaz; background/cron ihtiyaçları için Vercel Cron veya uygun harici job sistemi kullanılır (cron endpoint'i secret ile korunmalı ve idempotent olmalıdır).

### 9) Custom domain bağlama

- Production domain'i Vercel → **Settings → Domains** üzerinden bağlanır.
- Kod içinde domain sabit yazılmaz; base URL `NEXT_PUBLIC_APP_URL` / ilgili server-side base env variable üzerinden yönetilir. Böylece domain sonradan değiştiğinde kod değişikliği gerekmez.

### 10) Cargo provider credential girme

- Provider kullanılacaksa ilgili key seti (ör. Aras için `ARAS_API_URL`, `ARAS_API_KEY`, `ARAS_API_SECRET`) Vercel Production environment'a girilir.
- Key yokken sistem crash olmaz; key girildiğinde ilgili entegrasyon config-driven aktifleşir (bkz. [Provider entegrasyon yapılandırması](#provider-entegrasyon-config-yaklaşımı)).

### 11) Netgsm credential girme

- SMS aktifleştirilecekse `NETGSM_USERCODE`, `NETGSM_PASSWORD`, `NETGSM_HEADER` Vercel Production environment'a girilir. Girilmezse SMS özelliği config-driven olarak disabled kalır.

### 12) Webhook / callback URL tanımlama

- Provider'lar webhook/callback sağlıyorsa public production URL kullanılır. Örnek biçim: `https://app-domain.com/api/webhooks/...`.
- Webhook URL'leri environment-aware olmalıdır; local URL production config'e karışmaz. URL'ler kod içinde sabit yazılmaz; base URL env config'ten gelir.
- Webhook imzası `WEBHOOK_SECRET` ile HMAC-SHA256 doğrulanır ve işleme idempotent yapılır (`lib/services/tracking/webhook.service.ts`).

### 13) Provider connection test

- Entegrasyonlar ekranından provider'ın **"Bağlantıyı Test Et"** aksiyonu server-side çalıştırılarak credential'ın geçerli olduğu doğrulanır; secret değerleri UI'da düz metin gösterilmez.
- Aynı mantıkla Netgsm yapılandırması ve DB erişimi doğrulanır.

### 14) Production smoke test

Canlı kabul öncesi en az şunlar doğrulanır:

- Giriş yapılabiliyor ve RBAC çalışıyor.
- Dashboard gerçek DB verisi gösteriyor (boş state dahil).
- Bir kargo oluşturma akışı (yapılandırılmış provider üzerinden) uçtan uca çalışıyor.
- Bakiye/cari hareketi doğru oluşuyor.
- Provider key yokken sistem crash olmuyor; key girildiğinde ilgili entegrasyon aktifleşiyor.
- Preview environment production DB/credential'a yanlışlıkla bağlanmıyor.
- Webhook dış imza doğrulaması ve idempotent işleme çalışıyor.
- Pooled DB connection doğru; `DATABASE_URL` production'a işaret ediyor.
- Secret/public env ayrımı doğru (client bundle'a secret sızmıyor).

---

## Deployment Kalite Kontrol Listesi

- [ ] GitHub repository bağlı (production branch belirli)
- [ ] Vercel project bağlı; production build başarılı
- [ ] Supabase production DB bağlantısı ve pooled bağlantı doğru
- [ ] Migration stratejisi çalışıyor (request runtime dışında)
- [ ] Production env vars tanımlı; secret/public ayrımı doğru
- [ ] Provider key yokken sistem crash olmuyor; key girildiğinde aktifleşebiliyor
- [ ] Netgsm config-driven çalışıyor
- [ ] Preview env production'a yanlışlıkla bağlanmıyor
- [ ] Webhook production URL'leri environment-aware
- [ ] Custom domain değişikliği kod gerektirmiyor
- [ ] Production seed/reset korumalı
- [ ] GitHub → Vercel automatic deployment çalışıyor

---

Yukarıdaki deployment adımları, projenin canlı ortam kabul kriterlerini (master prompt bölüm 92–94) karşılayacak şekilde düzenlenmiştir. Gerçek credential değerleri source code'a, GitHub'a veya client bundle'a yazılmaz; yalnızca Vercel Environment Variables üzerinden verilir.

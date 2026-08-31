#  Kargoda

**Kargoda**, kargo operasyonlarını, gönderileri, müşterileri, fiyatlandırmayı, bakiye/cari hesapları, kargo takibini ve entegrasyonları tek merkezden yönetmek için geliştirilen modern bir kargo operasyon platformudur.

## ✨ Özellikler

- 📦 Kargo oluşturma ve gönderi yönetimi
- 📊 Operasyon dashboard'u
- 👥 Müşteri yönetimi
- 💳 Bakiye sistemi
- 🧾 Cari hesap yönetimi
- 💰 Müşteriye özel fiyatlandırma
- 📍 Kargo takip ve durum geçmişi
- 🏷️ Barkod ve kargo etiketi
- 📥 Excel ile toplu gönderi oluşturma
- 🔄 İade takibi
- 📱 SMS bildirimleri
- 📈 Raporlama ve kârlılık analizi
- 🔌 Çoklu kargo firması entegrasyonu
- 👤 Yönetici ve müşteri panelleri
- 🔐 RBAC, 2FA ve oturum yönetimi
- 📱 Responsive arayüz

## 🚚 Kargo Entegrasyonları

Platform aşağıdaki kargo firmalarının entegrasyon altyapısını destekleyecek şekilde tasarlanmıştır:

- Aras Kargo
- DHL
- HepsiJET
- PTT Kargo

Kargo firmaları ortak provider/adapter mimarisi üzerinden yönetilir.

## 🛠️ Teknolojiler

- Next.js
- React
- TypeScript
- Tailwind CSS
- PostgreSQL
- Supabase
- Vercel
- Recharts
- Framer Motion
- Lucide React
- SWR
- ExcelJS
- Sonner
- date-fns

## 🎨 Tasarım

Kargoda, **Modern Premium SaaS Dashboard + Soft Glassmorphism** tasarım dilini kullanır.

Ana renk paleti:

- Background: `#eef2f7`
- Panel: `#ffffff`
- Primary: `#0ea5e9`
- Primary Accent: `#0284c7`
- Primary Text: `#020617`

## 🔐 Güvenlik

Platformda iki temel kullanıcı rolü bulunur:

- **Yönetici**
- **Müşteri**

Yetkilendirme yalnızca arayüz seviyesinde değil, backend ve veri erişim katmanlarında da uygulanır.

Müşteri hesapları yalnızca kendi operasyon ve finansal verilerine erişebilir.

Desteklenen hesap güvenliği özellikleri:

- Rol bazlı erişim kontrolü
- Tenant / müşteri veri izolasyonu
- İki aşamalı doğrulama (2FA)
- Aktif oturum yönetimi
- Güvenli profil yönetimi
- Audit / sistem logları

## ⚙️ Ortam Değişkenleri

Gizli anahtarları repository içerisine eklemeyin.

Yerel geliştirme için:

`/.env.local`

Production ortamında gerekli değişkenler **Vercel Environment Variables** üzerinden tanımlanmalıdır.

Örnek environment dosyası:

`.env.example`

Gerçek API key, token, password ve secret değerleri GitHub'a gönderilmemelidir.

## 💻 Local Development

Repository'yi klonlayın:

git clone <repository-url>

Proje klasörüne girin:

cd kargoda

Bağımlılıkları yükleyin:

npm install

Environment değişkenlerini yapılandırın ve development server'ı başlatın:

npm run dev

Uygulama varsayılan olarak:

http://localhost:3000

üzerinden çalışır.

## ☁️ Production

Production altyapısı:

GitHub → Vercel → Supabase

GitHub repository üzerinde yapılan güncellemeler Vercel deployment sürecine aktarılır.

Production database ve ilgili backend servisleri Supabase üzerinde çalışır.

## 📂 Proje Yapısı

Proje domain/feature odaklı ve sürdürülebilir bir mimariyle geliştirilmektedir.

Temel alanlar:

- Authentication
- Customers
- Shipments
- Cargo Providers
- Tracking
- Pricing
- Balance
- Current Accounts
- Notifications
- Reports
- Integrations
- Users
- Audit

## ⚠️ Lisans

Bu proje özel ve ticari kullanım için geliştirilmiştir.

Kaynak kodun izinsiz kopyalanması, dağıtılması, değiştirilmesi veya ticari amaçla kullanılması yasaktır.

**© Kargoda. Tüm hakları saklıdır.**

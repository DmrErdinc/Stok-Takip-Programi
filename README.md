<div align="center">

# 🏪 Stok Takip — Kurumsal Stok ve Satış Yönetimi

**Profesyonel stok takip, satış noktası (POS) ve raporlama sistemi**

[![NestJS](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-red?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://typescriptlang.org/)
[![SQLite](https://img.shields.io/badge/SQLite-DB-003B57?style=for-the-badge&logo=sqlite)](https://sqlite.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<br/>

*Modern, hızlı ve kullanıcı dostu stok takip uygulaması. Küçük ve orta ölçekli işletmeler için tasarlandı.*

</div>

---
## 📸 Ekran Görüntüleri

### 🔐 Giriş Ekranı

![Giriş Ekranı](docs/screenshots/login.png)

Demo hesaplar ile hızlı giriş yapabilirsiniz. Admin ve Kasiyer rolleri mevcuttur.

---

### 🛒 Satış Noktası (POS)

![POS Ekranı](docs/screenshots/pos.png)

Barkod okuyucu desteği, hızlı ürün arama, anlık sepet yönetimi ve nakit/kart/havale ödeme seçenekleri.

---

### 📦 Ürün Yönetimi

![Ürünler](docs/screenshots/products.png)

Ürün ekleme, düzenleme, silme. SKU, barkod, kategori, fiyat ve stok bilgileri tek ekranda.

---

### 📊 Stok Durumu

![Stok](docs/screenshots/stock.png)

Anlık stok seviyeleri, kritik stok uyarıları ve stok hareket geçmişi.

---

### 📋 Satış Geçmişi & İade

![Satış Geçmişi](docs/screenshots/sales-history.png)

Tüm satışlar, kasiyere göre gruplama, tarih filtreleme ve tek tıkla iade işlemi.

---

### ⚠️ Kritik Stok Raporu

![Kritik Stok](docs/screenshots/critical-stock.png)

Minimum stok seviyesinin altına düşen ürünler otomatik listelenir.

---

### 📈 Gün Sonu Raporu

![Gün Sonu](docs/screenshots/daily-report.png)

Günlük satış adedi, brüt ciro, iade tutarı, net ciro ve ödeme tipi dağılımı.

---

### 👥 Kullanıcı Yönetimi

![Kullanıcılar](docs/screenshots/users.png)

Admin panelinden kullanıcı ekleme, rol atama (Admin/Kasiyer) ve hesap yönetimi.
---

## ✨ Özellikler

### 🛒 Satış Noktası (POS)
- ⚡ **Barkod okuyucu** desteği ile hızlı ürün ekleme
- 🔍 İsim veya SKU ile **akıllı ürün arama**
- 🛒 Dinamik **sepet yönetimi** (miktar artır/azalt, sil)
- 💳 **Nakit, Kart, Havale** ödeme tipleri
- 🧾 Otomatik **fiş numarası** oluşturma
- ⌨️ **Klavye kısayolları** (F2: Barkod odak, Enter: Ekle, Del: Sil)

### 📦 Ürün Yönetimi
- ➕ Ürün ekleme ile birlikte **otomatik stok hareketi** oluşturma
- ✏️ Ürün düzenleme (fiyat, kategori, marka, raf konumu)
- 🏷️ **Çoklu barkod** desteği
- 📁 **Kategori** sistemi (Elektronik, Gıda, Kırtasiye, Giyim vb.)
- 🔍 SKU, isim ve barkod ile filtreleme

### 📊 Stok Yönetimi
- 📈 Anlık **stok seviyeleri** takibi
- ⚠️ **Kritik stok uyarıları** (minimum seviye altı otomatik tespit)
- 📋 **Stok hareket geçmişi** (giriş, çıkış, iade, sayım)
- 🔄 Manuel **stok düzeltme** (sayım farkı giderme)

### 💰 Satış & İade
- 📜 Detaylı **satış geçmişi** (fiş no, tarih, kasiyer, ürünler, tutar)
- 👤 **Kasiyere göre** satış gruplama
- 📅 **Tarih aralığı** filtreleme
- ↩️ Tek tıkla **iade** işlemi (stok otomatik güncellenir)
- 💵 KDV hesaplaması

### 📈 Raporlama
- ⚠️ **Kritik Stok Raporu** — minimum seviyenin altındaki ürünler
- 📊 **Satış Raporu** — dönemsel özet
- 🏆 **En Çok Satanlar** — popüler ürünler
- 📅 **Gün Sonu Raporu** — günlük ciro, iade, ödeme dağılımı
- 💎 **Stok Değeri** — toplam envanter değeri

### 👥 Kullanıcı Yönetimi
- 🔐 **JWT kimlik doğrulama**
- 👑 **Rol tabanlı yetkilendirme** (Admin, Kasiyer, Denetçi)
- 👤 Kullanıcı ekleme, düzenleme, devre dışı bırakma
- 📊 Kasiyere göre satış performansı

---

## 🏗️ Teknoloji Altyapısı

### Frontend
| Teknoloji | Açıklama |
|-----------|----------|
| **Next.js 15** | React tabanlı fullstack framework |
| **TypeScript** | Tip güvenli JavaScript |
| **Tailwind CSS** | Utility-first CSS framework |
| **Lucide React** | Modern ikon kütüphanesi |

### Backend
| Teknoloji | Açıklama |
|-----------|----------|
| **NestJS 10** | Progressive Node.js framework |
| **Prisma ORM** | Type-safe veritabanı erişimi |
| **SQLite** | Hafif, gömülü veritabanı |
| **JWT** | Token tabanlı kimlik doğrulama |
| **bcrypt** | Şifre hash'leme |

### Monorepo
| Teknoloji | Açıklama |
|-----------|----------|
| **pnpm** | Hızlı paket yöneticisi |
| **Turborepo** | Monorepo build sistemi |

---

## 📐 Veritabanı Şeması

```mermaid
erDiagram
    User ||--o{ Sale : creates
    User ||--o{ StockMove : performs
    User ||--o{ AuditLog : generates

    Category ||--o{ Product : contains
    Category ||--o{ Category : has_children

    Product ||--o{ Barcode : has
    Product ||--o{ SaleLine : sold_in
    Product ||--o{ StockMoveLine : moved_in

    Sale ||--o{ SaleLine : contains
    Sale ||--o| StockMove : triggers

    StockMove ||--o{ StockMoveLine : contains

    Supplier ||--o{ PurchaseOrder : receives
    PurchaseOrder ||--o{ PurchaseOrderLine : contains
    PurchaseOrder ||--o{ PurchaseReceipt : fulfilled_by
    PurchaseReceipt ||--o{ PurchaseReceiptLine : contains
    PurchaseReceipt ||--o| StockMove : triggers

    User {
        string id PK
        string email UK
        string name
        string role
        boolean active
    }

    Product {
        string id PK
        string sku UK
        string name
        float salePrice
        float costPrice
        int minStock
        string categoryId FK
    }

    Sale {
        string id PK
        string receiptNo UK
        string userId FK
        string paymentType
        float totalAmount
        boolean refunded
    }

    StockMove {
        string id PK
        string documentNo UK
        string type
        string reason
        string userId FK
    }
```

---

## 🚀 Kurulum

### Gereksinimler

- **Node.js** 18+
- **pnpm** 8+ (`npm install -g pnpm`)

### 1. Projeyi Klonlayın

```bash
git clone https://github.com/kullanici/stok-takip.git
cd stok-takip
```

### 2. Bağımlılıkları Yükleyin

```bash
pnpm install
```

### 3. Ortam Değişkenlerini Ayarlayın

```bash
cp apps/api/.env.example apps/api/.env
```

`.env` dosyasını düzenleyin:

```env
DATABASE_URL="file:./dev.db"
JWT_SECRET="super-secret-key-change-in-production"
API_PORT=3001
```

### 4. Veritabanını Oluşturun

```bash
cd apps/api
npx prisma migrate dev --name init
npx prisma db seed
cd ../..
```

### 5. Uygulamayı Başlatın

```bash
pnpm dev
```

🌐 **Frontend:** http://localhost:3000  
🔧 **Backend API:** http://localhost:3001

### 6. Demo Hesaplar ile Giriş

| Rol | E-posta | Şifre |
|-----|---------|-------|
| 👑 Admin | admin@stoktakip.com | admin123 |
| 💼 Kasiyer | kasiyer@stoktakip.com | kasiyer123 |

---

## 📁 Proje Yapısı

```
stok-takip/
├── apps/
│   ├── api/                    # Backend (NestJS)
│   │   ├── prisma/
│   │   │   ├── schema.prisma   # Veritabanı şeması
│   │   │   ├── seed.ts         # Demo verileri
│   │   │   └── dev.db          # SQLite veritabanı
│   │   └── src/
│   │       ├── auth/           # Kimlik doğrulama (JWT)
│   │       ├── products/       # Ürün CRUD
│   │       ├── sales/          # Satış & iade
│   │       ├── stock/          # Stok yönetimi
│   │       ├── reports/        # Raporlama
│   │       ├── categories/     # Kategori yönetimi
│   │       ├── users/          # Kullanıcı yönetimi
│   │       ├── suppliers/      # Tedarikçi yönetimi
│   │       ├── purchases/      # Satın alma
│   │       └── prisma/         # Prisma servisi
│   │
│   └── web/                    # Frontend (Next.js)
│       └── src/
│           ├── app/
│           │   ├── dashboard/
│           │   │   ├── pos/            # Satış noktası
│           │   │   ├── products/       # Ürünler
│           │   │   ├── stock/          # Stok
│           │   │   ├── sales-history/  # Satış geçmişi
│           │   │   ├── users/          # Kullanıcılar
│           │   │   └── reports/        # Raporlar
│           │   └── page.tsx            # Giriş sayfası
│           ├── lib/
│           │   ├── api.ts              # API istemcisi
│           │   ├── auth-context.tsx     # Auth context
│           │   └── utils.ts            # Yardımcı fonksiyonlar
│           └── components/             # UI bileşenleri
│
├── docs/screenshots/           # Ekran görüntüleri
├── package.json
├── pnpm-workspace.yaml
└── turbo.json
```

---

## 🔑 API Endpoints

### Auth
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `POST` | `/api/auth/login` | Giriş yap |
| `GET` | `/api/auth/me` | Mevcut kullanıcı bilgisi |

### Products
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/products` | Ürün listele (sayfalı, aranabilir) |
| `GET` | `/api/products/:id` | Ürün detayı |
| `GET` | `/api/products/barcode/:code` | Barkod ile ürün bul |
| `GET` | `/api/products/search?q=` | Ürün ara |
| `POST` | `/api/products` | Ürün ekle 🔒 Admin |
| `PUT` | `/api/products/:id` | Ürün güncelle 🔒 Admin |
| `DELETE` | `/api/products/:id` | Ürün sil (soft) 🔒 Admin |

### Sales
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/sales` | Satış listele |
| `GET` | `/api/sales/:id` | Satış detayı |
| `POST` | `/api/sales` | Yeni satış 🔒 Admin/Kasiyer |
| `POST` | `/api/sales/:id/refund` | İade 🔒 Admin/Kasiyer |

### Stock
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/stock` | Stok seviyeleri |
| `GET` | `/api/stock/movements` | Stok hareketleri |
| `POST` | `/api/stock/movement` | Stok hareketi oluştur 🔒 Admin |
| `POST` | `/api/stock/adjust` | Stok düzeltme 🔒 Admin |

### Reports
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/reports/critical-stock` | Kritik stok raporu |
| `GET` | `/api/reports/sales-summary` | Satış özeti |
| `GET` | `/api/reports/top-sellers` | En çok satanlar |
| `GET` | `/api/reports/daily-summary` | Gün sonu raporu |
| `GET` | `/api/reports/stock-value` | Stok değeri |

### Users
| Method | Endpoint | Açıklama |
|--------|----------|----------|
| `GET` | `/api/users` | Kullanıcı listele 🔒 Admin |
| `POST` | `/api/users` | Kullanıcı ekle 🔒 Admin |
| `PUT` | `/api/users/:id` | Kullanıcı güncelle 🔒 Admin |
| `DELETE` | `/api/users/:id` | Kullanıcı devre dışı 🔒 Admin |

---

## 🎨 Tasarım Özellikleri

- 🌙 **Premium Dark Mode** — göz yormayan, modern koyu tema
- ✨ **Cam Efekti (Glassmorphism)** — şık yarı-saydam kartlar
- 🎯 **Gradient İkonlar** — mor ve cyan tonlarında başlık ikonları
- 💫 **Micro Animasyonlar** — fade-in, scale-in, hover efektleri
- 📱 **Responsive** — masaüstü ve tablet uyumlu
- 🎲 **Emoji Destekli UI** — sezgisel görsel ipuçları

---

## 🔒 Güvenlik

- 🔑 **JWT Token** tabanlı kimlik doğrulama
- 🛡️ **RBAC** (Role-Based Access Control) — rol tabanlı yetkilendirme
- 🔐 **bcrypt** ile şifre hash'leme (10 round)
- 🚫 **CORS** koruması yapılandırılmış
- ✅ **ValidationPipe** — tüm girdiler doğrulanır, fazla alanlar reddedilir

---

## 📝 Lisans

Bu proje [MIT Lisansı](LICENSE) ile lisanslanmıştır.

---

<div align="center">

**⭐ Bu projeyi beğendiyseniz yıldız vermeyi unutmayın!**

Yapımcı: **Stok Takip Ekibi** • 2026

</div>

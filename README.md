# ERP_Demo - Teknik Kurulum ve Çalıştırma Rehberi

Bu ERP yazılımı; inşaat firmalarının şantiye yönetimi, personel takibi ve cari işlemlerini merkezi bir sistem üzerinden yönetmesini sağlar. Bu döküman, projenin yerel ortamda (development) ayağa kaldırılması için gereken terminal komutlarını içerir.

##  1. Veritabanı Yapılandırması (PostgreSQL)

Sunucu başlatılmadan önce PostgreSQL üzerinde veritabanı fiziksel olarak oluşturulmalıdır.

```bash
# Terminalden veritabanını oluşturun
createdb erp_demo
```

---

##  2. Backend (Sunucu) Kurulumu

Backend; Node.js, Express ve PostgreSQL tabanlıdır. Sunucu çalışmadan önce veritabanı şemasının (`setup-db.js`) kurulması zorunludur.

```bash
# 1. Backend klasörüne girin
cd backend

# 2. Bağımlılıkları yükleyin
npm install

# 3. .env dosyasını hazırlayın
# env.example dosyasını .env olarak kopyalayıp DB bilgilerinizi güncelleyin
cp env.example .env

# 4. Veritabanı tablolarını ve örnek verileri (seed) yükleyin
# Bu komut 'users', 'cari_accounts' ve 'transactions' tablolarını kurar
node scripts/setup-db.js

# 5. API sunucusunu başlatın
npm start
```
* API Adresi:`http://localhost:3001`
* Swagger Dokümantasyonu: `http://localhost:3001/api-docs`

---

## 3. Frontend (Arayüz) Kurulumu

Frontend; React, Vite, Ant Design ve Redux JS mimarisi üzerine kurulmuştur. Terminalde yeni bir sekme açarak şu komutları uygulayın:

```bash
# 1. Bağımlılıkları yükleyin
npm install

# 2. Uygulamayı geliştirme modunda başlatın
npm run dev
```
* Frontend Adresi: `http://localhost:5173`

---

##  Varsayılan Giriş Bilgileri

Sistem kurulumunda (`seed.js`) otomatik olarak aşağıdaki kullanıcılar tanımlanır:

| Kullanıcı Adı | Şifre | Rol |
| **admin** | admin123 | Yönetici |
| **user** | user123 | Standart Kullanıcı |

---

## Proje Mimarisi ve Güvenlik

* Yetkilendirme: JWT (JSON Web Token) tabanlı middleware yapısı.
* Veri Doğrulama:`express-validator` ile sıkı tip kontrolü.
* Dosya Yönetimi: `/backend/uploads` dizini ve Multer entegrasyonu.
* CORS:Güvenli origin listesi (localhost:3001, 5173, 3000).

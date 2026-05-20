# Dijital Tarif Defteri
 
> Sistem Analizi ve Tasarımı dersi kapsamında geliştirilmiş; kullanıcıların kendi yemek tariflerini ekleyebildiği, yönetebildiği ve defterinde denenmemiş olarak bekleyen tariflerin tavsiye edildiği RESTful API ve Web Uygulaması.
 
Modern web mimarisi standartlarına uygun olarak tasarlanmış olan bu sistem, güçlü bir Node.js arka ucu ve dinamik bir Vanilla JS ön ucu barındırmaktadır.
 
---
 
## Projenin Öne Çıkan Özellikleri
 
- **Güvenli Kimlik Doğrulama:** Kullanıcı kayıt ve giriş işlemleri şifrelenmiş (Bcrypt) ve JSON Web Token (JWT) ile yetkilendirilmiştir.
- **Tam Kapsamlı CRUD Mimarisi:** Tarif ekleme, listeleme, güncelleme ve silme işlemleri katı yetki kontrolleriyle gerçekleştirilir.
- **Akıllı Tavsiye Algoritması:** Kullanıcının veritabanında "denemediği" tarifleri analiz ederek rastgele öneriler sunar.
- **Modüler Mimari (MVC):** İş mantığı (Controllers) ile yönlendirmeler (Routes) birbirinden tamamen izole edilerek "Separation of Concerns" prensibi uygulanmıştır.
- **Canlı API Dokümantasyonu:** Tüm API uç noktaları Swagger UI ile belgelenmiş ve interaktif test ortamı sağlanmıştır.
- **Otomatik API Testleri (TDD):** Jest ve Supertest kullanılarak güvenlik, doğrulama ve veritabanı senaryoları için 13 adet kapsamlı test yazılmıştır.
---
 
## Kullanılan Teknolojiler
 
**Arka Yüz (Backend)**
- Node.js & Express.js
- SQLite (İlişkisel Veritabanı)
- JSON Web Token (JWT) & Bcrypt
- Swagger UI Express
- Jest & Supertest
**Ön Yüz (Frontend)**
- HTML5, CSS3, Vanilla JavaScript
- Fetch API
---
 
## Proje Klasör Mimarisi
 
```text
dijital-tarif-defteri/
│
├── public/                 # Ön yüz (Frontend) dosyaları
├── src/                    # Arka yüz (Backend) modülleri
│   ├── controllers/        # İş mantığı ve API operasyonları
│   ├── models/             # Veritabanı bağlantısı ve tablo yapıları
│   ├── routes/             # API yönlendirmeleri (Endpoints)
│   └── middlewares/        # Güvenlik ve yetki kontrolleri
│
├── api.test.js             # Otomatik API test paketleri
├── database.db             # SQLite veritabanı dosyası
├── swagger.json            # OpenAPI dokümantasyon konfigürasyonu
├── package.json            # Proje bağımlılıkları ve betikler
└── server.js               # Uygulama giriş noktası ve sunucu ayarları
```
 
---
 
## Kurulum ve Çalıştırma
 
Projeyi yerel ortamınızda çalıştırmak için aşağıdaki adımları sırasıyla izleyiniz:
 
**1. Depoyu Klonlayın**
```bash
git clone https://github.com/Sevval-Yildiz/dijital-tarif-defteri.git
```
 
**2. Bağımlılıkları Yükleyin**
```bash
npm install
```
 
**3. Çevre Değişkenlerini (.env) Ayarlayın**
 
Projenin ana dizininde (`server.js` ile aynı konumda) bir `.env` dosyası oluşturun ve içerisine aşağıdaki konfigürasyon ayarlarını ekleyin:
 
```env
# Uygulamanın çalışacağı port numarası
PORT=3000
 
# JWT (JSON Web Token) imzalamak için kullanılacak gizli anahtar
# Not: Kendi ortamınızda karmaşık ve tahmin edilemez bir değer belirleyiniz.
JWT_SECRET=your_jwt_secret_key_here
```
 
**4. Sunucuyu Başlatın**
```bash
npm run dev
```
 
**5. Tarayıcıda Görüntüleyin**
 
Uygulama arayüzüne erişmek için tarayıcınızda şu adrese gidin: `http://localhost:3000`
 
---
 
## API Dokümantasyonu ve Testler
 
### Swagger UI ile İnteraktif Dokümantasyon
 
Proje çalışırken tüm uç noktaları incelemek ve test etmek için tarayıcınızda `http://localhost:3000/api-docs` adresini ziyaret edin. Korumalı rotaları denemek için `/api/auth/login` üzerinden alınan bilet (Token), "Authorize" sekmesine girilmelidir.
 
### Otomatik Testleri Başlatma
 
Uygulamanın kararlılığını ve hata toleransını ölçen 13 adet API testini çalıştırmak için terminalde şu komutu giriniz:
 
```bash
npm test
```
 
---
 
> Geliştirici: **Şevval Yıldız** | Bilgisayar Mühendisliği Öğrencisi
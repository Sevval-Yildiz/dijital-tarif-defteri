// Gerekenleri çağırma :
const express = require('express'); // Web sunucumuzu kuracak ana iskelet (motor).
const cors = require('cors'); // Frontend ile backendin güvenli konuşmasını sağlayan izin belgesi.
require('dotenv').config(); // .env dosyamızdaki gizli sifrelerimizi okuyabilmemizi sağlayan paket.
const db = require('./src/models/database'); // Veritabanımızın çalışması için ana motorumuzda onu çağırıyoruz.
const swaggerUi = require('swagger-ui-express');
// server.js ve swagger.json yan yana olduğu için sadece ./ kullanıyoruz
const swaggerDocument = require('./swagger.json');

// Motoru çalıştırma ve ayarlar :
const app = express(); // Express'i çalıştırıp app adında bir sunucu objesi üretiyoruz.
// Frontend (Arayüz) dosyalarının bulunduğu 'public' klasörünü dışa açıyoruz (Static File Serving)
app.use(express.static('public'));
const PORT = process.env.PORT || 3000; // .env dosyasına bak, PORT varsa onu al, yoksa 3000'i kullan

// Sunucuya yetenekler ekleme (Middlewares) : 
app.use(express.json()); // Sunucuya diyoruz ki: "Dışarıdan sana JSON formatında veri gelirse bunu anla ve oku".
app.use(cors()); // Güvenlik engelini kaldırıp veri alışverişine izin veriyoruz.
app.use(express.static('public')); // Sunucuya diyoruz ki: "Biri siteme girerse, ona 'public' klasörünün içindeki HTML/CSS dosyalarını göster".

// İlk route denemesi :
// Biri tarayıcıda "http://localhost:3000/api/test" adresine giderse (GET isteği yaparsa) : 
app.get('/api/test', (req, res) => {
    // Ona bu JSON mesajını cevap (res - response) olarak gönder
    res.json({ mesaj: "Dijital Tarif Defteri backend'i çalışıyor!" });
});

// Garsonlarımızı çağırıyoruz
const authRoutes = require('./src/routes/authRoutes');
// "Eğer biri /api/auth ile başlayan bir adrese gelirse, onlarla bu garsonlar ilgilensin" diyoruz
app.use('/api/auth', authRoutes);

// Tarif işlemleri için yönlendirmeleri çağırıyoruz
const recipeRoutes = require('./src/routes/recipeRoutes');
app.use('/api/recipes', recipeRoutes);

// Swagger API Dokümantasyonu Rotası
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Sunucuya "Belirlediğimiz kapıda (3000) sürekli dinlemede kal ve uyanık ol" diyoruz.
app.listen(PORT, () => {
    console.log(`Sunucu http://localhost:${PORT} adresinde ayaklandı!`);
});
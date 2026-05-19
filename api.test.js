const request = require('supertest');
const API_URL = 'http://localhost:3000';

describe('Dijital Tarif Defteri - Nihai ve Tam Kapsamlı API Testleri', () => {
    
    // Testler arası veri taşımak için global değişkenlerimiz
    let token = '';
    let createdRecipeId = '';
    const uniqueEmail = `test_${Date.now()}@muhendislik.com`;

    // ==========================================
    // BÖLÜM 1: KAYIT OLMA (REGISTER) VALIDASYONLARI
    // ==========================================
    describe('Kullanıcı Kayıt İşlemleri (POST /api/auth/register)', () => {
        test('❌ Boş veri gönderildiğinde reddedilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/register').send({
                email: "",
                password: ""
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.mesaj).toBe("Lütfen email ve şifre giriniz.");
        });

        test('❌ Geçersiz e-posta formatı reddedilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/register').send({
                email: "sadece_yazi_domain_yok",
                password: "password123"
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.mesaj).toBe("Lütfen geçerli bir e-posta adresi (örneğin: deneme@mail.com) giriniz.");
        });

        test('❌ Şifre 6 karakterden kısaysa reddedilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/register').send({
                email: "kisa@muhendislik.com",
                password: "12345" // 5 karakter
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.mesaj).toBe("Şifreniz en az 6, en fazla 50 karakter uzunluğunda olmalıdır.");
        });

        test('❌ Şifre 50 karakterden uzunsa reddedilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/register').send({
                email: "uzun@muhendislik.com",
                password: "a".repeat(51) // 51 karakter
            });
            expect(response.statusCode).toBe(400);
            expect(response.body.mesaj).toBe("Şifreniz en az 6, en fazla 50 karakter uzunluğunda olmalıdır.");
        });

        test('✅ Doğru bilgilerle kayıt başarılı olmalı', async () => {
            const response = await request(API_URL).post('/api/auth/register').send({
                email: uniqueEmail,
                password: "gecerli_sifre_123" 
            });
            expect(response.statusCode).toBe(201); // 201 Created
        });
    });

    // ==========================================
    // BÖLÜM 2: GİRİŞ YAPMA (LOGIN) VE SİSTEM GÜVENLİĞİ
    // ==========================================
    describe('Sistem Güvenliği ve Giriş (POST /api/auth/login)', () => {
        test('❌ Sisteme kayıtlı olmayan (yanlış) e-posta ile giriş reddedilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/login').send({
                email: "sistemde_hic_olmayan_biri@test.com",
                password: "gecerli_sifre_123"
            });
            expect(response.statusCode).not.toBe(200); // Başarılı olmamalı
        });

        test('❌ Yanlış şifre ile giriş reddedilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/login').send({
                email: uniqueEmail,
                password: "yanlis_sifre"
            });
            expect(response.statusCode).toBe(401); // 401 Unauthorized
        });

        test('✅ Doğru bilgilerle giriş yapıp Token alınabilmeli', async () => {
            const response = await request(API_URL).post('/api/auth/login').send({
                email: uniqueEmail,
                password: "gecerli_sifre_123"
            });
            expect(response.statusCode).toBe(200);
            expect(response.body.token).toBeDefined();
            token = response.body.token; // Alınan token diğer testlerde kullanılacak
        });

        test('❌ Tokensız (Biletsiz) korumalı rotalara girilememeli', async () => {
            const response = await request(API_URL).get('/api/recipes');
            expect(response.statusCode).toBe(403);
        });
    });

    // ==========================================
    // BÖLÜM 3: TAM CRUD (TARİF) İŞLEMLERİ
    // ==========================================
    describe('Tarif Yönetimi (C-R-U-D)', () => {
        
        // C - CREATE (Oluşturma)
        test('✅ Yetkili kullanıcı yeni tarif ekleyebilmeli (POST /api/recipes)', async () => {
            const response = await request(API_URL)
                .post('/api/recipes')
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: "Orijinal Test Makarnası",
                    ingredients: "Makarna, Su, Tuz",
                    instructions: "Hepsini kaynatın.",
                    category: "Ana Yemek",
                    is_tried: 1
                });
            expect(response.statusCode).toBe(201);
            expect(response.body.id).toBeDefined();
            createdRecipeId = response.body.id; // Eklenen tarifin ID'sini güncelleme ve silme için kaydet
        });

        // R - READ (Okuma)
        test('✅ Yetkili kullanıcı tarifleri listeleyebilmeli (GET /api/recipes)', async () => {
            const response = await request(API_URL)
                .get('/api/recipes')
                .set('Authorization', `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
            expect(response.body).toBeDefined();
        });

        // U - UPDATE (Güncelleme) - Senin uyarınla eklenen eksik parça!
        test('✅ Yetkili kullanıcı eklediği tarifi güncelleyebilmeli (PUT /api/recipes/:id)', async () => {
            const response = await request(API_URL)
                .put(`/api/recipes/${createdRecipeId}`)
                .set('Authorization', `Bearer ${token}`)
                .send({
                    title: "Güncellenmiş Bolonez Soslu Makarna",
                    ingredients: "Makarna, Kıyma, Domates Sosu",
                    instructions: "Önce sosu yapın, sonra makarnayla karıştırın.",
                    category: "Ana Yemek",
                    is_tried: 1
                });
            expect(response.statusCode).toBe(200);
        });

        // D - DELETE (Silme)
        test('✅ Yetkili kullanıcı eklediği tarifi silebilmeli (DELETE /api/recipes/:id)', async () => {
            const response = await request(API_URL)
                .delete(`/api/recipes/${createdRecipeId}`)
                .set('Authorization', `Bearer ${token}`);
            expect(response.statusCode).toBe(200);
        });
    });
});
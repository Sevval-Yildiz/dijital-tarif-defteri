const db = require('../models/database');

// 1. TARİF OLUŞTURMA (CREATE)
const createRecipe = (req, res) => {
    // req.body içinden artık is_tried verisini de çekiyoruz
    const { title, ingredients, instructions, category, is_tried } = req.body;
    const userId = req.user.id; // JWT'den gelen kullanıcı

    // Kategori validasyonu
    const allowedCategories = ["Kahvaltılık", "Ana Yemek", "Çorba", "Tatlı", "Hamur İşi", "Salata", "İçecek"];
    if (!allowedCategories.includes(category)) {
        return res.status(400).json({ mesaj: "Geçersiz kategori!" });
    }

    // Gelen is_tried verisini güvenli hale getiriyoruz (Yoksa 0 yap)
    const triedValue = is_tried === 1 ? 1 : 0;

    // SQL sorgusuna is_tried sütununu da ekledik
    const sql = `INSERT INTO recipes (title, ingredients, instructions, category, is_tried, user_id) VALUES (?, ?, ?, ?, ?, ?)`;
    
    db.run(sql, [title, ingredients, instructions, category, triedValue, userId], function(err) {
        if (err) return res.status(500).json({ mesaj: "Veritabanına kaydedilirken bir hata oluştu." });
        
        res.status(201).json({ 
            mesaj: "Tarif başarıyla eklendi.", 
            id: this.lastID 
        });
    });
};

// 2. KULLANICININ KENDİ TARİFLERİNİ GETİRME (READ)
const getAllRecipes = (req, res) => {
    const userId = req.user.id;

    // Sadece token'a sahip olan kullanıcının ID'si ile eşleşen tarifleri getir
    const sql = `SELECT * FROM recipes WHERE user_id = ?`;
    db.all(sql, [userId], (err, rows) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        res.json({ tarifler: rows });
    });
};

// 3. TARİF SİLME (DELETE)
const deleteRecipe = (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.id;

    // Sadece o tarifin sahibi silebilsin diye AND user_id = ? kontrolü ekliyoruz
    const sql = `DELETE FROM recipes WHERE id = ? AND user_id = ?`;
    db.run(sql, [recipeId, userId], function(err) {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        if (this.changes === 0) return res.status(404).json({ mesaj: "Tarif bulunamadı veya silme yetkiniz yok." });
        res.json({ mesaj: "Tarif başarıyla silindi." });
    });
};

// 4. ŞEFİN TAVSİYESİ - RASTGELE ÖNERİ ALGORİTMASI 
const getRandomRecipe = (req, res) => {
    const userId = req.user.id;

    // Kullanıcının daha önce denemediği (is_tried = 0) tarifler arasından rastgele 1 tane seç
    const sql = `SELECT * FROM recipes WHERE user_id = ? AND is_tried = 0 ORDER BY RANDOM() LIMIT 1`;
    db.get(sql, [userId], (err, row) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        if (!row) return res.status(404).json({ mesaj: "Önerecek denenmemiş tarif bulunamadı." });
        res.json({ onerilenTarif: row });
    });
};

// 5. TARİF GÜNCELLEME (UPDATE)
const updateRecipe = (req, res) => {
    const recipeId = req.params.id;
    const userId = req.user.id;
    const { title, ingredients, instructions, category, is_tried } = req.body;

    // Kategori validasyonu (Veri Bütünlüğü için)
    const allowedCategories = ["Kahvaltılık", "Ana Yemek", "Çorba", "Tatlı", "Hamur İşi", "Salata", "İçecek"];
    if (category && !allowedCategories.includes(category)) {
        return res.status(400).json({ 
            mesaj: `Geçersiz kategori! Lütfen şunlardan birini seçin: ${allowedCategories.join(', ')}` 
        });
    }

    // Yalnızca tarifi oluşturan kişi güncelleyebilsin diye "user_id = ?" kontrolü yapıyoruz
    const sql = `UPDATE recipes SET title = ?, ingredients = ?, instructions = ?, category = ?, is_tried = ? WHERE id = ? AND user_id = ?`;
    
    db.run(sql, [title, ingredients, instructions, category, is_tried, recipeId, userId], function(err) {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        
        // Eğer hiçbir satır değişmediyse (tarif yoksa veya kullanıcı yetkisizse)
        if (this.changes === 0) {
            return res.status(404).json({ mesaj: "Tarif bulunamadı veya bu tarifi güncelleme yetkiniz yok." });
        }
        
        res.json({ mesaj: "Tarif başarıyla güncellendi." });
    });
};

module.exports = { createRecipe, getAllRecipes, deleteRecipe, getRandomRecipe, updateRecipe };
const db = require('../models/database');
const jwt = require('jsonwebtoken');

const register = (req, res) => {
    const { email, password } = req.body;

    // 1. BOŞLUK KONTROLÜ
    if (!email || !password) {
        return res.status(400).json({ mesaj: "Lütfen email ve şifre giriniz." });
    }

    // 2. EMAİL FORMATI KONTROLÜ 
    // Regex: İçinde boşluk olmayan, ortasında @ olan, sonra yine boşluksuz karakter ve . olan bir yapı arar.
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return res.status(400).json({ mesaj: "Lütfen geçerli bir e-posta adresi (örneğin: deneme@mail.com) giriniz." });
    }

    // 3. ŞİFRE UZUNLUK KONTROLÜ 
    if (password.length < 6 || password.length > 50) {
        return res.status(400).json({ mesaj: "Şifreniz en az 6, en fazla 50 karakter uzunluğunda olmalıdır." });
    }

    // Her şey kurallara uygunsa veritabanına kaydet
    const sql = `INSERT INTO users (email, password) VALUES (?, ?)`;
    db.run(sql, [email, password], function(err) {
        if (err) {
            if (err.message.includes('UNIQUE')) {
                return res.status(400).json({ mesaj: "Bu email zaten sistemde kayıtlı." });
            }
            return res.status(500).json({ mesaj: "Veritabanı hatası oluştu!" });
        }
        res.status(201).json({ mesaj: "Kayıt başarılı! Artık giriş yapabilirsiniz." });
    });
};

const login = (req, res) => {
    const { email, password } = req.body;

    const sql = `SELECT * FROM users WHERE email = ? AND password = ?`;
    db.get(sql, [email, password], (err, user) => {
        if (err) return res.status(500).json({ mesaj: "Veritabanı hatası!" });
        
        if (!user) return res.status(401).json({ mesaj: "Geçersiz email veya şifre!" });

        // JWT (Görünmez Damgalı Bilet) Oluşturuluyor
        const token = jwt.sign(
            { id: user.id, email: user.email }, 
            process.env.JWT_SECRET, 
            { expiresIn: '24h' } 
        );

        res.json({ mesaj: "Giriş başarılı!", token: token });
    });
};

module.exports = { register, login };
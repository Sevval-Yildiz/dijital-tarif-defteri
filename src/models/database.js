const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Veritabanı dosyamızın tam olarak nereye kaydedileceğini belirtiyoruz (ana klasörde database.db adında olacak)
const dbPath = path.resolve(__dirname, '../../database.db');

// Veritabanına bağlanıyoruz (eğer dosya yoksa bizim için otomatik oluşturacak)
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err.message);
    } else {
        console.log('SQLite veritabanına başarıyla bağlanıldı ve tablolar hazır!');
    }
});

// Tablolarımızı inşa etme bölümü
db.serialize(() => {
    // 1. KULLANICILAR TABLOSU (Senin JWT ve giriş yapma şartın için)
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL
    )`);

    // 2. TARİFLER TABLOSU (Projemizin ana varlığı)
    db.run(`CREATE TABLE IF NOT EXISTS recipes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER,
        title TEXT NOT NULL,
        ingredients TEXT NOT NULL,
        instructions TEXT NOT NULL,
        category TEXT,
        is_tried BOOLEAN DEFAULT 0,
        FOREIGN KEY (user_id) REFERENCES users(id)
    )`);
});

// Bu dosyayı diğer dosyalarda kullanabilmek için dışa aktarıyoruz.
module.exports = db;
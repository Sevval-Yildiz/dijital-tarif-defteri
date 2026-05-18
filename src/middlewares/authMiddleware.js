const jwt = require('jsonwebtoken');

// Yetkilendirme (Authorization) Kontrol Katmanı
const verifyToken = (req, res, next) => {
    // İstemciden gelen isteğin Header kısmındaki 'Authorization' verisini alıyoruz
    const authHeader = req.headers['authorization'];

    // Token yoksa 403 (Forbidden) hatası döndür
    if (!authHeader) {
        return res.status(403).json({ mesaj: "Erişim reddedildi: Token bulunamadı." });
    }

    // Token genellikle "Bearer eyJhbGci..." formatında gelir. Sadece token kısmını ayıklıyoruz.
    const token = authHeader.split(' ')[1];

    if (!token) {
        return res.status(403).json({ mesaj: "Erişim reddedildi: Token formatı hatalı." });
    }

    // JWT'nin geçerliliğini ve imzasını doğrulama işlemi
    jwt.verify(token, process.env.JWT_SECRET, (err, decodedUser) => {
        if (err) {
            return res.status(401).json({ mesaj: "Geçersiz veya süresi dolmuş token!" });
        }

        // Token geçerliyse, çözümlenen kullanıcı verisini (id ve email) Request objesine ekle
        // Böylece Controller katmanında bu veriye 'req.user' üzerinden erişebileceğiz
        req.user = decodedUser;
        
        // İşlemi bir sonraki katmana (Controller) aktar
        next();
    });
};

module.exports = verifyToken;
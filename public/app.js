// Arayüz Elementlerinin Seçilmesi (DOM Elements)
const loginSection = document.getElementById('login-section');
const registerSection = document.getElementById('register-section');
const dashboardSection = document.getElementById('dashboard-section');
const authNav = document.getElementById('auth-nav');
const alertContainer = document.getElementById('alert-container');

// Form Yönlendirme Linkleri
document.getElementById('go-to-register').addEventListener('click', (e) => {
    e.preventDefault();
    toggleSections('register');
});

document.getElementById('go-to-login').addEventListener('click', (e) => {
    e.preventDefault();
    toggleSections('login');
});

// Görünüm Değiştirme Fonksiyonu (State UI Toggle)
function toggleSections(currentView) {
    // Tüm alanları gizle
    loginSection.classList.add('d-none');
    registerSection.classList.add('d-none');
    dashboardSection.classList.add('d-none');

    // İstenen alanı görünür yap
    if (currentView === 'login') loginSection.classList.remove('d-none');
    if (currentView === 'register') registerSection.classList.remove('d-none');
    if (currentView === 'dashboard') dashboardSection.classList.remove('d-none');
}

// Uygulama Başlangıcında Oturum Kontrolü (Check Auth State)
function checkAuth() {
    const token = localStorage.getItem('token');
    
    if (token) {
        // Kullanıcı giriş yapmışsa navigasyon çubuğuna Çıkış Yap butonu ekle
        authNav.innerHTML = `<button class="btn btn-outline-light btn-sm" id="btn-logout">Güvenli Çıkış</button>`;
        document.getElementById('btn-logout').addEventListener('click', logout);
        toggleSections('dashboard');
        loadRecipes();
    } else {
        // Kullanıcı giriş yapmamışsa navigasyon çubuğunu temizle ve login ekranını göster
        authNav.innerHTML = '';
        toggleSections('login');
    }
}

// Hesaptan Çıkış Yapma Fonksiyonu (Logout Function)
function logout() {
    // Yerel hafızadaki JWT kimlik kartını siliyoruz
    localStorage.removeItem('token');
    showAlert('Oturum başarıyla sonlandırıldı.', 'success');
    checkAuth(); // Arayüz durumunu güncelle
}

// Global Bildirim Mesajı Fonksiyonu
function showAlert(message, type) {
    alertContainer.innerText = message;
    alertContainer.className = `alert alert-${type} text-center mb-4`;
    alertContainer.classList.remove('d-none');
    setTimeout(() => alertContainer.classList.add('d-none'), 4000);
}

// Sayfa yüklendiğinde oturum durumunu tetikle
document.addEventListener('DOMContentLoaded', checkAuth);

// ==========================================
// KİMLİK DOĞRULAMA (AUTHENTICATION) İŞLEMLERİ
// ==========================================

// 1. KAYIT OLMA (REGISTER) FONKSİYONU
document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault(); // Formun sayfayı yenilemesini (default davranışını) engelliyoruz

    // DOM'dan (Arayüzden) kullanıcı girdilerini alıyoruz
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;

    try {
        // Sunucuya POST isteği (Request) atıyoruz
        const response = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json' // Veriyi JSON formatında gönderdiğimizi belirtiyoruz
            },
            body: JSON.stringify({ email, password }) // JavaScript objesini JSON string'e çeviriyoruz (Payload)
        });

        const data = await response.json(); // Sunucudan dönen cevabı (Response) çözümlüyoruz

        if (response.ok) {
            // HTTP Status 200-299 arasıysa işlem başarılıdır
            showAlert('Kayıt başarılı! Lütfen giriş yapın.', 'success');
            toggleSections('login'); // Kullanıcıyı direkt giriş ekranına yönlendiriyoruz
            document.getElementById('register-form').reset(); // Form içindeki inputları temizliyoruz
        } else {
            // Sunucudan dönen özel hata mesajını (örneğin: "Geçersiz email formatı") gösteriyoruz
            showAlert(data.mesaj, 'danger');
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
        showAlert('Sunucuya bağlanırken bir hata oluştu.', 'danger');
    }
});

// 2. GİRİŞ YAPMA (LOGIN) FONKSİYONU
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok) {
            // Giriş başarılıysa, sunucunun verdiği JWT Token'ı tarayıcının yerel hafızasına (Local Storage) kaydediyoruz
            localStorage.setItem('token', data.token);
            
            showAlert('Giriş başarılı! Tarif defteriniz yükleniyor...', 'success');
            document.getElementById('login-form').reset();
            
            // Oturum durumunu güncelleyip Dashboard'u ekrana getirecek ana fonksiyonu tetikliyoruz
            checkAuth();
        } else {
            showAlert(data.mesaj, 'danger'); // Örn: "Geçersiz email veya şifre!"
        }
    } catch (error) {
        console.error('Giriş hatası:', error);
        showAlert('Sunucuya bağlanırken bir hata oluştu.', 'danger');
    }
});

// ==========================================
// TARİF (CRUD) İŞLEMLERİ
// ==========================================

let currentRecipes = [];

// 1. Tarifleri Backend'den Çekme ve Ekrana Basma (READ)
async function loadRecipes() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch('/api/recipes', {
            method: 'GET',
            headers: { 'Authorization': `Bearer ${token}` } // JWT Biletimizi gösteriyoruz
        });

        const data = await response.json();
        currentRecipes = data.tarifler;
        const container = document.getElementById('recipes-list-container');
        container.innerHTML = ''; // Ekranı temizle

        // Eğer kullanıcının hiç tarifi yoksa
        if (!data.tarifler || data.tarifler.length === 0) {
            container.innerHTML = `
                <div class="col-12 text-center mt-5">
                    <p class="text-muted lead">Burası biraz boş görünüyor.</p>
                    <p class="text-muted">Hemen sağ üstten ilk tarifinizi ekleyin!</p>
                </div>`;
            return;
        }

       // Gelen tarifleri Bootstrap Kartları (Cards) şeklinde ekrana basıyoruz
        data.tarifler.forEach(recipe => {
            container.innerHTML += `
                <div class="col-md-4 mb-4">
                    <div class="card h-100 shadow-sm border-0">
                        <div class="card-body">
                            <span class="badge custom-navbar mb-2">${recipe.category}</span>
                            <h5 class="card-title fw-bold text-dark">${recipe.title}</h5>
                            <p class="card-text text-muted small mt-3">
                                <strong>Malzemeler:</strong><br>
                                ${recipe.ingredients.substring(0, 60)}...
                            </p>
                        </div>
                        <div class="card-footer bg-transparent border-0 pt-0">
                            <button class="btn btn-sm btn-success w-100 mb-2" onclick="viewRecipe(${recipe.id})">📖 Tarifi Oku</button>
                            <button class="btn btn-sm btn-outline-danger w-100">🗑️ Sil</button>
                        </div>
                    </div>
                </div>
            `;
        });

    } catch (error) {
        console.error('Veri çekme hatası:', error);
    }
}

// 2. Yeni Tarif Ekleme (CREATE)
document.getElementById('add-recipe-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('token');

    // Formdaki verileri topluyoruz
    const newRecipe = {
        title: document.getElementById('recipe-title').value,
        ingredients: document.getElementById('recipe-ingredients').value,
        instructions: document.getElementById('recipe-instructions').value,
        category: document.getElementById('recipe-category').value
    };

    try {
        const response = await fetch('/api/recipes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(newRecipe)
        });

        if (response.ok) {
            // Modal'ı (Popup) programatik olarak kapatıyoruz
            const modalElement = document.getElementById('recipeModal');
            const modalInstance = bootstrap.Modal.getInstance(modalElement);
            modalInstance.hide();
            
            // Formu temizle ve arayüzü güncelle
            document.getElementById('add-recipe-form').reset();
            showAlert('Harika! Yeni tarif defterinize eklendi.', 'success');
            
            // Ekranı yenilemeden yeni tarifleri getirmesi için fonksiyonu tekrar çağırıyoruz
            loadRecipes();
        } else {
            const data = await response.json();
            showAlert(data.mesaj, 'danger');
        }
    } catch (error) {
        console.error('Kayıt hatası:', error);
    }
});

// 3. Seçili Tarifi Okuma (READ SPECIFIC)
function viewRecipe(recipeId) {
    // Tıklanan tarifi hafızadaki listeden (currentRecipes) buluyoruz
    const recipe = currentRecipes.find(r => r.id === recipeId);
    if (!recipe) return;

    // HTML'deki modal'ın içini, bulduğumuz tarifin bilgileriyle dolduruyoruz
    document.getElementById('detail-title').innerText = recipe.title;
    document.getElementById('detail-category').innerText = recipe.category;
    document.getElementById('detail-ingredients').innerText = recipe.ingredients;
    document.getElementById('detail-instructions').innerText = recipe.instructions;

    // Modalı (Pencereyi) ekranda gösteriyoruz
    const modal = new bootstrap.Modal(document.getElementById('recipeDetailModal'));
    modal.show();
}
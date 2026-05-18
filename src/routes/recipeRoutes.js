const express = require('express');
const router = express.Router();

// Controller ve Middleware katmanlarımızı projeye dahil ediyoruz
const recipeController = require('../controllers/recipeController');
const verifyToken = require('../middlewares/authMiddleware');

// CRUD Operasyonları için Korumalı Uç Noktalar (Protected Endpoints)
// Dikkat: Her bir route'un arasına 'verifyToken' middleware'ini ekledik.
// İstek buraya geldiğinde önce verifyToken çalışır, onay verirse controller'a geçer.

// 1. Yeni tarif ekleme (POST /api/recipes)
router.post('/', verifyToken, recipeController.createRecipe);

// 2. Kullanıcının tariflerini getirme (GET /api/recipes)
router.get('/', verifyToken, recipeController.getAllRecipes);

// 3. Şefin Tavsiyesi algoritması (GET /api/recipes/random)
router.get('/random', verifyToken, recipeController.getRandomRecipe);

// 4. Tarif silme (DELETE /api/recipes/:id) -> :id kısmı dinamik parametredir
router.delete('/:id', verifyToken, recipeController.deleteRecipe);

// 5. Tarif güncelleme (PUT /api/recipes/:id)
router.put('/:id', verifyToken, recipeController.updateRecipe);

module.exports = router;
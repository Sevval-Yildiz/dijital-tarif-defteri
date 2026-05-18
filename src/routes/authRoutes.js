const express = require('express');
const router = express.Router();

// Aşçımızı (Controller) mutfaktan çağırıyoruz
const authController = require('../controllers/authController');

// Gelen istekleri ilgili aşçıya yönlendiren garsonlarımız
router.post('/register', authController.register);
router.post('/login', authController.login);

module.exports = router;
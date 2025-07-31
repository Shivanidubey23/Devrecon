const express = require('express');
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateProfileUpdate
} = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Private routes (require authentication)
router.use(protect); // All routes below this middleware require authentication

router.get('/me', getMe);
router.put('/me', validateProfileUpdate, updateProfile);
router.put('/change-password', changePassword);

module.exports = router;
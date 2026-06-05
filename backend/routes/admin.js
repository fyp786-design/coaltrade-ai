// backend/routes/admin.js
const express = require('express');
const router = express.Router();
const {
  getDashboardStats, getAllUsers, toggleUserStatus,
  updateUserRole, deleteUser, getAllListingsAdmin
} = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middleware/auth');

// All admin routes require authentication + admin role
router.use(authenticate, isAdmin);

router.get('/dashboard', getDashboardStats);
router.get('/users', getAllUsers);
router.put('/users/:id/toggle-status', toggleUserStatus);
router.put('/users/:id/role', updateUserRole);
router.delete('/users/:id', deleteUser);
router.get('/listings', getAllListingsAdmin);

module.exports = router;

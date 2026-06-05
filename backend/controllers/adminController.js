// backend/controllers/adminController.js
const { pool } = require('../config/db');

// @GET /api/admin/dashboard - Dashboard stats
const getDashboardStats = async (req, res) => {
  try {
    const [users, listings, trades, pendingTrades] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users'),
      pool.query("SELECT COUNT(*) FROM coal_listings WHERE status = 'active'"),
      pool.query('SELECT COUNT(*) FROM trade_requests'),
      pool.query("SELECT COUNT(*) FROM trade_requests WHERE status = 'pending'"),
    ]);

    const recentUsers = await pool.query(
      'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC LIMIT 5'
    );
    const recentListings = await pool.query(
      `SELECT cl.id, cl.title, cl.coal_type, cl.price_per_ton, cl.status, cl.created_at, u.name as seller_name
       FROM coal_listings cl JOIN users u ON cl.user_id = u.id
       ORDER BY cl.created_at DESC LIMIT 5`
    );

    res.json({
      success: true,
      stats: {
        totalUsers: parseInt(users.rows[0].count),
        activeListings: parseInt(listings.rows[0].count),
        totalTrades: parseInt(trades.rows[0].count),
        pendingTrades: parseInt(pendingTrades.rows[0].count),
      },
      recentUsers: recentUsers.rows,
      recentListings: recentListings.rows
    });
  } catch (err) {
    console.error('GetDashboardStats error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/admin/users - Get all users
const getAllUsers = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, name, email, role, phone, company, location, is_active, created_at
       FROM users ORDER BY created_at DESC`
    );
    res.json({ success: true, users: result.rows });
  } catch (err) {
    console.error('GetAllUsers error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/admin/users/:id/toggle-status - Activate/Deactivate user
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account.' });
    }

    const result = await pool.query(
      'UPDATE users SET is_active = NOT is_active WHERE id = $1 RETURNING id, name, email, is_active',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    const user = result.rows[0];
    res.json({
      success: true,
      message: `User ${user.is_active ? 'activated' : 'deactivated'} successfully.`,
      user
    });
  } catch (err) {
    console.error('ToggleUserStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/admin/users/:id/role - Change user role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, message: 'Invalid role.' });
    }

    const result = await pool.query(
      'UPDATE users SET role = $1 WHERE id = $2 RETURNING id, name, email, role',
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User role updated.', user: result.rows[0] });
  } catch (err) {
    console.error('UpdateUserRole error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @DELETE /api/admin/users/:id - Delete user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account.' });
    }

    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    res.json({ success: true, message: 'User deleted successfully.' });
  } catch (err) {
    console.error('DeleteUser error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/admin/listings - Get all listings (admin view)
const getAllListingsAdmin = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cl.*, u.name as seller_name, u.email as seller_email
       FROM coal_listings cl
       JOIN users u ON cl.user_id = u.id
       ORDER BY cl.created_at DESC`
    );
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    console.error('GetAllListingsAdmin error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = {
  getDashboardStats, getAllUsers, toggleUserStatus,
  updateUserRole, deleteUser, getAllListingsAdmin
};

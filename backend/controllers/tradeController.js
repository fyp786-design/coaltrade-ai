// backend/controllers/tradeController.js
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');

// @POST /api/trade - Send trade request
const sendTradeRequest = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { listing_id, quantity_requested, offered_price, message } = req.body;

    // Get listing details
    const listingResult = await pool.query(
      'SELECT id, user_id, status FROM coal_listings WHERE id = $1',
      [listing_id]
    );

    if (listingResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    const listing = listingResult.rows[0];

    if (listing.status !== 'active') {
      return res.status(400).json({ success: false, message: 'Listing is not active.' });
    }

    if (listing.user_id === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot send a trade request to your own listing.' });
    }

    // Check if buyer already sent request for this listing
    const existingRequest = await pool.query(
      'SELECT id FROM trade_requests WHERE listing_id = $1 AND buyer_id = $2 AND status = $3',
      [listing_id, req.user.id, 'pending']
    );
    if (existingRequest.rows.length > 0) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this listing.' });
    }

    const result = await pool.query(
      `INSERT INTO trade_requests (listing_id, buyer_id, seller_id, quantity_requested, offered_price, message)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [listing_id, req.user.id, listing.user_id, quantity_requested, offered_price || null, message || null]
    );

    res.status(201).json({
      success: true,
      message: 'Trade request sent successfully.',
      tradeRequest: result.rows[0]
    });
  } catch (err) {
    console.error('SendTradeRequest error:', err);
    res.status(500).json({ success: false, message: 'Server error sending trade request.' });
  }
};

// @GET /api/trade/my - Get my trade requests (sent + received)
const getMyTradeRequests = async (req, res) => {
  try {
    // Requests I sent (as buyer)
    const sentResult = await pool.query(
      `SELECT tr.*, 
              cl.title as listing_title, cl.coal_type, cl.price_per_ton,
              u.name as seller_name, u.company as seller_company
       FROM trade_requests tr
       JOIN coal_listings cl ON tr.listing_id = cl.id
       JOIN users u ON tr.seller_id = u.id
       WHERE tr.buyer_id = $1
       ORDER BY tr.created_at DESC`,
      [req.user.id]
    );

    // Requests I received (as seller)
    const receivedResult = await pool.query(
      `SELECT tr.*, 
              cl.title as listing_title, cl.coal_type, cl.price_per_ton,
              u.name as buyer_name, u.company as buyer_company, u.email as buyer_email
       FROM trade_requests tr
       JOIN coal_listings cl ON tr.listing_id = cl.id
       JOIN users u ON tr.buyer_id = u.id
       WHERE tr.seller_id = $1
       ORDER BY tr.created_at DESC`,
      [req.user.id]
    );

    res.json({
      success: true,
      sent: sentResult.rows,
      received: receivedResult.rows
    });
  } catch (err) {
    console.error('GetMyTradeRequests error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @PUT /api/trade/:id/status - Accept/Reject trade request (seller only)
const updateTradeStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected', 'completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status value.' });
    }

    const checkResult = await pool.query(
      'SELECT * FROM trade_requests WHERE id = $1',
      [id]
    );

    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Trade request not found.' });
    }

    const tradeRequest = checkResult.rows[0];

    if (tradeRequest.seller_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    }

    const result = await pool.query(
      'UPDATE trade_requests SET status = $1 WHERE id = $2 RETURNING *',
      [status, id]
    );

    res.json({
      success: true,
      message: `Trade request ${status}.`,
      tradeRequest: result.rows[0]
    });
  } catch (err) {
    console.error('UpdateTradeStatus error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/trade - Admin: get all trade requests
const getAllTradeRequests = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT tr.*,
              cl.title as listing_title, cl.coal_type,
              buyer.name as buyer_name, buyer.email as buyer_email,
              seller.name as seller_name, seller.email as seller_email
       FROM trade_requests tr
       JOIN coal_listings cl ON tr.listing_id = cl.id
       JOIN users buyer ON tr.buyer_id = buyer.id
       JOIN users seller ON tr.seller_id = seller.id
       ORDER BY tr.created_at DESC`
    );
    res.json({ success: true, tradeRequests: result.rows });
  } catch (err) {
    console.error('GetAllTradeRequests error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

module.exports = { sendTradeRequest, getMyTradeRequests, updateTradeStatus, getAllTradeRequests };

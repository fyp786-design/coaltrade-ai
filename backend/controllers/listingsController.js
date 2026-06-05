// backend/controllers/listingsController.js
const { pool } = require('../config/db');
const { validationResult } = require('express-validator');
const axios = require('axios');

// @GET /api/listings - Get all active listings (marketplace)
const getAllListings = async (req, res) => {
  try {
    const { search, coal_type, listing_type, min_price, max_price, location, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;

    let query = `
      SELECT cl.*, u.name as seller_name, u.company as seller_company, u.location as seller_location
      FROM coal_listings cl
      JOIN users u ON cl.user_id = u.id
      WHERE cl.status = 'active'
    `;
    const params = [];
    let paramCount = 0;

    if (search) {
      paramCount++;
      query += ` AND (cl.title ILIKE $${paramCount} OR cl.description ILIKE $${paramCount} OR cl.coal_type ILIKE $${paramCount})`;
      params.push(`%${search}%`);
    }
    if (coal_type) {
      paramCount++;
      query += ` AND cl.coal_type ILIKE $${paramCount}`;
      params.push(`%${coal_type}%`);
    }
    if (listing_type) {
      paramCount++;
      query += ` AND cl.listing_type = $${paramCount}`;
      params.push(listing_type);
    }
    if (min_price) {
      paramCount++;
      query += ` AND cl.price_per_ton >= $${paramCount}`;
      params.push(parseFloat(min_price));
    }
    if (max_price) {
      paramCount++;
      query += ` AND cl.price_per_ton <= $${paramCount}`;
      params.push(parseFloat(max_price));
    }
    if (location) {
      paramCount++;
      query += ` AND cl.location ILIKE $${paramCount}`;
      params.push(`%${location}%`);
    }

    // Count query
    const countQuery = query.replace(
      'SELECT cl.*, u.name as seller_name, u.company as seller_company, u.location as seller_location',
      'SELECT COUNT(*)'
    );
    const countResult = await pool.query(countQuery, params);
    const total = parseInt(countResult.rows[0].count);

    query += ` ORDER BY cl.created_at DESC LIMIT $${paramCount + 1} OFFSET $${paramCount + 2}`;
    params.push(parseInt(limit), offset);

    const result = await pool.query(query, params);

    res.json({
      success: true,
      listings: result.rows,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (err) {
    console.error('GetAllListings error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching listings.' });
  }
};

// @GET /api/listings/:id - Get single listing details
const getListingById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT cl.*, u.name as seller_name, u.email as seller_email,
              u.company as seller_company, u.phone as seller_phone, u.location as seller_location
       FROM coal_listings cl
       JOIN users u ON cl.user_id = u.id
       WHERE cl.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }

    res.json({ success: true, listing: result.rows[0] });
  } catch (err) {
    console.error('GetListingById error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @GET /api/listings/my/listings - Get current user's listings
const getMyListings = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT cl.*, 
              (SELECT COUNT(*) FROM trade_requests tr WHERE tr.listing_id = cl.id) as trade_request_count
       FROM coal_listings cl
       WHERE cl.user_id = $1
       ORDER BY cl.created_at DESC`,
      [req.user.id]
    );
    res.json({ success: true, listings: result.rows });
  } catch (err) {
    console.error('GetMyListings error:', err);
    res.status(500).json({ success: false, message: 'Server error.' });
  }
};

// @POST /api/listings - Add new coal listing
const createListing = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const {
      title, coal_type, quantity, quantity_unit = 'tons',
      price_per_ton, location, description, calorific_value,
      ash_content, moisture_content, sulfur_content, listing_type = 'sell'
    } = req.body;

    // Try to get AI price prediction
    let ai_predicted_price = null;
    try {
      const aiResponse = await axios.post(
        `${process.env.AI_MODEL_URL}/predict`,
        { coal_type, calorific_value, ash_content, moisture_content, sulfur_content, quantity },
        { timeout: 5000 }
      );
      if (aiResponse.data && aiResponse.data.predicted_price) {
        ai_predicted_price = aiResponse.data.predicted_price;
      }
    } catch (aiErr) {
      console.warn('AI price prediction unavailable:', aiErr.message);
    }

    const result = await pool.query(
      `INSERT INTO coal_listings
        (user_id, title, coal_type, quantity, quantity_unit, price_per_ton, location,
         description, calorific_value, ash_content, moisture_content, sulfur_content,
         listing_type, ai_predicted_price)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14)
       RETURNING *`,
      [
        req.user.id, title, coal_type, quantity, quantity_unit, price_per_ton, location,
        description || null, calorific_value || null, ash_content || null,
        moisture_content || null, sulfur_content || null, listing_type, ai_predicted_price
      ]
    );

    res.status(201).json({
      success: true,
      message: 'Coal listing created successfully.',
      listing: result.rows[0]
    });
  } catch (err) {
    console.error('CreateListing error:', err);
    res.status(500).json({ success: false, message: 'Server error creating listing.' });
  }
};

// @PUT /api/listings/:id - Update coal listing
const updateListing = async (req, res) => {
  try {
    const { id } = req.params;

    // Verify ownership
    const checkResult = await pool.query(
      'SELECT user_id FROM coal_listings WHERE id = $1',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    if (checkResult.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this listing.' });
    }

    const {
      title, coal_type, quantity, quantity_unit, price_per_ton, location,
      description, calorific_value, ash_content, moisture_content, sulfur_content,
      listing_type, status
    } = req.body;

    const result = await pool.query(
      `UPDATE coal_listings SET
        title=COALESCE($1, title),
        coal_type=COALESCE($2, coal_type),
        quantity=COALESCE($3, quantity),
        quantity_unit=COALESCE($4, quantity_unit),
        price_per_ton=COALESCE($5, price_per_ton),
        location=COALESCE($6, location),
        description=COALESCE($7, description),
        calorific_value=COALESCE($8, calorific_value),
        ash_content=COALESCE($9, ash_content),
        moisture_content=COALESCE($10, moisture_content),
        sulfur_content=COALESCE($11, sulfur_content),
        listing_type=COALESCE($12, listing_type),
        status=COALESCE($13, status)
       WHERE id=$14
       RETURNING *`,
      [title, coal_type, quantity, quantity_unit, price_per_ton, location,
       description, calorific_value, ash_content, moisture_content, sulfur_content,
       listing_type, status, id]
    );

    res.json({
      success: true,
      message: 'Listing updated successfully.',
      listing: result.rows[0]
    });
  } catch (err) {
    console.error('UpdateListing error:', err);
    res.status(500).json({ success: false, message: 'Server error updating listing.' });
  }
};

// @DELETE /api/listings/:id - Delete coal listing
const deleteListing = async (req, res) => {
  try {
    const { id } = req.params;

    const checkResult = await pool.query(
      'SELECT user_id FROM coal_listings WHERE id = $1',
      [id]
    );
    if (checkResult.rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Listing not found.' });
    }
    if (checkResult.rows[0].user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
    }

    await pool.query('DELETE FROM coal_listings WHERE id = $1', [id]);

    res.json({ success: true, message: 'Listing deleted successfully.' });
  } catch (err) {
    console.error('DeleteListing error:', err);
    res.status(500).json({ success: false, message: 'Server error deleting listing.' });
  }
};

module.exports = { getAllListings, getListingById, getMyListings, createListing, updateListing, deleteListing };

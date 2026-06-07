// backend/controllers/aiController.js
const axios = require('axios');
const { pool } = require('../config/db');

// @POST /api/ai/predict - Get AI price prediction
const predictPrice = async (req, res) => {
  try {
    const {
      coal_type,
      calorific_value,
      ash_content,
      moisture_content,
      sulfur_content,
      quantity
    } = req.body;

    if (!coal_type) {
      return res.status(400).json({ success: false, message: 'coal_type is required.' });
    }

    const response = await axios.post(
      `${process.env.AI_MODEL_URL || 'http://localhost:5001'}/predict`,
      { coal_type, calorific_value, ash_content, moisture_content, sulfur_content, quantity },
      {  timeout: 60000  }
    );

    res.json({
      success: true,
      prediction: response.data
    });
  } catch (err) {
    console.error('PredictPrice error:', err.message);

    // Fallback: provide estimate based on coal type
    const fallbackPrices = {
      'anthracite': 180,
      'bituminous': 120,
      'sub-bituminous': 90,
      'lignite': 50,
      'coking coal': 220,
      'thermal coal': 100,
    };

    const coalTypeLower = (req.body.coal_type || '').toLowerCase();
    let estimatedPrice = 100;
    for (const [key, price] of Object.entries(fallbackPrices)) {
      if (coalTypeLower.includes(key)) {
        estimatedPrice = price;
        break;
      }
    }

    res.json({
      success: true,
      prediction: {
        predicted_price: estimatedPrice,
        confidence: 0.65,
        model: 'fallback_heuristic',
        note: 'AI model temporarily unavailable. Using estimated price.'
      }
    });
  }
};

// @GET /api/ai/market-insights - Get market statistics
const getMarketInsights = async (req, res) => {
  try {
    const stats = await pool.query(`
      SELECT 
        coal_type,
        COUNT(*) as listing_count,
        AVG(price_per_ton) as avg_price,
        MIN(price_per_ton) as min_price,
        MAX(price_per_ton) as max_price,
        SUM(quantity) as total_quantity
      FROM coal_listings
      WHERE status = 'active'
      GROUP BY coal_type
      ORDER BY listing_count DESC
    `);

    const totalListings = await pool.query("SELECT COUNT(*) FROM coal_listings WHERE status = 'active'");
    const totalTrades = await pool.query("SELECT COUNT(*) FROM trade_requests WHERE status = 'completed'");
    const totalUsers = await pool.query("SELECT COUNT(*) FROM users WHERE is_active = true");
    const recentListings = await pool.query(
      `SELECT coal_type, price_per_ton, created_at FROM coal_listings 
       WHERE status = 'active' ORDER BY created_at DESC LIMIT 10`
    );

    res.json({
      success: true,
      insights: {
        coalTypeStats: stats.rows,
        totalActiveListings: parseInt(totalListings.rows[0].count),
        completedTrades: parseInt(totalTrades.rows[0].count),
        activeUsers: parseInt(totalUsers.rows[0].count),
        recentListings: recentListings.rows
      }
    });
  } catch (err) {
    console.error('GetMarketInsights error:', err);
    res.status(500).json({ success: false, message: 'Server error fetching market insights.' });
  }
};

// @GET /api/ai/status - Check AI model status
const getAIStatus = async (req, res) => {
  try {
    const response = await axios.get(
      `${process.env.AI_MODEL_URL || 'http://localhost:5001'}/health`,
      { timeout: 5000 }
    );
    res.json({ success: true, status: 'online', details: response.data });
  } catch (err) {
    res.json({ success: true, status: 'offline', message: 'AI model is currently offline.' });
  }
};

module.exports = { predictPrice, getMarketInsights, getAIStatus };

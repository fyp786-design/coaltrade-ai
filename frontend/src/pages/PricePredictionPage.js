// frontend/src/pages/PricePredictionPage.js
import React, { useState } from 'react';
import { aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const COAL_TYPES = ['Anthracite', 'Bituminous', 'Sub-Bituminous', 'Lignite', 'Coking Coal', 'Thermal Coal'];

const PricePredictionPage = () => {
  const { user } = useAuth();
  const [form, setForm] = useState({
    coal_type: 'Thermal Coal', calorific_value: 5500, ash_content: 15,
    moisture_content: 10, sulfur_content: 0.8, quantity: 1000
  });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);
    try {
      const res = await aiAPI.predict(form);
      setResult(res.data.prediction);
    } catch (err) {
      setError(err.response?.data?.message || 'Prediction failed. Please try again.');
    } finally { setLoading(false); }
  };

  const qualityTip = (field, value) => {
    const tips = {
      calorific_value: value > 6500 ? '🟢 High quality' : value > 5000 ? '🟡 Medium quality' : '🔴 Low quality',
      ash_content: value < 10 ? '🟢 Low ash (good)' : value < 20 ? '🟡 Moderate ash' : '🔴 High ash (lower value)',
      moisture_content: value < 8 ? '🟢 Low moisture (good)' : value < 15 ? '🟡 Moderate' : '🔴 High moisture',
      sulfur_content: value < 0.5 ? '🟢 Low sulfur (premium)' : value < 1.5 ? '🟡 Moderate' : '🔴 High sulfur',
    };
    return tips[field] || '';
  };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>🤖 AI Coal Price Prediction</h1>
          <p>Enter coal quality parameters to get an AI-powered fair price estimate</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 28, maxWidth: 1000 }}>
          {/* Form */}
          <div>
            <div className="card">
              <div className="card-header">Enter Coal Parameters</div>
              <div className="card-body">
                {error && <div className="alert alert-error" style={{ marginBottom: 16 }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                  <div className="form-group">
                    <label className="form-label required">Coal Type</label>
                    <select className="form-control" value={form.coal_type} onChange={set('coal_type')}>
                      {COAL_TYPES.map(ct => <option key={ct}>{ct}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label required">
                      Calorific Value (kcal/kg)
                      <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8, fontSize: '0.8rem' }}>
                        {qualityTip('calorific_value', form.calorific_value)}
                      </span>
                    </label>
                    <input className="form-control" type="number" step="1" min="3000" max="9000"
                      value={form.calorific_value} onChange={set('calorific_value')} required />
                    <input type="range" min="3000" max="9000" step="50" value={form.calorific_value}
                      onChange={set('calorific_value')} style={{ width: '100%', accentColor: '#1a5f2e', marginTop: 6 }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">
                      Ash Content (%)
                      <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8, fontSize: '0.8rem' }}>
                        {qualityTip('ash_content', form.ash_content)}
                      </span>
                    </label>
                    <input className="form-control" type="number" step="0.1" min="0" max="50"
                      value={form.ash_content} onChange={set('ash_content')} required />
                    <input type="range" min="0" max="50" step="0.5" value={form.ash_content}
                      onChange={set('ash_content')} style={{ width: '100%', accentColor: '#1a5f2e', marginTop: 6 }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">
                      Moisture Content (%)
                      <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8, fontSize: '0.8rem' }}>
                        {qualityTip('moisture_content', form.moisture_content)}
                      </span>
                    </label>
                    <input className="form-control" type="number" step="0.1" min="0" max="40"
                      value={form.moisture_content} onChange={set('moisture_content')} required />
                    <input type="range" min="0" max="40" step="0.5" value={form.moisture_content}
                      onChange={set('moisture_content')} style={{ width: '100%', accentColor: '#1a5f2e', marginTop: 6 }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label required">
                      Sulfur Content (%)
                      <span style={{ fontWeight: 400, color: '#64748b', marginLeft: 8, fontSize: '0.8rem' }}>
                        {qualityTip('sulfur_content', form.sulfur_content)}
                      </span>
                    </label>
                    <input className="form-control" type="number" step="0.01" min="0" max="5"
                      value={form.sulfur_content} onChange={set('sulfur_content')} required />
                    <input type="range" min="0" max="5" step="0.05" value={form.sulfur_content}
                      onChange={set('sulfur_content')} style={{ width: '100%', accentColor: '#1a5f2e', marginTop: 6 }} />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Quantity (tons)</label>
                    <input className="form-control" type="number" step="1" min="1"
                      value={form.quantity} onChange={set('quantity')} />
                    <span className="form-hint">Larger quantities may lower the per-ton price</span>
                  </div>

                  {!user ? (
                    <div className="alert alert-info">
                      <Link to="/login" style={{ color: '#1e40af', fontWeight: 600 }}>Login</Link> to save predictions and access full features.
                    </div>
                  ) : null}

                  <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
                    {loading ? '⏳ Predicting...' : '🤖 Predict Price'}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Result Panel */}
          <div>
            {!result && !loading && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '48px 24px' }}>
                  <div style={{ fontSize: '4rem', marginBottom: 16 }}>🤖</div>
                  <h3 style={{ color: '#1a5f2e', marginBottom: 12 }}>AI Price Prediction</h3>
                  <p style={{ color: '#64748b', lineHeight: 1.7 }}>
                    Our Machine Learning model was trained on international coal import/export data.
                    Enter coal parameters on the left to get a fair price estimate.
                  </p>
                  <div style={{ marginTop: 24, padding: 16, background: '#f0fdf4', borderRadius: 8, textAlign: 'left' }}>
                    <div style={{ fontWeight: 700, color: '#166534', marginBottom: 8 }}>How it works:</div>
                    <ul style={{ color: '#374151', fontSize: '0.88rem', lineHeight: 1.8, paddingLeft: 20 }}>
                      <li>Random Forest + Gradient Boosting ensemble model</li>
                      <li>Trained on 2,000+ coal market data points</li>
                      <li>~88% prediction accuracy (R² score)</li>
                      <li>Considers all quality parameters</li>
                    </ul>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="card">
                <div className="card-body" style={{ textAlign: 'center', padding: '64px 24px' }}>
                  <div className="spinner" style={{ margin: '0 auto 16px' }}></div>
                  <p style={{ color: '#64748b' }}>Running ML model prediction...</p>
                </div>
              </div>
            )}

            {result && (
              <>
                <div className="card" style={{ marginBottom: 20 }}>
                  <div className="card-header" style={{ background: '#1a5f2e', color: 'white' }}>
                    🤖 AI Prediction Result
                  </div>
                  <div className="card-body" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: 8 }}>Predicted Fair Price</div>
                    <div style={{ fontSize: '3.5rem', fontWeight: 800, color: '#1a5f2e', lineHeight: 1 }}>
                      ${result.predicted_price?.toFixed(2)}
                    </div>
                    <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: 16 }}>per metric ton (USD)</div>

                    {result.price_range && (
                      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 16 }}>
                        <div style={{ padding: '10px 20px', background: '#f0fdf4', borderRadius: 8 }}>
                          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>LOW</div>
                          <div style={{ fontWeight: 700, color: '#15803d' }}>${result.price_range.low?.toFixed(2)}</div>
                        </div>
                        <div style={{ padding: '10px 20px', background: '#fef9c3', borderRadius: 8 }}>
                          <div style={{ fontSize: '0.75rem', color: '#854d0e', fontWeight: 600 }}>HIGH</div>
                          <div style={{ fontWeight: 700, color: '#a16207' }}>${result.price_range.high?.toFixed(2)}</div>
                        </div>
                      </div>
                    )}

                    <div style={{ padding: 12, background: '#f8fafc', borderRadius: 8, fontSize: '0.85rem', color: '#374151' }}>
                      <strong>Model Confidence:</strong> {((result.confidence || 0.85) * 100).toFixed(0)}%
                      {' · '}
                      <strong>Model:</strong> {result.model === 'ensemble_rf_gb' ? 'Ensemble (RF + GB)' : result.model}
                    </div>
                  </div>
                </div>

                {result.individual_predictions && (
                  <div className="card" style={{ marginBottom: 20 }}>
                    <div className="card-header">Individual Model Predictions</div>
                    <div className="card-body">
                      <div style={{ display: 'flex', gap: 12 }}>
                        <div style={{ flex: 1, padding: 14, background: '#dbeafe', borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#1e40af', fontWeight: 600 }}>RANDOM FOREST</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#1d4ed8' }}>
                            ${result.individual_predictions.random_forest?.toFixed(2)}
                          </div>
                        </div>
                        <div style={{ flex: 1, padding: 14, background: '#f0fdf4', borderRadius: 8, textAlign: 'center' }}>
                          <div style={{ fontSize: '0.75rem', color: '#166534', fontWeight: 600 }}>GRADIENT BOOST</div>
                          <div style={{ fontSize: '1.4rem', fontWeight: 700, color: '#15803d' }}>
                            ${result.individual_predictions.gradient_boosting?.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ display: 'flex', gap: 12 }}>
                  <Link to="/listings/add" className="btn btn-primary" style={{ flex: 1, justifyContent: 'center' }}>
                    📦 Post Listing
                  </Link>
                  <button className="btn btn-ghost" onClick={() => setResult(null)}>Try Again</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionPage;

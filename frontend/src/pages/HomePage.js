// frontend/src/pages/HomePage.js
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { aiAPI, listingsAPI } from '../services/api';

const HomePage = () => {
  const [insights, setInsights] = useState(null);
  const [recentListings, setRecentListings] = useState([]);

  useEffect(() => {
    aiAPI.getMarketInsights().then(r => setInsights(r.data.insights)).catch(() => {});
    listingsAPI.getAll({ limit: 6, page: 1 }).then(r => setRecentListings(r.data.listings || [])).catch(() => {});
  }, []);

  return (
    <div>
      {/* Hero */}
      <section style={heroStyles.hero}>
        <div className="container" style={heroStyles.inner}>
          <div style={heroStyles.content}>
            <div style={heroStyles.badge}>🤖 AI-Powered Coal Trading Platform</div>
            <h1 style={heroStyles.h1}>
              Trade Coal Smarter<br />with <span style={{color: '#f59e0b'}}>AI Predictions</span>
            </h1>
            <p style={heroStyles.sub}>
              Pakistan's first intelligent coal marketplace. Post listings, send trade requests,
              and get AI-powered price predictions to make smarter buying & selling decisions.
            </p>
            <div style={heroStyles.ctas}>
              <Link to="/marketplace" className="btn btn-secondary btn-lg">Browse Marketplace</Link>
              <Link to="/register" className="btn btn-outline btn-lg" style={{color: 'white', borderColor: 'rgba(255,255,255,0.6)'}}>
                Create Free Account
              </Link>
            </div>
          </div>
          <div style={heroStyles.statsGrid}>
            {[
              { label: 'Active Listings', value: insights?.totalActiveListings ?? '---', icon: '📦' },
              { label: 'Trades Completed', value: insights?.completedTrades ?? '---', icon: '✅' },
              { label: 'Active Traders', value: insights?.activeUsers ?? '---', icon: '👥' },
              { label: 'AI Accuracy', value: '~97% ', icon: '🤖' },
            ].map((s, i) => (
              <div key={i} style={heroStyles.statBox}>
                <div style={{fontSize: '1.6rem'}}>{s.icon}</div>
                <div style={{fontSize: '1.5rem', fontWeight: 700}}>{s.value}</div>
                <div style={{fontSize: '0.8rem', opacity: 0.8}}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{padding: '64px 0', background: 'white'}}>
        <div className="container">
          <h2 style={sectionHead}>Key Features</h2>
          <p style={sectionSub}>Everything you need for modern coal trading</p>
          <div className="grid-3" style={{marginTop: 40}}>
            {[
              { icon: '🤖', title: 'AI Price Prediction', desc: 'Our Machine Learning model predicts fair coal prices based on quality parameters like calorific value, ash content, and moisture.' },
              { icon: '📦', title: 'Listing Management', desc: 'Post coal listings for sale or purchase. Add detailed specifications and manage your inventory easily.' },
              { icon: '🤝', title: 'Trade Requests', desc: 'Send and receive trade requests directly from the platform. Accept or reject requests with one click.' },
              { icon: '🔐', title: 'Secure Authentication', desc: 'JWT-based authentication with bcrypt password hashing keeps your account secure.' },
              { icon: '📊', title: 'Market Insights', desc: 'Real-time market data showing price trends, popular coal types, and trading activity.' },
              { icon: '⚙', title: 'Admin Dashboard', desc: 'Full admin control over users, listings, and platform monitoring.' },
            ].map((f, i) => (
              <div key={i} className="card card-body" style={{textAlign: 'center'}}>
                <div style={{fontSize: '2.5rem', marginBottom: 16}}>{f.icon}</div>
                <h3 style={{fontWeight: 700, marginBottom: 8, color: '#1a5f2e'}}>{f.title}</h3>
                <p style={{color: '#64748b', fontSize: '0.9rem', lineHeight: 1.6}}>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Listings */}
      {recentListings.length > 0 && (
        <section style={{padding: '64px 0', background: '#f8faf8'}}>
          <div className="container">
            <h2 style={sectionHead}>Recent Listings</h2>
            <p style={sectionSub}>Latest coal listings on the marketplace</p>
            <div className="grid-3" style={{marginTop: 40}}>
              {recentListings.map(l => (
                <div key={l.id} className="listing-card">
                  <div className="listing-card-body">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
                      <span className={`badge ${l.listing_type === 'sell' ? 'badge-green' : 'badge-blue'}`}>
                        {l.listing_type === 'sell' ? '🟢 For Sale' : '🔵 Wanted'}
                      </span>
                      <span className="badge badge-gray">{l.coal_type}</span>
                    </div>
                    <h3 style={{fontWeight: 600, marginBottom: 8, fontSize: '1rem'}}>{l.title}</h3>
                    <div className="listing-price">${parseFloat(l.price_per_ton).toFixed(0)}/ton</div>
                    <div className="listing-meta">
                      <span className="listing-meta-item">📦 {parseFloat(l.quantity).toLocaleString()} {l.quantity_unit}</span>
                      <span className="listing-meta-item">📍 {l.location}</span>
                    </div>
                    <div style={{marginTop: 16}}>
                      <Link to={`/listings/${l.id}`} className="btn btn-outline btn-sm btn-full">
                        View Details
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div style={{textAlign: 'center', marginTop: 32}}>
              <Link to="/marketplace" className="btn btn-primary btn-lg">View All Listings →</Link>
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section style={{padding: '80px 0', background: 'linear-gradient(135deg, #1a5f2e 0%, #2d8a4a 100%)', color: 'white', textAlign: 'center'}}>
        <div className="container">
          <h2 style={{fontSize: '2rem', fontWeight: 700, marginBottom: 16}}>Ready to Start Trading?</h2>
          <p style={{opacity: 0.85, fontSize: '1.05rem', marginBottom: 32}}>Join Pakistan's intelligent coal marketplace today</p>
          <div style={{display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap'}}>
            <Link to="/register" className="btn btn-secondary btn-lg">Create Account</Link>
            <Link to="/ai/predict" className="btn btn-outline btn-lg" style={{color: 'white', borderColor: 'rgba(255,255,255,0.6)'}}>Try AI Prediction</Link>
          </div>
        </div>
      </section>
    </div>
  );
};

const heroStyles = {
  hero: { background: 'linear-gradient(135deg, #134823 0%, #1a5f2e 50%, #2d8a4a 100%)', color: 'white', padding: '80px 0 64px' },
  inner: { maxWidth: 1200 },
  content: { maxWidth: 640 },
  badge: { display: 'inline-block', background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.5)', color: '#f59e0b', padding: '6px 14px', borderRadius: 20, fontSize: '0.85rem', fontWeight: 600, marginBottom: 20 },
  h1: { fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.2, marginBottom: 20 },
  sub: { fontSize: '1.05rem', opacity: 0.85, lineHeight: 1.7, marginBottom: 36, maxWidth: 540 },
  ctas: { display: 'flex', gap: 16, flexWrap: 'wrap' },
  statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginTop: 56 },
  statBox: { background: 'rgba(255,255,255,0.1)', borderRadius: 12, padding: '20px 16px', textAlign: 'center', backdropFilter: 'blur(10px)' },
};

const sectionHead = { fontSize: '1.75rem', fontWeight: 700, textAlign: 'center', color: '#1a5f2e' };
const sectionSub = { textAlign: 'center', color: '#64748b', marginTop: 8 };

export default HomePage;

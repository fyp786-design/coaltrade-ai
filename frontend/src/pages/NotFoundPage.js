// frontend/src/pages/NotFoundPage.js
import React from 'react';
import { Link } from 'react-router-dom';

const NotFoundPage = () => (
  <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 40 }}>
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '6rem', marginBottom: 16 }}>⛏</div>
      <h1 style={{ fontSize: '3rem', fontWeight: 800, color: '#1a5f2e', marginBottom: 8 }}>404</h1>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: 12 }}>Page Not Found</h2>
      <p style={{ color: '#64748b', marginBottom: 32 }}>The page you're looking for doesn't exist or has been moved.</p>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
        <Link to="/" className="btn btn-primary btn-lg">Go Home</Link>
        <Link to="/marketplace" className="btn btn-outline btn-lg">Browse Marketplace</Link>
      </div>
    </div>
  </div>
);

export default NotFoundPage;

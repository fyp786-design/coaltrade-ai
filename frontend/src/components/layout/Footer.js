// frontend/src/components/layout/Footer.js
import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => (
  <footer style={styles.footer}>
    <div style={styles.container}>
      <div style={styles.grid}>
        <div>
          <h3 style={styles.brand}>⚫ CoalTrade AI</h3>
          <p style={styles.desc}>Pakistan's intelligent coal trading marketplace powered by machine learning.</p>
          <p style={styles.desc}>University of Lahore — BSCS FYP Fall 2021–2026</p>
        </div>
        <div>
          <h4 style={styles.colHead}>Quick Links</h4>
          <div style={styles.links}>
            <Link to="/marketplace" style={styles.link}>Marketplace</Link>
            <Link to="/ai/predict" style={styles.link}>AI Price Prediction</Link>
            <Link to="/register" style={styles.link}>Create Account</Link>
            <Link to="/login" style={styles.link}>Login</Link>
          </div>
        </div>
        <div>
          <h4 style={styles.colHead}>Contact</h4>
          <p style={styles.link}>📍 Lahore, Pakistan</p>
          <p style={styles.link}>✉ coaltrade@uol.edu.pk</p>
          <p style={styles.link}>🏫 Dept. of CS & IT, UOL</p>
        </div>
      </div>
      <div style={styles.bottom}>
        <p style={{color: 'rgba(255,255,255,0.5)', fontSize: '0.8rem'}}>
          © 2026 CoalTrade AI — Hammad Ahmed | M. Hassan Shahid | Muzamil Naseer
        </p>
      </div>
    </div>
  </footer>
);

const styles = {
  footer: { background: '#134823', color: 'white', padding: '48px 0 24px' },
  container: { maxWidth: 1200, margin: '0 auto', padding: '0 24px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 40, marginBottom: 40 },
  brand: { fontSize: '1.2rem', marginBottom: 12, fontWeight: 700 },
  desc: { fontSize: '0.85rem', color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, marginBottom: 6 },
  colHead: { fontSize: '0.9rem', fontWeight: 700, marginBottom: 12, color: '#f59e0b' },
  links: { display: 'flex', flexDirection: 'column', gap: 8 },
  link: { color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.85rem', transition: 'color 0.2s' },
  bottom: { borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 24, textAlign: 'center' },
};

export default Footer;

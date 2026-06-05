// frontend/src/components/layout/Navbar.js
import React, { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    setMenuOpen(false);
  };

  return (
    <nav style={styles.nav}>
      <div style={styles.container}>
        {/* Logo */}
        <Link to="/" style={styles.logo}>
          <span style={styles.logoIcon}>⚫</span>
          <span>CoalTrade <strong>AI</strong></span>
        </Link>

        {/* Desktop Nav Links */}
        <div style={styles.navLinks}>
          <NavLink to="/marketplace" style={({isActive}) => ({...styles.link, ...(isActive ? styles.linkActive : {})})}>
            Marketplace
          </NavLink>
          <NavLink to="/ai/predict" style={({isActive}) => ({...styles.link, ...(isActive ? styles.linkActive : {})})}>
            🤖 AI Predict
          </NavLink>

          {user ? (
            <>
              <NavLink to="/dashboard" style={({isActive}) => ({...styles.link, ...(isActive ? styles.linkActive : {})})}>
                Dashboard
              </NavLink>
              <NavLink to="/my-listings" style={({isActive}) => ({...styles.link, ...(isActive ? styles.linkActive : {})})}>
                My Listings
              </NavLink>
              <NavLink to="/trade-requests" style={({isActive}) => ({...styles.link, ...(isActive ? styles.linkActive : {})})}>
                Trade Requests
              </NavLink>
              {user.role === 'admin' && (
                <NavLink to="/admin" style={({isActive}) => ({...styles.link, color: '#f59e0b', ...(isActive ? styles.linkActive : {})})}>
                  ⚙ Admin
                </NavLink>
              )}
              <div style={styles.userMenu}>
                <span style={styles.userGreet}>👤 {user.name}</span>
                <div style={styles.dropdown}>
                  <Link to="/profile" style={styles.dropdownItem}>My Profile</Link>
                  <button onClick={handleLogout} style={styles.dropdownItem}>Logout</button>
                </div>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" style={{...styles.link, ...styles.btnOutline}}>Login</Link>
              <Link to="/register" style={{...styles.link, ...styles.btnFilled}}>Register</Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger */}
        <button style={styles.hamburger} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
          {menuOpen ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div style={styles.mobileMenu}>
          <Link to="/marketplace" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Marketplace</Link>
          <Link to="/ai/predict" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>🤖 AI Price Predict</Link>
          {user ? (
            <>
              <Link to="/dashboard" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Dashboard</Link>
              <Link to="/my-listings" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>My Listings</Link>
              <Link to="/trade-requests" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Trade Requests</Link>
              <Link to="/profile" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Profile</Link>
              {user.role === 'admin' && (
                <Link to="/admin" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Admin Panel</Link>
              )}
              <button onClick={handleLogout} style={{...styles.mobileLink, width: '100%', textAlign: 'left', background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444'}}>
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Login</Link>
              <Link to="/register" style={styles.mobileLink} onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

const styles = {
  nav: {
    position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
    background: '#1a5f2e', boxShadow: '0 2px 12px rgba(0,0,0,0.15)',
  },
  container: {
    maxWidth: 1200, margin: '0 auto', padding: '0 24px',
    height: 64, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: {
    display: 'flex', alignItems: 'center', gap: 8,
    color: 'white', textDecoration: 'none', fontSize: '1.1rem',
  },
  logoIcon: { fontSize: '1.3rem' },
  navLinks: { display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' },
  link: {
    color: 'rgba(255,255,255,0.85)', textDecoration: 'none',
    padding: '6px 12px', borderRadius: 6, fontSize: '0.875rem', fontWeight: 500,
    transition: 'all 0.2s',
  },
  linkActive: { color: 'white', background: 'rgba(255,255,255,0.15)' },
  btnOutline: { border: '1.5px solid rgba(255,255,255,0.5)', color: 'white' },
  btnFilled: { background: '#f59e0b', color: '#1a2e1a', fontWeight: 700, borderRadius: 8 },
  userMenu: { position: 'relative', cursor: 'pointer' },
  userGreet: {
    color: 'white', fontSize: '0.875rem', fontWeight: 600,
    padding: '6px 12px', borderRadius: 6, display: 'block',
  },
  dropdown: {
    position: 'absolute', top: '100%', right: 0, marginTop: 4,
    background: 'white', borderRadius: 8, boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
    minWidth: 160, overflow: 'hidden', zIndex: 100,
  },
  dropdownItem: {
    display: 'block', padding: '10px 16px', color: '#1a2e1a',
    textDecoration: 'none', fontSize: '0.875rem', fontWeight: 500,
    background: 'none', border: 'none', width: '100%', textAlign: 'left',
    cursor: 'pointer', transition: 'background 0.15s',
  },
  hamburger: {
    background: 'none', border: 'none', color: 'white',
    fontSize: '1.4rem', cursor: 'pointer', display: 'none',
    padding: '4px 8px',
  },
  mobileMenu: {
    background: '#134823', padding: '16px 24px',
    display: 'flex', flexDirection: 'column', gap: 4,
  },
  mobileLink: {
    color: 'rgba(255,255,255,0.9)', textDecoration: 'none',
    padding: '10px 0', fontSize: '0.95rem', fontWeight: 500,
    borderBottom: '1px solid rgba(255,255,255,0.1)', display: 'block',
  },
};

export default Navbar;

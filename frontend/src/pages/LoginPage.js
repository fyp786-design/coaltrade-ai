// frontend/src/pages/LoginPage.js
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={authStyles.page}>
      <div style={authStyles.card}>
        <div style={authStyles.logo}>⚫ CoalTrade AI</div>
        <h2 style={authStyles.title}>Sign In to Your Account</h2>
        <p style={authStyles.sub}>Welcome back! Please enter your details.</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label required">Email Address</label>
            <input type="email" className="form-control" placeholder="you@example.com"
              value={form.email} onChange={e => setForm({...form, email: e.target.value})} required />
          </div>
          <div className="form-group">
            <label className="form-label required">Password</label>
            <input type="password" className="form-control" placeholder="Enter your password"
              value={form.password} onChange={e => setForm({...form, password: e.target.value})} required />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Signing in...' : 'Sign In'}
          </button>
        </form>

        <p style={authStyles.footer}>
          Don't have an account? <Link to="/register" style={authStyles.footerLink}>Create one here</Link>
        </p>
      </div>
    </div>
  );
};

// ─── Register Page ────────────────────────────────────────────
export const RegisterPage = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '', company: '', location: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return; }
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Account created! Welcome, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const set = (field) => (e) => setForm({...form, [field]: e.target.value});

  return (
    <div style={authStyles.page}>
      <div style={{...authStyles.card, maxWidth: 540}}>
        <div style={authStyles.logo}>⚫ CoalTrade AI</div>
        <h2 style={authStyles.title}>Create Your Account</h2>
        <p style={authStyles.sub}>Join Pakistan's intelligent coal trading marketplace</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label required">Full Name</label>
              <input type="text" className="form-control" placeholder="Muhammad Hassan" value={form.name} onChange={set('name')} required />
            </div>
            <div className="form-group">
              <label className="form-label required">Email</label>
              <input type="email" className="form-control" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label required">Password</label>
            <input type="password" className="form-control" placeholder="Min. 6 characters" value={form.password} onChange={set('password')} required />
          </div>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">Phone Number</label>
              <input type="tel" className="form-control" placeholder="+92 300 1234567" value={form.phone} onChange={set('phone')} />
            </div>
            <div className="form-group">
              <label className="form-label">Company / Organization</label>
              <input type="text" className="form-control" placeholder="Your company" value={form.company} onChange={set('company')} />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Location</label>
            <input type="text" className="form-control" placeholder="Lahore, Pakistan" value={form.location} onChange={set('location')} />
          </div>
          <button type="submit" className="btn btn-primary btn-full btn-lg" disabled={loading}>
            {loading ? '⏳ Creating account...' : 'Create Account'}
          </button>
        </form>

        <p style={authStyles.footer}>
          Already have an account? <Link to="/login" style={authStyles.footerLink}>Sign in here</Link>
        </p>
      </div>
    </div>
  );
};

const authStyles = {
  page: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', background: '#f8faf8' },
  card: { background: 'white', borderRadius: 16, padding: 40, boxShadow: '0 10px 40px rgba(0,0,0,0.1)', width: '100%', maxWidth: 460 },
  logo: { fontSize: '1.1rem', fontWeight: 700, color: '#1a5f2e', textAlign: 'center', marginBottom: 24 },
  title: { fontSize: '1.5rem', fontWeight: 700, textAlign: 'center', marginBottom: 8, color: '#1a2e1a' },
  sub: { color: '#64748b', textAlign: 'center', marginBottom: 28, fontSize: '0.9rem' },
  footer: { textAlign: 'center', marginTop: 24, fontSize: '0.9rem', color: '#64748b' },
  footerLink: { color: '#1a5f2e', fontWeight: 600, textDecoration: 'none' },
};

export default LoginPage;

// frontend/src/pages/AdminDashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../services/api';

const AdminDashboardPage = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminAPI.getDashboard()
      .then(r => setData(r.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-loading"><div className="spinner"></div></div>;

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>⚙ Admin Dashboard</h1>
          <p>Platform overview and management</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Stats */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'Total Users', value: data?.stats?.totalUsers, icon: '👥', link: '/admin/users', color: '#1a5f2e' },
            { label: 'Active Listings', value: data?.stats?.activeListings, icon: '📦', link: '/admin/listings', color: '#2563eb' },
            { label: 'Total Trades', value: data?.stats?.totalTrades, icon: '🤝', link: '#', color: '#7c3aed' },
            { label: 'Pending Trades', value: data?.stats?.pendingTrades, icon: '⏳', link: '#', color: '#d97706' },
          ].map((s, i) => (
            <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
              <div className="stat-card">
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value ?? '—'}</div>
              </div>
            </Link>
          ))}
        </div>

        {/* Nav Cards */}
        <div className="grid-3" style={{ marginBottom: 28 }}>
          {[
            { title: 'Manage Users', desc: 'View, activate, deactivate, or change roles', link: '/admin/users', icon: '👥' },
            { title: 'Manage Listings', desc: 'View and moderate all coal listings', link: '/admin/listings', icon: '📦' },
            { title: 'AI Model Status', desc: 'Monitor ML model health and accuracy', link: '/ai/predict', icon: '🤖' },
          ].map((c, i) => (
            <Link key={i} to={c.link} style={{ textDecoration: 'none' }}>
              <div className="card card-body" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                <div style={{ fontSize: '2rem', marginBottom: 12 }}>{c.icon}</div>
                <h3 style={{ fontWeight: 700, color: '#1a5f2e', marginBottom: 6 }}>{c.title}</h3>
                <p style={{ color: '#64748b', fontSize: '0.875rem' }}>{c.desc}</p>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          {/* Recent Users */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recent Users</span>
              <Link to="/admin/users" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Name</th><th>Email</th><th>Role</th></tr></thead>
                <tbody>
                  {(data?.recentUsers || []).map(u => (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 600 }}>{u.name}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.email}</td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-yellow' : 'badge-green'}`}>{u.role}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Listings */}
          <div className="card">
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Recent Listings</span>
              <Link to="/admin/listings" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead><tr><th>Title</th><th>Price</th><th>Status</th></tr></thead>
                <tbody>
                  {(data?.recentListings || []).map(l => (
                    <tr key={l.id}>
                      <td style={{ fontWeight: 600, fontSize: '0.85rem' }}>{l.title}</td>
                      <td>${parseFloat(l.price_per_ton).toFixed(0)}/ton</td>
                      <td><span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{l.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboardPage;

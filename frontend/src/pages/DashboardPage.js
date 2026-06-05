// frontend/src/pages/DashboardPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI, tradeAPI, aiAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

const DashboardPage = () => {
  const { user } = useAuth();
  const [myListings, setMyListings] = useState([]);
  const [tradeData, setTradeData] = useState({ sent: [], received: [] });
  const [insights, setInsights] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      listingsAPI.getMyListings(),
      tradeAPI.getMyRequests(),
      aiAPI.getMarketInsights(),
    ]).then(([listRes, tradeRes, insightRes]) => {
      setMyListings(listRes.data.listings);
      setTradeData({ sent: tradeRes.data.sent, received: tradeRes.data.received });
      setInsights(insightRes.data.insights);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="app-loading"><div className="spinner"></div></div>;

  const activeListings = myListings.filter(l => l.status === 'active').length;
  const pendingReceived = tradeData.received.filter(r => r.status === 'pending').length;
  const pendingSent = tradeData.sent.filter(r => r.status === 'pending').length;

  const chartData = insights?.coalTypeStats?.map(s => ({
    name: s.coal_type.split(' ')[0],
    avgPrice: parseFloat(s.avg_price || 0).toFixed(0),
    listings: parseInt(s.listing_count),
  })) || [];

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>Welcome, {user.name}! 👋</h1>
          <p>Here's your CoalTrade AI trading overview</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Stats Row */}
        <div className="grid-4" style={{ marginBottom: 28 }}>
          {[
            { label: 'My Active Listings', value: activeListings, icon: '📦', link: '/my-listings', color: '#1a5f2e' },
            { label: 'Pending Requests', value: pendingReceived, icon: '📥', link: '/trade-requests', color: '#d97706' },
            { label: 'Sent Requests', value: pendingSent, icon: '📤', link: '/trade-requests', color: '#2563eb' },
            { label: 'Market Listings', value: insights?.totalActiveListings || 0, icon: '🏪', link: '/marketplace', color: '#7c3aed' },
          ].map((s, i) => (
            <Link key={i} to={s.link} style={{ textDecoration: 'none' }}>
              <div className="stat-card" style={{ cursor: 'pointer', transition: 'box-shadow 0.2s' }}>
                <div style={{ fontSize: '1.8rem', marginBottom: 8 }}>{s.icon}</div>
                <div className="stat-card-label">{s.label}</div>
                <div className="stat-card-value" style={{ color: s.color }}>{s.value}</div>
              </div>
            </Link>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
          {/* Market Chart */}
          <div className="card">
            <div className="card-header">📊 Market Avg Price by Coal Type (USD/ton)</div>
            <div className="card-body">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={chartData} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip formatter={(v) => [`$${v}`, 'Avg Price']} />
                    <Bar dataKey="avgPrice" fill="#1a5f2e" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div style={{ textAlign: 'center', padding: 40, color: '#94a3b8' }}>No market data available yet</div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div>
            <div className="card" style={{ marginBottom: 20 }}>
              <div className="card-header">⚡ Quick Actions</div>
              <div className="card-body" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <Link to="/listings/add" className="btn btn-primary btn-full">+ Post New Listing</Link>
                <Link to="/marketplace" className="btn btn-outline btn-full">Browse Marketplace</Link>
                <Link to="/ai/predict" className="btn btn-ghost btn-full">🤖 AI Price Predict</Link>
                <Link to="/trade-requests" className="btn btn-ghost btn-full">📋 Trade Requests</Link>
              </div>
            </div>

            {/* Pending alert */}
            {pendingReceived > 0 && (
              <div className="alert alert-warning">
                You have <strong>{pendingReceived}</strong> pending trade request{pendingReceived > 1 ? 's' : ''} to review.
                <Link to="/trade-requests" style={{ marginLeft: 8, fontWeight: 700 }}>Review →</Link>
              </div>
            )}
          </div>
        </div>

        {/* Recent Listings Table */}
        {myListings.length > 0 && (
          <div className="card" style={{ marginTop: 24 }}>
            <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span>My Recent Listings</span>
              <Link to="/my-listings" className="btn btn-ghost btn-sm">View All</Link>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Coal Type</th>
                    <th>Qty</th>
                    <th>Price</th>
                    <th>Status</th>
                    <th>Requests</th>
                  </tr>
                </thead>
                <tbody>
                  {myListings.slice(0, 5).map(l => (
                    <tr key={l.id}>
                      <td>
                        <Link to={`/listings/${l.id}`} style={{ color: '#1a5f2e', fontWeight: 600, textDecoration: 'none' }}>
                          {l.title}
                        </Link>
                      </td>
                      <td>{l.coal_type}</td>
                      <td>{parseFloat(l.quantity).toLocaleString()} {l.quantity_unit}</td>
                      <td>${parseFloat(l.price_per_ton).toFixed(2)}/ton</td>
                      <td>
                        <span className={`badge ${l.status === 'active' ? 'badge-green' : 'badge-gray'}`}>{l.status}</span>
                      </td>
                      <td>{l.trade_request_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;

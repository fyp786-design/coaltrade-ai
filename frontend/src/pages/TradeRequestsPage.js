// frontend/src/pages/TradeRequestsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { tradeAPI } from '../services/api';
import toast from 'react-hot-toast';

const statusBadge = (status) => {
  const map = { pending: 'badge-yellow', accepted: 'badge-green', rejected: 'badge-red', completed: 'badge-blue' };
  return <span className={`badge ${map[status] || 'badge-gray'}`}>{status}</span>;
};

const TradeRequestsPage = () => {
  const [data, setData] = useState({ sent: [], received: [] });
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('received');

  const fetchRequests = () => {
    setLoading(true);
    tradeAPI.getMyRequests()
      .then(r => setData({ sent: r.data.sent, received: r.data.received }))
      .catch(() => toast.error('Failed to load trade requests'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchRequests(); }, []);

  const handleUpdateStatus = async (id, status) => {
    try {
      await tradeAPI.updateStatus(id, status);
      toast.success(`Request ${status}.`);
      fetchRequests();
    } catch { toast.error('Failed to update status.'); }
  };

  const Tab = ({ id, label, count }) => (
    <button
      onClick={() => setTab(id)}
      style={{
        padding: '10px 20px', border: 'none', cursor: 'pointer', fontWeight: 600,
        borderBottom: tab === id ? '3px solid #1a5f2e' : '3px solid transparent',
        color: tab === id ? '#1a5f2e' : '#64748b', background: 'none', fontSize: '0.9rem',
      }}
    >
      {label} {count > 0 && <span className="badge badge-green" style={{ marginLeft: 6 }}>{count}</span>}
    </button>
  );

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>Trade Requests</h1>
          <p>Manage your incoming and outgoing trade requests</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Tabs */}
        <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', marginBottom: 24 }}>
          <Tab id="received" label="📥 Received" count={data.received.filter(r => r.status === 'pending').length} />
          <Tab id="sent" label="📤 Sent" count={0} />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <>
            {/* Received Requests */}
            {tab === 'received' && (
              data.received.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📥</div>
                  <h3>No received requests</h3>
                  <p>Trade requests from buyers will appear here</p>
                </div>
              ) : (
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Listing</th>
                          <th>From Buyer</th>
                          <th>Qty Requested</th>
                          <th>Offered Price</th>
                          <th>Message</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.received.map(r => (
                          <tr key={r.id}>
                            <td>
                              <Link to={`/listings/${r.listing_id}`} style={{ color: '#1a5f2e', fontWeight: 600, textDecoration: 'none' }}>
                                {r.listing_title}
                              </Link>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{r.coal_type}</div>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{r.buyer_name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{r.buyer_company || r.buyer_email}</div>
                            </td>
                            <td>{parseFloat(r.quantity_requested).toLocaleString()} tons</td>
                            <td>{r.offered_price ? `$${parseFloat(r.offered_price).toFixed(2)}/ton` : '—'}</td>
                            <td style={{ maxWidth: 200, fontSize: '0.85rem' }}>{r.message || '—'}</td>
                            <td>{statusBadge(r.status)}</td>
                            <td>
                              {r.status === 'pending' && (
                                <div style={{ display: 'flex', gap: 6 }}>
                                  <button className="btn btn-primary btn-sm" onClick={() => handleUpdateStatus(r.id, 'accepted')}>✅ Accept</button>
                                  <button className="btn btn-danger btn-sm" onClick={() => handleUpdateStatus(r.id, 'rejected')}>❌ Reject</button>
                                </div>
                              )}
                              {r.status === 'accepted' && (
                                <button className="btn btn-ghost btn-sm" onClick={() => handleUpdateStatus(r.id, 'completed')}>Mark Complete</button>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}

            {/* Sent Requests */}
            {tab === 'sent' && (
              data.sent.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-state-icon">📤</div>
                  <h3>No sent requests</h3>
                  <p>Browse the marketplace and send trade requests to sellers</p>
                  <Link to="/marketplace" className="btn btn-primary">Browse Marketplace</Link>
                </div>
              ) : (
                <div className="card">
                  <div className="table-wrap">
                    <table>
                      <thead>
                        <tr>
                          <th>Listing</th>
                          <th>Seller</th>
                          <th>Qty Requested</th>
                          <th>Offered Price</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sent.map(r => (
                          <tr key={r.id}>
                            <td>
                              <Link to={`/listings/${r.listing_id}`} style={{ color: '#1a5f2e', fontWeight: 600, textDecoration: 'none' }}>
                                {r.listing_title}
                              </Link>
                            </td>
                            <td>
                              <div style={{ fontWeight: 600 }}>{r.seller_name}</div>
                              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{r.seller_company}</div>
                            </td>
                            <td>{parseFloat(r.quantity_requested).toLocaleString()} tons</td>
                            <td>{r.offered_price ? `$${parseFloat(r.offered_price).toFixed(2)}/ton` : '—'}</td>
                            <td>{statusBadge(r.status)}</td>
                            <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{new Date(r.created_at).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default TradeRequestsPage;

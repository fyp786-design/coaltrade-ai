// frontend/src/pages/MyListingsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const MyListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = () => {
    setLoading(true);
    listingsAPI.getMyListings()
      .then(r => setListings(r.data.listings))
      .catch(() => toast.error('Failed to load listings'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this listing?')) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing deleted.');
      setListings(prev => prev.filter(l => l.id !== id));
    } catch { toast.error('Failed to delete.'); }
  };

  const handleStatusChange = async (id, status) => {
    try {
      await listingsAPI.update(id, { status });
      toast.success(`Listing marked as ${status}.`);
      fetchListings();
    } catch { toast.error('Failed to update status.'); }
  };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h1>My Listings</h1>
              <p>Manage your coal listings</p>
            </div>
            <Link to="/listings/add" className="btn btn-secondary">+ Post New Listing</Link>
          </div>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No listings yet</h3>
            <p>Post your first coal listing to start trading</p>
            <Link to="/listings/add" className="btn btn-primary">Post a Listing</Link>
          </div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Type</th>
                    <th>Coal Type</th>
                    <th>Quantity</th>
                    <th>Price/Ton</th>
                    <th>Status</th>
                    <th>Requests</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {listings.map(l => (
                    <tr key={l.id}>
                      <td>
                        <Link to={`/listings/${l.id}`} style={{ color: '#1a5f2e', fontWeight: 600, textDecoration: 'none' }}>
                          {l.title}
                        </Link>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📍 {l.location}</div>
                      </td>
                      <td>
                        <span className={`badge ${l.listing_type === 'sell' ? 'badge-green' : 'badge-blue'}`}>
                          {l.listing_type === 'sell' ? 'Sale' : 'Buy'}
                        </span>
                      </td>
                      <td>{l.coal_type}</td>
                      <td>{parseFloat(l.quantity).toLocaleString()} {l.quantity_unit}</td>
                      <td><strong>${parseFloat(l.price_per_ton).toFixed(2)}</strong></td>
                      <td>
                        <span className={`badge ${l.status === 'active' ? 'badge-green' : l.status === 'sold' ? 'badge-blue' : 'badge-gray'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td>
                        <span className="badge badge-yellow">{l.trade_request_count} requests</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <Link to={`/listings/edit/${l.id}`} className="btn btn-ghost btn-sm">✏ Edit</Link>
                          {l.status === 'active' && (
                            <button className="btn btn-ghost btn-sm" onClick={() => handleStatusChange(l.id, 'sold')}>Mark Sold</button>
                          )}
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id)}>🗑</button>
                        </div>
                      </td>
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

export default MyListingsPage;

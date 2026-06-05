// frontend/src/pages/AdminListingsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI, listingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const AdminListingsPage = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchListings = () => {
    setLoading(true);
    adminAPI.getAllListings()
      .then(r => setListings(r.data.listings))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchListings(); }, []);

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete listing "${title}"?`)) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing deleted.');
      fetchListings();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete listing.');
    }
  };

  const filtered = listings.filter(l =>
    l.title.toLowerCase().includes(search.toLowerCase()) ||
    l.coal_type.toLowerCase().includes(search.toLowerCase()) ||
    (l.seller_name || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>📦 Manage Listings</h1>
          <p>View and moderate all coal listings on the platform</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
          <input className="form-control" style={{ maxWidth: 360 }} placeholder="🔍 Search listings..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ alignSelf: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            {filtered.length} of {listings.length} listings
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 64 }}><div className="spinner" style={{ margin: '0 auto' }}></div></div>
        ) : (
          <div className="card">
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Seller</th>
                    <th>Coal Type</th>
                    <th>Qty</th>
                    <th>Price/ton</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Posted</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(l => (
                    <tr key={l.id}>
                      <td>
                        <Link to={`/listings/${l.id}`} style={{ color: '#1a5f2e', fontWeight: 600, textDecoration: 'none' }}>
                          {l.title.length > 40 ? l.title.slice(0, 40) + '…' : l.title}
                        </Link>
                      </td>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: '0.88rem' }}>{l.seller_name}</div>
                        <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{l.seller_email}</div>
                      </td>
                      <td>{l.coal_type}</td>
                      <td>{parseFloat(l.quantity).toLocaleString()} {l.quantity_unit}</td>
                      <td>${parseFloat(l.price_per_ton).toFixed(2)}</td>
                      <td>
                        <span className={`badge ${l.listing_type === 'sell' ? 'badge-green' : 'badge-blue'}`}>
                          {l.listing_type}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${l.status === 'active' ? 'badge-green' : l.status === 'sold' ? 'badge-blue' : 'badge-gray'}`}>
                          {l.status}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{new Date(l.created_at).toLocaleDateString()}</td>
                      <td>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(l.id, l.title)}>🗑 Delete</button>
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

export default AdminListingsPage;

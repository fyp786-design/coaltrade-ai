// frontend/src/pages/ListingDetailPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { listingsAPI, tradeAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const ListingDetailPage = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [tradeForm, setTradeForm] = useState({ quantity_requested: '', offered_price: '', message: '' });
  const [sending, setSending] = useState(false);
  const [showTradeForm, setShowTradeForm] = useState(false);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(r => setListing(r.data.listing))
      .catch(() => toast.error('Listing not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this listing?')) return;
    try {
      await listingsAPI.delete(id);
      toast.success('Listing deleted.');
      navigate('/my-listings');
    } catch { toast.error('Failed to delete listing.'); }
  };

  const handleTradeSubmit = async (e) => {
    e.preventDefault();
    if (!user) { toast.error('Please login to send a trade request.'); navigate('/login'); return; }
    setSending(true);
    try {
      await tradeAPI.sendRequest({ listing_id: parseInt(id), ...tradeForm });
      toast.success('Trade request sent successfully!');
      setShowTradeForm(false);
      setTradeForm({ quantity_requested: '', offered_price: '', message: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send trade request.');
    } finally { setSending(false); }
  };

  if (loading) return <div className="app-loading"><div className="spinner"></div></div>;
  if (!listing) return <div className="container" style={{padding: '60px 24px', textAlign: 'center'}}><h2>Listing not found</h2><Link to="/marketplace" className="btn btn-primary" style={{marginTop: 16}}>Back to Marketplace</Link></div>;

  const isOwner = user && user.id === listing.user_id;

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <div style={{display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12}}>
            <Link to="/marketplace" style={{color: 'rgba(255,255,255,0.7)', textDecoration: 'none', fontSize: '0.9rem'}}>← Marketplace</Link>
          </div>
          <h1>{listing.title}</h1>
          <p>Posted by {listing.seller_company || listing.seller_name} · {listing.location}</p>
        </div>
      </section>

      <div className="container" style={{padding: '32px 24px'}}>
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 28}}>
          {/* Main Info */}
          <div>
            {/* Overview Card */}
            <div className="card" style={{marginBottom: 24}}>
              <div className="card-header">
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span>Listing Overview</span>
                  <div style={{display: 'flex', gap: 8}}>
                    <span className={`badge ${listing.listing_type === 'sell' ? 'badge-green' : 'badge-blue'}`}>
                      {listing.listing_type === 'sell' ? '🟢 For Sale' : '🔵 Wanted'}
                    </span>
                    <span className={`badge ${listing.status === 'active' ? 'badge-green' : 'badge-gray'}`}>
                      {listing.status}
                    </span>
                  </div>
                </div>
              </div>
              <div className="card-body">
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 20, marginBottom: 20}}>
                  <div style={detailBox}>
                    <div style={detailLabel}>Coal Type</div>
                    <div style={detailValue}>⛏ {listing.coal_type}</div>
                  </div>
                  <div style={detailBox}>
                    <div style={detailLabel}>Quantity</div>
                    <div style={detailValue}>📦 {parseFloat(listing.quantity).toLocaleString()} {listing.quantity_unit}</div>
                  </div>
                  <div style={detailBox}>
                    <div style={detailLabel}>Location</div>
                    <div style={detailValue}>📍 {listing.location}</div>
                  </div>
                </div>
                {listing.description && (
                  <div>
                    <div style={detailLabel}>Description</div>
                    <p style={{color: '#374151', lineHeight: 1.7, marginTop: 6}}>{listing.description}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quality Specs */}
            {(listing.calorific_value || listing.ash_content || listing.moisture_content || listing.sulfur_content) && (
              <div className="card" style={{marginBottom: 24}}>
                <div className="card-header">📊 Coal Quality Specifications</div>
                <div className="card-body">
                  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16}}>
                    {listing.calorific_value && <QualityRow label="Calorific Value" value={`${listing.calorific_value} kcal/kg`} />}
                    {listing.ash_content && <QualityRow label="Ash Content" value={`${listing.ash_content}%`} />}
                    {listing.moisture_content && <QualityRow label="Moisture Content" value={`${listing.moisture_content}%`} />}
                    {listing.sulfur_content && <QualityRow label="Sulfur Content" value={`${listing.sulfur_content}%`} />}
                  </div>
                </div>
              </div>
            )}

            {/* Seller Info */}
            <div className="card">
              <div className="card-header">👤 Seller Information</div>
              <div className="card-body">
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 16}}>
                  <QualityRow label="Name" value={listing.seller_name} />
                  {listing.seller_company && <QualityRow label="Company" value={listing.seller_company} />}
                  {listing.seller_email && <QualityRow label="Email" value={listing.seller_email} />}
                  {listing.seller_phone && <QualityRow label="Phone" value={listing.seller_phone} />}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Price Card */}
            <div className="card" style={{marginBottom: 20}}>
              <div className="card-body" style={{textAlign: 'center'}}>
                <div style={{fontSize: '0.85rem', color: '#64748b', marginBottom: 4}}>Listed Price</div>
                <div style={{fontSize: '2.5rem', fontWeight: 800, color: '#1a5f2e'}}>
                  ${parseFloat(listing.price_per_ton).toFixed(2)}
                </div>
                <div style={{color: '#64748b', fontSize: '0.9rem'}}>per ton</div>
                {listing.ai_predicted_price && (
                  <div style={{marginTop: 16, padding: '12px', background: '#f0fdf4', borderRadius: 8, border: '1px solid #86efac'}}>
                    <div style={{fontSize: '0.8rem', color: '#166534', fontWeight: 600}}>🤖 AI Predicted Price</div>
                    <div style={{fontSize: '1.4rem', fontWeight: 700, color: '#15803d'}}>
                      ${parseFloat(listing.ai_predicted_price).toFixed(2)}/ton
                    </div>
                  </div>
                )}
                <div style={{marginTop: 16, padding: '10px', background: '#f8fafc', borderRadius: 8, fontSize: '0.85rem', color: '#374151'}}>
                  <strong>Total Value:</strong><br/>
                  ${(parseFloat(listing.price_per_ton) * parseFloat(listing.quantity)).toLocaleString()}
                </div>
              </div>
            </div>

            {/* Actions */}
            {isOwner ? (
              <div className="card" style={{marginBottom: 20}}>
                <div className="card-body">
                  <h4 style={{marginBottom: 12, fontWeight: 600}}>Manage Listing</h4>
                  <Link to={`/listings/edit/${listing.id}`} className="btn btn-outline btn-full" style={{marginBottom: 10}}>
                    ✏ Edit Listing
                  </Link>
                  <button onClick={handleDelete} className="btn btn-danger btn-full">
                    🗑 Delete Listing
                  </button>
                </div>
              </div>
            ) : (
              <div className="card" style={{marginBottom: 20}}>
                <div className="card-body">
                  {!showTradeForm ? (
                    <>
                      <button
                        className="btn btn-primary btn-full btn-lg"
                        onClick={() => user ? setShowTradeForm(true) : navigate('/login')}
                        style={{marginBottom: 10}}
                      >
                        🤝 Send Trade Request
                      </button>
                      {!user && <p style={{fontSize: '0.8rem', color: '#64748b', textAlign: 'center'}}>Login required to trade</p>}
                    </>
                  ) : (
                    <form onSubmit={handleTradeSubmit}>
                      <h4 style={{marginBottom: 16, fontWeight: 600}}>Send Trade Request</h4>
                      <div className="form-group">
                        <label className="form-label required">Quantity (tons)</label>
                        <input type="number" className="form-control" step="0.01" min="0.01"
                          max={listing.quantity} placeholder="Enter quantity"
                          value={tradeForm.quantity_requested}
                          onChange={e => setTradeForm(f => ({...f, quantity_requested: e.target.value}))} required />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Offered Price ($/ton)</label>
                        <input type="number" className="form-control" step="0.01" placeholder="Your offered price"
                          value={tradeForm.offered_price}
                          onChange={e => setTradeForm(f => ({...f, offered_price: e.target.value}))} />
                      </div>
                      <div className="form-group">
                        <label className="form-label">Message</label>
                        <textarea className="form-control" rows={3} placeholder="Add a note to seller..."
                          value={tradeForm.message}
                          onChange={e => setTradeForm(f => ({...f, message: e.target.value}))} />
                      </div>
                      <div style={{display: 'flex', gap: 8}}>
                        <button type="submit" className="btn btn-primary" style={{flex: 1}} disabled={sending}>
                          {sending ? '⏳ Sending...' : '✅ Send Request'}
                        </button>
                        <button type="button" className="btn btn-ghost" onClick={() => setShowTradeForm(false)}>Cancel</button>
                      </div>
                    </form>
                  )}
                </div>
              </div>
            )}

            <div className="card">
              <div className="card-body" style={{fontSize: '0.85rem', color: '#64748b'}}>
                <div style={{marginBottom: 6}}>📅 Posted: {new Date(listing.created_at).toLocaleDateString()}</div>
                <div>🔄 Updated: {new Date(listing.updated_at).toLocaleDateString()}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const QualityRow = ({ label, value }) => (
  <div style={{padding: '10px 14px', background: '#f8fafc', borderRadius: 8}}>
    <div style={{fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 2}}>{label}</div>
    <div style={{fontWeight: 600, color: '#1a2e1a'}}>{value}</div>
  </div>
);

const detailBox = { padding: '14px', background: '#f8fafc', borderRadius: 8 };
const detailLabel = { fontSize: '0.75rem', color: '#64748b', fontWeight: 600, marginBottom: 4 };
const detailValue = { fontWeight: 600, color: '#1a2e1a', fontSize: '0.95rem' };

export default ListingDetailPage;

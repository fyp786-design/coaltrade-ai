// frontend/src/pages/AddListingPage.js
import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import toast from 'react-hot-toast';

const COAL_TYPES = ['Anthracite', 'Bituminous', 'Sub-Bituminous', 'Lignite', 'Coking Coal', 'Thermal Coal'];

const ListingForm = ({ initialValues = {}, onSubmit, loading, title, submitLabel }) => {
  const [form, setForm] = useState({
    title: '', coal_type: '', quantity: '', quantity_unit: 'tons',
    price_per_ton: '', location: '', description: '',
    calorific_value: '', ash_content: '', moisture_content: '',
    sulfur_content: '', listing_type: 'sell',
    ...initialValues
  });

  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));

  const handleSubmit = (e) => { e.preventDefault(); onSubmit(form); };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>{title}</h1>
          <p>Fill in the details below to post your coal listing</p>
        </div>
      </section>
      <div className="container" style={{ padding: '32px 24px', maxWidth: 860 }}>
        <form onSubmit={handleSubmit}>
          {/* Basic Info */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">📋 Basic Information</div>
            <div className="card-body">
              <div className="form-group">
                <label className="form-label required">Listing Title</label>
                <input className="form-control" placeholder="e.g. Premium Thermal Coal – 500 Tons Available" value={form.title} onChange={set('title')} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Listing Type</label>
                  <select className="form-control" value={form.listing_type} onChange={set('listing_type')}>
                    <option value="sell">For Sale</option>
                    <option value="buy">Wanted / Buy</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label required">Coal Type</label>
                  <select className="form-control" value={form.coal_type} onChange={set('coal_type')} required>
                    <option value="">Select coal type...</option>
                    {COAL_TYPES.map(ct => <option key={ct}>{ct}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Quantity</label>
                  <input className="form-control" type="number" step="0.01" min="0.01" placeholder="e.g. 500" value={form.quantity} onChange={set('quantity')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit</label>
                  <select className="form-control" value={form.quantity_unit} onChange={set('quantity_unit')}>
                    <option value="tons">Tons (metric)</option>
                    <option value="short_tons">Short Tons (US)</option>
                    <option value="kg">Kilograms</option>
                  </select>
                </div>
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Price per Ton (USD)</label>
                  <input className="form-control" type="number" step="0.01" min="0.01" placeholder="e.g. 120.00" value={form.price_per_ton} onChange={set('price_per_ton')} required />
                </div>
                <div className="form-group">
                  <label className="form-label required">Location</label>
                  <input className="form-control" placeholder="e.g. Lahore, Punjab, Pakistan" value={form.location} onChange={set('location')} required />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={4} placeholder="Describe the coal quality, origin, delivery terms, etc." value={form.description} onChange={set('description')} />
              </div>
            </div>
          </div>

          {/* Quality Specs */}
          <div className="card" style={{ marginBottom: 24 }}>
            <div className="card-header">📊 Quality Specifications <span style={{ fontSize: '0.8rem', fontWeight: 400, color: '#64748b' }}>(optional — helps AI price prediction)</span></div>
            <div className="card-body">
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label">Calorific Value (kcal/kg)</label>
                  <input className="form-control" type="number" step="1" placeholder="e.g. 6000" value={form.calorific_value} onChange={set('calorific_value')} />
                  <span className="form-hint">Typical range: 3000–8000 kcal/kg</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Ash Content (%)</label>
                  <input className="form-control" type="number" step="0.01" placeholder="e.g. 12.5" value={form.ash_content} onChange={set('ash_content')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Moisture Content (%)</label>
                  <input className="form-control" type="number" step="0.01" placeholder="e.g. 8.0" value={form.moisture_content} onChange={set('moisture_content')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Sulfur Content (%)</label>
                  <input className="form-control" type="number" step="0.01" placeholder="e.g. 0.8" value={form.sulfur_content} onChange={set('sulfur_content')} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12 }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
              {loading ? '⏳ Saving...' : submitLabel}
            </button>
            <Link to="/my-listings" className="btn btn-ghost btn-lg">Cancel</Link>
          </div>
        </form>
      </div>
    </div>
  );
};

const AddListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      const res = await listingsAPI.create(form);
      toast.success('Listing created successfully!');
      if (res.data.listing?.ai_predicted_price) {
        toast.success(`🤖 AI predicted price: $${parseFloat(res.data.listing.ai_predicted_price).toFixed(2)}/ton`, { duration: 5000 });
      }
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.message || err.response?.data?.errors?.[0]?.msg || 'Failed to create listing.');
    } finally { setLoading(false); }
  };

  return <ListingForm title="Post New Coal Listing" submitLabel="✅ Post Listing" onSubmit={handleSubmit} loading={loading} />;
};

export { ListingForm };
export default AddListingPage;

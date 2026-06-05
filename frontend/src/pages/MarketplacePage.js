// frontend/src/pages/MarketplacePage.js
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { listingsAPI } from '../services/api';

const COAL_TYPES = ['Anthracite', 'Bituminous', 'Sub-Bituminous', 'Lignite', 'Coking Coal', 'Thermal Coal'];

const MarketplacePage = () => {
  const [listings, setListings] = useState([]);
  const [pagination, setPagination] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    search: '', coal_type: '', listing_type: '', min_price: '', max_price: '', page: 1
  });

  const fetchListings = useCallback(async () => {
    setLoading(true);
    try {
      const params = Object.fromEntries(Object.entries(filters).filter(([, v]) => v !== ''));
      const res = await listingsAPI.getAll(params);
      setListings(res.data.listings);
      setPagination(res.data.pagination);
    } catch {
      setListings([]);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => { fetchListings(); }, [fetchListings]);

  const handleSearch = (e) => { e.preventDefault(); setFilters(f => ({...f, page: 1})); };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>Coal Marketplace</h1>
          <p>Browse active coal listings — buy, sell, and trade efficiently</p>
        </div>
      </section>

      <div className="container" style={{padding: '32px 24px'}}>
        {/* Filters */}
        <div className="card" style={{marginBottom: 28}}>
          <div className="card-body">
            <form onSubmit={handleSearch}>
              <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 16}}>
                <input
                  className="form-control" placeholder="🔍 Search listings..."
                  value={filters.search}
                  onChange={e => setFilters(f => ({...f, search: e.target.value}))}
                />
                <select className="form-control" value={filters.coal_type} onChange={e => setFilters(f => ({...f, coal_type: e.target.value}))}>
                  <option value="">All Coal Types</option>
                  {COAL_TYPES.map(ct => <option key={ct}>{ct}</option>)}
                </select>
                <select className="form-control" value={filters.listing_type} onChange={e => setFilters(f => ({...f, listing_type: e.target.value}))}>
                  <option value="">Buy & Sell</option>
                  <option value="sell">For Sale</option>
                  <option value="buy">Wanted</option>
                </select>
                <input className="form-control" type="number" placeholder="Min Price ($/ton)" value={filters.min_price} onChange={e => setFilters(f => ({...f, min_price: e.target.value}))} />
                <input className="form-control" type="number" placeholder="Max Price ($/ton)" value={filters.max_price} onChange={e => setFilters(f => ({...f, max_price: e.target.value}))} />
                <div style={{display: 'flex', gap: 8}}>
                  <button type="submit" className="btn btn-primary" style={{flex: 1}}>Search</button>
                  <button type="button" className="btn btn-ghost" onClick={() => setFilters({search:'',coal_type:'',listing_type:'',min_price:'',max_price:'',page:1})}>
                    Clear
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Results count */}
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
          <p style={{color: '#64748b', fontSize: '0.9rem'}}>
            {loading ? 'Loading...' : `${pagination.total} listing${pagination.total !== 1 ? 's' : ''} found`}
          </p>
          <Link to="/listings/add" className="btn btn-primary btn-sm">+ Post Listing</Link>
        </div>

        {/* Listings Grid */}
        {loading ? (
          <div style={{textAlign: 'center', padding: 64}}><div className="spinner" style={{margin: '0 auto'}}></div></div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">📦</div>
            <h3>No listings found</h3>
            <p>Try adjusting your filters or post the first listing!</p>
            <Link to="/listings/add" className="btn btn-primary">Post a Listing</Link>
          </div>
        ) : (
          <div className="grid-3">
            {listings.map(l => <ListingCard key={l.id} listing={l} />)}
          </div>
        )}

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div style={{display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32}}>
            {Array.from({length: pagination.totalPages}, (_, i) => i + 1).map(p => (
              <button key={p} className={`btn btn-sm ${p === pagination.page ? 'btn-primary' : 'btn-ghost'}`}
                onClick={() => setFilters(f => ({...f, page: p}))}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const ListingCard = ({ listing: l }) => (
  <div className="listing-card">
    <div className="listing-card-body">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12}}>
        <span className={`badge ${l.listing_type === 'sell' ? 'badge-green' : 'badge-blue'}`}>
          {l.listing_type === 'sell' ? '🟢 For Sale' : '🔵 Wanted'}
        </span>
        <span className="badge badge-gray" style={{fontSize: '0.7rem'}}>{l.coal_type}</span>
      </div>
      <h3 style={{fontWeight: 600, fontSize: '0.95rem', marginBottom: 10, lineHeight: 1.4}}>{l.title}</h3>
      <div className="listing-price">${parseFloat(l.price_per_ton).toFixed(2)}<span style={{fontSize: '0.85rem', fontWeight: 400, color: '#64748b'}}>/ton</span></div>
      {l.ai_predicted_price && (
        <div style={{fontSize: '0.8rem', color: '#2d8a4a', marginTop: 4}}>
          🤖 AI Estimate: ${parseFloat(l.ai_predicted_price).toFixed(0)}/ton
        </div>
      )}
      <div className="listing-meta" style={{marginTop: 10}}>
        <span className="listing-meta-item">📦 {parseFloat(l.quantity).toLocaleString()} {l.quantity_unit}</span>
        <span className="listing-meta-item">📍 {l.location}</span>
        <span className="listing-meta-item">🏢 {l.seller_company || l.seller_name}</span>
      </div>
      <div style={{marginTop: 16}}>
        <Link to={`/listings/${l.id}`} className="btn btn-outline btn-sm btn-full">View Details →</Link>
      </div>
    </div>
  </div>
);

export default MarketplacePage;

// frontend/src/pages/EditListingPage.js
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { listingsAPI } from '../services/api';
import { ListingForm } from './AddListingPage';
import toast from 'react-hot-toast';

const EditListingPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initialValues, setInitialValues] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    listingsAPI.getById(id)
      .then(r => setInitialValues(r.data.listing))
      .catch(() => { toast.error('Listing not found'); navigate('/my-listings'); });
  }, [id, navigate]);

  const handleSubmit = async (form) => {
    setLoading(true);
    try {
      await listingsAPI.update(id, form);
      toast.success('Listing updated successfully!');
      navigate('/my-listings');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update listing.');
    } finally { setLoading(false); }
  };

  if (!initialValues) return <div className="app-loading"><div className="spinner"></div></div>;

  return (
    <ListingForm
      title="Edit Coal Listing"
      submitLabel="💾 Save Changes"
      initialValues={initialValues}
      onSubmit={handleSubmit}
      loading={loading}
    />
  );
};

export default EditListingPage;

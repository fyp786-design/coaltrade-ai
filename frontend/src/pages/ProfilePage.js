// frontend/src/pages/ProfilePage.js
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [form, setForm] = useState({ name: user.name || '', phone: user.phone || '', company: user.company || '', location: user.location || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [changingPw, setChangingPw] = useState(false);
  const set = (field) => (e) => setForm(f => ({ ...f, [field]: e.target.value }));
  const setPw = (field) => (e) => setPwForm(f => ({ ...f, [field]: e.target.value }));

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await authAPI.updateProfile(form);
      updateUser(res.data.user);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally { setSaving(false); }
  };

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirmPassword) {
      toast.error('New passwords do not match.');
      return;
    }
    if (pwForm.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters.');
      return;
    }
    setChangingPw(true);
    try {
      await authAPI.changePassword({ currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed successfully!');
      setPwForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change password.');
    } finally { setChangingPw(false); }
  };

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>My Profile</h1>
          <p>Manage your account information</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px', maxWidth: 800 }}>
        {/* Profile Info */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div className="card-header">👤 Profile Information</div>
          <div className="card-body">
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, padding: '16px 20px', background: '#f0fdf4', borderRadius: 10 }}>
              <div style={{ width: 64, height: 64, background: '#1a5f2e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '1.8rem', fontWeight: 700, flexShrink: 0 }}>
                {user.name?.[0]?.toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: '1.1rem' }}>{user.name}</div>
                <div style={{ color: '#64748b', fontSize: '0.9rem' }}>{user.email}</div>
                <span className={`badge ${user.role === 'admin' ? 'badge-yellow' : 'badge-green'}`} style={{ marginTop: 4 }}>
                  {user.role === 'admin' ? '⚙ Admin' : '👤 Trader'}
                </span>
              </div>
            </div>

            <form onSubmit={handleProfileSave}>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">Full Name</label>
                  <input className="form-control" value={form.name} onChange={set('name')} required />
                </div>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input className="form-control" value={user.email} disabled style={{ background: '#f8fafc', cursor: 'not-allowed' }} />
                  <span className="form-hint">Email cannot be changed</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input className="form-control" placeholder="+92 300 1234567" value={form.phone} onChange={set('phone')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Company / Organization</label>
                  <input className="form-control" placeholder="Your company name" value={form.company} onChange={set('company')} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input className="form-control" placeholder="Lahore, Pakistan" value={form.location} onChange={set('location')} />
              </div>
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? '⏳ Saving...' : '💾 Save Changes'}
              </button>
            </form>
          </div>
        </div>

        {/* Change Password */}
        <div className="card">
          <div className="card-header">🔒 Change Password</div>
          <div className="card-body">
            <form onSubmit={handlePasswordChange}>
              <div className="form-group">
                <label className="form-label required">Current Password</label>
                <input type="password" className="form-control" value={pwForm.currentPassword} onChange={setPw('currentPassword')} required />
              </div>
              <div className="grid-2">
                <div className="form-group">
                  <label className="form-label required">New Password</label>
                  <input type="password" className="form-control" placeholder="Min. 6 characters" value={pwForm.newPassword} onChange={setPw('newPassword')} required />
                </div>
                <div className="form-group">
                  <label className="form-label required">Confirm New Password</label>
                  <input type="password" className="form-control" value={pwForm.confirmPassword} onChange={setPw('confirmPassword')} required />
                </div>
              </div>
              <button type="submit" className="btn btn-outline" disabled={changingPw}>
                {changingPw ? '⏳ Updating...' : '🔒 Update Password'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

// frontend/src/pages/AdminUsersPage.js
import React, { useState, useEffect } from 'react';
import { adminAPI } from '../services/api';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const AdminUsersPage = () => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchUsers = () => {
    setLoading(true);
    adminAPI.getUsers()
      .then(r => setUsers(r.data.users))
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchUsers(); }, []);

  const handleToggleStatus = async (id, name, isActive) => {
    if (!window.confirm(`${isActive ? 'Deactivate' : 'Activate'} user "${name}"?`)) return;
    try {
      await adminAPI.toggleUserStatus(id);
      toast.success(`User ${isActive ? 'deactivated' : 'activated'}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update user status.');
    }
  };

  const handleChangeRole = async (id, currentRole) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change role to "${newRole}"?`)) return;
    try {
      await adminAPI.updateUserRole(id, newRole);
      toast.success(`Role changed to ${newRole}.`);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to change role.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Permanently delete user "${name}"? This cannot be undone.`)) return;
    try {
      await adminAPI.deleteUser(id);
      toast.success('User deleted.');
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete user.');
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    (u.company || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <section className="page-header">
        <div className="container">
          <h1>👥 Manage Users</h1>
          <p>View and manage all registered users</p>
        </div>
      </section>

      <div className="container" style={{ padding: '32px 24px' }}>
        {/* Search */}
        <div style={{ marginBottom: 20, display: 'flex', gap: 12 }}>
          <input className="form-control" style={{ maxWidth: 360 }} placeholder="🔍 Search by name, email or company..."
            value={search} onChange={e => setSearch(e.target.value)} />
          <span style={{ alignSelf: 'center', color: '#64748b', fontSize: '0.9rem' }}>
            {filtered.length} of {users.length} users
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
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Role</th>
                    <th>Status</th>
                    <th>Joined</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ fontWeight: 600 }}>{u.name}</div>
                        {u.location && <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>📍 {u.location}</div>}
                      </td>
                      <td style={{ fontSize: '0.85rem' }}>{u.email}</td>
                      <td style={{ fontSize: '0.85rem', color: '#64748b' }}>{u.company || '—'}</td>
                      <td>
                        <span className={`badge ${u.role === 'admin' ? 'badge-yellow' : 'badge-green'}`}>{u.role}</span>
                      </td>
                      <td>
                        <span className={`badge ${u.is_active ? 'badge-green' : 'badge-red'}`}>
                          {u.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.82rem', color: '#94a3b8' }}>{new Date(u.created_at).toLocaleDateString()}</td>
                      <td>
                        {u.id !== currentUser.id ? (
                          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap' }}>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleToggleStatus(u.id, u.name, u.is_active)}>
                              {u.is_active ? '🚫 Deactivate' : '✅ Activate'}
                            </button>
                            <button className="btn btn-ghost btn-sm" onClick={() => handleChangeRole(u.id, u.role)}>
                              {u.role === 'admin' ? '👤 Make User' : '⚙ Make Admin'}
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDelete(u.id, u.name)}>🗑</button>
                          </div>
                        ) : (
                          <span style={{ color: '#94a3b8', fontSize: '0.82rem' }}>You</span>
                        )}
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

export default AdminUsersPage;

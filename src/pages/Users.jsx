import { useEffect, useMemo, useState } from 'react';
import Button from '../components/ui/Button';
import Table from '../components/ui/Table';
import { useAuth } from '../hooks/useAuth';
import { createUserRequest, deactivateUserRequest, listUsersRequest, updateUserRequest } from '../services/usersService';
import { getApiErrorMessage } from '../utils/apiError';

const emptyUserForm = { name: '', email: '', password: '', role: 'VIEWER' };

const Users = () => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [form, setForm] = useState(emptyUserForm);
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await listUsersRequest();
      setUsers(response.data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUser?.role === 'ADMIN') loadUsers();
  }, [currentUser?.role]);

  const formErrors = useMemo(() => {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Name should be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Use a valid email address';
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      nextErrors.password = 'Password must be 8+ chars and include a number';
    }
    return nextErrors;
  }, [form]);

  const formValid = Object.keys(formErrors).length === 0;

  const createUser = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!formValid) return;

    try {
      setSubmitting(true);
      setError('');
      await createUserRequest(form);
      setForm(emptyUserForm);
      setTouched({ name: false, email: false, password: false });
      await loadUsers();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create user'));
    } finally {
      setSubmitting(false);
    }
  };

  const deactivate = async (userId) => {
    try {
      await deactivateUserRequest(userId);
      await loadUsers();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not deactivate user'));
    }
  };

  const activate = async (userId) => {
    try {
      await updateUserRequest(userId, { status: 'ACTIVE' });
      await loadUsers();
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not activate user'));
    }
  };

  if (currentUser?.role !== 'ADMIN') return <main className="page"><h2>Access denied</h2></main>;

  const columns = [
    { key: 'name', label: 'Name' },
    { key: 'email', label: 'Email' },
    { key: 'role', label: 'Role' },
    { key: 'status', label: 'Status' },
    {
      key: 'actions',
      label: 'Actions',
      render: (userRow) => (
        <div className="users-actions">
          <Button variant="secondary" disabled={userRow.status === 'ACTIVE'} onClick={() => activate(userRow.id)}>
            Activate
          </Button>
          <Button variant="danger" disabled={userRow.status === 'INACTIVE'} onClick={() => deactivate(userRow.id)}>
            Deactivate
          </Button>
        </div>
      )
    }
  ];

  return (
    <main className="page users-page">
      <h2>User Management</h2>
      <p>Create users directly from UI and deactivate accounts when needed.</p>

      <form className="users-form" onSubmit={createUser}>
        <div className="users-form-grid">
          <label>
            Name
            <input
              value={form.name}
              onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            />
            {touched.name && formErrors.name ? <small className="field-error">{formErrors.name}</small> : null}
          </label>
          <label>
            Email
            <input
              value={form.email}
              onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
            />
            {touched.email && formErrors.email ? <small className="field-error">{formErrors.email}</small> : null}
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
            />
            {touched.password && formErrors.password ? (
              <small className="field-error">{formErrors.password}</small>
            ) : null}
          </label>
          <label>
            Role
            <select value={form.role} onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value }))}>
              <option value="VIEWER">VIEWER</option>
              <option value="ANALYST">ANALYST</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </label>
        </div>
        <Button type="submit" disabled={!formValid || submitting}>
          {submitting ? 'Creating...' : 'Create User'}
        </Button>
        {error ? <small className="field-error">{error}</small> : null}
      </form>

      {loading ? <p>Loading users...</p> : <Table columns={columns} rows={users} />}
    </main>
  );
};

export default Users;

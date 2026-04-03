import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import api from '../services/api';
import { getApiErrorMessage } from '../utils/apiError';

const Signup = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false, password: false });

  const errors = useMemo(() => {
    const nextErrors = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Name should be at least 2 characters';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Use a valid email';
    if (form.password.length < 8 || !/\d/.test(form.password)) {
      nextErrors.password = 'Password must be 8+ chars and include a number';
    }
    return nextErrors;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const submit = async (event) => {
    event.preventDefault();
    setTouched({ name: true, email: true, password: true });
    if (!isValid) return;

    try {
      setSubmitting(true);
      setError('');
      await api.post('/auth/register/open', form);
      await signIn({ email: form.email, password: form.password });
      navigate('/dashboard');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Could not create account'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Create account</h2>
        <p className="auth-help">This works only when there are no active users in the system.</p>
        <Input
          label="Full name"
          value={form.name}
          onBlur={() => setTouched((prev) => ({ ...prev, name: true }))}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          error={touched.name ? errors.name : ''}
        />
        <Input
          label="Email"
          type="email"
          value={form.email}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
          onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
          error={touched.email ? errors.email : ''}
        />
        <Input
          label="Password"
          type="password"
          value={form.password}
          onBlur={() => setTouched((prev) => ({ ...prev, password: true }))}
          onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
          error={touched.password ? errors.password : ''}
        />
        {error ? <small className="field-error">{error}</small> : null}
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Creating...' : 'Create Admin Account'}
        </Button>
        <p className="auth-help">
          Already have an active account? <Link to="/login">Sign in</Link>
        </p>
      </form>
    </main>
  );
};

export default Signup;

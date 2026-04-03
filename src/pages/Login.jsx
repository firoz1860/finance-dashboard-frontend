import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { useAuth } from '../hooks/useAuth';
import { getApiErrorMessage } from '../utils/apiError';

const Login = () => {
  const navigate = useNavigate();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: '', password: '' });
  const [touched, setTouched] = useState({ email: false, password: false });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const errors = useMemo(() => {
    const nextErrors = {};
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) nextErrors.email = 'Use a valid email';
    if (form.password.length < 8) nextErrors.password = 'Password must be at least 8 characters';
    return nextErrors;
  }, [form]);

  const isValid = Object.keys(errors).length === 0;

  const submit = async (event) => {
    event.preventDefault();
    setTouched({ email: true, password: true });
    if (!isValid) return;

    try {
      setSubmitting(true);
      setError('');
      await signIn(form);
      navigate('/dashboard');
    } catch (requestError) {
      setError(getApiErrorMessage(requestError, 'Unable to sign in'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="page auth-page">
      <form className="auth-form" onSubmit={submit}>
        <h2>Sign in</h2>
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
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? 'Signing in...' : 'Sign In'}
        </Button>
        {error ? <small className="field-error">{error}</small> : null}
        <p className="auth-help">
          No active users available? <Link to="/signup">Create first admin account</Link>
        </p>
      </form>
    </main>
  );
};

export default Login;

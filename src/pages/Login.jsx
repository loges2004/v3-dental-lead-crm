import { useState } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { BrandLogo } from '../components/BrandLogo';

export function LoginPage() {
  const { login, isAuthenticated, loading } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/';

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  if (!loading && isAuthenticated) {
    return <Navigate to={from} replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await login(username, password);
      toast.success('Welcome back');
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.message || 'Login failed');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-brand-50 to-slate-100 p-4 dark:from-slate-950 dark:to-slate-900">
      <button
        type="button"
        className="absolute right-4 top-4 btn-secondary text-xs"
        onClick={toggle}
      >
        {dark ? 'Light' : 'Dark'}
      </button>
      <div className="card w-full max-w-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <BrandLogo size="lg" />
          <p className="mt-3 text-sm text-slate-500">Team sign in</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="username">
              Username
            </label>
            <input
              id="username"
              className="input-field"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="mb-1 block text-sm font-medium" htmlFor="password">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="input-field"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full min-h-[44px]" disabled={submitting}>
            {submitting ? 'Signing in...' : 'Login'}
          </button>
        </form>
        <p className="mt-4 text-center text-xs text-slate-500">
          Team login — use your clinic username and password.
        </p>
      </div>
    </div>
  );
}

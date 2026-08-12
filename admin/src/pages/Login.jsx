import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiMail } from 'react-icons/fi';
import api from '../lib/api';
import { useAuthStore } from '../store';
import toast from 'react-hot-toast';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      if (!['admin', 'superadmin'].includes(data.user.role)) {
        throw new Error('Access denied. Admins only.');
      }
      setAuth(data.user, data.accessToken);
      toast.success('Welcome back, Admin!');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-dark-bg px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 card p-8 sm:p-10">
        <div className="text-center">
          <img src="/logo.png" className="h-16 w-auto object-contain mx-auto" alt="logo" />
          <h2 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">Admin Portal</h2>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Sign in to manage DZONE GADGET</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} className="input pl-10 py-2.5" placeholder="admin@dzone-gadget.store" />
              </div>
            </div>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} className="input pl-10 py-2.5" placeholder="••••••••" />
              </div>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full btn-primary py-3 text-base">
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>
      </div>
    </div>
  );
}

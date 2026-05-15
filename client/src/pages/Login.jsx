import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { useAuthStore } from '../store';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || '/';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      setAuth(data.user, data.accessToken);
      toast.success(`Welcome back, ${data.user.name}!`);
      navigate(from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Sign In — D-STORE</title></Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="/logo.png" className="h-12 w-auto object-contain" alt="logo" /></Link>
            <h1 className="font-display font-bold text-2xl mt-3 dark:text-dark-text">Welcome back!</h1>
            <p className="text-gray-500 dark:text-dark-muted mt-1">Sign in to your D-STORE account</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="label">Email</label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="email" type="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} className="input pl-10" required />
                </div>
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input id="password" type={showPass ? 'text' : 'password'} placeholder="••••••••" value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} className="input pl-10 pr-10" required />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">{showPass ? <FiEyeOff size={16} /> : <FiEye size={16} />}</button>
                </div>
                <div className="text-right mt-1"><Link to="/forgot-password" className="text-sm text-primary-500 hover:underline">Forgot password?</Link></div>
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-70">{loading ? 'Signing in...' : 'Sign In'}</button>
            </form>

            <div className="mt-6 flex items-center">
              <div className="flex-1 border-t border-gray-200 dark:border-dark-border"></div>
              <span className="px-3 text-sm text-gray-400 dark:text-dark-muted">OR</span>
              <div className="flex-1 border-t border-gray-200 dark:border-dark-border"></div>
            </div>

            <button type="button" onClick={() => navigate(from)} className="mt-6 w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 dark:bg-dark-bg dark:hover:bg-dark-border text-gray-700 dark:text-dark-text font-semibold rounded-xl transition-colors">
              Continue as Guest
            </button>

            <p className="text-center text-sm text-gray-500 dark:text-dark-muted mt-6">Don't have an account? <Link to="/register" className="text-primary-500 font-semibold hover:underline">Sign Up</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

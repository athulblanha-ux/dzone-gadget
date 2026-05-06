import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiUser, FiMail, FiLock, FiPhone } from 'react-icons/fi';
import { useAuthStore } from '../store';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters.');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      setAuth(data.user, data.accessToken);
      toast.success('Account created! Welcome to D-STORE');
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Create Account — D-STORE</title></Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4 py-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="/logo.png" className="h-12 w-auto object-contain" alt="logo" /></Link>
            <h1 className="font-display font-bold text-2xl mt-3 dark:text-dark-text">Create your account</h1>
            <p className="text-gray-500 dark:text-dark-muted mt-1">Join D-STORE and get 10% off your first order!</p>
          </div>
          <div className="card p-8">
            <form onSubmit={handleSubmit} className="space-y-5">
              {[
                { id: 'name', icon: FiUser, label: 'Full Name', placeholder: 'Your name', type: 'text' },
                { id: 'email', icon: FiMail, label: 'Email', placeholder: 'you@example.com', type: 'email' },
                { id: 'phone', icon: FiPhone, label: 'Phone (optional)', placeholder: '+91 98765 43210', type: 'tel' },
                { id: 'password', icon: FiLock, label: 'Password', placeholder: '••••••••', type: 'password' },
              ].map(({ id, icon: Icon, label, placeholder, type }) => (
                <div key={id}>
                  <label className="label">{label}</label>
                  <div className="relative">
                    <Icon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                    <input id={id} type={type} placeholder={placeholder} value={form[id]} onChange={e => setForm(p => ({ ...p, [id]: e.target.value }))} className="input pl-10" required={id !== 'phone'} />
                  </div>
                </div>
              ))}
              <button type="submit" disabled={loading} className="btn-primary w-full disabled:opacity-70">{loading ? 'Creating account...' : 'Create Account'}</button>
            </form>
            <p className="text-center text-sm text-gray-500 dark:text-dark-muted mt-6">Already have an account? <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign In</Link></p>
          </div>
        </motion.div>
      </div>
    </>
  );
}

import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';
import { FiMail } from 'react-icons/fi';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/auth/forgot-password', { email });
      setSent(true);
      toast.success('Reset link sent! Check your inbox.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong.');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Forgot Password — D-STORE</title></Helmet>
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="text-center mb-8">
            <Link to="/"><img src="/logo.png" className="h-12 w-auto object-contain" alt="logo" /></Link>
            <h1 className="font-display font-bold text-2xl mt-3 dark:text-dark-text">Forgot Password</h1>
            <p className="text-gray-500 dark:text-dark-muted mt-1">Enter your email to receive a reset link</p>
          </div>
          <div className="card p-8">
            {sent ? (
              <div className="text-center py-4">
                <div className="text-5xl mb-4">📧</div>
                <h3 className="font-semibold text-lg dark:text-dark-text mb-2">Email Sent!</h3>
                <p className="text-gray-500 dark:text-dark-muted text-sm">Check your inbox for the password reset link. It expires in 30 minutes.</p>
                <Link to="/login" className="btn-primary mt-6 inline-block">Back to Sign In</Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="label">Email Address</label>
                  <div className="relative">
                    <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input id="forgot-email" type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} className="input pl-10" required />
                  </div>
                </div>
                <button type="submit" disabled={loading} className="btn-primary w-full">{loading ? 'Sending...' : 'Send Reset Link'}</button>
                <p className="text-center text-sm"><Link to="/login" className="text-primary-500 hover:underline">Back to Sign In</Link></p>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </>
  );
}

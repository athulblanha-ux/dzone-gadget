import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiUser, FiMail, FiPhone, FiLogOut, FiEdit2 } from 'react-icons/fi';
import { useAuthStore } from '../store';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Profile() {
  const { user, updateUser, logout } = useAuthStore();
  const [form, setForm] = useState({ name: user?.name || '', phone: user?.phone || '' });
  const [loading, setLoading] = useState(false);

  const { data: profile } = useQuery({ queryKey: ['profile'], queryFn: () => api.get('/users/profile').then(r => r.data.user) });

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.put('/users/profile', form);
      updateUser(data.user);
      toast.success('Profile updated successfully!');
    } catch {
      toast.error('Failed to update profile');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>My Profile — DZONE GADGET</title></Helmet>
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="font-display font-bold text-3xl dark:text-dark-text">My Profile</h1>
          <button onClick={logout} className="btn-secondary py-2 px-4 text-sm text-red-500 border-red-200 hover:bg-red-50 dark:hover:bg-red-900/20"><FiLogOut /> Logout</button>
        </div>
        
        <div className="card p-8 mb-8 flex flex-col md:flex-row gap-8 items-start">
          <div className="flex flex-col items-center gap-4">
            {profile?.avatar?.url ? (
              <img src={profile.avatar.url} alt={user?.name} className="w-32 h-32 rounded-full object-cover border-4 border-primary-100" />
            ) : (
              <div className="w-32 h-32 rounded-full bg-gradient-primary flex items-center justify-center text-white text-4xl font-bold border-4 border-primary-100 shadow-lg">
                {user?.name?.[0]}
              </div>
            )}
            <button className="text-primary-500 text-sm font-semibold flex items-center gap-1 hover:underline"><FiEdit2 size={12} /> Change Avatar</button>
          </div>
          
          <div className="flex-1 w-full">
            <form onSubmit={handleUpdate} className="space-y-4">
              <div><label className="label">Full Name</label><div className="relative"><FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="text" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} className="input pl-10" required /></div></div>
              <div><label className="label">Email Address</label><div className="relative"><FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="email" value={user?.email} className="input pl-10 bg-gray-50 dark:bg-dark-bg text-gray-500" disabled /></div><p className="text-xs text-gray-400 mt-1">Email cannot be changed.</p></div>
              <div><label className="label">Phone Number</label><div className="relative"><FiPhone className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input type="tel" value={form.phone} onChange={e => setForm(p => ({...p, phone: e.target.value}))} className="input pl-10" /></div></div>
              <button type="submit" disabled={loading} className="btn-primary mt-4 w-full md:w-auto">{loading ? 'Saving...' : 'Save Changes'}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

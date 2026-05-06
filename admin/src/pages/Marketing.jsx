import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Marketing() {
  const [activeTab, setActiveTab] = useState('coupons');
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'coupons', label: 'Coupons' },
    { id: 'newsletter', label: 'Newsletter Subscribers' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Marketing</h1>
      
      <div className="flex gap-2 border-b dark:border-dark-border">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2 font-medium border-b-2 transition-colors ${activeTab === tab.id ? 'border-primary-600 text-primary-600 dark:border-primary-500 dark:text-primary-500' : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === 'coupons' && <CouponsManager queryClient={queryClient} />}
      {activeTab === 'newsletter' && <NewsletterManager />}
    </div>
  );
}

function CouponsManager({ queryClient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: '', maxDiscount: '', minOrderAmount: '', expiryDate: '', usageLimit: '', isActive: true
  });

  const { data, isLoading } = useQuery({ 
    queryKey: ['coupons'], 
    queryFn: () => api.get('/coupons').then(r => r.data.coupons) 
  });

  const saveMutation = useMutation({
    mutationFn: (d) => editingId ? api.put(`/coupons/${editingId}`, d) : api.post('/coupons', d),
    onSuccess: () => { 
      queryClient.invalidateQueries(['coupons']); 
      toast.success(editingId ? 'Coupon updated' : 'Coupon created'); 
      setIsModalOpen(false); 
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save coupon')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/coupons/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['coupons']); toast.success('Coupon deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const submitData = { ...form };
    if (!submitData.maxDiscount) delete submitData.maxDiscount;
    if (!submitData.usageLimit) delete submitData.usageLimit;
    saveMutation.mutate(submitData);
  };

  const openEdit = (c) => {
    setEditingId(c._id);
    setForm({
      code: c.code,
      type: c.type,
      value: c.value,
      maxDiscount: c.maxDiscount || '',
      minOrderAmount: c.minOrderAmount || '',
      expiryDate: c.expiryDate ? new Date(c.expiryDate).toISOString().split('T')[0] : '',
      usageLimit: c.usageLimit || '',
      isActive: c.isActive
    });
    setIsModalOpen(true);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm({ code: '', type: 'percentage', value: '', maxDiscount: '', minOrderAmount: '', expiryDate: '', usageLimit: '', isActive: true });
    setIsModalOpen(true);
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold dark:text-white">Discount Coupons</h2>
        <button onClick={openCreate} className="btn-primary text-sm"><FiPlus className="inline mr-1" /> Add Coupon</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-dark-border text-sm text-gray-500 dark:text-gray-400">
              <th className="p-3">Code</th>
              <th className="p-3">Type & Value</th>
              <th className="p-3">Min Order</th>
              <th className="p-3">Usage</th>
              <th className="p-3">Expiry</th>
              <th className="p-3">Status</th>
              <th className="p-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan="7" className="p-4 text-center">Loading...</td></tr> : data?.map(c => (
              <tr key={c._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                <td className="p-3 font-medium dark:text-white">{c.code}</td>
                <td className="p-3 text-sm dark:text-gray-300">
                  {c.type === 'percentage' ? `${c.value}%` : `₹${c.value}`}
                  {c.type === 'percentage' && c.maxDiscount ? ` (Up to ₹${c.maxDiscount})` : ''}
                </td>
                <td className="p-3 text-sm dark:text-gray-300">₹{c.minOrderAmount || 0}</td>
                <td className="p-3 text-sm dark:text-gray-300">{c.usedCount || 0} / {c.usageLimit || '∞'}</td>
                <td className="p-3 text-sm dark:text-gray-300">
                  {c.expiryDate ? new Date(c.expiryDate).toLocaleDateString() : 'Never'}
                </td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${c.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {c.isActive ? 'Active' : 'Inactive'}
                  </span>
                </td>
                <td className="p-3 text-right flex justify-end gap-2">
                  <button onClick={() => openEdit(c)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={16}/></button>
                  <button onClick={() => { if(window.confirm('Delete this coupon?')) deleteMutation.mutate(c._id) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={16}/></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-lg overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border">
              <h3 className="font-bold dark:text-white">{editingId ? 'Edit' : 'New'} Coupon</h3>
              <button onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Coupon Code *</label>
                  <input type="text" className="input" value={form.code} onChange={e=>setForm({...form, code:e.target.value.toUpperCase()})} required placeholder="e.g. SUMMER50" />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select className="input" value={form.isActive} onChange={e=>setForm({...form, isActive:e.target.value==='true'})}>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Discount Type *</label>
                  <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (₹)</option>
                  </select>
                </div>
                <div>
                  <label className="label">Discount Value *</label>
                  <input type="number" className="input" value={form.value} onChange={e=>setForm({...form, value:e.target.value})} required min="1" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {form.type === 'percentage' && (
                  <div>
                    <label className="label">Max Discount (₹)</label>
                    <input type="number" className="input" value={form.maxDiscount} onChange={e=>setForm({...form, maxDiscount:e.target.value})} placeholder="Optional" />
                  </div>
                )}
                <div>
                  <label className="label">Min Order Amount (₹)</label>
                  <input type="number" className="input" value={form.minOrderAmount} onChange={e=>setForm({...form, minOrderAmount:e.target.value})} placeholder="0" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Expiry Date</label>
                  <input type="date" className="input" value={form.expiryDate} onChange={e=>setForm({...form, expiryDate:e.target.value})} />
                </div>
                <div>
                  <label className="label">Total Usage Limit</label>
                  <input type="number" className="input" value={form.usageLimit} onChange={e=>setForm({...form, usageLimit:e.target.value})} placeholder="Unlimited" />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-dark-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saveMutation.isLoading} className="btn-primary">Save Coupon</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function NewsletterManager() {
  const { data, isLoading } = useQuery({ 
    queryKey: ['newsletter-subscribers'], 
    queryFn: () => api.get('/newsletters/admin/subscribers').then(r => r.data.subscribers) 
  });

  const exportCSV = () => {
    if (!data?.length) return toast.error('No subscribers to export');
    const csvContent = "data:text/csv;charset=utf-8," 
      + "Email,Status,Subscribed At\n"
      + data.map(e => `${e.email},${e.status},${new Date(e.subscribedAt).toISOString()}`).join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "newsletter_subscribers.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="font-bold dark:text-white">Subscribers</h2>
          <p className="text-sm text-gray-500">Total: {data?.length || 0}</p>
        </div>
        <button onClick={exportCSV} className="btn-secondary text-sm flex items-center gap-2"><FiDownload /> Export CSV</button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b dark:border-dark-border text-sm text-gray-500 dark:text-gray-400">
              <th className="p-3">Email</th>
              <th className="p-3">Status</th>
              <th className="p-3">Subscribed At</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? <tr><td colSpan="3" className="p-4 text-center">Loading...</td></tr> : data?.map(s => (
              <tr key={s._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                <td className="p-3 font-medium dark:text-white">{s.email}</td>
                <td className="p-3">
                  <span className={`px-2 py-1 text-xs rounded-full ${s.status === 'subscribed' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                    {s.status}
                  </span>
                </td>
                <td className="p-3 text-sm dark:text-gray-300">
                  {new Date(s.subscribedAt).toLocaleString()}
                </td>
              </tr>
            ))}
            {!isLoading && data?.length === 0 && (
              <tr><td colSpan="3" className="p-8 text-center text-gray-500">No subscribers found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

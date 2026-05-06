import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiEdit2, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function CMS() {
  const [activeTab, setActiveTab] = useState('banners');
  const queryClient = useQueryClient();

  const tabs = [
    { id: 'banners', label: 'Banners' },
    { id: 'faqs', label: 'FAQs' },
    { id: 'testimonials', label: 'Testimonials' },
    { id: 'homepage', label: 'Homepage Sections' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Content Management</h1>
      
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

      {activeTab === 'banners' && <BannersManager queryClient={queryClient} />}
      {activeTab === 'faqs' && <FAQsManager queryClient={queryClient} />}
      {activeTab === 'testimonials' && <TestimonialsManager queryClient={queryClient} />}
      {activeTab === 'homepage' && <HomepageManager queryClient={queryClient} />}
    </div>
  );
}

function BannersManager({ queryClient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ title: '', link: '', position: 'hero', order: 0, isActive: true });

  const { data, isLoading } = useQuery({ queryKey: ['cms-banners'], queryFn: () => api.get('/banners').then(r => r.data.banners) });

  const saveMutation = useMutation({
    mutationFn: (fd) => api.post('/banners', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { queryClient.invalidateQueries(['cms-banners']); toast.success('Banner created'); setIsModalOpen(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/banners/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['cms-banners']); toast.success('Banner deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!file) return toast.error('Please upload an image');
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    fd.append('image', file);
    saveMutation.mutate(fd);
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold dark:text-white">Hero Banners</h2>
        <button onClick={() => { setForm({ title: '', link: '', position: 'hero', order: 0, isActive: true }); setFile(null); setIsModalOpen(true); }} className="btn-primary text-sm"><FiPlus/> Add Banner</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <p className="text-gray-500">Loading...</p> : data?.map(banner => (
          <div key={banner._id} className="border dark:border-dark-border rounded-lg overflow-hidden group relative">
            <img src={banner.image?.url} className="w-full h-40 object-cover" />
            <div className="p-3 bg-white dark:bg-dark-card">
              <p className="font-semibold dark:text-white text-sm">{banner.title}</p>
              <p className="text-xs text-gray-500">Link: {banner.link || '-'}</p>
            </div>
            <button onClick={() => { if(window.confirm('Delete banner?')) deleteMutation.mutate(banner._id) }} className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity shadow"><FiTrash2 size={14}/></button>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border"><h3 className="font-bold dark:text-white">New Banner</h3><button onClick={() => setIsModalOpen(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Title</label><input type="text" className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required/></div>
              <div><label className="label">Redirect Link (Optional)</label><input type="text" className="input" value={form.link} onChange={e=>setForm({...form, link:e.target.value})} placeholder="/shop?sale=true"/></div>
              <div><label className="label">Banner Image *</label><input type="file" accept="image/*" className="input" onChange={e=>setFile(e.target.files[0])} required/></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={saveMutation.isLoading} className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function FAQsManager({ queryClient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ question: '', answer: '', category: 'general', order: 0 });

  const { data, isLoading } = useQuery({ queryKey: ['cms-faqs'], queryFn: () => api.get('/faqs').then(r => r.data.faqs) });

  const saveMutation = useMutation({
    mutationFn: (d) => editingId ? api.put(`/faqs/${editingId}`, d) : api.post('/faqs', d),
    onSuccess: () => { queryClient.invalidateQueries(['cms-faqs']); toast.success('FAQ saved'); setIsModalOpen(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/faqs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['cms-faqs']); toast.success('FAQ deleted'); }
  });

  const handleSubmit = (e) => { e.preventDefault(); saveMutation.mutate(form); };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold dark:text-white">FAQs</h2>
        <button onClick={() => { setForm({ question: '', answer: '', category: 'general', order: 0 }); setEditingId(null); setIsModalOpen(true); }} className="btn-primary text-sm"><FiPlus/> Add FAQ</button>
      </div>
      <div className="space-y-3">
        {isLoading ? <p className="text-gray-500">Loading...</p> : data?.map(faq => (
          <div key={faq._id} className="border dark:border-dark-border p-4 rounded-lg flex justify-between items-start gap-4">
            <div>
              <p className="font-bold text-sm dark:text-white">{faq.question}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{faq.answer}</p>
            </div>
            <div className="flex flex-shrink-0">
              <button onClick={() => { setEditingId(faq._id); setForm({ question: faq.question, answer: faq.answer, category: faq.category, order: faq.order }); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={16}/></button>
              <button onClick={() => { if(window.confirm('Delete FAQ?')) deleteMutation.mutate(faq._id) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={16}/></button>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border"><h3 className="font-bold dark:text-white">{editingId ? 'Edit' : 'New'} FAQ</h3><button onClick={() => setIsModalOpen(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Question *</label><input type="text" className="input" value={form.question} onChange={e=>setForm({...form, question:e.target.value})} required/></div>
              <div><label className="label">Answer *</label><textarea rows={3} className="input" value={form.answer} onChange={e=>setForm({...form, answer:e.target.value})} required/></div>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={saveMutation.isLoading} className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function TestimonialsManager({ queryClient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({ name: '', role: '', content: '', rating: 5, isPublished: true, order: 0 });

  const { data, isLoading } = useQuery({ queryKey: ['cms-testimonials'], queryFn: () => api.get('/testimonials').then(r => r.data.testimonials) });

  const saveMutation = useMutation({
    mutationFn: (fd) => editingId ? api.put(`/testimonials/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }) : api.post('/testimonials', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => { queryClient.invalidateQueries(['cms-testimonials']); toast.success('Testimonial saved'); setIsModalOpen(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save testimonial')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/testimonials/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['cms-testimonials']); toast.success('Testimonial deleted'); }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.entries(form).forEach(([k,v]) => fd.append(k,v));
    if (file) fd.append('image', file);
    saveMutation.mutate(fd);
  };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold dark:text-white">Testimonials</h2>
        <button onClick={() => { setForm({ name: '', role: '', content: '', rating: 5, isPublished: true, order: 0 }); setEditingId(null); setFile(null); setIsModalOpen(true); }} className="btn-primary text-sm"><FiPlus/> Add Testimonial</button>
      </div>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading ? <p className="text-gray-500">Loading...</p> : data?.map(t => (
          <div key={t._id} className="border dark:border-dark-border p-4 rounded-lg flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <img src={t.image?.url || '/placeholder.png'} className="w-12 h-12 rounded-full object-cover" />
              <div>
                <p className="font-bold text-sm dark:text-white">{t.name}</p>
                <p className="text-xs text-gray-500">{t.role}</p>
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 italic flex-1">"{t.content}"</p>
            <div className="flex justify-between items-center pt-3 border-t dark:border-dark-border">
              <span className={`text-xs px-2 py-1 rounded-full ${t.isPublished ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{t.isPublished ? 'Published' : 'Hidden'}</span>
              <div className="flex gap-1">
                <button onClick={() => { setEditingId(t._id); setForm({ name: t.name, role: t.role, content: t.content, rating: t.rating, isPublished: t.isPublished, order: t.order }); setFile(null); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={16}/></button>
                <button onClick={() => { if(window.confirm('Delete testimonial?')) deleteMutation.mutate(t._id) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border"><h3 className="font-bold dark:text-white">{editingId ? 'Edit' : 'New'} Testimonial</h3><button onClick={() => setIsModalOpen(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Customer Name *</label><input type="text" className="input" value={form.name} onChange={e=>setForm({...form, name:e.target.value})} required/></div>
              <div><label className="label">Role/Location</label><input type="text" className="input" value={form.role} onChange={e=>setForm({...form, role:e.target.value})} placeholder="e.g. Verified Buyer"/></div>
              <div><label className="label">Content *</label><textarea rows={3} className="input" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required/></div>
              <div><label className="label">Rating (1-5)</label><input type="number" min="1" max="5" className="input" value={form.rating} onChange={e=>setForm({...form, rating:e.target.value})} required/></div>
              <div><label className="label">Profile Image</label><input type="file" accept="image/*" className="input" onChange={e=>setFile(e.target.files[0])} /></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form, isPublished:e.target.checked})}/> Publish on site</label>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={saveMutation.isLoading} className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

function HomepageManager({ queryClient }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({ title: '', type: 'products', isActive: true, order: 0 });

  const { data, isLoading } = useQuery({ queryKey: ['cms-homepage'], queryFn: () => api.get('/homepage-sections').then(r => r.data.sections) });

  const saveMutation = useMutation({
    mutationFn: (d) => editingId ? api.put(`/homepage-sections/${editingId}`, d) : api.post('/homepage-sections', d),
    onSuccess: () => { queryClient.invalidateQueries(['cms-homepage']); toast.success('Section saved'); setIsModalOpen(false); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save section')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/homepage-sections/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['cms-homepage']); toast.success('Section deleted'); }
  });

  const handleSubmit = (e) => { e.preventDefault(); saveMutation.mutate(form); };

  return (
    <div className="card p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold dark:text-white">Homepage Sections</h2>
        <button onClick={() => { setForm({ title: '', type: 'products', isActive: true, order: 0 }); setEditingId(null); setIsModalOpen(true); }} className="btn-primary text-sm"><FiPlus/> Add Section</button>
      </div>
      <div className="space-y-3">
        {isLoading ? <p className="text-gray-500">Loading...</p> : data?.map(sec => (
          <div key={sec._id} className="border dark:border-dark-border p-4 rounded-lg flex justify-between items-center">
            <div>
              <p className="font-bold text-sm dark:text-white">{sec.title}</p>
              <p className="text-xs text-gray-500 mt-1 capitalize">Type: {sec.type} | Order: {sec.order}</p>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-xs px-2 py-1 rounded-full ${sec.isActive ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>{sec.isActive ? 'Active' : 'Inactive'}</span>
              <div className="flex flex-shrink-0 gap-1">
                <button onClick={() => { setEditingId(sec._id); setForm({ title: sec.title, type: sec.type, isActive: sec.isActive, order: sec.order }); setIsModalOpen(true); }} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded"><FiEdit2 size={16}/></button>
                <button onClick={() => { if(window.confirm('Delete section?')) deleteMutation.mutate(sec._id) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 size={16}/></button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border"><h3 className="font-bold dark:text-white">{editingId ? 'Edit' : 'New'} Section</h3><button onClick={() => setIsModalOpen(false)}><FiX /></button></div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Section Title *</label><input type="text" className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required placeholder="e.g. Featured Products"/></div>
              <div>
                <label className="label">Section Type</label>
                <select className="input" value={form.type} onChange={e=>setForm({...form, type:e.target.value})}>
                  <option value="products">Products Grid</option>
                  <option value="categories">Categories Grid</option>
                  <option value="custom">Custom Content</option>
                </select>
              </div>
              <div><label className="label">Display Order</label><input type="number" className="input" value={form.order} onChange={e=>setForm({...form, order:e.target.value})}/></div>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.isActive} onChange={e=>setForm({...form, isActive:e.target.checked})}/> Active</label>
              <div className="flex justify-end gap-2 pt-2"><button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button><button type="submit" disabled={saveMutation.isLoading} className="btn-primary">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

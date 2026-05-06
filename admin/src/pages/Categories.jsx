import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Categories() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', icon: '', isFeatured: false, order: 0 });
  const [search, setSearch] = useState('');

  const queryClient = useQueryClient();

  const { data: categories, isLoading } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.categories)
  });

  const saveMutation = useMutation({
    mutationFn: (data) => editingCategory ? api.put(`/categories/${editingCategory._id}`, data) : api.post('/categories', data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      toast.success(editingCategory ? 'Category updated' : 'Category created');
      handleClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/categories/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-categories']);
      toast.success('Category deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed')
  });

  const handleOpen = (category = null) => {
    if (category) {
      setEditingCategory(category);
      setForm({ name: category.name, description: category.description || '', icon: category.icon || '', isFeatured: category.isFeatured, order: category.order || 0 });
    } else {
      setEditingCategory(null);
      setForm({ name: '', description: '', icon: '', isFeatured: false, order: categories?.length || 0 });
    }
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    saveMutation.mutate(form);
  };

  const filtered = categories?.filter(c => c.name.toLowerCase().includes(search.toLowerCase())) || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Categories</h1>
        <button onClick={() => handleOpen()} className="btn-primary"><FiPlus /> Add Category</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-sm mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search categories..." value={search} onChange={e => setSearch(e.target.value)} className="input pl-10" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-400">
              <tr><th className="px-4 py-3">Category</th><th className="px-4 py-3">Slug</th><th className="px-4 py-3">Featured</th><th className="px-4 py-3">Order</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              : filtered.map(cat => (
                <tr key={cat._id} className="border-b dark:border-dark-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{cat.icon}</span>
                      <div>
                        <div className="font-semibold dark:text-white">{cat.name}</div>
                        {cat.description && <div className="text-xs text-gray-500 line-clamp-1">{cat.description}</div>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat.slug}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${cat.isFeatured ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                      {cat.isFeatured ? 'Yes' : 'No'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{cat.order}</td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpen(cat)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded mr-2"><FiEdit2 /></button>
                    <button onClick={() => { if(window.confirm('Delete this category?')) deleteMutation.mutate(cat._id) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
              {!isLoading && filtered.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No categories found.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border">
              <h3 className="font-bold text-lg dark:text-white">{editingCategory ? 'Edit Category' : 'New Category'}</h3>
              <button onClick={handleClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><FiX size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 space-y-4">
              <div><label className="label">Name *</label><input required type="text" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
              <div><label className="label">Description</label><textarea className="input" rows="2" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="label">Emoji Icon</label><input type="text" className="input" value={form.icon} onChange={e => setForm({...form, icon: e.target.value})} placeholder="🎮" /></div>
                <div><label className="label">Display Order</label><input type="number" className="input" value={form.order} onChange={e => setForm({...form, order: Number(e.target.value)})} /></div>
              </div>
              <div>
                <label className="flex items-center gap-2 cursor-pointer mt-2">
                  <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="accent-primary-500 w-4 h-4" />
                  <span className="text-sm font-medium dark:text-white">Featured Category</span>
                </label>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t dark:border-dark-border">
                <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saveMutation.isLoading} className="btn-primary">{saveMutation.isLoading ? 'Saving...' : 'Save'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

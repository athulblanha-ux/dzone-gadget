import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiEdit2, FiX, FiImage } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Blogs() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [file, setFile] = useState(null);
  const [form, setForm] = useState({
    title: '', excerpt: '', content: '', category: 'general', tags: '', isPublished: false, isFeatured: false
  });

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-blogs'],
    queryFn: () => api.get('/blogs').then(r => r.data.blogs)
  });

  const saveMutation = useMutation({
    mutationFn: (fd) => editingId ? api.put(`/blogs/${editingId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } }) : api.post('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-blogs']);
      toast.success(editingId ? 'Blog updated' : 'Blog created');
      setIsModalOpen(false);
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to save blog')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/blogs/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-blogs']); toast.success('Blog deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!editingId && !file) return toast.error('Please upload a cover image');
    
    const fd = new FormData();
    Object.entries(form).forEach(([k, v]) => {
      if (k === 'tags') {
        fd.append(k, v); // Send as comma-separated string
      } else {
        fd.append(k, v);
      }
    });
    if (file) fd.append('coverImage', file);

    saveMutation.mutate(fd);
  };

  const openCreate = () => {
    setEditingId(null);
    setFile(null);
    setForm({ title: '', excerpt: '', content: '', category: 'general', tags: '', isPublished: false, isFeatured: false });
    setIsModalOpen(true);
  };

  const openEdit = (blog) => {
    setEditingId(blog._id);
    setFile(null);
    setForm({
      title: blog.title,
      excerpt: blog.excerpt || '',
      content: blog.content || '',
      category: blog.category || 'general',
      tags: blog.tags ? blog.tags.join(', ') : '',
      isPublished: blog.isPublished || false,
      isFeatured: blog.isFeatured || false
    });
    setIsModalOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Blogs</h1>
        <button onClick={openCreate} className="btn-primary text-sm flex items-center gap-2">
          <FiPlus /> Create Blog Post
        </button>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? <p className="text-gray-500">Loading...</p> : data?.map(blog => (
          <div key={blog._id} className="card overflow-hidden group">
            <div className="relative h-48 bg-gray-100 dark:bg-dark-bg">
              {blog.coverImage?.url ? (
                <img src={blog.coverImage.url} alt={blog.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-gray-400">
                  <FiImage size={32} />
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(blog)} className="bg-white/90 p-1.5 rounded-lg text-blue-600 hover:bg-white shadow"><FiEdit2 size={16}/></button>
                <button onClick={() => { if(window.confirm('Delete blog?')) deleteMutation.mutate(blog._id) }} className="bg-white/90 p-1.5 rounded-lg text-red-600 hover:bg-white shadow"><FiTrash2 size={16}/></button>
              </div>
            </div>
            <div className="p-4">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold dark:text-white line-clamp-2" title={blog.title}>{blog.title}</h3>
              </div>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4 line-clamp-2">{blog.excerpt}</p>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className={`px-2 py-1 rounded-full ${blog.isPublished ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                  {blog.isPublished ? 'Published' : 'Draft'}
                </span>
                <span>{new Date(blog.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl w-full max-w-4xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border">
              <h3 className="font-bold dark:text-white">{editingId ? 'Edit' : 'Create'} Blog Post</h3>
              <button onClick={() => setIsModalOpen(false)}><FiX /></button>
            </div>
            <form onSubmit={handleSubmit} className="p-4 overflow-y-auto space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div>
                    <label className="label">Title *</label>
                    <input type="text" className="input" value={form.title} onChange={e=>setForm({...form, title:e.target.value})} required />
                  </div>
                  <div>
                    <label className="label">Excerpt</label>
                    <textarea rows="2" className="input" value={form.excerpt} onChange={e=>setForm({...form, excerpt:e.target.value})} maxLength="500"></textarea>
                  </div>
                  <div>
                    <label className="label">Content (HTML) *</label>
                    <textarea rows="15" className="input font-mono text-sm" value={form.content} onChange={e=>setForm({...form, content:e.target.value})} required placeholder="<p>Write your HTML content here...</p>"></textarea>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="label">Cover Image</label>
                    <input type="file" accept="image/*" className="input" onChange={e=>setFile(e.target.files[0])} />
                  </div>
                  <div>
                    <label className="label">Category</label>
                    <input type="text" className="input" value={form.category} onChange={e=>setForm({...form, category:e.target.value})} />
                  </div>
                  <div>
                    <label className="label">Tags (comma-separated)</label>
                    <input type="text" className="input" value={form.tags} onChange={e=>setForm({...form, tags:e.target.value})} placeholder="toys, kids, sale" />
                  </div>
                  
                  <div className="pt-4 border-t dark:border-dark-border space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isPublished} onChange={e=>setForm({...form, isPublished:e.target.checked})} className="rounded text-primary-600" />
                      <span className="text-sm dark:text-gray-300">Publish immediately</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input type="checkbox" checked={form.isFeatured} onChange={e=>setForm({...form, isFeatured:e.target.checked})} className="rounded text-primary-600" />
                      <span className="text-sm dark:text-gray-300">Feature on homepage</span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t dark:border-dark-border">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn-secondary">Cancel</button>
                <button type="submit" disabled={saveMutation.isLoading} className="btn-primary">Save Blog Post</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiImage, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Products() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  
  // Form State
  const initialForm = { name: '', description: '', shortDescription: '', price: '', salePrice: '', stock: '', category: '', tags: '', ageGroup: 'all', gstRate: 18, isFeatured: false, isTrending: false, isNewArrival: false, variants: [], video: null, deliveryCharge: 0 };
  const [form, setForm] = useState(initialForm);
  const [images, setImages] = useState([]);
  const [previews, setPreviews] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [videoFile, setVideoFile] = useState(null);
  const [videoPreview, setVideoPreview] = useState(null);
  const [existingVideo, setExistingVideo] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-products', page, search],
    queryFn: () => api.get(`/products?page=${page}&limit=10&search=${search}`).then(r => r.data)
  });

  const { data: categories } = useQuery({
    queryKey: ['admin-categories'],
    queryFn: () => api.get('/categories').then(r => r.data.categories)
  });

  const saveMutation = useMutation({
    mutationFn: async (formData) => {
      if (editingProduct) {
        return api.put(`/products/${editingProduct._id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      }
      return api.post('/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success(editingProduct ? 'Product updated' : 'Product created');
      handleClose();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Action failed')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-products']);
      toast.success('Product deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Delete failed')
  });

  const handleOpen = (prod = null) => {
    if (prod) {
      setEditingProduct(prod);
      setForm({
        name: prod.name,
        description: prod.description,
        shortDescription: prod.shortDescription,
        price: prod.price,
        salePrice: prod.salePrice || '',
        stock: prod.stock,
        category: prod.category?._id || '',
        tags: prod.tags?.join(', ') || '',
        ageGroup: prod.ageGroup || 'all',
        gstRate: prod.gstRate,
        isFeatured: prod.isFeatured,
        isTrending: prod.isTrending,
        isNewArrival: prod.isNewArrival,
        variants: prod.variants || [],
        deliveryCharge: prod.deliveryCharge || 0
      });
      setExistingImages(prod.images || []);
      setExistingVideo(prod.video || null);
    } else {
      setEditingProduct(null);
      setForm(initialForm);
      setExistingImages([]);
      setExistingVideo(null);
    }
    setImages([]);
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
    setIsModalOpen(true);
  };

  const handleClose = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleVideoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setVideoFile(file);
      if (videoPreview) URL.revokeObjectURL(videoPreview);
      setVideoPreview(URL.createObjectURL(file));
    }
  };

  const removeImage = (index) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);

    const newPreviews = [...previews];
    URL.revokeObjectURL(newPreviews[index]);
    newPreviews.splice(index, 1);
    setPreviews(newPreviews);
  };

  const removeVideo = () => {
    setVideoFile(null);
    if (videoPreview) URL.revokeObjectURL(videoPreview);
    setVideoPreview(null);
  };

  const removeExistingVideo = () => {
    setExistingVideo(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!form.name || !form.shortDescription || !form.price || form.stock === '' || form.gstRate === '' || !form.category) {
      return toast.error("Please fill all required fields (marked with *)");
    }

    const fd = new FormData();
    Object.entries(form).forEach(([key, val]) => {
      if (key === 'tags') {
        fd.append(key, JSON.stringify(val.split(',').map(s => s.trim()).filter(Boolean)));
      } else if (key === 'variants') {
        fd.append(key, JSON.stringify(val));
      } else if (typeof val === 'boolean') {
        fd.append(key, val);
      } else {
        fd.append(key, val);
      }
    });

    // Retain existing images that were not removed
    if (editingProduct) {
      fd.append('existingImages', JSON.stringify(existingImages));
      if (!existingVideo) fd.append('removeVideo', 'true');
    }

    images.forEach(file => fd.append('images', file));
    if (videoFile) fd.append('video', videoFile);
    saveMutation.mutate(fd);
  };

  const removeExistingImage = (publicId) => {
    setExistingImages(prev => prev.filter(img => (img.publicId || img.public_id) !== publicId));
  };

  const addVariant = () => setForm(f => ({ ...f, variants: [...f.variants, { name: 'Color', value: '', priceOffset: 0, stock: 10 }] }));
  const updateVariant = (idx, key, val) => {
    const v = [...form.variants];
    v[idx][key] = val;
    setForm({ ...form, variants: v });
  };
  const removeVariant = (idx) => setForm(f => ({ ...f, variants: f.variants.filter((_, i) => i !== idx) }));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Products</h1>
        <button onClick={() => handleOpen()} className="btn-primary"><FiPlus /> Add Product</button>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name, tags, or SKUs..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input pl-10" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-400">
              <tr><th className="px-4 py-3">Product</th><th className="px-4 py-3">Category</th><th className="px-4 py-3">Price</th><th className="px-4 py-3">Stock</th><th className="px-4 py-3">Badges</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              : data?.products?.map(prod => (
                <tr key={prod._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded bg-gray-100 overflow-hidden flex-shrink-0">
                        {prod.images?.[0]?.url ? <img src={prod.images[0].url} className="w-full h-full object-contain" /> : <FiImage className="mx-auto mt-4 text-gray-400" />}
                      </div>
                      <div>
                        <div className="font-semibold dark:text-white line-clamp-1">{prod.name}</div>
                        <div className="text-xs text-gray-500">{prod.slug}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{prod.category?.name || '-'}</td>
                  <td className="px-4 py-3 font-medium text-primary-600">₹{prod.isOnSale ? prod.salePrice : prod.price} {prod.isOnSale && <span className="text-xs text-gray-400 line-through">₹{prod.price}</span>}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${prod.stock > 10 ? 'bg-green-100 text-green-700' : prod.stock > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                      {prod.stock} in stock
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1 flex-wrap">
                      {prod.isFeatured && <span className="w-2 h-2 rounded-full bg-blue-500" title="Featured" />}
                      {prod.isTrending && <span className="w-2 h-2 rounded-full bg-orange-500" title="Trending" />}
                      {prod.isNewArrival && <span className="w-2 h-2 rounded-full bg-green-500" title="New Arrival" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => handleOpen(prod)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded mr-2"><FiEdit2 /></button>
                    <button onClick={() => { if(window.confirm('Delete this product?')) deleteMutation.mutate(prod._id) }} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.products?.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No products found.</td></tr>}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {data?.pagination && data.pagination.pages > 1 && (
          <div className="flex justify-between items-center mt-4 pt-4 border-t dark:border-dark-border">
            <span className="text-sm text-gray-500">Page {page} of {data.pagination.pages}</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="btn-secondary py-1 text-sm">Prev</button>
              <button onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))} disabled={page === data.pagination.pages} className="btn-secondary py-1 text-sm">Next</button>
            </div>
          </div>
        )}
      </div>

      {/* Form Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border">
              <h3 className="font-bold text-lg dark:text-white">{editingProduct ? 'Edit Product' : 'New Product'}</h3>
              <button onClick={handleClose} className="p-1 text-gray-500 hover:bg-gray-100 rounded"><FiX size={20} /></button>
            </div>
            
            <div className="overflow-y-auto p-4 flex-1">
              <form id="productForm" onSubmit={handleSubmit} className="space-y-6" noValidate>
                
                {/* Basic Info */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-2"><label className="label">Product Name *</label><input required type="text" className="input" value={form.name} onChange={e => setForm({...form, name: e.target.value})} /></div>
                  <div className="col-span-2"><label className="label">Short Description *</label><input required type="text" maxLength={150} className="input" value={form.shortDescription} onChange={e => setForm({...form, shortDescription: e.target.value})} /></div>
                  <div className="col-span-2"><label className="label">Full Description</label><textarea rows="4" className="input" value={form.description} onChange={e => setForm({...form, description: e.target.value})} /></div>
                </div>

                {/* Pricing & Inventory */}
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div><label className="label">Price (₹) *</label><input required type="number" min="0" className="input" value={form.price} onChange={e => setForm({...form, price: e.target.value})} /></div>
                  <div><label className="label">Sale Price (₹)</label><input type="number" min="0" className="input" value={form.salePrice} onChange={e => setForm({...form, salePrice: e.target.value})} /></div>
                  <div><label className="label">Stock *</label><input required type="number" min="0" className="input" value={form.stock} onChange={e => setForm({...form, stock: e.target.value})} /></div>
                  <div><label className="label">GST Rate (%) *</label><input required type="number" min="0" max="100" className="input" value={form.gstRate} onChange={e => setForm({...form, gstRate: e.target.value})} /></div>
                  <div><label className="label">Delivery Charge (₹)</label><input type="number" min="0" className="input" value={form.deliveryCharge} onChange={e => setForm({...form, deliveryCharge: e.target.value === '' ? '' : Number(e.target.value)})} /></div>
                </div>

                {/* Classification */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="label">Category *</label>
                    <select required className="input" value={form.category} onChange={e => setForm({...form, category: e.target.value})}>
                      <option value="">Select Category</option>
                      {categories?.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="label">Age Group</label>
                    <select className="input" value={form.ageGroup} onChange={e => setForm({...form, ageGroup: e.target.value})}>
                      <option value="0-2">0-2 years</option>
                      <option value="3-5">3-5 years</option>
                      <option value="6-8">6-8 years</option>
                      <option value="9-12">9-12 years</option>
                      <option value="13+">13+ years</option>
                      <option value="all">All Ages</option>
                    </select>
                  </div>
                  <div><label className="label">Tags (comma separated)</label><input type="text" className="input" value={form.tags} onChange={e => setForm({...form, tags: e.target.value})} placeholder="educational, puzzle" /></div>
                </div>

                {/* Images */}
                <div>
                  <label className="label">Images</label>
                  <div className="flex gap-4 flex-wrap mb-2">
                    {existingImages.map(img => (
                      <div key={img.publicId || img.public_id} className="relative w-20 h-20 rounded border">
                        <img src={img.url} className="w-full h-full object-contain rounded" />
                        <button type="button" onClick={() => removeExistingImage(img.publicId || img.public_id)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FiX size={12}/></button>
                      </div>
                    ))}
                    {previews.map((url, i) => (
                      <div key={i} className="relative w-20 h-20 rounded border border-blue-300">
                        <img src={url} className="w-full h-full object-contain rounded opacity-70" />
                        <button type="button" onClick={() => removeImage(i)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FiX size={12}/></button>
                      </div>
                    ))}
                  </div>
                  <input type="file" multiple accept="image/*" onChange={(e) => {
                    const files = Array.from(e.target.files);
                    setImages(files);
                    previews.forEach(url => URL.revokeObjectURL(url));
                    const newPreviews = files.map(file => URL.createObjectURL(file));
                    setPreviews(newPreviews);
                  }} className="input" />
                  <p className="text-xs text-gray-500 mt-1">Upload multiple images. Max 5MB each.</p>
                </div>

                {/* Video */}
                <div>
                  <label className="label">Product Video</label>
                  <div className="flex gap-4 flex-wrap mb-2">
                    {existingVideo && (
                      <div className="relative w-40 h-24 rounded border overflow-hidden">
                        <video src={existingVideo.url} className="w-full h-full object-cover" />
                        <button type="button" onClick={removeExistingVideo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FiX size={12}/></button>
                      </div>
                    )}
                    {videoPreview && (
                      <div className="relative w-40 h-24 rounded border border-blue-300 overflow-hidden">
                        <video src={videoPreview} className="w-full h-full object-cover opacity-70" />
                        <button type="button" onClick={removeVideo} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"><FiX size={12}/></button>
                      </div>
                    )}
                  </div>
                  <input type="file" accept="video/*" onChange={handleVideoChange} className="input" />
                  <p className="text-xs text-gray-500 mt-1">Upload a product video. Max 20MB.</p>
                </div>

                {/* Variants */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="label !mb-0">Product Variants</label>
                    <button type="button" onClick={addVariant} className="text-sm text-primary-600 hover:underline flex items-center gap-1"><FiPlus/> Add Variant</button>
                  </div>
                  {form.variants.map((v, i) => (
                    <div key={i} className="flex gap-2 items-center mb-2 bg-gray-50 dark:bg-dark-bg p-2 rounded border border-gray-200 dark:border-dark-border">
                      <input placeholder="Name (e.g. Color)" value={v.name} onChange={e => updateVariant(i, 'name', e.target.value)} className="input text-sm" />
                      <input placeholder="Value (e.g. Red)" value={v.value} onChange={e => updateVariant(i, 'value', e.target.value)} className="input text-sm" />
                      <input type="number" placeholder="Stock" value={v.stock} onChange={e => updateVariant(i, 'stock', Number(e.target.value))} className="input text-sm" />
                      <button type="button" onClick={() => removeVariant(i)} className="p-2 text-red-500 hover:bg-red-50 rounded"><FiTrash2/></button>
                    </div>
                  ))}
                </div>

                {/* Toggles */}
                <div className="flex gap-6 pt-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({...form, isFeatured: e.target.checked})} className="accent-primary-500 w-4 h-4" />
                    <span className="text-sm font-medium dark:text-white">Featured</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isTrending} onChange={e => setForm({...form, isTrending: e.target.checked})} className="accent-primary-500 w-4 h-4" />
                    <span className="text-sm font-medium dark:text-white">Trending</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={form.isNewArrival} onChange={e => setForm({...form, isNewArrival: e.target.checked})} className="accent-primary-500 w-4 h-4" />
                    <span className="text-sm font-medium dark:text-white">New Arrival</span>
                  </label>
                </div>
              </form>
            </div>
            
            <div className="p-4 border-t dark:border-dark-border flex justify-end gap-3 bg-gray-50 dark:bg-dark-bg/50">
              <button type="button" onClick={handleClose} className="btn-secondary">Cancel</button>
              <button type="submit" form="productForm" disabled={saveMutation.isLoading} className="btn-primary">{saveMutation.isLoading ? 'Saving...' : 'Save Product'}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

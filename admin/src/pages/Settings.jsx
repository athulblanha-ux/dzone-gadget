import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSave } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Settings() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({});

  const { data, isLoading } = useQuery({ 
    queryKey: ['admin-settings'], 
    queryFn: () => api.get('/settings').then(r => r.data.settings) 
  });

  useEffect(() => {
    if (data && Object.keys(form).length === 0) {
      const initial = {};
      data.forEach(s => { initial[s.key] = s.value; });
      setTimeout(() => setForm(initial), 0);
    }
  }, [data, form]);

  const saveMutation = useMutation({
    mutationFn: (updates) => Promise.all(updates.map(u => api.post('/settings', u))),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-settings']);
      toast.success('Settings saved successfully');
    },
    onError: () => toast.error('Failed to save settings')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const updates = data.map(s => ({
      key: s.key,
      value: form[s.key],
      label: s.label,
      group: s.group,
      type: s.type,
      isPublic: s.isPublic
    })).filter(s => s.value !== data.find(d => d.key === s.key).value); // only send changed

    if (updates.length > 0) {
      saveMutation.mutate(updates);
    } else {
      toast('No changes detected');
    }
  };

  const groups = data ? [...new Set(data.map(s => s.group))] : [];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Store Settings</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {isLoading ? <p className="text-gray-500">Loading settings...</p> : 
          groups.map(group => (
            <div key={group} className="card p-6">
              <h2 className="text-lg font-bold mb-4 capitalize dark:text-white border-b dark:border-dark-border pb-2">{group}</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.filter(s => s.group === group && s.key !== 'free_shipping_threshold').map(setting => (
                  <div key={setting.key} className={setting.type === 'textarea' ? 'col-span-1 md:col-span-2' : ''}>
                    <label className="label">{setting.label}</label>
                    {setting.type === 'textarea' ? (
                      <textarea
                        rows={4}
                        className="input"
                        value={form[setting.key] || ''}
                        onChange={e => setForm({...form, [setting.key]: e.target.value})}
                      />
                    ) : (
                      <input
                        type={setting.type === 'number' ? 'number' : 'text'}
                        className="input"
                        value={form[setting.key] || ''}
                        onChange={e => setForm({...form, [setting.key]: setting.type === 'number' ? Number(e.target.value) : e.target.value})}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))
        }

        <div className="flex justify-end sticky bottom-6 z-10">
          <button type="submit" disabled={saveMutation.isLoading || isLoading} className="btn-primary shadow-xl py-3 px-8 text-lg rounded-full">
            <FiSave /> {saveMutation.isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </div>
      </form>
    </div>
  );
}

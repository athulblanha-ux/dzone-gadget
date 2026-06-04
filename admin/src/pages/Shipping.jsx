import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiPlus, FiTrash2, FiEdit2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Shipping() {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [currentRule, setCurrentRule] = useState({ state: '', baseFee: 49, freeShippingThreshold: 999999 });

  const { data: rules, isLoading } = useQuery({
    queryKey: ['shippingRules'],
    queryFn: () => api.get('/shipping').then(res => res.data.rules)
  });

  const createMutation = useMutation({
    mutationFn: (newRule) => api.post('/shipping', newRule),
    onSuccess: () => {
      queryClient.invalidateQueries(['shippingRules']);
      toast.success('Shipping rule added');
      setIsEditing(false);
      setCurrentRule({ state: '', baseFee: 49, freeShippingThreshold: 999999 });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to add rule')
  });

  const updateMutation = useMutation({
    mutationFn: (rule) => api.put(`/shipping/${rule._id}`, rule),
    onSuccess: () => {
      queryClient.invalidateQueries(['shippingRules']);
      toast.success('Shipping rule updated');
      setIsEditing(false);
      setCurrentRule({ state: '', baseFee: 49, freeShippingThreshold: 999999 });
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update rule')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/shipping/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(['shippingRules']);
      toast.success('Shipping rule deleted');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete rule')
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (currentRule._id) {
      updateMutation.mutate(currentRule);
    } else {
      createMutation.mutate(currentRule);
    }
  };

  const handleEdit = (rule) => {
    setCurrentRule(rule);
    setIsEditing(true);
  };

  if (isLoading) return <div className="p-8">Loading shipping rules...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold dark:text-white">Shipping Rules</h1>
        <button 
          onClick={() => { setIsEditing(true); setCurrentRule({ state: '', baseFee: 49, freeShippingThreshold: 999999 }); }} 
          className="btn-primary flex items-center gap-2"
        >
          <FiPlus /> Add Rule
        </button>
      </div>

      {isEditing && (
        <div className="card p-6 border-2 border-primary-500">
          <h2 className="text-xl font-bold mb-4 dark:text-white">{currentRule._id ? 'Edit' : 'Add'} Shipping Rule</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="label">State</label>
              <select 
                className="input" 
                value={currentRule.state} 
                onChange={e => setCurrentRule({...currentRule, state: e.target.value})} 
                required
                disabled={currentRule.state.toLowerCase() === 'default'}
              >
                <option value="" disabled>Select State</option>
                {currentRule.state.toLowerCase() === 'default' && <option value="Default">Default (Fallback)</option>}
                <option value="Andaman and Nicobar Islands">Andaman and Nicobar Islands</option>
                <option value="Andhra Pradesh">Andhra Pradesh</option>
                <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                <option value="Assam">Assam</option>
                <option value="Bihar">Bihar</option>
                <option value="Chandigarh">Chandigarh</option>
                <option value="Chhattisgarh">Chhattisgarh</option>
                <option value="Dadra and Nagar Haveli and Daman and Diu">Dadra and Nagar Haveli and Daman and Diu</option>
                <option value="Delhi">Delhi</option>
                <option value="Goa">Goa</option>
                <option value="Gujarat">Gujarat</option>
                <option value="Haryana">Haryana</option>
                <option value="Himachal Pradesh">Himachal Pradesh</option>
                <option value="Jammu and Kashmir">Jammu and Kashmir</option>
                <option value="Jharkhand">Jharkhand</option>
                <option value="Karnataka">Karnataka</option>
                <option value="Kerala">Kerala</option>
                <option value="Ladakh">Ladakh</option>
                <option value="Lakshadweep">Lakshadweep</option>
                <option value="Madhya Pradesh">Madhya Pradesh</option>
                <option value="Maharashtra">Maharashtra</option>
                <option value="Manipur">Manipur</option>
                <option value="Meghalaya">Meghalaya</option>
                <option value="Mizoram">Mizoram</option>
                <option value="Nagaland">Nagaland</option>
                <option value="Odisha">Odisha</option>
                <option value="Puducherry">Puducherry</option>
                <option value="Punjab">Punjab</option>
                <option value="Rajasthan">Rajasthan</option>
                <option value="Sikkim">Sikkim</option>
                <option value="Tamil Nadu">Tamil Nadu</option>
                <option value="Telangana">Telangana</option>
                <option value="Tripura">Tripura</option>
                <option value="Uttar Pradesh">Uttar Pradesh</option>
                <option value="Uttarakhand">Uttarakhand</option>
                <option value="West Bengal">West Bengal</option>
              </select>
              <p className="text-xs text-gray-500 mt-1">Exact state match for shipping.</p>
            </div>
            <div>
              <label className="label">Base Fee (₹)</label>
              <input 
                type="number" 
                className="input" 
                value={currentRule.baseFee} 
                onChange={e => setCurrentRule({...currentRule, baseFee: Number(e.target.value)})} 
                min="0"
                required 
              />
            </div>
            <div className="col-span-full flex justify-end gap-3 mt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="btn-secondary">Cancel</button>
              <button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading} className="btn-primary">
                Save Rule
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 dark:bg-dark-bg border-b border-gray-100 dark:border-dark-border">
              <tr>
                <th className="p-4 font-semibold dark:text-gray-300">State</th>
                <th className="p-4 font-semibold dark:text-gray-300">Base Fee</th>
                <th className="p-4 font-semibold text-right dark:text-gray-300">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
              {rules?.map((rule) => (
                <tr key={rule._id} className="hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                  <td className="p-4 dark:text-gray-300 font-medium">
                    {rule.state} {rule.state.toLowerCase() === 'default' && <span className="ml-2 text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">Fallback</span>}
                  </td>
                  <td className="p-4 dark:text-gray-300">₹{rule.baseFee}</td>
                  <td className="p-4 text-right space-x-2">
                    <button onClick={() => handleEdit(rule)} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg">
                      <FiEdit2 />
                    </button>
                    {rule.state.toLowerCase() !== 'default' && (
                      <button 
                        onClick={() => { if(window.confirm('Delete this rule?')) deleteMutation.mutate(rule._id); }} 
                        className="p-2 text-red-500 hover:bg-red-50 rounded-lg"
                      >
                        <FiTrash2 />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {rules?.length === 0 && (
                <tr>
                  <td colSpan="3" className="p-8 text-center text-gray-500">No shipping rules found. Add one above!</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

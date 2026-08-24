import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch, FiMessageSquare, FiX, FiMapPin, FiShoppingBag } from 'react-icons/fi';
import api from '../lib/api';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedWhatsAppPhone, setSelectedWhatsAppPhone] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => api.get(`/users?page=${page}&limit=15&search=${search}`).then(r => r.data)
  });

  const { data: whatsappData, isLoading: isWaLoading } = useQuery({
    queryKey: ['admin-whatsapp-customer-stats', selectedWhatsAppPhone],
    queryFn: async () => {
      if (!selectedWhatsAppPhone) return null;
      const res = await api.get(`/whatsapp-customers/${selectedWhatsAppPhone}/stats`);
      return res.data;
    },
    enabled: !!selectedWhatsAppPhone,
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Customers</h1>

      <div className="card p-4">
        <div className="relative max-w-md mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by name or email..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input pl-10" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-400">
              <tr>
                <th className="px-4 py-3">Customer</th>
                <th className="px-4 py-3">Email / Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Joined</th>
                <th className="px-4 py-3">WhatsApp Info</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              : data?.users?.map(user => (
                <tr key={user._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-bold overflow-hidden">
                        {user.avatar?.url ? <img src={user.avatar.url} className="w-full h-full object-cover"/> : user.name[0]}
                      </div>
                      <div className="font-semibold dark:text-white">{user.name}</div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-500">
                    <p>{user.email}</p>
                    {user.phone && <p className="text-xs text-gray-400">Ph: {user.phone}</p>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' || user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedWhatsAppPhone(user.phone || user.whatsappNumber || user.name)}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 transition-colors"
                    >
                      <FiMessageSquare size={13} /> View WhatsApp
                    </button>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.users?.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No customers found.</td></tr>}
            </tbody>
          </table>
        </div>
        
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

      {/* WhatsApp Information Modal */}
      {selectedWhatsAppPhone && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-lg w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiMessageSquare className="text-emerald-500" /> WhatsApp Customer Information
              </h3>
              <button
                onClick={() => setSelectedWhatsAppPhone(null)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {isWaLoading ? (
              <p className="text-sm text-gray-500 py-4 text-center">Loading WhatsApp data...</p>
            ) : whatsappData ? (
              <div className="space-y-4 text-sm">
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-dark-bg rounded-xl">
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp Number</p>
                    <p className="font-bold text-emerald-600 dark:text-emerald-400">{whatsappData.whatsappNumber || selectedWhatsAppPhone}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Saved Addresses</p>
                    <p className="font-bold text-gray-900 dark:text-white">{whatsappData.savedAddressesCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">WhatsApp Orders</p>
                    <p className="font-bold text-gray-900 dark:text-white">{whatsappData.totalOrdersCount || 0}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Total WhatsApp Spend</p>
                    <p className="font-bold text-gray-900 dark:text-white">₹{(whatsappData.totalOrderValue || 0).toLocaleString('en-IN')}</p>
                  </div>
                </div>

                {whatsappData.customer?.addresses?.length > 0 && (
                  <div className="space-y-2">
                    <p className="font-semibold text-xs text-gray-500 uppercase">Saved Addresses ({whatsappData.customer.addresses.length})</p>
                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {whatsappData.customer.addresses.map((a, i) => (
                        <div key={i} className="p-2.5 bg-gray-50 dark:bg-dark-bg rounded-lg text-xs border border-gray-200 dark:border-dark-border">
                          <span className="font-bold">{a.type || 'Home'}: </span>
                          <span>{a.houseFlatBuilding}, {a.city}, {a.state} - {a.pincode}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-sm text-gray-500 py-4 text-center">No WhatsApp records found for this phone number.</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { FiSearch } from 'react-icons/fi';
import api from '../lib/api';

export default function Customers() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-customers', page, search],
    queryFn: () => api.get(`/users?page=${page}&limit=15&search=${search}`).then(r => r.data)
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
              <tr><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Email</th><th className="px-4 py-3">Role</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th></tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
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
                  <td className="px-4 py-3 text-gray-500">{user.email}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.role === 'admin' || user.role === 'superadmin' ? 'bg-purple-100 text-purple-700' : 'bg-gray-100 text-gray-700'}`}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500">{new Date(user.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-semibold ${user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.isActive ? 'Active' : 'Banned'}
                    </span>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.users?.length === 0 && <tr><td colSpan="5" className="px-4 py-8 text-center text-gray-500">No customers found.</td></tr>}
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
    </div>
  );
}

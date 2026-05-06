import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiCheck, FiTrash2, FiStar } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

export default function Reviews() {
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-reviews'],
    queryFn: () => api.get('/reviews/admin/all').then(r => r.data.reviews)
  });

  const approveMutation = useMutation({
    mutationFn: (id) => api.patch(`/reviews/${id}/approve`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-reviews']); toast.success('Review approved'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to approve')
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => api.delete(`/reviews/${id}`),
    onSuccess: () => { queryClient.invalidateQueries(['admin-reviews']); toast.success('Review deleted'); },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to delete')
  });

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <FiStar key={i} className={i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'} size={14} />
    ));
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold dark:text-white">Product Reviews</h1>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-dark-border text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-dark-bg/50">
                <th className="p-4">Product</th>
                <th className="p-4">User</th>
                <th className="p-4">Rating & Review</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="6" className="p-4 text-center">Loading...</td></tr> : data?.map(r => (
                <tr key={r._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={r.product?.images?.[0]?.url || '/placeholder.png'} className="w-10 h-10 object-cover rounded bg-white" />
                      <span className="font-medium text-sm dark:text-white line-clamp-2">{r.product?.name || 'Unknown Product'}</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <p className="text-sm font-medium dark:text-white">{r.user?.name}</p>
                    <p className="text-xs text-gray-500">{r.user?.email}</p>
                  </td>
                  <td className="p-4 max-w-xs">
                    <div className="flex gap-1 mb-1">{renderStars(r.rating)}</div>
                    <p className="text-sm dark:text-gray-300 line-clamp-2" title={r.comment}>{r.comment}</p>
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${r.isApproved ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                      {r.isApproved ? 'Approved' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-sm dark:text-gray-300">
                    {new Date(r.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-4 text-right flex justify-end gap-2">
                    {!r.isApproved && (
                      <button onClick={() => approveMutation.mutate(r._id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded bg-white shadow-sm" title="Approve">
                        <FiCheck size={16} />
                      </button>
                    )}
                    <button onClick={() => { if(window.confirm('Delete this review?')) deleteMutation.mutate(r._id) }} className="p-1.5 text-red-600 hover:bg-red-50 rounded bg-white shadow-sm" title="Delete">
                      <FiTrash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.length === 0 && (
                <tr><td colSpan="6" className="p-8 text-center text-gray-500">No reviews found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

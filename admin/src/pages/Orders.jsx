import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FiSearch, FiEye, FiDownload } from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STATUS_STYLES = {
  placed: 'bg-yellow-100 text-yellow-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-purple-100 text-purple-700',
  shipped: 'bg-indigo-100 text-indigo-700',
  out_for_delivery: 'bg-orange-100 text-orange-700',
  delivered: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
  returned: 'bg-gray-100 text-gray-700'
};

export default function Orders() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-orders', page, search],
    queryFn: () => api.get(`/orders?page=${page}&limit=10&search=${search}`).then(r => r.data)
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }) => api.patch(`/orders/${id}/status`, { status, message: `Order status updated to ${status}` }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-orders']);
      toast.success('Order status updated');
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Update failed')
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold dark:text-white">Orders</h1>
      </div>

      <div className="card p-4">
        <div className="relative max-w-md mb-6">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input type="text" placeholder="Search by Order ID, Customer Name..." value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} className="input pl-10" />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-400">
              <tr><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th></tr>
            </thead>
            <tbody>
              {isLoading ? <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">Loading...</td></tr>
              : data?.orders?.map(order => (
                <tr key={order._id} className="border-b dark:border-dark-border hover:bg-gray-50 dark:hover:bg-dark-bg/50">
                  <td className="px-4 py-3 font-medium dark:text-white">{order.orderNumber}</td>
                  <td className="px-4 py-3 text-gray-500">{new Date(order.createdAt).toLocaleDateString()}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium dark:text-white">{order.shippingAddress?.fullName}</div>
                    <div className="text-xs text-gray-500">{order.user?.email || 'Guest'}</div>
                  </td>
                  <td className="px-4 py-3 font-bold text-primary-600">₹{order.total.toLocaleString()}</td>
                  <td className="px-4 py-3">
                    <select 
                      value={order.status} 
                      onChange={(e) => updateStatusMutation.mutate({ id: order._id, status: e.target.value })}
                      className={`text-xs font-semibold px-2 py-1 rounded border-0 cursor-pointer outline-none ${STATUS_STYLES[order.status] || 'bg-gray-100 text-gray-700'}`}
                    >
                      {Object.keys(STATUS_STYLES).map(status => (
                        <option key={status} value={status}>{status.replace(/_/g, ' ').toUpperCase()}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button onClick={() => setSelectedOrder(order)} className="p-1.5 text-blue-500 hover:bg-blue-50 rounded mr-2" title="View Details"><FiEye /></button>
                    <button onClick={async () => {
                      try {
                        const res = await api.get(`/orders/${order._id}/invoice`, { responseType: 'blob' });
                        const url = window.URL.createObjectURL(new Blob([res.data]));
                        const link = document.createElement('a');
                        link.href = url;
                        link.setAttribute('download', `invoice-${order.orderNumber}.pdf`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                        window.URL.revokeObjectURL(url);
                      } catch (err) {
                        console.error(err);
                        toast.error('Failed to download invoice');
                      }
                    }} className="p-1.5 text-gray-500 hover:bg-gray-100 rounded inline-block" title="Download Invoice"><FiDownload /></button>
                  </td>
                </tr>
              ))}
              {!isLoading && data?.orders?.length === 0 && <tr><td colSpan="6" className="px-4 py-8 text-center text-gray-500">No orders found.</td></tr>}
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

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-dark-card rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-4 border-b dark:border-dark-border">
              <h3 className="font-bold text-lg dark:text-white">Order {selectedOrder.orderNumber}</h3>
              <button onClick={() => setSelectedOrder(null)} className="p-1 text-gray-500 hover:bg-gray-100 rounded">✕</button>
            </div>
            <div className="overflow-y-auto p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Customer & Shipping</h4>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress.addressLine1}</p>
                  <p className="text-gray-600 dark:text-gray-400">{selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.state} - {selectedOrder.shippingAddress.pincode}</p>
                  <p className="text-gray-600 dark:text-gray-400">Phone: {selectedOrder.shippingAddress.phone}</p>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 dark:text-white mb-2">Payment Info</h4>
                  <p className="text-gray-600 dark:text-gray-400">Method: <span className="uppercase">{selectedOrder.paymentMethod}</span></p>
                  <p className="text-gray-600 dark:text-gray-400">Status: <span className={`font-semibold ${selectedOrder.paymentStatus === 'paid' ? 'text-green-500' : 'text-yellow-500'}`}>{selectedOrder.paymentStatus.toUpperCase()}</span></p>
                  {selectedOrder.razorpayOrderId && <p className="text-gray-600 dark:text-gray-400 text-xs mt-1 border-t dark:border-dark-border pt-1">Rzp: {selectedOrder.razorpayOrderId}</p>}
                </div>
              </div>

              <div>
                <h4 className="font-bold text-gray-900 dark:text-white mb-3">Order Items</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, i) => (
                    <div key={i} className="flex justify-between items-center bg-gray-50 dark:bg-dark-bg p-3 rounded-lg border border-gray-100 dark:border-dark-border">
                      <div className="flex items-center gap-3">
                        <img src={item.image} alt="" className="w-12 h-12 rounded object-cover" />
                        <div>
                          <p className="font-medium text-sm dark:text-white">{item.name}</p>
                          <p className="text-xs text-gray-500">Qty: {item.quantity} × ₹{item.price}</p>
                        </div>
                      </div>
                      <div className="font-bold dark:text-white">₹{(item.quantity * item.price).toLocaleString()}</div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 dark:border-dark-border pt-4 space-y-2 text-sm max-w-xs ml-auto">
                <div className="flex justify-between text-gray-500"><span>Subtotal:</span><span className="font-semibold text-gray-900 dark:text-white">₹{selectedOrder.subtotal?.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-500"><span>Shipping:</span><span className="font-semibold text-gray-900 dark:text-white">{selectedOrder.shippingFee === 0 ? 'FREE' : `₹${selectedOrder.shippingFee}`}</span></div>
                {selectedOrder.codFee > 0 && <div className="flex justify-between text-gray-500"><span>COD Fee:</span><span className="font-semibold text-gray-900 dark:text-white">₹{selectedOrder.codFee}</span></div>}
                {selectedOrder.discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Discount:</span><span className="font-semibold">-₹{selectedOrder.discountAmount?.toLocaleString()}</span></div>}
                <div className="flex justify-between font-bold text-base dark:text-white pt-2 border-t dark:border-dark-border"><span>Total:</span><span className="text-primary-500">₹{selectedOrder.total?.toLocaleString()}</span></div>
              </div>
            </div>
            <div className="p-4 border-t dark:border-dark-border flex justify-end gap-3 bg-gray-50 dark:bg-dark-bg/50">
              <button onClick={() => setSelectedOrder(null)} className="btn-secondary">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

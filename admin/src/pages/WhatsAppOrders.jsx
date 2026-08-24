import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import {
  FiSearch,
  FiEye,
  FiEdit,
  FiTrash2,
  FiMessageSquare,
  FiPlus,
  FiRefreshCw,
  FiTruck,
  FiCheckCircle,
  FiClock,
  FiPackage,
  FiXCircle,
  FiRotateCcw,
  FiExternalLink,
  FiFilter,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' },
  { value: 'confirmed', label: 'Confirmed', color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400' },
  { value: 'processing', label: 'Processing', color: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400' },
  { value: 'packed', label: 'Packed', color: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400' },
  { value: 'shipped', label: 'Shipped', color: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400' },
  { value: 'in_transit', label: 'In Transit', color: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400' },
  { value: 'out_for_delivery', label: 'Out for Delivery', color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400' },
  { value: 'delivered', label: 'Delivered', color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' },
  { value: 'returned', label: 'Returned', color: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400' },
];

const PAYMENT_STATUS_STYLES = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400',
  paid: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  failed: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  refunded: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

export default function WhatsAppOrders() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [courierFilter, setCourierFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [page, setPage] = useState(1);

  // Quick Change Status Modal
  const [statusModalOrder, setStatusModalOrder] = useState(null);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusNote, setStatusNote] = useState('');

  // Fetch WhatsApp Orders & Stats
  const { data, isLoading, refetch } = useQuery({
    queryKey: [
      'admin-whatsapp-orders',
      page,
      search,
      statusFilter,
      paymentStatusFilter,
      courierFilter,
      dateFrom,
      dateTo,
    ],
    queryFn: async () => {
      const res = await api.get('/whatsapp-orders/orders', {
        params: {
          page,
          limit: 15,
          search,
          status: statusFilter,
          paymentStatus: paymentStatusFilter,
          courier: courierFilter,
          dateFrom,
          dateTo,
        },
      });
      return res.data;
    },
    keepPreviousData: true,
  });

  const orders = data?.orders || [];
  const stats = data?.stats || {
    total: 0,
    new: 0,
    confirmed: 0,
    processing: 0,
    shipped: 0,
    delivered: 0,
    cancelled: 0,
    returned: 0,
  };
  const pagination = data?.pagination || { page: 1, pages: 1, total: 0 };

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, paymentStatus, message }) => {
      const res = await api.patch(`/whatsapp-orders/orders/${id}/status`, {
        status,
        paymentStatus,
        message,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
      setStatusModalOrder(null);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id) => {
      const res = await api.delete(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('WhatsApp Order deleted');
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    },
  });

  const handleOpenWhatsApp = (whatsappNumber, orderNumber) => {
    let cleanNumber = (whatsappNumber || '').replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
    const message = encodeURIComponent(`Hello! Regarding your WhatsApp Order ${orderNumber} on DZONE GADGET:`);
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const getStatusBadge = (statusVal) => {
    const matched = STATUS_OPTIONS.find((s) => s.value === statusVal);
    const color = matched?.color || 'bg-gray-100 text-gray-800';
    const label = matched?.label || statusVal;
    return (
      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${color}`}>
        {label}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-3">
            <span className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <FiMessageSquare className="w-6 h-6" />
            </span>
            WhatsApp Orders
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            Manage, track, and create manual orders placed via WhatsApp
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl transition-colors"
            title="Refresh Data"
          >
            <FiRefreshCw size={18} />
          </button>

          <Link
            to="/whatsapp-orders/new"
            className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-md shadow-emerald-600/20 transition-colors"
          >
            <FiPlus size={20} />
            + New WhatsApp Order
          </Link>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {[
          { label: 'Total Orders', count: stats.total, color: 'text-gray-900 dark:text-white', border: 'border-gray-200 dark:border-dark-border' },
          { label: 'New', count: stats.new, color: 'text-yellow-600 dark:text-yellow-400', border: 'border-yellow-200 dark:border-yellow-900/40' },
          { label: 'Confirmed', count: stats.confirmed, color: 'text-blue-600 dark:text-blue-400', border: 'border-blue-200 dark:border-blue-900/40' },
          { label: 'Processing', count: stats.processing, color: 'text-purple-600 dark:text-purple-400', border: 'border-purple-200 dark:border-purple-900/40' },
          { label: 'Shipped', count: stats.shipped, color: 'text-cyan-600 dark:text-cyan-400', border: 'border-cyan-200 dark:border-cyan-900/40' },
          { label: 'Delivered', count: stats.delivered, color: 'text-emerald-600 dark:text-emerald-400', border: 'border-emerald-200 dark:border-emerald-900/40' },
          { label: 'Cancelled', count: stats.cancelled, color: 'text-red-600 dark:text-red-400', border: 'border-red-200 dark:border-red-900/40' },
          { label: 'Returned', count: stats.returned, color: 'text-gray-500 dark:text-gray-400', border: 'border-gray-300 dark:border-gray-700' },
        ].map((c) => (
          <div
            key={c.label}
            onClick={() => setStatusFilter(c.label === 'Total Orders' ? '' : c.label.toLowerCase().replace(/ /g, '_'))}
            className={`cursor-pointer p-3.5 rounded-xl bg-white dark:bg-dark-card border ${c.border} shadow-sm hover:shadow-md transition-all text-center`}
          >
            <p className="text-xs font-medium text-gray-500 dark:text-gray-400 truncate">{c.label}</p>
            <p className={`text-xl font-bold mt-1 ${c.color}`}>{c.count || 0}</p>
          </div>
        ))}
      </div>

      {/* Search & Filters */}
      <div className="bg-white dark:bg-dark-card p-4 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Search */}
          <div className="relative md:col-span-1">
            <FiSearch className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search Order ID, Customer, Phone..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Order Statuses</option>
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Status Filter */}
          <div>
            <select
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-sm dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Payment Statuses</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
              <option value="failed">Failed</option>
              <option value="refunded">Refunded</option>
            </select>
          </div>

          {/* Date Filter */}
          <div className="flex gap-2">
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-xs dark:text-white"
              title="From Date"
            />
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-2.5 py-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-xs dark:text-white"
              title="To Date"
            />
          </div>
        </div>

        {(search || statusFilter || paymentStatusFilter || courierFilter || dateFrom || dateTo) && (
          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-dark-border text-xs">
            <span className="text-gray-500">Filtered results</span>
            <button
              onClick={() => {
                setSearch('');
                setStatusFilter('');
                setPaymentStatusFilter('');
                setCourierFilter('');
                setDateFrom('');
                setDateTo('');
                setPage(1);
              }}
              className="text-emerald-600 dark:text-emerald-400 hover:underline font-medium"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-dark-card rounded-2xl border border-gray-200 dark:border-dark-border overflow-hidden shadow-sm">
        {isLoading ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
            Loading WhatsApp Orders...
          </div>
        ) : orders.length === 0 ? (
          <div className="p-12 text-center text-gray-500 dark:text-gray-400 space-y-3">
            <FiMessageSquare className="w-12 h-12 mx-auto text-gray-300 dark:text-gray-600" />
            <p className="text-lg font-semibold text-gray-800 dark:text-white">No WhatsApp Orders Found</p>
            <p className="text-sm">Create your first WhatsApp order to get started!</p>
            <Link
              to="/whatsapp-orders/new"
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-emerald-700"
            >
              <FiPlus /> Create Order
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-dark-bg/50 text-xs font-bold text-gray-500 uppercase">
                  <th className="py-4 px-4">Order ID</th>
                  <th className="py-4 px-4">Customer</th>
                  <th className="py-4 px-4">WhatsApp</th>
                  <th className="py-4 px-4">Product(s)</th>
                  <th className="py-4 px-4">Total</th>
                  <th className="py-4 px-4">Payment</th>
                  <th className="py-4 px-4">Courier / Tracking</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Date</th>
                  <th className="py-4 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border text-sm">
                {orders.map((ord) => (
                  <tr key={ord._id} className="hover:bg-gray-50/80 dark:hover:bg-dark-bg/50 transition-colors">
                    {/* Order ID */}
                    <td className="py-4 px-4 font-bold text-emerald-600 dark:text-emerald-400">
                      <Link to={`/whatsapp-orders/${ord._id}`} className="hover:underline">
                        {ord.orderNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-gray-900 dark:text-white">{ord.customerName}</p>
                      {ord.shippingAddressSnapshot?.city && (
                        <p className="text-xs text-gray-500">
                          {ord.shippingAddressSnapshot.city}, {ord.shippingAddressSnapshot.state}
                        </p>
                      )}
                    </td>

                    {/* WhatsApp Number */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => handleOpenWhatsApp(ord.whatsappNumber, ord.orderNumber)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-100 transition-colors"
                        title="Open WhatsApp chat"
                      >
                        <FiMessageSquare size={14} />
                        {ord.whatsappNumber}
                      </button>
                    </td>

                    {/* Product(s) */}
                    <td className="py-4 px-4 max-w-xs">
                      <p className="font-medium text-gray-800 dark:text-gray-200 truncate">
                        {ord.items?.[0]?.name || 'Custom Product'}
                      </p>
                      {ord.items?.length > 1 && (
                        <p className="text-xs text-gray-500">+ {ord.items.length - 1} more item(s)</p>
                      )}
                    </td>

                    {/* Total Amount */}
                    <td className="py-4 px-4 font-bold text-gray-900 dark:text-white">
                      ₹{(ord.paymentDetails?.grandTotal || 0).toLocaleString('en-IN')}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase ${
                          PAYMENT_STATUS_STYLES[ord.paymentDetails?.status] || 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {ord.paymentDetails?.method} • {ord.paymentDetails?.status}
                      </span>
                    </td>

                    {/* Courier & Tracking */}
                    <td className="py-4 px-4 text-xs">
                      {ord.shippingInfo?.courierCompany ? (
                        <div>
                          <p className="font-semibold text-gray-800 dark:text-gray-200">
                            {ord.shippingInfo.courierCompany}
                          </p>
                          <p className="text-gray-500 font-mono">{ord.shippingInfo.trackingNumber || 'No tracking #'}</p>
                        </div>
                      ) : (
                        <span className="text-gray-400 italic">Not shipped yet</span>
                      )}
                    </td>

                    {/* Order Status */}
                    <td className="py-4 px-4">
                      <button
                        onClick={() => {
                          setStatusModalOrder(ord);
                          setNewStatus(ord.status);
                          setNewPaymentStatus(ord.paymentDetails?.status || 'pending');
                          setStatusNote('');
                        }}
                        className="hover:opacity-80 transition-opacity"
                        title="Click to change status"
                      >
                        {getStatusBadge(ord.status)}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="py-4 px-4 text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap">
                      {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          to={`/whatsapp-orders/${ord._id}`}
                          className="p-1.5 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg"
                          title="View Order"
                        >
                          <FiEye size={16} />
                        </Link>

                        <Link
                          to={`/whatsapp-orders/${ord._id}/edit`}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg"
                          title="Edit Order"
                        >
                          <FiEdit size={16} />
                        </Link>

                        <button
                          onClick={() => handleOpenWhatsApp(ord.whatsappNumber, ord.orderNumber)}
                          className="p-1.5 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-lg"
                          title="Open WhatsApp"
                        >
                          <FiMessageSquare size={16} />
                        </button>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete WhatsApp order ${ord.orderNumber}?`)) {
                              deleteMutation.mutate(ord._id);
                            }
                          }}
                          className="p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                          title="Delete Order"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-gray-200 dark:border-dark-border flex items-center justify-between text-sm">
            <span className="text-gray-500">
              Page {pagination.page} of {pagination.pages} ({pagination.total} total orders)
            </span>
            <div className="flex gap-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Previous
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-dark-border text-gray-700 dark:text-gray-300 disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Quick Change Status Modal */}
      {statusModalOrder && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-md w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Change Status: {statusModalOrder.orderNumber}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                >
                  {STATUS_OPTIONS.map((s) => (
                    <option key={s.value} value={s.value}>
                      {s.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                >
                  <option value="pending">Pending</option>
                  <option value="paid">Paid</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Status Update Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Packed and ready for dispatch"
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setStatusModalOrder(null)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  statusMutation.mutate({
                    id: statusModalOrder._id,
                    status: newStatus,
                    paymentStatus: newPaymentStatus,
                    message: statusNote,
                  });
                }}
                disabled={statusMutation.isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium shadow-md"
              >
                {statusMutation.isLoading ? 'Updating...' : 'Update Status'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

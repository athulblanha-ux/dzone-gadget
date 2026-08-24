import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FiArrowLeft,
  FiEdit,
  FiMessageSquare,
  FiPrinter,
  FiTrash2,
  FiExternalLink,
  FiTruck,
  FiUser,
  FiMapPin,
  FiCreditCard,
  FiCheckCircle,
  FiX,
  FiSave,
  FiPlus,
  FiMinus,
} from 'react-icons/fi';
import toast from 'react-hot-toast';
import api from '../lib/api';

const STATUS_BADGES = {
  new: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  processing: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  packed: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-400',
  shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/30 dark:text-cyan-400',
  in_transit: 'bg-sky-100 text-sky-800 dark:bg-sky-900/30 dark:text-sky-400',
  out_for_delivery: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400',
  cancelled: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  returned: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400',
};

export default function WhatsAppOrderDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [newPaymentStatus, setNewPaymentStatus] = useState('');
  const [statusMessage, setStatusMessage] = useState('');

  // Edit Customer Modal State
  const [showEditCustomerModal, setShowEditCustomerModal] = useState(false);
  const [editCustomerName, setEditCustomerName] = useState('');
  const [editWhatsappNumber, setEditWhatsappNumber] = useState('');
  const [editEmail, setEditEmail] = useState('');

  // Edit Address Modal State
  const [showEditAddressModal, setShowEditAddressModal] = useState(false);
  const [editRecipientName, setEditRecipientName] = useState('');
  const [editHouseFlat, setEditHouseFlat] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editState, setEditState] = useState('');
  const [editPincode, setEditPincode] = useState('');

  // Edit Items Modal State
  const [showEditItemsModal, setShowEditItemsModal] = useState(false);
  const [editItems, setEditItems] = useState([]);

  const { data, isLoading } = useQuery({
    queryKey: ['admin-whatsapp-order', id],
    queryFn: async () => {
      const res = await api.get(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
  });

  const order = data?.order;

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: async ({ status, paymentStatus, message }) => {
      const res = await api.patch(`/whatsapp-orders/orders/${id}/status`, {
        status,
        paymentStatus,
        message,
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order status updated!');
      queryClient.invalidateQueries(['admin-whatsapp-order', id]);
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
      setShowStatusModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
  });

  // Update Order Payload Mutation
  const updateOrderMutation = useMutation({
    mutationFn: async (payload) => {
      const res = await api.put(`/whatsapp-orders/orders/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Updated successfully! 🎉');
      queryClient.invalidateQueries(['admin-whatsapp-order', id]);
      queryClient.invalidateQueries(['admin-whatsapp-orders']);
      setShowEditCustomerModal(false);
      setShowEditAddressModal(false);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update details');
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.delete(`/whatsapp-orders/orders/${id}`);
      return res.data;
    },
    onSuccess: () => {
      toast.success('Order deleted');
      navigate('/whatsapp-orders');
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to delete order');
    },
  });

  const handleOpenWhatsApp = () => {
    if (!order?.whatsappNumber) return;
    let cleanNumber = order.whatsappNumber.replace(/\D/g, '');
    if (cleanNumber.length === 10) cleanNumber = '91' + cleanNumber;
    const message = encodeURIComponent(
      `Hello ${order.customerName}! Regarding your WhatsApp Order ${order.orderNumber} on DSTORE:`
    );
    window.open(`https://wa.me/${cleanNumber}?text=${message}`, '_blank');
  };

  const handlePrint = async () => {
    try {
      const res = await api.get(`/whatsapp-orders/orders/${id}/shipping-label`, {
        responseType: 'blob',
      });
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `shipping-label-${order.orderNumber}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success(`Shipping Label ${order.orderNumber} downloaded! 📦`);
    } catch (err) {
      toast.error('Failed to download shipping label PDF');
    }
  };

  // Open Edit Customer Modal
  const handleOpenEditCustomer = () => {
    setEditCustomerName(order.customerName || '');
    setEditWhatsappNumber(order.whatsappNumber || '');
    setEditEmail(order.email || '');
    setShowEditCustomerModal(true);
  };

  // Save Customer Modal
  const handleSaveCustomer = () => {
    if (!editCustomerName.trim() || !editWhatsappNumber.trim()) {
      toast.error('Customer Name and WhatsApp Number are required');
      return;
    }
    updateOrderMutation.mutate({
      customerName: editCustomerName.trim(),
      whatsappNumber: editWhatsappNumber.trim(),
      email: editEmail.trim(),
    });
  };

  // Payment & COD Price Edit Modal State
  const [showEditPaymentModal, setShowEditPaymentModal] = useState(false);
  const [editPaymentMethod, setEditPaymentMethod] = useState('COD');
  const [editPaymentStatusState, setEditPaymentStatusState] = useState('paid');
  const [editCodAmount, setEditCodAmount] = useState('0');

  const handleOpenEditPayment = () => {
    setEditPaymentMethod(order?.paymentDetails?.method || 'COD');
    setEditPaymentStatusState(order?.paymentDetails?.status || 'paid');
    setEditCodAmount(order?.paymentDetails?.grandTotal || 0);
    setShowEditPaymentModal(true);
  };

  const handleSavePayment = () => {
    updateOrderMutation.mutate({
      paymentDetails: {
        method: editPaymentMethod,
        status: editPaymentStatusState,
        grandTotal: Number(editCodAmount) || 0,
      },
    });
    setShowEditPaymentModal(false);
  };

  // Open Edit Address Modal
  const handleOpenEditAddress = () => {
    const addrObj = order.shippingAddressSnapshot || {};
    setEditRecipientName(addrObj.recipientName || order.customerName || '');
    setEditHouseFlat(addrObj.houseFlatBuilding || '');
    setEditCity(addrObj.city && addrObj.city !== 'Kochi' && addrObj.city !== 'N/A' ? addrObj.city : '');
    setEditState(addrObj.state && addrObj.state !== 'Kerala' && addrObj.state !== 'N/A' ? addrObj.state : '');
    setEditPincode(addrObj.pincode && addrObj.pincode !== '682030' && addrObj.pincode !== '000000' ? addrObj.pincode : '');
    setShowEditAddressModal(true);
  };

  // Save Address Modal
  const handleSaveAddress = () => {
    const addrObj = order.shippingAddressSnapshot || {};
    updateOrderMutation.mutate({
      shippingAddressSnapshot: {
        ...addrObj,
        recipientName: editRecipientName.trim() || editCustomerName || order.customerName,
        houseFlatBuilding: editHouseFlat.trim() || 'Address details',
        city: editCity.trim(),
        state: editState.trim(),
        pincode: editPincode.trim(),
        phone: editWhatsappNumber || order.whatsappNumber,
      },
    });
  };

  // Open Edit Items Modal
  const handleOpenEditItems = () => {
    const currentItems = (order?.items || []).map((item) => ({
      name: item.name || '',
      sku: item.sku || 'WA-ITEM',
      unitPrice: item.unitPrice || 0,
      quantity: item.quantity || 1,
      discount: item.discount || 0,
      total: item.total || ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1)),
    }));
    setEditItems(currentItems.length > 0 ? currentItems : [{ name: 'Custom Product', sku: 'WA-ITEM', unitPrice: 0, quantity: 1, discount: 0, total: 0 }]);
    setShowEditItemsModal(true);
  };

  // Add New Item to draft
  const handleAddItemToDraft = () => {
    setEditItems((prev) => [
      ...prev,
      { name: '', sku: 'WA-ITEM', unitPrice: 0, quantity: 1, discount: 0, total: 0 },
    ]);
  };

  // Update item field in draft
  const handleUpdateItemField = (index, field, value) => {
    setEditItems((prev) => {
      const copy = [...prev];
      const target = { ...copy[index], [field]: value };
      const q = Number(target.quantity) || 1;
      const p = Number(target.unitPrice) || 0;
      const d = Number(target.discount) || 0;
      target.total = Math.max(0, p * q - d);
      copy[index] = target;
      return copy;
    });
  };

  // Remove item from draft
  const handleRemoveItemFromDraft = (index) => {
    setEditItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Save Items Modal
  const handleSaveItems = () => {
    if (editItems.length === 0) {
      toast.error('Order must have at least one product');
      return;
    }
    for (const item of editItems) {
      if (!item.name.trim()) {
        toast.error('Product name cannot be empty');
        return;
      }
    }
    updateOrderMutation.mutate({ items: editItems });
    setShowEditItemsModal(false);
  };

  // Inline Item Quantity Update
  const handleInlineItemQtyChange = (itemIndex, qtyDelta) => {
    const updatedItems = (order?.items || []).map((item, idx) => {
      if (idx === itemIndex) {
        const newQty = Math.max(1, (Number(item.quantity) || 1) + qtyDelta);
        const p = Number(item.unitPrice) || 0;
        const d = Number(item.discount) || 0;
        return {
          ...item,
          quantity: newQty,
          total: Math.max(0, p * newQty - d),
        };
      }
      return item;
    });
    updateOrderMutation.mutate({ items: updatedItems });
  };

  // Inline Item Delete
  const handleInlineItemDelete = (itemIndex) => {
    if (order?.items?.length <= 1) {
      toast.error('Order must have at least one product');
      return;
    }
    if (window.confirm('Delete this product from the order?')) {
      const updatedItems = order.items.filter((_, idx) => idx !== itemIndex);
      updateOrderMutation.mutate({ items: updatedItems });
    }
  };

  if (isLoading) {
    return (
      <div className="p-12 text-center text-gray-500 dark:text-gray-400 font-medium">
        Loading WhatsApp Order Details...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="p-12 text-center space-y-4">
        <p className="text-xl font-bold text-red-500">Order Not Found</p>
        <Link to="/whatsapp-orders" className="text-emerald-600 font-bold hover:underline">
          Return to WhatsApp Orders
        </Link>
      </div>
    );
  }

  const addr = order.shippingAddressSnapshot || {};

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12 print:p-0 print:max-w-none text-xs sm:text-sm">
      {/* Top Navigation & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 print:hidden">
        <div className="flex items-center gap-3">
          <Link
            to="/whatsapp-orders"
            className="p-2 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-card rounded-xl transition-colors"
          >
            <FiArrowLeft size={20} />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">
                WhatsApp Order #{order.orderNumber}
              </h1>
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                  STATUS_BADGES[order.status] || 'bg-gray-100 text-gray-700'
                }`}
              >
                {order.status?.replace(/_/g, ' ')}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">
              Placed on {new Date(order.createdAt).toLocaleString('en-IN')}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setNewStatus(order.status);
              setNewPaymentStatus(order.paymentDetails?.status || 'pending');
              setStatusMessage('');
              setShowStatusModal(true);
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 text-xs font-bold shadow"
          >
            <FiCheckCircle /> Change Status
          </button>

          <button
            onClick={handleOpenWhatsApp}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-xs font-bold shadow"
          >
            <FiMessageSquare /> Open WhatsApp
          </button>

          {order.shippingInfo?.trackingUrl && (
            <a
              href={order.shippingInfo.trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-600 text-white hover:bg-cyan-700 text-xs font-bold shadow"
            >
              <FiTruck /> Track Shipment <FiExternalLink size={12} />
            </a>
          )}

          <button
            onClick={handlePrint}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow"
          >
            <FiPrinter /> Print Shipping Label
          </button>

          <button
            onClick={() => {
              if (window.confirm(`Delete WhatsApp Order ${order.orderNumber}?`)) {
                deleteMutation.mutate();
              }
            }}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 text-xs font-bold shadow"
          >
            <FiTrash2 /> Delete Order
          </button>
        </div>
      </div>

      {/* Main Order Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Col (2 Cols): Customer & Address Snapshot & Products */}
        <div className="md:col-span-2 space-y-6">
          {/* Customer & Shipping Address Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Customer Box with EDIT BUTTON */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-2 relative group">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <FiUser className="text-emerald-500" /> Customer Information
                </h3>
                <button
                  onClick={handleOpenEditCustomer}
                  className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1"
                >
                  <FiEdit size={12} /> Edit
                </button>
              </div>

              <p className="text-base font-bold text-gray-900 dark:text-white">{order.customerName}</p>
              <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                <FiMessageSquare size={16} /> {order.whatsappNumber}
              </p>
              {order.email && <p className="text-xs text-gray-500">{order.email}</p>}
            </div>

            {/* Address Box with EDIT BUTTON */}
            <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-2 relative group">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                  <FiMapPin className="text-emerald-500" /> Shipping Address
                </h3>
                <button
                  onClick={handleOpenEditAddress}
                  className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1"
                >
                  <FiEdit size={12} /> Edit
                </button>
              </div>

              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {addr.recipientName || order.customerName}
              </p>
              <p className="text-xs text-gray-700 dark:text-gray-300">
                {addr.houseFlatBuilding}{addr.streetLocality && addr.streetLocality !== 'N/A' ? `, ${addr.streetLocality}` : ''}
              </p>
              {addr.landmark && <p className="text-xs text-gray-500">Landmark: {addr.landmark}</p>}
              {addr.city && addr.city !== 'Kochi' && addr.city !== 'N/A' && (
                <p className="text-xs text-gray-700 dark:text-gray-300 font-semibold">
                  {addr.city}{addr.state && addr.state !== 'Kerala' && addr.state !== 'N/A' ? `, ${addr.state}` : ''}{addr.pincode && addr.pincode !== '682030' && addr.pincode !== '000000' ? ` - ${addr.pincode}` : ''}
                </p>
              )}
            </div>
          </div>

          {/* Products Table */}
          <div className="bg-white dark:bg-dark-card p-6 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                Order Items ({order.items?.length || 0})
              </h3>
              <button
                onClick={handleOpenEditItems}
                className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5"
              >
                <FiEdit size={13} /> Edit Items
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-dark-border text-xs font-bold text-gray-500 uppercase">
                    <th className="py-3 px-3">Item Description</th>
                    <th className="py-3 px-3">SKU / Variant</th>
                    <th className="py-3 px-3">Qty</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-dark-border">
                  {order.items?.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/40 transition-colors">
                      <td className="py-3 px-3 font-semibold text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-3 text-xs text-gray-500">
                        {item.sku || item.variant || item.size || 'N/A'}
                      </td>
                      <td className="py-3 px-3 font-bold">
                        <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-lg border border-gray-200 dark:border-gray-700">
                          <button
                            onClick={() => handleInlineItemQtyChange(idx, -1)}
                            className="text-gray-500 hover:text-red-500 p-0.5"
                            title="Decrease Quantity"
                          >
                            <FiMinus size={12} />
                          </button>
                          <span className="text-xs font-black min-w-[16px] text-center">{item.quantity}</span>
                          <button
                            onClick={() => handleInlineItemQtyChange(idx, 1)}
                            className="text-gray-500 hover:text-emerald-500 p-0.5"
                            title="Increase Quantity"
                          >
                            <FiPlus size={12} />
                          </button>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => handleInlineItemDelete(idx)}
                          className="p-1.5 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                          title="Delete Product"
                        >
                          <FiTrash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right Col (1 Col): Payment Info & Courier Tracking */}
        <div className="space-y-6">
          {/* Payment Card */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
                <FiCreditCard className="text-emerald-500" /> Payment Info
              </h3>
              <button
                onClick={handleOpenEditPayment}
                className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400 text-xs font-bold hover:bg-emerald-100 flex items-center gap-1 transition-colors"
              >
                <FiEdit size={12} /> Edit
              </button>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Method:</span>
              <span className="font-bold text-gray-900 dark:text-white uppercase">
                {order.paymentDetails?.method || 'COD'}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Payment Status:</span>
              <span className="px-2.5 py-1 rounded-full text-xs font-bold uppercase bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                {order.paymentDetails?.status || 'paid'}
              </span>
            </div>

            {/* COD Collectible Amount Field */}
            {(order.paymentDetails?.method || 'COD').toUpperCase() === 'COD' && (
              <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-sm">
                <span className="font-bold text-gray-700 dark:text-gray-300">COD Price to Collect:</span>
                <span className="font-black text-base text-blue-600 dark:text-blue-400 font-mono">
                  ₹{(order.paymentDetails?.grandTotal || 0).toLocaleString('en-IN')}
                </span>
              </div>
            )}
          </div>

          {/* Courier & Shipping Card */}
          <div className="bg-white dark:bg-dark-card p-5 rounded-2xl border border-gray-200 dark:border-dark-border shadow-sm space-y-3">
            <h3 className="text-xs font-bold uppercase text-gray-500 tracking-wider flex items-center gap-1.5">
              <FiTruck className="text-emerald-500" /> Courier & Shipping
            </h3>
            <div className="text-sm space-y-1.5">
              <p>
                <span className="text-gray-500">Courier:</span>{' '}
                <strong className="text-gray-900 dark:text-white">
                  {order.shippingInfo?.courierCompany || 'Not set'}
                </strong>
              </p>
              <p>
                <span className="text-gray-500">Tracking #:</span>{' '}
                <strong className="font-mono text-gray-900 dark:text-white">
                  {order.shippingInfo?.trackingNumber || 'N/A'}
                </strong>
              </p>
              {order.shippingInfo?.shipmentDate && (
                <p className="text-xs text-gray-500">
                  Shipment Date: {new Date(order.shippingInfo.shipmentDate).toLocaleDateString('en-IN')}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* EDIT CUSTOMER MODAL */}
      {showEditCustomerModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-md w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiUser className="text-emerald-500" /> Edit Customer Details
              </h3>
              <button
                onClick={() => setShowEditCustomerModal(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Customer Name *
                </label>
                <input
                  type="text"
                  value={editCustomerName}
                  onChange={(e) => setEditCustomerName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  WhatsApp Number *
                </label>
                <input
                  type="text"
                  value={editWhatsappNumber}
                  onChange={(e) => setEditWhatsappNumber(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Email Address
                </label>
                <input
                  type="email"
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditCustomerModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveCustomer}
                disabled={updateOrderMutation.isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <FiSave size={14} />
                {updateOrderMutation.isLoading ? 'Saving...' : 'Save Customer Details'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT SHIPPING ADDRESS MODAL */}
      {showEditAddressModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-lg w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <FiMapPin className="text-emerald-500" /> Edit Shipping Address
              </h3>
              <button
                onClick={() => setShowEditAddressModal(false)}
                className="p-1 text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-bg rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Recipient Name *
                </label>
                <input
                  type="text"
                  value={editRecipientName}
                  onChange={(e) => setEditRecipientName(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white font-medium"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                  Full Address / House, Building, Street *
                </label>
                <textarea
                  rows={3}
                  value={editHouseFlat}
                  onChange={(e) => setEditHouseFlat(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    City
                  </label>
                  <input
                    type="text"
                    value={editCity}
                    onChange={(e) => setEditCity(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    State
                  </label>
                  <input
                    type="text"
                    value={editState}
                    onChange={(e) => setEditState(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white"
                  />
                </div>

                <div>
                  <label className="block font-semibold mb-1 text-gray-700 dark:text-gray-300">
                    PIN Code
                  </label>
                  <input
                    type="text"
                    value={editPincode}
                    onChange={(e) => setEditPincode(e.target.value)}
                    className="w-full p-2 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowEditAddressModal(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveAddress}
                disabled={updateOrderMutation.isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow flex items-center gap-1.5"
              >
                <FiSave size={14} />
                {updateOrderMutation.isLoading ? 'Saving...' : 'Save Shipping Address'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CHANGE STATUS MODAL */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-card max-w-md w-full rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Change Status: {order.orderNumber}
            </h3>

            <div className="space-y-3 text-sm">
              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Order Status</label>
                <select
                  value={newStatus}
                  onChange={(e) => setNewStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white font-bold"
                >
                  <option value="paid">PAID</option>
                  <option value="shipped">SHIPPED</option>
                  <option value="delivered">DELIVERED</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white font-bold"
                >
                  <option value="paid">PAID</option>
                  <option value="pending">PENDING</option>
                  <option value="failed">FAILED</option>
                  <option value="refunded">REFUNDED</option>
                </select>
              </div>

              <div>
                <label className="block font-medium mb-1 dark:text-gray-300">Timeline Note (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g. Package dispatched via India Post"
                  value={statusMessage}
                  onChange={(e) => setStatusMessage(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-dark-bg border border-gray-200 dark:border-dark-border rounded-xl dark:text-white"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 rounded-xl text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-dark-bg text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  statusMutation.mutate({
                    status: newStatus,
                    paymentStatus: newPaymentStatus,
                    message: statusMessage,
                  });
                }}
                disabled={statusMutation.isLoading}
                className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 text-sm font-medium shadow-md"
              >
                {statusMutation.isLoading ? 'Updating...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Order Items Modal */}
      {showEditItemsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-white dark:bg-dark-card w-full max-w-2xl rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
              <h3 className="text-lg font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <FiEdit className="text-emerald-500" /> Edit Order Items
              </h3>
              <button
                onClick={() => setShowEditItemsModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
              >
                <FiX size={20} />
              </button>
            </div>

            {/* List of items in draft */}
            <div className="space-y-3 max-h-[50vh] overflow-y-auto pr-1">
              {editItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl border border-gray-200 dark:border-dark-border bg-gray-50/50 dark:bg-gray-800/40 space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-bold text-gray-400 uppercase">Item #{idx + 1}</span>
                    {editItems.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveItemFromDraft(idx)}
                        className="text-xs text-red-500 hover:text-red-600 font-bold flex items-center gap-1"
                      >
                        <FiTrash2 size={13} /> Remove
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 text-xs">
                    {/* Item Name */}
                    <div className="sm:col-span-6 space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Product Name</label>
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleUpdateItemField(idx, 'name', e.target.value)}
                        placeholder="Product Name"
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-semibold text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Unit Price */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Price (₹)</label>
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice}
                        onChange={(e) => handleUpdateItemField(idx, 'unitPrice', e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 font-bold text-gray-900 dark:text-white"
                      />
                    </div>

                    {/* Quantity */}
                    <div className="sm:col-span-3 space-y-1">
                      <label className="text-[10px] font-bold text-gray-500 uppercase">Qty</label>
                      <div className="flex items-center gap-1 bg-white dark:bg-gray-900 rounded-lg border border-gray-300 dark:border-gray-700 px-1 py-0.5">
                        <button
                          type="button"
                          onClick={() => handleUpdateItemField(idx, 'quantity', Math.max(1, (Number(item.quantity) || 1) - 1))}
                          className="p-1 text-gray-500 hover:text-red-500"
                        >
                          <FiMinus size={12} />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => handleUpdateItemField(idx, 'quantity', Math.max(1, Number(e.target.value) || 1))}
                          className="w-full text-center font-extrabold text-xs bg-transparent focus:outline-none dark:text-white"
                        />
                        <button
                          type="button"
                          onClick={() => handleUpdateItemField(idx, 'quantity', (Number(item.quantity) || 1) + 1)}
                          className="p-1 text-gray-500 hover:text-emerald-500"
                        >
                          <FiPlus size={12} />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-gray-200/60 dark:border-gray-700/60 text-xs">
                    <span className="text-gray-500">
                      Line Total: <strong className="text-gray-900 dark:text-white">₹{item.total || ((Number(item.unitPrice) || 0) * (Number(item.quantity) || 1))}</strong>
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Add Product Button */}
            <button
              type="button"
              onClick={handleAddItemToDraft}
              className="w-full py-2.5 rounded-xl border-2 border-dashed border-emerald-500/40 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-xs font-bold flex items-center justify-center gap-2 transition-colors"
            >
              <FiPlus size={15} /> Add Another Product
            </button>

            {/* Subtotal Preview */}
            <div className="bg-emerald-50 dark:bg-emerald-900/20 p-3 rounded-xl flex items-center justify-between text-xs font-extrabold text-emerald-800 dark:text-emerald-300">
              <span>New Product Subtotal ({editItems.reduce((acc, i) => acc + (Number(i.quantity) || 1), 0)} items):</span>
              <span className="text-sm font-black">
                ₹{editItems.reduce((acc, i) => acc + (Number(i.total) || 0), 0).toLocaleString('en-IN')}
              </span>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => setShowEditItemsModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveItems}
                disabled={updateOrderMutation.isPending}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <FiSave size={14} /> Save Items
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Payment & COD Price Modal */}
      {showEditPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl p-6 border border-gray-200 dark:border-dark-border shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 dark:border-dark-border pb-3">
              <h3 className="text-base font-extrabold text-gray-900 dark:text-white flex items-center gap-2">
                <FiCreditCard className="text-emerald-500" /> Edit Payment & COD Price
              </h3>
              <button
                onClick={() => setShowEditPaymentModal(false)}
                className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-white rounded-lg"
              >
                <FiX size={18} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Method
                </label>
                <select
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl dark:text-white font-bold"
                >
                  <option value="COD">COD (Cash On Delivery)</option>
                  <option value="Prepaid">Prepaid / Paid Online</option>
                  <option value="UPI">UPI / GPay</option>
                  <option value="Bank Transfer">Bank Transfer</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                  Payment Status
                </label>
                <select
                  value={editPaymentStatusState}
                  onChange={(e) => setEditPaymentStatusState(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl dark:text-white font-bold"
                >
                  <option value="paid">PAID</option>
                  <option value="pending">PENDING</option>
                  <option value="failed">FAILED</option>
                </select>
              </div>

              {editPaymentMethod.toUpperCase() === 'COD' && (
                <div>
                  <label className="block font-bold text-gray-700 dark:text-gray-300 mb-1">
                    COD Collectible Amount (₹) *
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={editCodAmount}
                    onChange={(e) => setEditCodAmount(e.target.value)}
                    placeholder="Enter COD Amount e.g. 8777"
                    className="w-full p-2.5 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-xl dark:text-white font-black text-sm"
                  />
                  <p className="text-[10px] text-gray-400 mt-1">
                    This collectible amount is shown on the orders list and printed on the shipping label.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-dark-border">
              <button
                type="button"
                onClick={() => setShowEditPaymentModal(false)}
                className="px-4 py-2 rounded-xl bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 text-xs font-bold"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSavePayment}
                disabled={updateOrderMutation.isPending}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow flex items-center gap-1.5 disabled:opacity-50"
              >
                <FiSave size={14} /> Save Payment
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

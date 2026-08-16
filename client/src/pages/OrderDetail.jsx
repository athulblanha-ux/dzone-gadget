import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function OrderDetail() {
  const { id } = useParams();
  const [payLoading, setPayLoading] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);

  const { data, isLoading, refetch } = useQuery({ queryKey: ['order', id], queryFn: () => api.get(`/orders/${id}`).then(r => r.data.order) });

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handlePayNow = async (order) => {
    setPayLoading(true);
    try {
      const { data: rzpData } = await api.post('/create-order', { orderId: order._id });
      
      if (rzpData.isMock) {
        setMockPaymentData({
          orderId: order._id,
          razorpayOrderId: rzpData.order_id || rzpData.razorpayOrderId,
          amount: rzpData.amount,
          keyId: rzpData.keyId,
          email: order.shippingAddress.email
        });
      } else {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) throw new Error('Razorpay SDK failed to load');
        
        const options = {
          key: rzpData.keyId || 'rzp_test_TQ06smJxa1jwR1',
          amount: rzpData.amount,
          currency: rzpData.currency || 'INR',
          name: 'DZONE GADGET',
          description: 'DZONE GADGET Order Payment',
          order_id: rzpData.order_id || rzpData.razorpayOrderId,
          handler: async (response) => {
            await api.post('/verify-payment', { ...response, orderId: order._id });
            toast.success('Payment successful! 🎉');
            refetch();
          },
          prefill: { 
            name: order.shippingAddress.fullName, 
            email: order.shippingAddress.email, 
            contact: order.shippingAddress.phone 
          },
          theme: { color: '#007aff' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Payment initiation failed');
    } finally {
      setPayLoading(false);
    }
  };

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="skeleton h-8 w-1/3 rounded mb-6" />{Array(3).fill(null).map((_,i)=><div key={i} className="card p-6 mb-4"><div className="skeleton h-4 rounded" /></div>)}</div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  return (
    <>
      <Helmet><title>{`Order ${data.orderNumber} — DZONE GADGET`}</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link to="/orders" className="flex items-center gap-2 text-primary-500 mb-6 hover:underline"><FiArrowLeft />Back to Orders</Link>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display font-bold text-2xl dark:text-dark-text">{data.orderNumber}</h1>
            <p className="text-gray-500 dark:text-dark-muted text-sm mt-1">Placed on {new Date(data.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'long', year:'numeric' })}</p>
          </div>
          <button onClick={async () => {
            try {
              const res = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' });
              const url = window.URL.createObjectURL(new Blob([res.data]));
              const link = document.createElement('a');
              link.href = url;
              link.setAttribute('download', `invoice-${data.orderNumber}.pdf`);
              document.body.appendChild(link);
              link.click();
              link.remove();
              window.URL.revokeObjectURL(url);
            } catch (err) {
              console.error(err);
              alert('Failed to download invoice');
            }
          }} className="btn-secondary text-sm py-2 px-4"><FiDownload />Invoice</button>
        </div>
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <div className="card p-5">
            <h3 className="font-semibold mb-3 dark:text-dark-text">Shipping Address</h3>
            <p className="text-sm text-gray-600 dark:text-dark-muted">
              {data.shippingAddress.fullName}<br/>
              {data.shippingAddress.addressLine1}<br/>
              {data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.pincode}<br/>
              Phone: {data.shippingAddress.phone}
            </p>
            {data.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-dark-border space-y-1.5 text-sm">
                <p className="font-semibold text-gray-800 dark:text-dark-text">Shipment Tracking</p>
                <p className="text-gray-600 dark:text-dark-muted">Courier: <span className="font-medium text-gray-900 dark:text-dark-text">{data.courierPartner || 'N/A'}</span></p>
                <p className="text-gray-600 dark:text-dark-muted">Tracking ID: <span className="font-medium text-gray-900 dark:text-dark-text font-mono">{data.trackingNumber}</span></p>
                {data.trackingUrl && (
                  <p className="mt-2">
                    <a href={data.trackingUrl} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline text-xs font-semibold">
                      Track Order &rarr;
                    </a>
                  </p>
                )}
              </div>
            )}
          </div>
          <div className="card p-5">
            <h3 className="font-semibold mb-3 dark:text-dark-text">Payment Info</h3>
            <div className="text-sm text-gray-600 dark:text-dark-muted space-y-1.5">
              <p>
                Method: <span className="font-semibold capitalize">{data.paymentMethod === 'partial_cod' ? 'Partial COD' : data.paymentMethod}</span>
              </p>
              <p>
                Status: <span className={
                  data.paymentStatus === 'paid' || data.paymentStatus === 'partially_paid' 
                    ? 'text-green-500 font-semibold capitalize' 
                    : 'text-yellow-500 capitalize'
                }>{data.paymentStatus.replace('_', ' ')}</span>
              </p>
              {data.paymentMethod === 'partial_cod' && (
                <div className="border-t border-gray-100 dark:border-dark-border mt-2 pt-2 text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Paid Advance:</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">₹{data.advanceAmount?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>COD Balance Due:</span>
                    <span className="font-medium text-gray-900 dark:text-dark-text">₹{data.codBalance?.toLocaleString()}</span>
                  </div>
                </div>
              )}
            </div>
            {(data.paymentMethod === 'razorpay' || data.paymentMethod === 'partial_cod') && data.paymentStatus === 'pending' && data.status !== 'cancelled' && (
              <button 
                onClick={() => handlePayNow(data)}
                disabled={payLoading}
                className="mt-3 w-full bg-primary-500 hover:bg-primary-600 text-white font-medium py-2 px-4 rounded-xl text-xs transition-colors flex items-center justify-center gap-1 shadow-sm"
              >
                {payLoading ? 'Processing...' : (data.paymentMethod === 'partial_cod' ? 'Pay Advance Now' : 'Pay Now')}
              </button>
            )}
          </div>
        </div>
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-4 dark:text-dark-text">Items ({data.items.length})</h3>
          <div className="space-y-4">
            {data.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">{item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-contain" /> : <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-8 h-8 object-contain opacity-50" alt="logo" /></div>}</div>
                <div className="flex-1"><p className="font-medium text-sm dark:text-dark-text">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.quantity} · ₹{item.price}</p></div>
                <p className="font-bold dark:text-dark-text">₹{(item.price*item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-dark-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-dark-muted"><span>Subtotal</span><span>₹{data.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500 dark:text-dark-muted"><span>Shipping</span><span>{data.shippingFee === 0 ? 'FREE' : `₹${data.shippingFee}`}</span></div>
            {data.codFee > 0 && <div className="flex justify-between text-gray-500 dark:text-dark-muted"><span>COD Fee</span><span>₹{data.codFee.toLocaleString()}</span></div>}
            {data.discountAmount > 0 && <div className="flex justify-between text-green-500"><span>Discount</span><span>-₹{data.discountAmount.toLocaleString()}</span></div>}
            <div className="flex justify-between font-bold text-base dark:text-dark-text pt-2 border-t border-gray-100 dark:border-dark-border"><span>Total</span><span className="text-primary-500">₹{data.total.toLocaleString()}</span></div>
          </div>
        </div>
        <div className="card p-5">
          <h3 className="font-semibold mb-4 dark:text-dark-text">Order Timeline</h3>
          <div className="space-y-3">
            {data.statusHistory?.map((h, i) => (
              <div key={i} className="flex gap-3 items-start">
                <div className="w-3 h-3 rounded-full bg-primary-500 mt-1 flex-shrink-0" />
                <div><p className="text-sm font-medium capitalize dark:text-dark-text">{h.status.replace('_',' ')}</p><p className="text-xs text-gray-400">{h.message} · {new Date(h.timestamp).toLocaleString('en-IN')}</p></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Mock Razorpay Simulator Modal */}
      {mockPaymentData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4 animate-in fade-in zoom-in-95 duration-200">
            {/* Header */}
            <div className="flex items-center justify-between border-b dark:border-dark-border pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-primary-500 flex items-center justify-center text-white font-bold">R</div>
                <div>
                  <h3 className="font-bold text-gray-900 dark:text-dark-text text-lg">Razorpay Simulator</h3>
                  <span className="text-xs font-semibold px-2 py-0.5 bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400 rounded-full">Sandbox Mode</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMockPaymentData(null);
                  toast.error('Payment cancelled.');
                }} 
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 font-bold text-xl"
              >
                &times;
              </button>
            </div>

            {/* Body */}
            <div className="space-y-4 my-6">
              <div className="bg-gray-50 dark:bg-dark-bg p-4 rounded-xl space-y-2">
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Merchant</span>
                  <span className="font-semibold text-gray-800 dark:text-dark-text">DZONE GADGET</span>
                </div>
                <div className="flex justify-between text-sm text-gray-500">
                  <span>Order ID</span>
                  <span className="font-mono text-xs text-gray-800 dark:text-dark-text">{mockPaymentData.razorpayOrderId}</span>
                </div>
                <div className="flex justify-between text-base font-bold border-t dark:border-dark-border pt-2 text-gray-900 dark:text-dark-text">
                  <span>Amount to Pay</span>
                  <span className="text-primary-500">₹{(mockPaymentData.amount / 100).toLocaleString('en-IN')}</span>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-xs text-gray-400 font-semibold tracking-wider uppercase">Select simulated payment method</p>
                <div className="grid grid-cols-3 gap-2">
                  <button className="flex flex-col items-center justify-center p-3 border-2 border-primary-500 bg-primary-50/10 dark:bg-primary-950/10 rounded-xl text-center">
                    <span className="text-xs font-medium dark:text-dark-text">UPI / QR</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-dark-border rounded-xl text-center hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                    <span className="text-xs font-medium text-gray-600 dark:text-dark-muted">Card</span>
                  </button>
                  <button className="flex flex-col items-center justify-center p-3 border border-gray-200 dark:border-dark-border rounded-xl text-center hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors">
                    <span className="text-xs font-medium text-gray-600 dark:text-dark-muted">Net Banking</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-2 mt-6">
              <button 
                onClick={async () => {
                  setPayLoading(true);
                  try {
                    const response = {
                      razorpay_order_id: mockPaymentData.razorpayOrderId,
                      razorpay_payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
                      razorpay_signature: 'mock_signature'
                    };
                    await api.post('/payments/razorpay/verify', { ...response, orderId: mockPaymentData.orderId });
                    setMockPaymentData(null);
                    toast.success('Payment successful! 🎉');
                    refetch();
                  } catch (err) {
                    toast.error(err.response?.data?.message || err.message || 'Payment verification failed');
                  } finally {
                    setPayLoading(false);
                  }
                }}
                disabled={payLoading}
                className="btn-primary w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
              >
                {payLoading ? 'Verifying...' : 'Simulate Success ✔'}
              </button>
              <button 
                onClick={() => {
                  setMockPaymentData(null);
                  toast.error('Simulated payment failed / cancelled.');
                }}
                disabled={payLoading}
                className="btn-secondary w-full py-3 border border-red-500 text-red-500 hover:bg-red-500/10 font-bold rounded-xl transition-all"
              >
                Simulate Failure ✖
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

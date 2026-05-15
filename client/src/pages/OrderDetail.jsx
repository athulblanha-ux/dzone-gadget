import { useParams, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiDownload, FiArrowLeft } from 'react-icons/fi';
import api from '../lib/api';

export default function OrderDetail() {
  const { id } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['order', id], queryFn: () => api.get(`/orders/${id}`).then(r => r.data.order) });

  if (isLoading) return <div className="max-w-4xl mx-auto px-4 py-8"><div className="skeleton h-8 w-1/3 rounded mb-6" />{Array(3).fill(null).map((_,i)=><div key={i} className="card p-6 mb-4"><div className="skeleton h-4 rounded" /></div>)}</div>;
  if (!data) return <div className="text-center py-20 text-gray-500">Order not found.</div>;

  return (
    <>
      <Helmet><title>{`Order ${data.orderNumber} — D-STORE`}</title></Helmet>
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
          <div className="card p-5"><h3 className="font-semibold mb-3 dark:text-dark-text">Shipping Address</h3><p className="text-sm text-gray-600 dark:text-dark-muted">{data.shippingAddress.fullName}<br/>{data.shippingAddress.addressLine1}<br/>{data.shippingAddress.city}, {data.shippingAddress.state} - {data.shippingAddress.pincode}<br/>Phone: {data.shippingAddress.phone}</p></div>
          <div className="card p-5"><h3 className="font-semibold mb-3 dark:text-dark-text">Payment Info</h3><p className="text-sm text-gray-600 dark:text-dark-muted">Method: {data.paymentMethod.toUpperCase()}<br/>Status: <span className={data.paymentStatus === 'paid' ? 'text-green-500 font-semibold' : 'text-yellow-500'}>{data.paymentStatus}</span></p></div>
        </div>
        <div className="card p-5 mb-6">
          <h3 className="font-semibold mb-4 dark:text-dark-text">Items ({data.items.length})</h3>
          <div className="space-y-4">
            {data.items.map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-16 h-16 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">{item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-8 h-8 object-contain opacity-50" alt="logo" /></div>}</div>
                <div className="flex-1"><p className="font-medium text-sm dark:text-dark-text">{item.name}</p><p className="text-xs text-gray-400">Qty: {item.quantity} · ₹{item.price}</p></div>
                <p className="font-bold dark:text-dark-text">₹{(item.price*item.quantity).toLocaleString()}</p>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-100 dark:border-dark-border mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-gray-500 dark:text-dark-muted"><span>Subtotal</span><span>₹{data.subtotal.toLocaleString()}</span></div>
            <div className="flex justify-between text-gray-500 dark:text-dark-muted"><span>Shipping</span><span>{data.shippingFee === 0 ? 'FREE' : `₹${data.shippingFee}`}</span></div>
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
    </>
  );
}

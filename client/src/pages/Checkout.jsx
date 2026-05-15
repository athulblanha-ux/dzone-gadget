import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCartStore, useAuthStore } from '../store';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Checkout() {
  const { items, total, clearCart } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', paymentMethod: 'cod' });
  const [shippingFee, setShippingFee] = useState(49);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  useEffect(() => {
    const fetchShipping = async () => {
      if (!total) return;
      setCalculatingShipping(true);
      try {
        const { data } = await api.post('/shipping/calculate', { state: form.state, subtotal: total });
        if (data.success) {
          setShippingFee(data.fee);
        }
      } catch (err) {
        console.error('Failed to calculate shipping', err);
      } finally {
        setCalculatingShipping(false);
      }
    };
    
    // Only fetch if a state is selected, else fetch default
    const timer = setTimeout(() => fetchShipping(), 500);
    return () => clearTimeout(timer);
  }, [form.state, total]);

  const grandTotal = total + shippingFee;

  if (items.length === 0) {
    navigate('/cart');
    return null;
  }

  const loadRazorpay = () => new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const orderData = { items: items.map(i => ({ product: i.product._id, quantity: i.quantity, variant: i.variant })), shippingAddress: form, paymentMethod: form.paymentMethod };
      
      if (form.paymentMethod === 'cod') {
        const { data } = await api.post('/orders', orderData);
        clearCart();
        toast.success('Order placed successfully! 🎉');
        if (isAuthenticated) {
          navigate(`/orders/${data.order._id}`);
        } else {
          navigate(`/shop`);
          toast.success(`Check ${form.email} for order details!`, { duration: 6000 });
        }
      } else if (form.paymentMethod === 'razorpay') {
        const isLoaded = await loadRazorpay();
        if (!isLoaded) throw new Error('Razorpay SDK failed to load');
        
        const { data: orderResponse } = await api.post('/orders', orderData);
        
        const { data: rzpData } = await api.post('/payments/razorpay/create-order', { orderId: orderResponse.order._id });
        
        const options = {
          key: rzpData.keyId || import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_stub',
          amount: rzpData.amount,
          currency: 'INR',
          name: 'D-STORE',
          description: 'D-STORE Order Payment',
          order_id: rzpData.razorpayOrderId,
          handler: async (response) => {
            await api.post('/payments/razorpay/verify', { ...response, orderId: orderResponse.order._id });
            clearCart();
            toast.success('Payment successful! Order placed. 🎉');
            if (isAuthenticated) {
              navigate(`/orders`);
            } else {
              navigate(`/shop`);
              toast.success(`Check ${form.email} for order details!`, { duration: 6000 });
            }
          },
          prefill: { name: form.fullName, email: form.email, contact: form.phone },
          theme: { color: '#FF6B6B' }
        };
        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Checkout — D-STORE</title></Helmet>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="font-display font-bold text-3xl dark:text-dark-text mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            {!isAuthenticated && (
              <div className="card p-4 bg-gray-50/50 dark:bg-dark-card/50 border border-gray-200 dark:border-dark-border">
                <p className="text-sm text-gray-600 dark:text-dark-text">
                  Checking out as a guest. <Link to="/login" state={{ from: '/checkout' }} className="text-primary-500 font-semibold hover:underline">Log in</Link> for faster checkout and to use your coupons!
                </p>
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4 dark:text-dark-text">Shipping Address</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2"><input placeholder="Full Name" value={form.fullName} onChange={e => setForm(p => ({...p, fullName:e.target.value}))} className="input" required /></div>
                <div className="col-span-2"><input type="email" placeholder="Email Address" value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))} className="input" required /></div>
                <div className="col-span-2"><input type="tel" placeholder="Phone Number" value={form.phone} onChange={e => setForm(p => ({...p, phone:e.target.value}))} className="input" required /></div>
                <div className="col-span-2"><input placeholder="Address Line 1" value={form.addressLine1} onChange={e => setForm(p => ({...p, addressLine1:e.target.value}))} className="input" required /></div>
                <div className="col-span-2"><input placeholder="Address Line 2 (Optional)" value={form.addressLine2} onChange={e => setForm(p => ({...p, addressLine2:e.target.value}))} className="input" /></div>
                <div><input placeholder="City" value={form.city} onChange={e => setForm(p => ({...p, city:e.target.value}))} className="input" required /></div>
                <div>
                  <select value={form.state} onChange={e => setForm(p => ({...p, state:e.target.value}))} className="input" required>
                    <option value="" disabled>Select State</option>
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
                </div>
                <div><input placeholder="Pincode" value={form.pincode} onChange={e => setForm(p => ({...p, pincode:e.target.value}))} className="input" required /></div>
              </div>
            </div>
            
            <div className="card p-6">
              <h2 className="font-semibold text-lg mb-4 dark:text-dark-text">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-dark-border rounded-xl cursor-pointer">
                  <input type="radio" name="payment" value="razorpay" checked={form.paymentMethod === 'razorpay'} onChange={e => setForm(p => ({...p, paymentMethod:e.target.value}))} className="accent-primary-500" />
                  <span className="font-medium dark:text-dark-text">Pay Online (UPI, Cards, Netbanking)</span>
                </label>
                <label className="flex items-center gap-3 p-3 border border-gray-200 dark:border-dark-border rounded-xl cursor-pointer">
                  <input type="radio" name="payment" value="cod" checked={form.paymentMethod === 'cod'} onChange={e => setForm(p => ({...p, paymentMethod:e.target.value}))} className="accent-primary-500" />
                  <span className="font-medium dark:text-dark-text">Cash on Delivery</span>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading || calculatingShipping} className="btn-primary w-full text-lg py-4">{loading ? 'Processing...' : (calculatingShipping ? 'Calculating...' : `Place Order (₹${grandTotal.toLocaleString()})`)}</button>
            </form>
          </div>
          
          <div>
            <div className="card p-6 sticky top-24 bg-gray-50 dark:bg-dark-bg border-none shadow-none lg:shadow-card lg:bg-white">
              <h2 className="font-semibold text-lg mb-4 dark:text-dark-text">Order Items</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.key} className="flex gap-4 items-center">
                    <img src={item.product.images?.[0]?.url} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    <div className="flex-1"><p className="text-sm font-medium dark:text-dark-text">{item.product.name}</p><p className="text-xs text-gray-500">Qty: {item.quantity}</p></div>
                    <p className="font-bold text-sm dark:text-dark-text">₹{(item.price * item.quantity).toLocaleString()}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>Shipping</span><span>{calculatingShipping ? 'Calculating...' : (shippingFee === 0 ? 'FREE' : `₹${shippingFee}`)}</span></div>
                <div className="flex justify-between text-xl font-bold pt-4 dark:text-dark-text border-t border-gray-200 dark:border-dark-border"><span>Total</span><span className="text-primary-500">₹{grandTotal.toLocaleString()}</span></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

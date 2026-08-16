import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useCartStore, useAuthStore } from '../store';
import api from '../lib/api';
import toast from 'react-hot-toast';
import { FiPlus, FiMinus, FiTrash2 } from 'react-icons/fi';

export default function Checkout() {
  const { items, total, clearCart, updateQuantity, removeItem } = useCartStore();
  const { user, isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [mockPaymentData, setMockPaymentData] = useState(null);
  const [form, setForm] = useState({ fullName: user?.name || '', email: user?.email || '', phone: user?.phone || '', addressLine1: '', addressLine2: '', city: '', state: '', pincode: '', paymentMethod: 'razorpay' });
  const [shippingFee, setShippingFee] = useState(0);
  const [calculatingShipping, setCalculatingShipping] = useState(false);

  useEffect(() => {
    const fetchShipping = async () => {
      if (!total) return;
      setCalculatingShipping(true);
      try {
        const { data } = await api.post('/shipping/calculate', { 
          state: form.state, 
          subtotal: total,
          items: items.map(i => ({ product: i.product._id, quantity: i.quantity }))
        });
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
  }, [form.state, total, items]);

  const codFee = form.paymentMethod === 'partial_cod' ? 90 : 0;
  const grandTotal = total + shippingFee + codFee;
  const advanceAmount = form.paymentMethod === 'partial_cod'
    ? Math.round(codFee + shippingFee + 0.3 * total)
    : grandTotal;
  const codBalance = form.paymentMethod === 'partial_cod' ? grandTotal - advanceAmount : 0;

  // Static calculations for the COD description text
  const codAdvanceStatic = Math.round(90 + shippingFee + 0.3 * total);
  const codBalanceStatic = (total + shippingFee + 90) - codAdvanceStatic;

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
          if (form.email) {
            toast.success(`Check ${form.email} for order details!`, { duration: 6000 });
          } else {
            toast.success('Order placed successfully! 🎉', { duration: 6000 });
          }
        }
      } else if (form.paymentMethod === 'razorpay' || form.paymentMethod === 'partial_cod') {
        const { data: orderResponse } = await api.post('/orders', orderData);
        const { data: rzpData } = await api.post('/create-order', { orderId: orderResponse.order._id });
        
        if (rzpData.isMock) {
          setMockPaymentData({
            orderId: orderResponse.order._id,
            razorpayOrderId: rzpData.order_id || rzpData.razorpayOrderId,
            amount: rzpData.amount,
            keyId: rzpData.keyId,
            email: form.email
          });
        } else {
          const isLoaded = await loadRazorpay();
          if (!isLoaded) throw new Error('Razorpay SDK failed to load');
          
          const options = {
            key: rzpData.keyId || 'rzp_live_TQPJA4NLxb2uEe',
            amount: rzpData.amount,
            currency: rzpData.currency || 'INR',
            name: 'DZONE GADGET',
            description: form.paymentMethod === 'partial_cod' ? 'DZONE GADGET Partial COD Advance' : 'DZONE GADGET Order Payment',
            order_id: rzpData.order_id || rzpData.razorpayOrderId,
            handler: async (response) => {
              await api.post('/verify-payment', { ...response, orderId: orderResponse.order._id });
              clearCart();
              toast.success(form.paymentMethod === 'partial_cod' ? 'Advance paid! Order placed. 🎉' : 'Payment successful! Order placed. 🎉');
              if (isAuthenticated) {
                navigate(`/orders/${orderResponse.order._id}`);
              } else {
                navigate(`/shop`);
                if (form.email) {
                  toast.success(`Check ${form.email} for order details!`, { duration: 6000 });
                } else {
                  toast.success('Order placed successfully! 🎉', { duration: 6000 });
                }
              }
            },
            prefill: { name: form.fullName, email: form.email, contact: form.phone },
            theme: { color: '#007aff' }
          };
          const rzp = new window.Razorpay(options);
          rzp.open();
        }
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Checkout failed');
    } finally { setLoading(false); }
  };

  return (
    <>
      <Helmet><title>Checkout — DZONE GADGET</title></Helmet>
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
                <div className="col-span-2"><input type="email" placeholder="Email Address (Optional)" value={form.email} onChange={e => setForm(p => ({...p, email:e.target.value}))} className="input" /></div>
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
                <label 
                  onClick={() => setForm(p => ({ ...p, paymentMethod: 'razorpay' }))} 
                  className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    form.paymentMethod === 'razorpay' 
                      ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10' 
                      : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="razorpay" 
                    checked={form.paymentMethod === 'razorpay'} 
                    onChange={() => {}} 
                    className="accent-primary-500 mt-1" 
                  />
                  <div>
                    <span className="font-semibold block dark:text-dark-text text-sm">Pay Online (UPI, Cards, Netbanking)</span>
                    <span className="text-xs text-gray-500 dark:text-dark-muted block mt-1">Pay full amount online for faster processing.</span>
                  </div>
                </label>

                <label 
                  onClick={() => setForm(p => ({ ...p, paymentMethod: 'partial_cod' }))} 
                  className={`flex items-start gap-3 p-4 border rounded-2xl cursor-pointer transition-all ${
                    form.paymentMethod === 'partial_cod' 
                      ? 'border-primary-500 bg-primary-50/10 dark:bg-primary-950/10' 
                      : 'border-gray-200 dark:border-dark-border hover:border-gray-300'
                  }`}
                >
                  <input 
                    type="radio" 
                    name="payment" 
                    value="partial_cod" 
                    checked={form.paymentMethod === 'partial_cod'} 
                    onChange={() => {}} 
                    className="accent-primary-500 mt-1" 
                  />
                  <div>
                    <span className="font-semibold block dark:text-dark-text text-sm">Partial Cash on Delivery (COD)</span>
                    <span className="text-xs text-gray-500 dark:text-dark-muted block mt-1">
                      Pay ₹{codAdvanceStatic.toLocaleString()} advance online to confirm order, balance ₹{codBalanceStatic.toLocaleString()} on delivery.
                    </span>
                  </div>
                </label>
              </div>
            </div>
            <button type="submit" disabled={loading || calculatingShipping} className="btn-primary w-full text-lg py-4 shadow-lg shadow-primary-500/20">
              {loading 
                ? 'Processing...' 
                : calculatingShipping 
                  ? 'Calculating...' 
                  : form.paymentMethod === 'partial_cod'
                    ? `Pay Advance & Place Order (₹${advanceAmount.toLocaleString()})`
                    : `Place Order (₹${grandTotal.toLocaleString()})`
              }
            </button>
            </form>
          </div>
          
          <div>
            <div className="card p-6 sticky top-24 bg-gray-50 dark:bg-dark-bg border-none shadow-none lg:shadow-card lg:bg-white">
              <h2 className="font-semibold text-lg mb-4 dark:text-dark-text">Order Items</h2>
              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2">
                {items.map(item => (
                  <div key={item.key} className="flex gap-4 items-center py-2 border-b border-gray-100 dark:border-dark-border last:border-b-0">
                    <img src={item.product.images?.[0]?.url} alt="" className="w-16 h-16 rounded-xl object-contain bg-gray-50 dark:bg-dark-card flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium dark:text-dark-text truncate">{item.product.name}</p>
                      {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                      <div className="flex items-center gap-2 mt-1.5">
                        <div className="flex items-center border border-gray-200 dark:border-dark-border rounded-lg overflow-hidden bg-white dark:bg-dark-card">
                          <button type="button" onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors text-gray-600 dark:text-dark-text"><FiMinus size={12} /></button>
                          <span className="px-2 font-semibold text-xs dark:text-dark-text">{item.quantity}</span>
                          <button type="button" onClick={() => updateQuantity(item.key, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="p-1 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors disabled:opacity-40 text-gray-600 dark:text-dark-text"><FiPlus size={12} /></button>
                        </div>
                        <button type="button" onClick={() => removeItem(item.key)} className="text-red-400 hover:text-red-600 p-1" aria-label="Remove item"><FiTrash2 size={14} /></button>
                      </div>
                    </div>
                    <div className="text-right font-bold text-sm dark:text-dark-text">₹{(item.price * item.quantity).toLocaleString()}</div>
                  </div>
                ))}
              </div>
              <div className="border-t border-gray-200 dark:border-dark-border pt-4 space-y-2">
                <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>Subtotal</span><span>₹{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>Shipping</span><span>{calculatingShipping ? 'Calculating...' : (shippingFee === 0 ? 'FREE' : `₹${shippingFee}`)}</span></div>
                {codFee > 0 && (
                  <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>COD Fee</span><span>₹{codFee}</span></div>
                )}
                <div className="flex justify-between text-xl font-bold pt-4 dark:text-dark-text border-t border-gray-200 dark:border-dark-border"><span>Total</span><span className="text-primary-500">₹{grandTotal.toLocaleString()}</span></div>
                {form.paymentMethod === 'partial_cod' && (
                  <div className="border-t border-dashed border-gray-200 dark:border-dark-border mt-3 pt-3 space-y-2 text-sm">
                    <div className="flex justify-between text-green-600 dark:text-green-400 font-medium">
                      <span>Pay Advance Now</span>
                      <span>₹{advanceAmount.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-gray-600 dark:text-dark-muted font-medium">
                      <span>Pay Balance on Delivery</span>
                      <span>₹{codBalance.toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
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
                  setLoading(true);
                  try {
                    const response = {
                      razorpay_order_id: mockPaymentData.razorpayOrderId,
                      razorpay_payment_id: `pay_mock_${Math.random().toString(36).substr(2, 9)}`,
                      razorpay_signature: 'mock_signature'
                    };
                    await api.post('/payments/razorpay/verify', { ...response, orderId: mockPaymentData.orderId });
                    setMockPaymentData(null);
                    clearCart();
                    toast.success('Payment successful! Order placed. 🎉');
                    if (isAuthenticated) {
                      navigate(`/orders/${mockPaymentData.orderId}`);
                    } else {
                      navigate(`/shop`);
                      if (mockPaymentData.email) {
                        toast.success(`Check ${mockPaymentData.email} for order details!`, { duration: 6000 });
                      } else {
                        toast.success('Order placed successfully! 🎉', { duration: 6000 });
                      }
                    }
                  } catch (err) {
                    toast.error(err.response?.data?.message || err.message || 'Payment verification failed');
                  } finally {
                    setLoading(false);
                  }
                }}
                disabled={loading}
                className="btn-primary w-full py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl transition-all"
              >
                {loading ? 'Verifying...' : 'Simulate Success ✔'}
              </button>
              <button 
                onClick={() => {
                  setMockPaymentData(null);
                  toast.error('Simulated payment failed / cancelled.');
                }}
                disabled={loading}
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

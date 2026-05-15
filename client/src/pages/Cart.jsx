import { Link, useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { motion, AnimatePresence } from 'framer-motion';
import { FiTrash2, FiPlus, FiMinus, FiShoppingBag } from 'react-icons/fi';
import { useCartStore, useAuthStore } from '../store';

export default function Cart() {
  const { items, removeItem, updateQuantity, total, itemCount } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate = useNavigate();
  const grandTotal = total;

  if (items.length === 0) return (
    <div className="max-w-7xl mx-auto px-4 py-20 text-center">
      <Helmet><title>Cart — D-STORE</title></Helmet>
      <div className="text-7xl mb-4">🛒</div>
      <h2 className="font-display font-bold text-2xl dark:text-dark-text mb-2">Your cart is empty</h2>
      <p className="text-gray-500 mb-6">Looks like you haven't added any toys yet!</p>
      <Link to="/shop" className="btn-primary">Start Shopping</Link>
    </div>
  );

  return (
    <>
      <Helmet><title>{`Cart (${itemCount}) — D-STORE`}</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-3xl dark:text-dark-text mb-8">Your Cart ({itemCount} items)</h1>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-4">
            <AnimatePresence>
              {items.map(item => (
                <motion.div key={item.key} layout exit={{ opacity: 0, height: 0 }} className="card p-4 flex gap-4">
                  <div className="w-20 h-20 rounded-xl bg-gray-50 overflow-hidden flex-shrink-0">
                    {item.product.images?.[0]?.url ? <img src={item.product.images[0].url} alt={item.product.name} className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-12 h-12 object-contain opacity-50" alt="logo" /></div>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-sm dark:text-dark-text line-clamp-2">{item.product.name}</h3>
                    {item.variant && <p className="text-xs text-gray-400 mt-0.5">{item.variant.name}: {item.variant.value}</p>}
                    <p className="text-primary-500 font-bold mt-1">₹{item.price.toLocaleString()}</p>
                    <div className="flex items-center gap-3 mt-2">
                      <div className="flex items-center border border-gray-200 dark:border-dark-border rounded-xl overflow-hidden">
                        <button onClick={() => updateQuantity(item.key, item.quantity - 1)} className="p-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors"><FiMinus size={14} /></button>
                        <span className="px-3 py-1 font-semibold text-sm dark:text-dark-text">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.key, item.quantity + 1)} disabled={item.quantity >= item.product.stock} className="p-2 hover:bg-gray-50 dark:hover:bg-dark-bg transition-colors disabled:opacity-40"><FiPlus size={14} /></button>
                      </div>
                      <button onClick={() => removeItem(item.key)} className="text-red-400 hover:text-red-600 p-1"><FiTrash2 size={16} /></button>
                    </div>
                  </div>
                  <div className="text-right font-bold dark:text-dark-text">₹{(item.price * item.quantity).toLocaleString()}</div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          <div className="lg:col-span-1">
            <div className="card p-6 sticky top-24">
              <h3 className="font-display font-bold text-lg mb-4 dark:text-dark-text">Order Summary</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>Subtotal ({itemCount} items)</span><span className="dark:text-dark-text">₹{total.toLocaleString()}</span></div>
                <div className="flex justify-between text-gray-600 dark:text-dark-muted"><span>Shipping</span><span className="text-xs text-gray-500 self-end">Calculated at checkout</span></div>
                <div className="border-t border-gray-100 dark:border-dark-border pt-3 flex justify-between font-bold text-lg dark:text-dark-text"><span>Estimated Total</span><span className="text-primary-500">₹{grandTotal.toLocaleString()}</span></div>
              </div>
              <button onClick={() => navigate('/checkout')} className="btn-primary w-full mt-6"><FiShoppingBag /> Proceed to Checkout</button>
              <Link to="/shop" className="block text-center text-sm text-primary-500 mt-3 hover:underline">Continue Shopping</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

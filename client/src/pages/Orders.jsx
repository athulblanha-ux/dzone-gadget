import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiPackage, FiChevronRight } from 'react-icons/fi';
import api from '../lib/api';

const STATUS_COLORS = { placed:'yellow',confirmed:'blue',processing:'purple',shipped:'indigo',out_for_delivery:'orange',delivered:'green',cancelled:'red',returned:'gray' };

export default function Orders() {
  const { data, isLoading } = useQuery({ queryKey: ['my-orders'], queryFn: () => api.get('/orders/my').then(r => r.data) });

  return (
    <>
      <Helmet><title>My Orders — D-STORE</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-3xl dark:text-dark-text mb-8">My Orders</h1>
        {isLoading ? <div className="space-y-4">{Array(3).fill(null).map((_,i) => <div key={i} className="card p-6"><div className="skeleton h-4 w-1/3 rounded mb-3" /><div className="skeleton h-3 w-1/2 rounded" /></div>)}</div>
        : data?.orders?.length === 0 ? (
          <div className="text-center py-20">
            <FiPackage size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="font-semibold text-xl dark:text-dark-text mb-2">No orders yet</h2>
            <Link to="/shop" className="btn-primary mt-4">Start Shopping</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {data?.orders?.map(order => (
              <Link key={order._id} to={`/orders/${order._id}`} className="card p-5 block hover:shadow-lg transition-shadow">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold dark:text-dark-text">{order.orderNumber}</p>
                    <p className="text-sm text-gray-500 dark:text-dark-muted mt-0.5">{order.items.length} item(s) · ₹{order.total.toLocaleString()}</p>
                    <p className="text-xs text-gray-400 mt-0.5">{new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`badge badge-${STATUS_COLORS[order.status] || 'gray'} capitalize`}>{order.status.replace('_',' ')}</span>
                    <FiChevronRight className="text-gray-400" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

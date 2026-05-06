import { useQuery } from '@tanstack/react-query';
import { FiDollarSign, FiShoppingBag, FiUsers, FiBox, FiTrendingUp } from 'react-icons/fi';
import api from '../lib/api';

export default function Dashboard() {
  const { data, isLoading } = useQuery({ queryKey: ['dashboard-stats'], queryFn: () => api.get('/analytics/dashboard').then(r => r.data) });

  if (isLoading) return <div className="space-y-6"><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">{Array(4).fill(0).map((_,i) => <div key={i} className="card p-6 h-32 skeleton" />)}</div></div>;

  const stats = [
    { label: 'Total Revenue', value: `₹${data?.totalRevenue?.toLocaleString() || 0}`, icon: FiDollarSign, color: 'text-green-500', bg: 'bg-green-100 dark:bg-green-900/20' },
    { label: 'Total Orders', value: data?.totalOrders || 0, icon: FiShoppingBag, color: 'text-blue-500', bg: 'bg-blue-100 dark:bg-blue-900/20' },
    { label: 'Total Customers', value: data?.totalCustomers || 0, icon: FiUsers, color: 'text-purple-500', bg: 'bg-purple-100 dark:bg-purple-900/20' },
    { label: 'Total Products', value: data?.totalProducts || 0, icon: FiBox, color: 'text-orange-500', bg: 'bg-orange-100 dark:bg-orange-900/20' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <div className="text-sm text-gray-500 dark:text-gray-400">Last 30 days</div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((s, i) => (
          <div key={i} className="card p-6 flex items-center gap-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center ${s.bg} ${s.color}`}>
              <s.icon size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{s.label}</p>
              <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{s.value}</h3>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><FiShoppingBag /> Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 dark:bg-dark-bg dark:text-gray-400">
                <tr><th className="px-4 py-3">Order ID</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Amount</th><th className="px-4 py-3">Status</th></tr>
              </thead>
              <tbody>
                {data?.recentOrders?.length ? data.recentOrders.map((o) => (
                  <tr key={o._id} className="border-b dark:border-dark-border">
                    <td className="px-4 py-3 font-medium dark:text-white">{o.orderNumber}</td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300">{o.shippingAddress?.fullName}</td>
                    <td className="px-4 py-3 font-medium text-primary-600">₹{o.total.toLocaleString()}</td>
                    <td className="px-4 py-3"><span className="px-2 py-1 bg-gray-100 dark:bg-dark-bg text-gray-600 dark:text-gray-300 rounded text-xs uppercase">{o.status.replace('_', ' ')}</span></td>
                  </tr>
                )) : <tr><td colSpan="4" className="px-4 py-8 text-center text-gray-500">No recent orders</td></tr>}
              </tbody>
            </table>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><FiTrendingUp /> Top Products</h2>
          <div className="space-y-4">
            {data?.topProducts?.length ? data.topProducts.map((p) => (
              <div key={p._id} className="flex items-center gap-4 border-b dark:border-dark-border pb-4 last:border-0 last:pb-0">
                <div className="w-12 h-12 bg-gray-100 dark:bg-dark-bg rounded-lg overflow-hidden">
                  {p.images?.[0]?.url ? <img src={p.images[0].url} alt="" className="w-full h-full object-cover" /> : <div className="w-full h-full flex items-center justify-center"><img src="/logo.png" className="w-6 h-6 object-contain opacity-50" alt="logo" /></div>}
                </div>
                <div className="flex-1">
                  <h4 className="text-sm font-semibold dark:text-white line-clamp-1">{p.name}</h4>
                  <p className="text-xs text-gray-500">{p.soldCount || 0} sold</p>
                </div>
                <div className="font-bold text-primary-600 text-sm">₹{((p.isOnSale && p.salePrice) ? p.salePrice : p.price).toLocaleString()}</div>
              </div>
            )) : <div className="py-8 text-center text-gray-500">No top products data yet</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

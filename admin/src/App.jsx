import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore, useThemeStore } from './store';
import Layout from './Layout';

const Login = React.lazy(() => import('./pages/Login'));
const Dashboard = React.lazy(() => import('./pages/Dashboard'));
const Products = React.lazy(() => import('./pages/Products'));
const ArrangeProducts = React.lazy(() => import('./pages/ArrangeProducts'));
const Categories = React.lazy(() => import('./pages/Categories'));
const Orders = React.lazy(() => import('./pages/Orders'));
const Customers = React.lazy(() => import('./pages/Customers'));
const CMS = React.lazy(() => import('./pages/CMS'));
const Settings = React.lazy(() => import('./pages/Settings'));
const Marketing = React.lazy(() => import('./pages/Marketing'));
const Reviews = React.lazy(() => import('./pages/Reviews'));
const Shipping = React.lazy(() => import('./pages/Shipping'));

const queryClient = new QueryClient();

function ProtectedRoute() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!['admin', 'superadmin'].includes(user?.role)) {
    return <div className="p-8 text-center text-red-500">Access Denied</div>;
  }
  return <Layout />;
}

export default function App() {
  const { init } = useThemeStore();
  
  useEffect(() => { init(); }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <React.Suspense fallback={<div className="h-screen flex items-center justify-center text-primary-500 font-bold">Loading D-STORE Admin...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<ProtectedRoute />}>
              <Route index element={<Dashboard />} />
              <Route path="products" element={<Products />} />
              <Route path="arrange-products" element={<ArrangeProducts />} />
              <Route path="categories" element={<Categories />} />
              <Route path="orders" element={<Orders />} />
              <Route path="customers" element={<Customers />} />
              <Route path="cms" element={<CMS />} />
              <Route path="marketing" element={<Marketing />} />
              <Route path="reviews" element={<Reviews />} />
              <Route path="settings" element={<Settings />} />
              <Route path="shipping" element={<Shipping />} />
              <Route path="*" element={<div className="p-8 text-gray-500">Page not found</div>} />
            </Route>
          </Routes>
        </React.Suspense>
        <Toaster />
      </BrowserRouter>
    </QueryClientProvider>
  );
}

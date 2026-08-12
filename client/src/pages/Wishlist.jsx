import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { useWishlistStore } from '../store';
import ProductCard from '../components/product/ProductCard';
import api from '../lib/api';

export default function Wishlist() {
  const { items } = useWishlistStore();
  const { data } = useQuery({
    queryKey: ['wishlist-products', items],
    queryFn: () => items.length ? api.get(`/products?${items.map(id => `id[]=${id}`).join('&')}&limit=50`).then(r => r.data.products) : Promise.resolve([]),
    enabled: items.length > 0,
  });

  return (
    <>
      <Helmet><title>Wishlist — DZONE GADGET</title></Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="font-display font-bold text-3xl dark:text-dark-text mb-8">My Wishlist ❤️</h1>
        {items.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-7xl mb-4">❤️</div>
            <h2 className="font-semibold text-xl dark:text-dark-text mb-2">Your wishlist is empty</h2>
            <p className="text-gray-500 mb-6">Save toys you love for later!</p>
            <Link to="/shop" className="btn-primary">Browse Toys</Link>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {data?.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        )}
      </div>
    </>
  );
}

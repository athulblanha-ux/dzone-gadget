import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '../lib/api';
import ProductCard from '../components/product/ProductCard';

import { FiBox, FiUsers, FiGrid, FiBookOpen, FiHeart, FiActivity, FiTarget, FiCpu, FiFeather, FiTv, FiSmile, FiTool, FiTruck } from 'react-icons/fi';

const getCategoryIcon = (slug, size = 24) => {
  switch (slug) {
    case 'action-figures': return <FiUsers size={size} />;
    case 'building-blocks': return <FiGrid size={size} />;
    case 'educational-toys': return <FiBookOpen size={size} />;
    case 'dolls-accessories': return <FiHeart size={size} />;
    case 'outdoor-sports': return <FiActivity size={size} />;
    case 'puzzles-games': return <FiTarget size={size} />;
    case 'remote-control': return <FiCpu size={size} />;
    case 'arts-crafts': return <FiFeather size={size} />;
    case 'toys': return <FiSmile size={size} />;
    case 'gadgets': return <FiTv size={size} />;
    case 'hobbygrade': return <FiTool size={size} />;
    case 'diecast': return <FiTruck size={size} />;
    default: return <FiBox size={size} />;
  }
};

export default function Category() {
  const { slug } = useParams();
  
  const { data: catRes, isLoading: catLoading } = useQuery({ queryKey: ['category', slug], queryFn: () => api.get('/categories').then(r => r.data.categories.find(c => c.slug === slug)) });
  
  const { data: prodRes, isLoading: prodLoading } = useQuery({ 
    queryKey: ['products-by-category', catRes?._id], 
    queryFn: () => api.get(`/products?category=${catRes._id}&limit=all`).then(r => r.data),
    enabled: !!catRes?._id
  });

  if (catLoading) return <div className="max-w-7xl mx-auto px-4 py-16"><div className="skeleton h-12 w-64 mx-auto mb-12 rounded" /><div className="grid grid-cols-2 md:grid-cols-4 gap-6">{Array(8).fill(null).map((_,i)=><div key={i} className="skeleton aspect-square rounded-2xl" />)}</div></div>;
  if (!catRes) return <div className="text-center py-20 text-gray-500">Category not found.</div>;

  return (
    <>
      <Helmet><title>{`${catRes.name} Toys — D-STORE`}</title></Helmet>
      <div className="bg-white/[0.02] border-b border-white/[0.05] py-12 mb-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <div className="w-20 h-20 mx-auto bg-white/5 border border-white/[0.08] backdrop-blur-md rounded-2xl flex items-center justify-center text-primary-400 mb-4 shadow-lg">
            {getCategoryIcon(catRes.slug, 32)}
          </div>
          <h1 className="font-display font-bold text-4xl dark:text-dark-text mb-2">{catRes.name}</h1>
          <p className="text-gray-500 dark:text-dark-muted max-w-2xl mx-auto">Explore our amazing collection of {catRes.name.toLowerCase()} for all ages.</p>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        {prodLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">{Array(8).fill(null).map((_,i)=><div key={i} className="skeleton aspect-square rounded-2xl" />)}</div>
        ) : prodRes?.products?.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
            {prodRes.products.map(p => <ProductCard key={p._id} product={p} />)}
          </div>
        ) : (
          <div className="text-center py-16 text-gray-500">No products found in this category yet.</div>
        )}
      </div>
    </>
  );
}

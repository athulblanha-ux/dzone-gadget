import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import api from '../../lib/api';

export default function PolicyPage({ title, settingKey }) {
  const { data, isLoading } = useQuery({ 
    queryKey: ['settings', settingKey], 
    queryFn: () => api.get('/settings/public').then(r => r.data.settings[settingKey]) 
  });

  return (
    <>
      <Helmet><title>{title} — DZONE GADGET</title></Helmet>
      <div className="max-w-4xl mx-auto px-4 py-16">
        <h1 className="font-display font-bold text-4xl dark:text-dark-text mb-8">{title}</h1>
        <div className="card p-8 md:p-12">
          {isLoading ? (
            <div className="space-y-4"><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-5/6" /><div className="skeleton h-4 w-full" /></div>
          ) : data ? (
            <div className="prose prose-lg dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: data.replace(/\n/g, '<br/>') }} />
          ) : (
            <p className="text-gray-500">Information not available.</p>
          )}
        </div>
      </div>
    </>
  );
}

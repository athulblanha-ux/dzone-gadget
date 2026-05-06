import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import { FiArrowLeft, FiClock, FiCalendar } from 'react-icons/fi';
import api from '../lib/api';

export default function BlogPost() {
  const { slug } = useParams();
  const { data, isLoading } = useQuery({ queryKey: ['blog', slug], queryFn: () => api.get(`/blogs/${slug}`).then(r => r.data.blog) });

  if (isLoading) return <div className="max-w-3xl mx-auto px-4 py-20"><div className="skeleton h-12 w-3/4 mb-6" /><div className="skeleton h-80 w-full mb-8 rounded-2xl" /><div className="space-y-4"><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-full" /><div className="skeleton h-4 w-5/6" /></div></div>;
  if (!data) return <div className="text-center py-32 font-medium">Post not found.</div>;

  return (
    <>
      <Helmet><title>{`${data.title} — D-STORE Blog`}</title><meta name="description" content={data.excerpt} /></Helmet>
      
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12">
        <Link to="/blog" className="inline-flex items-center gap-2 text-primary-500 font-medium hover:underline mb-8"><FiArrowLeft /> Back to Blog</Link>
        
        <div className="mb-8">
          <div className="inline-block bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-bold mb-4">{data.category}</div>
          <h1 className="font-display font-bold text-4xl md:text-5xl dark:text-dark-text leading-tight mb-6">{data.title}</h1>
          <div className="flex flex-wrap items-center gap-6 text-gray-500 dark:text-dark-muted text-sm border-b border-gray-100 dark:border-dark-border pb-6">
            <div className="flex items-center gap-2"><FiCalendar /> {new Date(data.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
            <div className="flex items-center gap-2"><FiClock /> {data.readTime} min read</div>
          </div>
        </div>

        {data.coverImage?.url && (
          <img src={data.coverImage.url} alt={data.title} className="w-full aspect-[2/1] object-cover rounded-3xl mb-12 shadow-lg" />
        )}

        <div className="prose prose-lg prose-primary dark:prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: data.content }} />
        
        {data.tags?.length > 0 && (
          <div className="mt-12 pt-8 border-t border-gray-100 dark:border-dark-border flex gap-2 flex-wrap">
            <span className="font-semibold dark:text-dark-text mr-2">Tags:</span>
            {data.tags.map(tag => (
              <span key={tag} className="bg-gray-100 dark:bg-dark-card px-3 py-1 rounded-lg text-sm text-gray-600 dark:text-dark-muted">#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

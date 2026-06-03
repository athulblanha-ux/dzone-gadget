

export default function Blog() {
  const { data, isLoading } = useQuery({ queryKey: ['blogs'], queryFn: () => api.get('/blogs').then(r => r.data.blogs) });

  return (
    <>
      <Helmet><title>Blog — D-STORE</title></Helmet>
      <div className="bg-gradient-to-b from-accent-purple/10 to-white dark:from-dark-card dark:to-dark-bg py-16 mb-8 text-center px-4">
        <h1 className="font-display font-bold text-4xl dark:text-dark-text mb-4">D-STORE Blog</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">Parenting tips, toy reviews, and fun activity ideas for your little ones.</p>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
        {isLoading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">{Array(6).fill(null).map((_,i)=><div key={i} className="skeleton h-80 rounded-2xl" />)}</div>
        ) : data?.length === 0 ? (
          <div className="text-center py-20 text-gray-500">No blog posts yet. Check back soon!</div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {data?.map(post => (
              <Link key={post._id} to={`/blog/${post.slug}`} className="card overflow-hidden group">
                <div className="aspect-video bg-gray-100 overflow-hidden relative">
                  {post.coverImage?.url ? <img src={post.coverImage.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <div className="w-full h-full flex items-center justify-center text-4xl text-primary-400 bg-white/5"><FiFileText /></div>}
                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur px-3 py-1 rounded-lg text-xs font-bold text-primary-500">{post.category}</div>
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs text-gray-400 mb-3"><span>{new Date(post.createdAt).toLocaleDateString()}</span><span>·</span><span>{post.readTime} min read</span></div>
                  <h3 className="font-bold text-xl mb-2 dark:text-dark-text group-hover:text-primary-500 transition-colors line-clamp-2">{post.title}</h3>
                  <p className="text-gray-500 dark:text-dark-muted text-sm line-clamp-3">{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </>
  );
}

import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <>
      <Helmet><title>About Us — DZONE GADGET</title></Helmet>
      
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-primary-500 to-accent-purple py-24 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-5xl mb-6">Our Story</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-white/90 leading-relaxed">
            Welcome to DZONE GADGET! We believe in the pursuit of detail and performance. Our mission is to bring high-quality hobbygrade products and diecast models to collectors and enthusiasts everywhere.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="font-display font-bold text-3xl dark:text-dark-text mb-6">Why Choose Us?</h2>
            <div className="space-y-6">
              {[
                { title: 'Precision & Quality', desc: 'Every model is curated for detail, authenticity, and premium build quality.' },
                { title: 'Authentic Experience', desc: 'We focus on hobbygrade products and diecast vehicles that captivate collectors.' },
                { title: 'Wide Selection', desc: 'From classic diecast cars to advanced RC vehicles, we provide authentic gear for every enthusiast.' }
              ].map((item, i) => (
                <div key={i} className="flex gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-500 flex items-center justify-center font-bold text-xl flex-shrink-0">{i + 1}</div>
                  <div>
                    <h3 className="font-bold text-lg dark:text-dark-text mb-1">{item.title}</h3>
                    <p className="text-gray-500 dark:text-dark-muted">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative">
            <div className="aspect-square bg-gray-100 rounded-3xl overflow-hidden">
              <img src="https://images.unsplash.com/photo-1594787318286-3d835c1d207f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Model cars display" className="w-full h-full object-cover" />
            </div>

          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto bg-gray-50 dark:bg-dark-card p-12 rounded-3xl">
          <h2 className="font-display font-bold text-3xl dark:text-dark-text mb-6">Our Promise</h2>
          <p className="text-gray-600 dark:text-dark-muted text-lg leading-relaxed mb-8">
            We don't just sell models; we deliver passion. If you are not completely thrilled with your purchase, let us know. We are committed to making it right.
          </p>
        </div>
      </div>
    </>
  );
}

import { Helmet } from 'react-helmet-async';
import { motion } from 'framer-motion';

export default function About() {
  return (
    <>
      <Helmet><title>About Us — D-STORE</title></Helmet>
      
      {/* Hero */}
      <div className="relative bg-gradient-to-r from-primary-500 to-accent-yellow py-24 text-center text-white">
        <div className="max-w-4xl mx-auto px-4">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display font-bold text-5xl mb-6">Our Story</motion.h1>
          <motion.p initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="text-xl text-white/90 leading-relaxed">
            Welcome to D-STORE! We believe that play is the highest form of research. Our mission is to spark joy, creativity, and learning in children everywhere through carefully curated, safe, and imaginative toys.
          </motion.p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center mb-20">
          <div>
            <h2 className="font-display font-bold text-3xl dark:text-dark-text mb-6">Why Choose Us?</h2>
            <div className="space-y-6">
              {[
                { title: 'Curated Quality', desc: 'Every toy is tested for safety, durability, and fun-factor.' },
                { title: 'Educational Value', desc: 'We focus on toys that help develop critical skills while keeping kids engaged.' },
                { title: 'Eco-Friendly Options', desc: 'We are expanding our range of sustainable and wooden toys to protect our planet.' }
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
              <img src="https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Kids playing" className="w-full h-full object-cover" />
            </div>

          </div>
        </div>

        <div className="text-center max-w-3xl mx-auto bg-gray-50 dark:bg-dark-card p-12 rounded-3xl">
          <h2 className="font-display font-bold text-3xl dark:text-dark-text mb-6">Our Promise</h2>
          <p className="text-gray-600 dark:text-dark-muted text-lg leading-relaxed mb-8">
            We don't just sell toys; we deliver smiles. If you or your child are not completely thrilled with your purchase, let us know. We are committed to making it right.
          </p>
        </div>
      </div>
    </>
  );
}

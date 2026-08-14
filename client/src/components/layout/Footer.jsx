import { Link } from 'react-router-dom';
import { FiInstagram, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  const links = {
    'Quick Links': [
      { label: 'Home', to: '/' },
      { label: 'Shop All', to: '/shop' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
      { label: 'Trending', to: '/shop?sort=popular' },
      { label: 'About Us', to: '/about' },
    ],
    'Support': [
      { label: 'Contact Us', to: '/contact' },
      { label: 'FAQ', to: '/faq' },
      { label: 'Track Order', to: '/orders' },
      { label: 'Return Policy', to: '/return-policy' },
      { label: 'Shipping Policy', to: '/shipping-policy' },
    ],
    'Legal': [
      { label: 'Privacy Policy', to: '/privacy' },
      { label: 'Terms & Conditions', to: '/terms' },
    ],
  };

  return (
    <footer className="bg-slate-950 dark:bg-[#06080e] border-t border-slate-200 dark:border-white/[0.08] mt-20 relative overflow-hidden">
      {/* Decorative ambient background glow */}
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[200px] bg-accent-cyan/5 blur-[120px] pointer-events-none rounded-full" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-3 mb-4">
              <img src="/logo.png" className="h-10 w-auto object-contain" alt="DZONE GADGET logo" />
              <span className="font-display font-extrabold text-2xl text-gradient-cyan tracking-tight">DZONE GADGET</span>
            </Link>
            <p className="text-slate-400 text-sm leading-relaxed mb-6 max-w-sm">
              Where passion meets precision. Discover premium hobby-grade models, high-performance RC gear, and detailed diecast collectibles.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: FiInstagram, href: 'https://www.instagram.com/dzonegadget.in/', label: 'Instagram' },
                { icon: FiTwitter, href: 'https://twitter.com/dzone-gadget', label: 'Twitter' },
                { icon: FiYoutube, href: 'https://youtube.com/dzone-gadget', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-10 h-10 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-accent-cyan hover:border-accent-cyan/50 hover:bg-slate-900 transition-all shadow-sm"
                >
                  <Icon size={17} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display font-bold text-white text-sm tracking-wider uppercase mb-4 text-slate-200">{title}</h4>
              <ul className="space-y-3">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-slate-400 text-sm hover:text-accent-cyan transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Contact Info */}
        <div className="border-t border-slate-800/80 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex flex-wrap items-center gap-6 text-slate-400 text-sm">
            <span className="flex items-center gap-2">
              <FiPhone size={15} className="text-accent-cyan" />
              +91 94959 61840
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin size={15} className="text-accent-cyan" />
              Mukkam, Kozhikode, Kerala, India
            </span>
          </div>
          <p className="text-slate-500 text-sm font-medium">
            © {new Date().getFullYear()} <span className="text-slate-300 font-semibold">DZONE GADGET</span>. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}

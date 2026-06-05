import { Link } from 'react-router-dom';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin } from 'react-icons/fi';

export default function Footer() {
  const links = {
    'Quick Links': [
      { label: 'Home', to: '/' },
      { label: 'Shop All', to: '/shop' },
      { label: 'New Arrivals', to: '/shop?sort=newest' },
      { label: 'Trending', to: '/shop?sort=popular' },
      { label: 'Blog', to: '/blog' },
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
    <footer className="bg-dark-card dark:bg-dark-bg border-t border-dark-border mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <img src="/logo.png" className="h-10 w-auto object-contain" alt="logo" />
              <span className="font-display font-bold text-2xl text-gradient">D-STORE</span>
            </Link>
            <p className="text-dark-muted text-sm leading-relaxed mb-6">
              Where passion meets precision. Discover premium hobbygrade models and diecast collections.
            </p>

            {/* Social */}
            <div className="flex gap-3 mt-6">
              {[
                { icon: FiInstagram, href: 'https://www.instagram.com/dstore.in/', label: 'Instagram' },
                { icon: FiFacebook, href: 'https://facebook.com/d-store', label: 'Facebook' },
                { icon: FiTwitter, href: 'https://twitter.com/d-store', label: 'Twitter' },
                { icon: FiYoutube, href: 'https://youtube.com/d-store', label: 'YouTube' },
              ].map(({ icon: Icon, href, label }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-xl bg-dark-bg border border-dark-border flex items-center justify-center text-dark-muted hover:text-primary-400 hover:border-primary-400 transition-colors"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-display font-semibold text-dark-text mb-4">{title}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link
                      to={item.to}
                      className="text-dark-muted text-sm hover:text-primary-400 transition-colors"
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
        <div className="border-t border-dark-border mt-12 pt-8 flex flex-col md:flex-row justify-between items-start gap-6">
          <div className="flex flex-wrap gap-6 text-dark-muted text-sm">
            <span className="flex items-center gap-2">
              <FiPhone size={14} className="text-primary-400" />
              +91 94953 02826
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin size={14} className="text-primary-400" />
              Mukkam, Kozhikode, Kerala, India
            </span>
          </div>
          <p className="text-dark-muted text-sm">
            © {new Date().getFullYear()} D-STORE. Made with love in India.
          </p>
        </div>
      </div>
    </footer>
  );
}

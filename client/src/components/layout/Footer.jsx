import { Link } from 'react-router-dom';
import { useState } from 'react';
import { FiInstagram, FiFacebook, FiTwitter, FiYoutube, FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import api from '../../lib/api';
import toast from 'react-hot-toast';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribing, setSubscribing] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribing(true);
    try {
      await api.post('/newsletters/subscribe', { email, source: 'footer' });
      toast.success('Subscribed! 🎉 Check your inbox for 10% off.');
      setEmail('');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed.');
    } finally {
      setSubscribing(false);
    }
  };

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
              Where play comes to life. Discover premium, safe, and fun toys for every child's imagination.
            </p>

            {/* Newsletter */}
            <p className="text-dark-text font-semibold mb-3">Get 10% off your first order!</p>
            <form onSubmit={handleSubscribe} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Your email..."
                className="flex-1 px-4 py-2.5 rounded-xl bg-dark-bg border border-dark-border text-dark-text placeholder-dark-muted text-sm focus:outline-none focus:ring-2 focus:ring-primary-400"
              />
              <button
                type="submit"
                disabled={subscribing}
                className="btn-primary py-2.5 px-4"
              >
                {subscribing ? '...' : <FiSend size={16} />}
              </button>
            </form>

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
              <FiMail size={14} className="text-primary-400" />
              support@d-store.store
            </span>
            <span className="flex items-center gap-2">
              <FiPhone size={14} className="text-primary-400" />
              +91 94953 02826
            </span>
            <span className="flex items-center gap-2">
              <FiMapPin size={14} className="text-primary-400" />
              Mumbai, Maharashtra, India
            </span>
          </div>
          <p className="text-dark-muted text-sm">
            © {new Date().getFullYear()} D-STORE. Made with ❤️ in India.
          </p>
        </div>
      </div>
    </footer>
  );
}

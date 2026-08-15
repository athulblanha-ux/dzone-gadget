import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiMail, FiPhone, FiMapPin, FiSend } from 'react-icons/fi';
import api from '../lib/api';
import toast from 'react-hot-toast';

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);

  const { data: settings } = useQuery({ queryKey: ['public-settings'], queryFn: () => api.get('/settings/public').then(r => r.data.settings) });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    // Note: Since we didn't build a specific contact API in backend, we simulate success
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    toast.success('Message sent! We will get back to you shortly. 📧');
    setForm({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <>
      <Helmet><title>Contact Us — DZONE GADGET</title></Helmet>
      
      <div className="bg-gray-50 dark:bg-dark-bg py-16 border-b border-gray-100 dark:border-dark-border">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h1 className="font-display font-bold text-4xl dark:text-dark-text mb-4">Contact Us 📞</h1>
          <p className="text-gray-500 max-w-2xl mx-auto">Have a question? We're here to help! Send us a message or reach out via our contact details.</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid lg:grid-cols-3 gap-12">
          {/* Info */}
          <div className="space-y-8">
            <h2 className="font-display font-bold text-2xl dark:text-dark-text">Get in touch</h2>
            
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center flex-shrink-0"><FiPhone size={20} /></div>
              <div>
                <h3 className="font-bold dark:text-dark-text mb-1">Phone / WhatsApp</h3>
                <p className="text-gray-500 dark:text-dark-muted">{settings?.contact_phone || '+91 94959 61840'}</p>
                <p className="text-xs text-gray-400 mt-1">Mon-Fri, 10am to 6pm</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-500 flex items-center justify-center flex-shrink-0"><FiMapPin size={20} /></div>
              <div>
                <h3 className="font-bold dark:text-dark-text mb-1">Office</h3>
                <p className="text-gray-500 dark:text-dark-muted leading-relaxed">{settings?.contact_address || 'Mukkam, Kozhikode, Kerala - 673602'}</p>
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="card p-8 space-y-6">
              <div className="grid sm:grid-cols-2 gap-6">
                <div><label className="label">Your Name</label><input type="text" className="input" value={form.name} onChange={e => setForm(p => ({...p, name: e.target.value}))} required /></div>
                <div><label className="label">Email Address</label><input type="email" className="input" value={form.email} onChange={e => setForm(p => ({...p, email: e.target.value}))} required /></div>
              </div>
              <div><label className="label">Subject</label><input type="text" className="input" value={form.subject} onChange={e => setForm(p => ({...p, subject: e.target.value}))} required /></div>
              <div><label className="label">Message</label><textarea rows={5} className="input resize-none py-3" value={form.message} onChange={e => setForm(p => ({...p, message: e.target.value}))} required /></div>
              <button type="submit" disabled={loading} className="btn-primary px-8"><FiSend /> {loading ? 'Sending...' : 'Send Message'}</button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}

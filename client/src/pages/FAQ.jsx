import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../lib/api';

export default function FAQ() {
  const { data, isLoading } = useQuery({ queryKey: ['faqs'], queryFn: () => api.get('/faqs').then(r => r.data.faqs) });
  const [openId, setOpenId] = useState(null);

  return (
    <>
      <Helmet><title>FAQ — D-STORE</title></Helmet>
      
      <div className="bg-gradient-to-b from-accent-blue/10 to-white dark:from-dark-card dark:to-dark-bg py-16 mb-8 text-center px-4">
        <h1 className="font-display font-bold text-4xl dark:text-dark-text mb-4">Frequently Asked Questions ❓</h1>
        <p className="text-gray-500 max-w-2xl mx-auto text-lg">Find answers to common questions about our toys, shipping, and returns.</p>
      </div>

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 mb-24">
        {isLoading ? (
          <div className="space-y-4">{Array(5).fill(null).map((_,i) => <div key={i} className="skeleton h-16 rounded-2xl" />)}</div>
        ) : data?.length === 0 ? (
          <div className="text-center text-gray-500">No FAQs available.</div>
        ) : (
          <div className="space-y-4">
            {data?.map(faq => (
              <div key={faq._id} className="card overflow-hidden">
                <button
                  onClick={() => setOpenId(openId === faq._id ? null : faq._id)}
                  className="w-full p-6 text-left flex items-center justify-between font-semibold dark:text-dark-text hover:text-primary-500 transition-colors"
                >
                  {faq.question}
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${openId === faq._id ? 'bg-primary-50 text-primary-500' : 'bg-gray-50 dark:bg-dark-bg text-gray-400'}`}>
                    {openId === faq._id ? <FiChevronUp /> : <FiChevronDown />}
                  </span>
                </button>
                <AnimatePresence>
                  {openId === faq._id && (
                    <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                      <div className="p-6 pt-0 text-gray-600 dark:text-dark-muted leading-relaxed">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        )}
        
        <div className="mt-16 text-center card p-8 bg-gradient-to-r from-primary-50 to-accent-yellow/10 border-primary-100">
          <h3 className="font-display font-bold text-xl mb-2">Still have questions?</h3>
          <p className="text-gray-600 mb-6">Our support team is here to help you.</p>
          <a href="/contact" className="btn-primary">Contact Us</a>
        </div>
      </div>
    </>
  );
}

import React, { useState } from 'react';
import { HelpCircle, ChevronRight, BookOpen, ShieldCheck, CheckCircle2 } from 'lucide-react';

export const RecruiterHelpPage = () => {
  const [openFaq, setOpenFaq] = useState(null);

  const faqs = [
    {
      q: 'How does KASUMIO verify student evidence?',
      a: 'Evidence in KASUMIO is verified strictly against demonstrable proof artifacts (such as public Git repositories with commit histories, live production URLs, accredited credentials, or competition submissions) and verified by accredited organizations.'
    },
    {
      q: 'Are candidate match scores based on arbitrary AI?',
      a: 'No. Match scores in KASUMIO are calculated deterministically from required skill weights, verified repository code artifacts, and practical screening benchmarks. There are zero fabricated scores.'
    },
    {
      q: 'How do technical screening blueprints work?',
      a: 'Screening blueprints define the time limit, passing threshold, and curriculum for a role. Candidates write real code in Java, Python, JavaScript, or C++ in an isolated sandbox evaluated against automated test cases.'
    },
    {
      q: 'How does candidate consent work for connection requests?',
      a: 'Candidates maintain selective profile disclosure. Sending an invitation or connection request notifies the candidate, and profile contact details are only disclosed upon mutual consent.'
    }
  ];

  return (
    <div className="space-y-6 max-w-4xl animate-in fade-in-50 duration-200">
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800">
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Help & Support</span>
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Hiring guidelines, verification standards, and frequently asked questions for employers.
        </p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, idx) => (
          <div
            key={idx}
            className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 p-5 shadow-2xs cursor-pointer"
            onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
          >
            <div className="flex items-center justify-between gap-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {faq.q}
              </h3>
              <ChevronRight
                className={`w-4 h-4 text-slate-400 transition-transform ${
                  openFaq === idx ? 'rotate-90 text-blue-600' : ''
                }`}
              />
            </div>
            {openFaq === idx && (
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mt-3 pt-3 border-t border-slate-100 dark:border-slate-800">
                {faq.a}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

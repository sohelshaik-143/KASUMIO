import React, { useState } from 'react';
import { MessageSquare, Send, CheckCircle2, User, Search, ShieldCheck } from 'lucide-react';

export const RecruiterMessagesPage = () => {
  const [activeThreadId, setActiveThreadId] = useState('t1');
  const [replyText, setReplyText] = useState('');

  const [threads, setThreads] = useState([
    {
      id: 't1',
      candidateName: 'Arjun Reddy',
      role: 'SDE Intern - Backend Developer',
      unread: true,
      messages: [
        {
          id: 'm1',
          sender: 'candidate',
          text: 'Hello Arjun! Thank you for the invitation. I have uploaded our team’s distributed caching benchmark code to the repository evidence link.',
          time: '10:30 AM'
        },
        {
          id: 'm2',
          sender: 'recruiter',
          text: 'Great work! The test cases executed deterministically and passed with high throughput. When are you available for a brief technical discussion?',
          time: '11:15 AM'
        },
        {
          id: 'm3',
          sender: 'candidate',
          text: 'I am available anytime tomorrow afternoon post 2 PM IST.',
          time: '11:45 AM'
        }
      ]
    },
    {
      id: 't2',
      candidateName: 'Sneha Kumar',
      role: 'Software Engineer - Java',
      unread: true,
      messages: [
        {
          id: 'm4',
          sender: 'candidate',
          text: 'Hi Sarah / Arjun, I noticed the job blueprint emphasizes Spring singleton concurrency. I updated my profile with a recent concurrency audit report.',
          time: 'Yesterday'
        }
      ]
    },
    {
      id: 't3',
      candidateName: 'Vikram Das',
      role: 'SDE Intern - Backend Developer',
      unread: true,
      messages: [
        {
          id: 'm5',
          sender: 'candidate',
          text: 'Completed the DSA assessment round! Scored 95% on the algorithmic tests.',
          time: '2 days ago'
        }
      ]
    }
  ]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'recruiter',
      text: replyText.trim(),
      time: 'Just now'
    };

    setThreads((prev) =>
      prev.map((t) =>
        t.id === activeThreadId
          ? { ...t, messages: [...t.messages, newMsg], unread: false }
          : t
      )
    );
    setReplyText('');
  };

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Candidate Messages</span>
            <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center leading-none">
              3
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Direct, consent-based communications with verified student candidates.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left: Threads List */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Conversations
            </span>
          </div>

          <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
            {threads.map((t) => (
              <div
                key={t.id}
                onClick={() => setActiveThreadId(t.id)}
                className={`p-4 cursor-pointer transition flex items-center justify-between gap-3 ${
                  activeThreadId === t.id
                    ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                    : 'hover:bg-slate-50/60 dark:hover:bg-slate-800/40'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold text-xs flex items-center justify-center shrink-0">
                    {t.candidateName.split(' ').map((n) => n[0]).join('')}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                      {t.candidateName}
                    </p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {t.role}
                    </p>
                  </div>
                </div>

                {t.unread && (
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 shrink-0" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right: Message Details & Input */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30 dark:bg-slate-900/30">
          {/* Thread Header */}
          <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e172a] flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {activeThread.candidateName}
              </h3>
              <p className="text-[11px] text-slate-400">
                Applied for {activeThread.role}
              </p>
            </div>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950 text-emerald-600 border border-emerald-200 dark:border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              Verified Candidate
            </span>
          </div>

          {/* Messages Flow */}
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {activeThread.messages.map((m) => {
              const isMe = m.sender === 'recruiter';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-md p-3.5 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isMe
                        ? 'bg-blue-600 text-white rounded-br-none'
                        : 'bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {m.text}
                  </div>
                  <span className="text-[10px] text-slate-400 mt-1 px-1">
                    {m.time}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reply Form */}
          <form
            onSubmit={handleSendMessage}
            className="p-4 bg-white dark:bg-[#0e172a] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3"
          >
            <input
              type="text"
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              placeholder="Write a message to candidate..."
              className="flex-1 px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500"
            />
            <button
              type="submit"
              className="p-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-xs transition"
              aria-label="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

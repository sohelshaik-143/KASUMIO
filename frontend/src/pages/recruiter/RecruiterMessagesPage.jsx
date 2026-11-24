import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Search, User, ShieldCheck, CheckCheck } from 'lucide-react';

export const RecruiterMessagesPage = () => {
  const [threads, setThreads] = useState(() => {
    try {
      const saved = localStorage.getItem('kasumo_recruiter_threads');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [activeThreadId, setActiveThreadId] = useState(() => threads[0]?.id || null);
  const [replyText, setReplyText] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('kasumo_recruiter_threads', JSON.stringify(threads));
    } catch {}
  }, [threads]);

  const activeThread = threads.find((t) => t.id === activeThreadId) || threads[0] || null;

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !activeThreadId) return;

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

  const unreadCount = threads.filter((t) => t.unread).length;

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Candidate Messages</span>
            {unreadCount > 0 && (
              <span className="w-6 h-6 rounded-full bg-rose-500 text-white text-xs font-bold flex items-center justify-center leading-none">
                {unreadCount}
              </span>
            )}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Direct, consent-based communications with verified student candidates.
          </p>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e172a] rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left: Threads List */}
        <div className="md:col-span-4 border-r border-slate-200 dark:border-slate-800 flex flex-col">
          <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Active Conversations ({threads.length})
            </span>
          </div>

          {threads.length === 0 ? (
            <div className="p-8 text-center space-y-2 my-auto">
              <MessageSquare className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No active conversations
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 max-w-xs mx-auto">
                When candidates reply to outreach or send questions, their conversations will appear here.
              </p>
            </div>
          ) : (
            <div className="flex-1 divide-y divide-slate-100 dark:divide-slate-800 overflow-y-auto">
              {threads.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setActiveThreadId(t.id)}
                  className={`p-4 cursor-pointer transition flex items-center justify-between gap-3 ${
                    activeThreadId === t.id
                      ? 'bg-blue-50/70 dark:bg-blue-950/40 border-l-4 border-blue-600'
                      : 'hover:bg-slate-50 dark:hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs shrink-0">
                      {t.candidateName ? t.candidateName.slice(0, 2).toUpperCase() : 'ST'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {t.candidateName}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate">
                        {t.role}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: Active Chat Area */}
        <div className="md:col-span-8 flex flex-col justify-between bg-slate-50/30 dark:bg-slate-900/30">
          {!activeThread ? (
            <div className="p-12 text-center my-auto space-y-2">
              <MessageSquare className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Select a conversation or send an outreach from Find Candidates
              </p>
            </div>
          ) : (
            <>
              {/* Thread Header */}
              <div className="p-4 px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0e172a] flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    {activeThread.candidateName}
                  </h3>
                  <p className="text-xs text-slate-400">{activeThread.role}</p>
                </div>
                <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-800/40">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Mutual Consent Active
                </span>
              </div>

              {/* Message History */}
              <div className="flex-1 p-6 space-y-4 overflow-y-auto max-h-[460px]">
                {activeThread.messages.map((m) => {
                  const isRecruiter = m.sender === 'recruiter';
                  return (
                    <div
                      key={m.id}
                      className={`flex flex-col ${isRecruiter ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed shadow-xs ${
                          isRecruiter
                            ? 'bg-blue-600 text-white rounded-br-xs'
                            : 'bg-white dark:bg-[#0e172a] border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-bl-xs'
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
              <form onSubmit={handleSendMessage} className="p-4 bg-white dark:bg-[#0e172a] border-t border-slate-200 dark:border-slate-800 flex items-center gap-3">
                <input
                  type="text"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Type an honest, evidence-oriented reply..."
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-xs sm:text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:border-blue-500"
                />
                <button
                  type="submit"
                  disabled={!replyText.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

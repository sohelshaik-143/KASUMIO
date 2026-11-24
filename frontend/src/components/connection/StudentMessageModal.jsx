import React, { useState, useEffect, useRef } from 'react';
import { Send, X, MessageSquare, Building, ShieldCheck } from 'lucide-react';

export const StudentMessageModal = ({ isOpen, onClose, connection }) => {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const messagesEndRef = useRef(null);

  const storageKey = connection ? `kasumo_messages_conn_${connection.id || connection.recruiterName}` : null;

  useEffect(() => {
    if (!isOpen || !connection) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        // Initial thread starting with connection note if any
        const initial = [];
        if (connection.requestNote) {
          initial.push({
            id: 'init-1',
            sender: 'recruiter',
            senderName: connection.recruiterName || 'Recruiter',
            text: connection.requestNote,
            time: 'Connection outreach'
          });
        }
        setMessages(initial);
      }
    } catch {
      setMessages([]);
    }
  }, [isOpen, connection?.id, storageKey]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (!isOpen || !connection) return null;

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'student',
      senderName: 'You',
      text: inputText.trim(),
      time: 'Just now'
    };

    const next = [...messages, newMsg];
    setMessages(next);
    setInputText('');

    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in-50 duration-200">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl w-full max-w-xl flex flex-col overflow-hidden max-h-[85vh]">
        {/* Modal Header - Student Portal Style */}
        <div className="p-4 sm:p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900">
                  {connection.recruiterName || 'Lead Recruiter'}
                </h3>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <ShieldCheck className="w-3 h-3" />
                  Verified Recruiter
                </span>
              </div>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Building className="w-3.5 h-3.5 text-slate-400" />
                <span>{connection.organizationName || 'Engineering Team'}</span>
                <span>•</span>
                <span className="font-medium text-slate-700">{connection.opportunityTitle}</span>
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Body */}
        <div className="flex-1 p-5 overflow-y-auto space-y-3.5 min-h-[260px] bg-slate-50/30">
          {messages.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-semibold text-slate-600">
                Start a direct conversation with {connection.recruiterName || 'the recruiter'}
              </p>
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto">
                Discuss technical requirements, your verified evidence, or interview schedules.
              </p>
            </div>
          ) : (
            messages.map((m) => {
              const isMe = m.sender === 'student';
              return (
                <div
                  key={m.id}
                  className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                >
                  <span className="text-[10px] font-semibold text-slate-400 mb-1 px-1">
                    {m.senderName} • {m.time}
                  </span>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-xs sm:text-sm leading-relaxed shadow-xs ${
                      isMe
                        ? 'bg-indigo-600 text-white rounded-br-xs'
                        : 'bg-white border border-slate-200 text-slate-800 rounded-bl-xs'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              );
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Form */}
        <form onSubmit={handleSend} className="p-3.5 sm:p-4 border-t border-slate-200 bg-white flex items-center gap-2">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type your message to recruiter..."
            className="flex-1 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          <button
            type="submit"
            disabled={!inputText.trim()}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { connectionApi } from '../../api/connectionApi';
import {
  MessageSquare,
  Send,
  Building,
  ShieldCheck,
  Search,
  CheckCheck,
  ArrowRight,
  User,
  Briefcase
} from 'lucide-react';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';

export const StudentMessagesPage = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedConnId, setSelectedConnId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [messagesMap, setMessagesMap] = useState({});
  const messagesEndRef = useRef(null);

  useEffect(() => {
    loadConversations();
  }, [user]);

  const loadConversations = async () => {
    try {
      setLoading(true);
      const conns = await connectionApi.getStudentConnections().catch(() => []);
      setConnections(conns || []);

      // Load messages for each connection from localStorage
      const map = {};
      (conns || []).forEach((c) => {
        const storageKey = `kasumo_messages_conn_${c.id || c.recruiterName}`;
        try {
          const saved = localStorage.getItem(storageKey);
          if (saved) {
            map[c.id] = JSON.parse(saved);
          } else if (c.requestNote) {
            map[c.id] = [
              {
                id: 'init-' + c.id,
                sender: 'recruiter',
                senderName: c.recruiterName || 'Recruiter',
                text: c.requestNote,
                time: 'Initial Outreach'
              }
            ];
          } else {
            map[c.id] = [];
          }
        } catch {
          map[c.id] = [];
        }
      });

      // Also check if there are recruiter threads where candidateName matches or is demo
      try {
        const recThreads = JSON.parse(localStorage.getItem('kasumo_recruiter_threads') || '[]');
        if (recThreads.length > 0 && conns.length === 0) {
          // If no formal connection API items yet but recruiter threads exist in local demo
          const synthetic = recThreads.map((t, idx) => ({
            id: 'rt-' + (t.id || idx),
            recruiterName: t.recruiterName || 'Talent Acquisition Team',
            organizationName: t.organizationName || 'Hiring Partner',
            opportunityTitle: t.roleTitle || 'Open Opportunity',
            status: 'CONNECTED',
            requestNote: t.messages?.[0]?.text || 'Hello! We reviewed your verifiable project evidence and would like to connect.'
          }));
          setConnections(synthetic);
          synthetic.forEach((sc, idx) => {
            map[sc.id] = recThreads[idx]?.messages || [];
          });
        }
      } catch {}

      setMessagesMap(map);
      if (conns.length > 0) {
        setSelectedConnId(conns[0].id);
      }
    } catch (err) {
      console.error('Failed to load student messages:', err);
    } finally {
      setLoading(false);
    }
  };

  const activeConnection = connections.find((c) => c.id === selectedConnId) || connections[0] || null;
  const currentMessages = activeConnection ? messagesMap[activeConnection.id] || [] : [];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [currentMessages, selectedConnId]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!inputText.trim() || !activeConnection) return;

    const newMsg = {
      id: 'msg-' + Date.now(),
      sender: 'student',
      senderName: user?.fullName || 'You',
      text: inputText.trim(),
      time: 'Just now'
    };

    const next = [...currentMessages, newMsg];
    setMessagesMap((prev) => ({
      ...prev,
      [activeConnection.id]: next
    }));
    setInputText('');

    const storageKey = `kasumo_messages_conn_${activeConnection.id || activeConnection.recruiterName}`;
    try {
      localStorage.setItem(storageKey, JSON.stringify(next));
    } catch {}
  };

  const filteredConnections = connections.filter((c) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (c.recruiterName || '').toLowerCase().includes(q) ||
      (c.organizationName || '').toLowerCase().includes(q) ||
      (c.opportunityTitle || '').toLowerCase().includes(q)
    );
  });

  if (loading) {
    return (
      <div className="min-h-[400px] flex items-center justify-center">
        <LoadingSpinner size="lg" text="Loading your messages..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in-50 duration-200">
      {/* Student Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Recruiter Messages</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 font-bold border border-blue-200">
              {connections.length} Conversations
            </span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Direct, consent-based communications with verified enterprise recruiters and hiring teams.
          </p>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[580px]">
        {/* Left Side: Conversations List */}
        <div className="md:col-span-5 lg:col-span-4 border-r border-slate-200 flex flex-col bg-slate-50/50">
          <div className="p-4 border-b border-slate-200">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search recruiters or companies..."
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 transition"
              />
            </div>
          </div>

          {filteredConnections.length === 0 ? (
            <div className="p-8 text-center space-y-2 my-auto">
              <MessageSquare className="w-8 h-8 text-slate-300 mx-auto" />
              <p className="text-xs font-bold text-slate-700">No conversations</p>
              <p className="text-[11px] text-slate-400 max-w-[200px] mx-auto">
                When recruiters message you regarding opportunities, they will show here.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-100 overflow-y-auto max-h-[520px]">
              {filteredConnections.map((conn) => {
                const isSelected = activeConnection?.id === conn.id;
                const msgs = messagesMap[conn.id] || [];
                const lastMsg = msgs[msgs.length - 1];

                return (
                  <button
                    key={conn.id}
                    type="button"
                    onClick={() => setSelectedConnId(conn.id)}
                    className={`w-full p-4 text-left transition flex items-start gap-3 ${
                      isSelected
                        ? 'bg-blue-50/80 border-l-4 border-blue-600'
                        : 'hover:bg-slate-100/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-bold flex items-center justify-center text-xs shrink-0 shadow-2xs">
                      {(conn.organizationName || conn.recruiterName || 'RE').slice(0, 2).toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <p className="text-xs font-bold text-slate-900 truncate">
                          {conn.recruiterName || 'Lead Recruiter'}
                        </p>
                        <span className="text-[10px] text-slate-400 shrink-0 font-medium">
                          {lastMsg?.time || 'Recent'}
                        </span>
                      </div>

                      <p className="text-[11px] font-semibold text-slate-600 flex items-center gap-1 truncate mt-0.5">
                        <Building className="w-3 h-3 text-slate-400 shrink-0" />
                        <span className="truncate">{conn.organizationName || 'Hiring Partner'}</span>
                      </p>

                      <p className="text-[11px] text-slate-400 truncate mt-1">
                        {lastMsg ? lastMsg.text : conn.requestNote || 'Tap to view conversation'}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Chat Window */}
        <div className="md:col-span-7 lg:col-span-8 flex flex-col bg-white">
          {activeConnection ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-white">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 text-blue-600 flex items-center justify-center font-bold text-xs shrink-0">
                    {(activeConnection.recruiterName || 'RE').slice(0, 2).toUpperCase()}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="text-sm font-bold text-slate-900 truncate">
                        {activeConnection.recruiterName || 'Technical Recruiter'}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5 truncate">
                      <Building className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-700">{activeConnection.organizationName || 'Company'}</span>
                      {activeConnection.opportunityTitle && (
                        <>
                          <span>•</span>
                          <span className="text-blue-600 truncate">{activeConnection.opportunityTitle}</span>
                        </>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => navigate('/student/discover')}
                  className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-slate-600 text-xs font-semibold hover:bg-slate-50 transition"
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  <span>View Roles</span>
                </button>
              </div>

              {/* Chat Message History */}
              <div className="flex-1 p-5 overflow-y-auto space-y-3.5 max-h-[440px]">
                {currentMessages.length === 0 ? (
                  <div className="py-12 text-center space-y-2">
                    <p className="text-xs text-slate-400">
                      No messages yet with {activeConnection.recruiterName || 'this recruiter'}. Send a message below to start the conversation.
                    </p>
                  </div>
                ) : (
                  currentMessages.map((msg, idx) => {
                    const isMe = msg.sender === 'student';
                    return (
                      <div
                        key={msg.id || idx}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        <div
                          className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-3.5 text-xs shadow-2xs leading-relaxed ${
                            isMe
                              ? 'bg-blue-600 text-white rounded-br-xs'
                              : 'bg-slate-100 text-slate-800 rounded-bl-xs border border-slate-200/80'
                          }`}
                        >
                          <p className="font-medium">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-1 px-1">
                          <span>{msg.time || 'Recently'}</span>
                          {isMe && <CheckCheck className="w-3 h-3 text-blue-500" />}
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Message Reply Input */}
              <form
                onSubmit={handleSendMessage}
                className="p-3.5 border-t border-slate-200 bg-slate-50/70 flex items-center gap-2"
              >
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Reply to ${activeConnection.recruiterName || 'recruiter'}...`}
                  className="flex-1 px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-blue-500 shadow-2xs transition"
                />
                <button
                  type="submit"
                  disabled={!inputText.trim()}
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send</span>
                </button>
              </form>
            </>
          ) : (
            <div className="p-12 text-center space-y-3 my-auto">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto border border-blue-100">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No active conversations yet
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                When enterprise recruiters review your verified evidence and reach out, you can communicate directly here.
              </p>
              <button
                type="button"
                onClick={() => navigate('/student/discover')}
                className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
              >
                <span>Explore Opportunities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

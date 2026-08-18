import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { connectionApi } from '../../api/connectionApi';
import { studentApi } from '../../api/studentApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { ConnectionConsentModal } from '../../components/connection/ConnectionConsentModal';
import { 
  ShieldCheck, 
  Building, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight, 
  Heart, 
  Eye, 
  Mail, 
  UserCheck, 
  Briefcase, 
  AlertCircle 
} from 'lucide-react';

export const StudentConnectionsPage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const [connections, setConnections] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'PENDING', 'ACCEPTED', 'PAST'

  // Consent modal state
  const [consentModalOpen, setConsentModalOpen] = useState(false);
  const [activeConnection, setActiveConnection] = useState(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [connsData, profileData] = await Promise.all([
        connectionApi.getStudentConnections().catch(() => []),
        studentApi.getProfile().catch(() => null),
      ]);
      setConnections(connsData || []);
      setStudentProfile(profileData);
    } catch (err) {
      console.error('Failed to load connections:', err);
      const errMsg = err.response?.data?.message || 'Could not load your connection requests.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isStudent]);

  const handleOpenConsent = (conn) => {
    setActiveConnection(conn);
    setConsentModalOpen(true);
  };

  const handleConfirmAccept = async (consentPayload) => {
    try {
      const updated = await connectionApi.acceptStudentConnection(activeConnection.id, consentPayload);
      setConnections((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setAlert({
        type: 'success',
        message: 'Connection established! Only your selected professional details were shared with the recruiter.',
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to accept connection.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  const handleDecline = async (connId) => {
    if (!window.confirm('Decline this connection request? Declining will never affect your matching, evidence strength, or reputation.')) {
      return;
    }
    try {
      const updated = await connectionApi.declineStudentConnection(connId);
      setConnections((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
      setAlert({
        type: 'info',
        message: 'Connection request declined. Your candidate standing and opportunity matching remain unaffected.',
      });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to decline connection.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  const handleCancelConnection = async (connId) => {
    if (!window.confirm('Are you sure you want to revoke this connection? The recruiter will no longer have access to your contact information.')) {
      return;
    }
    try {
      await connectionApi.cancelStudentConnection(connId);
      setConnections((prev) =>
        prev.map((c) => (c.id === connId ? { ...c, status: 'CANCELLED' } : c))
      );
      setAlert({ type: 'info', message: 'Connection revoked.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to revoke connection.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading connection requests and status..." />
      </div>
    );
  }

  const filteredConnections = connections.filter((c) => {
    if (selectedFilter === 'PENDING') return c.status === 'PENDING';
    if (selectedFilter === 'ACCEPTED') return c.status === 'ACCEPTED';
    if (selectedFilter === 'PAST') return c.status === 'DECLINED' || c.status === 'EXPIRED' || c.status === 'CANCELLED';
    return true;
  });

  const pendingCount = connections.filter((c) => c.status === 'PENDING').length;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Clock className="w-3 h-3" />
            Decision Pending
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
            <CheckCircle2 className="w-3 h-3" />
            Connected
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3" />
            Declined
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-850 text-slate-500 border border-slate-750">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
            Revoked
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Trusted Connections
            </h1>
            {pendingCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-amber-950/80 text-amber-300 border border-amber-800/80">
                {pendingCount} Pending Decision
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Recruiters interested in connecting based on your demonstrated evidence footprint.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          {['ALL', 'PENDING', 'ACCEPTED', 'PAST'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedFilter === filter
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {filter === 'ALL' ? 'All Connections' : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Connection Cards */}
      {filteredConnections.length === 0 ? (
        <EmptyState
          icon={ShieldCheck}
          title="No connection requests in this category"
          description="When recruiters discover your demonstrable proof footprint for their opportunities, their connection requests will appear here for your explicit consent."
        />
      ) : (
        <div className="space-y-4">
          {filteredConnections.map((conn) => (
            <div
              key={conn.id}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 sm:p-6 shadow-xl transition space-y-4"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-850 text-teal-300 border border-slate-700/80">
                      <Building className="w-3.5 h-3.5" />
                      {conn.organizationName}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-850 text-slate-400 border border-slate-700 uppercase">
                      {conn.opportunityType} • {conn.workType}
                    </span>
                    {renderStatusBadge(conn.status)}
                  </div>

                  <h2 className="text-lg sm:text-xl font-bold text-white tracking-tight">
                    {conn.opportunityTitle}
                  </h2>
                </div>

                {/* Actions */}
                <div className="shrink-0 flex items-center gap-2">
                  {conn.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleDecline(conn.id)}
                        className="px-3.5 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-850 hover:bg-slate-800 rounded-xl border border-slate-700/80 transition"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => handleOpenConsent(conn)}
                        className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Accept & Choose Info to Share</span>
                      </button>
                    </>
                  )}

                  {conn.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleCancelConnection(conn.id)}
                      className="px-3 py-1.5 text-xs font-semibold text-slate-400 hover:text-rose-400 bg-slate-850 rounded-xl border border-slate-750 transition"
                    >
                      Revoke Connection
                    </button>
                  )}
                </div>
              </div>

              {/* Recruiter Message */}
              {conn.recruiterNote && (
                <div className="bg-slate-850/80 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-300">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Message from Recruiter
                  </span>
                  <p className="italic text-slate-200">
                    "{conn.recruiterNote}"
                  </p>
                </div>
              )}

              {/* Disclosed Sharing Summary (if ACCEPTED) */}
              {conn.status === 'ACCEPTED' && (
                <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-xl p-3.5 text-xs text-slate-300 space-y-1">
                  <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider block">
                    Information Disclosed by You
                  </span>
                  <div className="flex flex-wrap gap-2 text-[11px] pt-1">
                    {conn.shareFullName && (
                      <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-200 border border-slate-700">
                        ✓ Full Name
                      </span>
                    )}
                    {conn.shareEmail && (
                      <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-200 border border-slate-700">
                        ✓ Contact Email
                      </span>
                    )}
                    {conn.shareUniversity && (
                      <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-200 border border-slate-700">
                        ✓ Academic Background
                      </span>
                    )}
                    {conn.shareBio && (
                      <span className="px-2 py-0.5 rounded bg-slate-850 text-slate-200 border border-slate-700">
                        ✓ Bio Statement
                      </span>
                    )}
                  </div>
                  {conn.customMessage && (
                    <p className="text-[11px] text-slate-400 italic pt-1">
                      Your note: "{conn.customMessage}"
                    </p>
                  )}
                </div>
              )}

              {/* Skills matched overview */}
              {conn.requiredSkills && conn.requiredSkills.length > 0 && (
                <div className="pt-2 border-t border-slate-800 flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 mr-1">Opportunity Capabilities:</span>
                  {conn.requiredSkills.map((s) => (
                    <span
                      key={s.skillId}
                      className="px-2 py-0.5 rounded bg-slate-850 text-teal-300 border border-slate-750 text-[11px]"
                    >
                      {s.skillName}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer Timestamp */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-800/60">
                <span>Received: {new Date(conn.createdAt).toLocaleDateString()}</span>
                {conn.status === 'PENDING' && (
                  <span className="text-amber-400/80 font-mono">
                    Expires: {new Date(conn.expiresAt).toLocaleDateString()} (14-day window)
                  </span>
                )}
                {conn.status === 'ACCEPTED' && conn.respondedAt && (
                  <span className="text-emerald-400/80">
                    Connected on {new Date(conn.respondedAt).toLocaleDateString()}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Consent Modal */}
      <ConnectionConsentModal
        isOpen={consentModalOpen}
        onClose={() => {
          setConsentModalOpen(false);
          setActiveConnection(null);
        }}
        connection={activeConnection}
        studentProfile={studentProfile}
        onConfirm={handleConfirmAccept}
      />
    </div>
  );
};

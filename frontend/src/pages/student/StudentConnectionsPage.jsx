import React, { useState, useEffect } from 'react';
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
  XCircle
} from 'lucide-react';

export const StudentConnectionsPage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const [connections, setConnections] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [selectedFilter, setSelectedFilter] = useState('ALL');

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
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Decision Pending
          </span>
        );
      case 'ACCEPTED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Connected
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
            <XCircle className="w-3 h-3 text-slate-400" />
            Declined
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <Clock className="w-3 h-3" />
            Expired
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Trusted Connections
            </h1>
            {pendingCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                {pendingCount} Decision Pending
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Recruiters interested in connecting based on your demonstrated evidence footprint.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-xs">
          {['ALL', 'PENDING', 'ACCEPTED', 'PAST'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedFilter === filter
                  ? 'bg-indigo-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
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
              className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-xs transition space-y-4"
            >
              {/* Top Row */}
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap mb-1.5">
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {conn.organizationName}
                    </span>
                    <span className="text-xs font-mono px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-200 uppercase">
                      {conn.opportunityType} • {conn.workType}
                    </span>
                    {renderStatusBadge(conn.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900">
                    {conn.opportunityTitle}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Recruiter: <span className="text-slate-800 font-semibold">{conn.recruiterName}</span>
                  </p>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {conn.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => handleOpenConsent(conn)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                      >
                        Review & Accept
                      </button>
                      <button
                        onClick={() => handleDecline(conn.id)}
                        className="px-3.5 py-2 bg-white border border-slate-200 text-slate-600 hover:text-slate-900 text-xs font-semibold rounded-xl transition"
                      >
                        Decline
                      </button>
                    </>
                  )}

                  {conn.status === 'ACCEPTED' && (
                    <button
                      onClick={() => handleCancelConnection(conn.id)}
                      className="px-3.5 py-2 bg-white border border-slate-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold rounded-xl transition"
                    >
                      Revoke Access
                    </button>
                  )}
                </div>
              </div>

              {/* Note */}
              {conn.requestNote && (
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-xs text-slate-700 leading-relaxed">
                  <span className="font-bold text-slate-900 block mb-0.5">Recruiter Note:</span>
                  "{conn.requestNote}"
                </div>
              )}
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
        onConfirm={handleConfirmAccept}
        connection={activeConnection}
        studentProfile={studentProfile}
      />
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { connectionApi } from '../../api/connectionApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { DisclosedProfileModal } from '../../components/connection/DisclosedProfileModal';
import { 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Eye, 
  Users,
  Briefcase,
  GraduationCap
} from 'lucide-react';

export const RecruiterConnectionsPage = () => {
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [selectedFilter, setSelectedFilter] = useState('ALL');

  // Disclosed modal state
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [selectedConnection, setSelectedConnection] = useState(null);

  const loadData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await connectionApi.getRecruiterConnections();
      setConnections(data || []);
    } catch (err) {
      console.error('Failed to load recruiter connections:', err);
      const errMsg = err.response?.data?.message || 'Could not load your candidate connections.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && (isRecruiter || isAdmin)) {
      loadData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isRecruiter, isAdmin]);

  const handleOpenProfile = (conn) => {
    setSelectedConnection(conn);
    setProfileModalOpen(true);
  };

  const handleCancelConnection = async (connId) => {
    try {
      await connectionApi.cancelRecruiterConnection(connId);
      setConnections((prev) =>
        prev.map((c) => (c.id === connId ? { ...c, status: 'CANCELLED', disclosedProfile: null } : c))
      );
      setAlert({ type: 'info', message: 'Connection disconnected.' });
    } catch (err) {
      const errMsg = err.response?.data?.message || 'Failed to cancel connection.';
      setAlert({ type: 'error', message: errMsg });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading connection records from database..." />
      </div>
    );
  }

  const filteredConnections = connections.filter((c) => {
    if (selectedFilter === 'ACCEPTED') return c.status === 'ACCEPTED';
    if (selectedFilter === 'PENDING') return c.status === 'PENDING';
    if (selectedFilter === 'PAST') return c.status === 'DECLINED' || c.status === 'EXPIRED' || c.status === 'CANCELLED';
    return true;
  });

  const connectedCount = connections.filter((c) => c.status === 'ACCEPTED').length;

  const renderStatusBadge = (status) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3 h-3 text-amber-600" />
            Waiting for Candidate Consent
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
            Candidate Declined
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            <Clock className="w-3 h-3" />
            Request Expired
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
            Disconnected
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
              Trusted Candidate Connections
            </h1>
            {connectedCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200">
                {connectedCount} Connected
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500">
            Candidates who consented to share their profile based on your opportunity requirements.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shrink-0 shadow-xs">
          {['ALL', 'ACCEPTED', 'PENDING', 'PAST'].map((filter) => (
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
          icon={Users}
          title="No candidate connections found"
          description="Request connection with candidate matches from your opportunities tab. When candidates consent, their contact details appear here."
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
                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
                      <Briefcase className="w-3.5 h-3.5" />
                      {conn.opportunityTitle}
                    </span>
                    {renderStatusBadge(conn.status)}
                  </div>

                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-indigo-600" />
                    <span>Candidate #{conn.studentId}</span>
                  </h3>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0">
                  {conn.status === 'ACCEPTED' && (
                    <>
                      <button
                        onClick={() => handleOpenProfile(conn)}
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center gap-1.5"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Inspect Profile</span>
                      </button>
                      <button
                        onClick={() => handleCancelConnection(conn.id)}
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-500 hover:text-rose-600 text-xs font-semibold rounded-xl transition"
                      >
                        Disconnect
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Disclosed Profile Modal */}
      <DisclosedProfileModal
        isOpen={profileModalOpen}
        onClose={() => {
          setProfileModalOpen(false);
          setSelectedConnection(null);
        }}
        connection={selectedConnection}
      />
    </div>
  );
};

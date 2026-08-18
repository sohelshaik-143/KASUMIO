import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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
  Mail, 
  Users,
  Briefcase,
  ExternalLink,
  GraduationCap
} from 'lucide-react';

export const RecruiterConnectionsPage = () => {
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const [connections, setConnections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const [selectedFilter, setSelectedFilter] = useState('ALL'); // 'ALL', 'ACCEPTED', 'PENDING', 'PAST'

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
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Clock className="w-3 h-3" />
            Waiting for Candidate Consent
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
            Candidate Declined
          </span>
        );
      case 'EXPIRED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-850 text-slate-500 border border-slate-750">
            <Clock className="w-3 h-3" />
            Request Expired
          </span>
        );
      case 'CANCELLED':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-500 border border-slate-700">
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
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Trusted Candidate Connections
            </h1>
            {connectedCount > 0 && (
              <span className="ml-1 px-2.5 py-0.5 text-[11px] font-bold rounded-lg bg-emerald-950/80 text-emerald-300 border border-emerald-800/80">
                {connectedCount} Connected
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Mutually consented connections with candidates discovered through demonstrable evidence matching.
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-xl p-1 shrink-0">
          {['ALL', 'ACCEPTED', 'PENDING', 'PAST'].map((filter) => (
            <button
              key={filter}
              onClick={() => setSelectedFilter(filter)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                selectedFilter === filter
                  ? 'bg-teal-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {filter === 'ALL' ? 'All Records' : filter.charAt(0) + filter.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* List */}
      {filteredConnections.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No candidate connections found"
          description="When you discover evidence-matched candidates in your opportunities and express interest, their connection status and consented contact details will appear here."
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredConnections.map((conn) => (
            <div
              key={conn.id}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 shadow-xl transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                {/* Header */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs sm:text-sm font-mono font-bold text-white bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-700/80">
                      {conn.disclosedProfile?.fullName || conn.candidateAlias}
                    </span>
                    {conn.status === 'ACCEPTED' ? (
                      <span className="text-[10px] uppercase tracking-wider text-emerald-400 font-mono font-semibold">
                        Identity Consented
                      </span>
                    ) : (
                      <span className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
                        Anonymous
                      </span>
                    )}
                  </div>
                  {renderStatusBadge(conn.status)}
                </div>

                {/* Opportunity Link */}
                <div className="text-xs">
                  <span className="text-slate-500">Opportunity:</span>{' '}
                  <Link
                    to={`/recruiter/opportunities/${conn.opportunityId}`}
                    className="font-semibold text-teal-300 hover:text-teal-200 underline underline-offset-2 transition"
                  >
                    {conn.opportunityTitle}
                  </Link>
                </div>

                {/* Status-specific context */}
                {conn.status === 'ACCEPTED' && conn.disclosedProfile && (
                  <div className="bg-slate-850/80 rounded-xl p-3.5 border border-slate-800 text-xs space-y-2">
                    {conn.disclosedProfile.email && (
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-300 font-mono text-[11px]">{conn.disclosedProfile.email}</span>
                        <a
                          href={`mailto:${conn.disclosedProfile.email}?subject=Opportunity: ${encodeURIComponent(conn.opportunityTitle)}`}
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-teal-600 hover:bg-teal-500 text-white font-semibold rounded-lg text-[11px] transition shadow-sm active:scale-98"
                        >
                          <Mail className="w-3 h-3" />
                          <span>Email</span>
                        </a>
                      </div>
                    )}
                    {conn.disclosedProfile.university && (
                      <div className="flex items-center gap-1.5 text-slate-300 text-[11px]">
                        <GraduationCap className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                        <span>
                          {conn.disclosedProfile.university}
                          {conn.disclosedProfile.graduationYear ? ` ('${conn.disclosedProfile.graduationYear.toString().slice(-2)})` : ''}
                        </span>
                      </div>
                    )}
                    {conn.disclosedProfile.customMessage && (
                      <p className="text-[11px] text-slate-300 italic pt-1 border-t border-slate-800">
                        "{conn.disclosedProfile.customMessage}"
                      </p>
                    )}
                  </div>
                )}

                {conn.status === 'PENDING' && (
                  <div className="bg-slate-850/60 rounded-xl p-3 border border-slate-800 text-xs text-slate-400 space-y-1">
                    <p className="text-slate-300 text-[11px]">
                      Interest sent to candidate. Waiting for candidate to accept and select permitted contact info.
                    </p>
                    {conn.recruiterNote && (
                      <p className="text-[11px] italic text-slate-400">
                        Your note: "{conn.recruiterNote}"
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
                <span className="font-mono text-[11px]">Requested: {new Date(conn.createdAt).toLocaleDateString()}</span>
                {conn.status === 'ACCEPTED' && (
                  <button
                    onClick={() => handleOpenProfile(conn)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-850 hover:bg-slate-800 text-teal-300 text-xs font-semibold rounded-xl border border-slate-700/80 transition"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Permitted Info</span>
                  </button>
                )}
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
        onCancelConnection={handleCancelConnection}
      />
    </div>
  );
};

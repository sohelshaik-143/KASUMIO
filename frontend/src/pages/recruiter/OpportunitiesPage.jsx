import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { 
  Briefcase, 
  Plus, 
  Users, 
  Layers, 
  MapPin, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ArrowRight 
} from 'lucide-react';

export const OpportunitiesPage = () => {
  const { user, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });
  const navigate = useNavigate();

  const fetchOpportunities = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await opportunityApi.getMyOpportunities();
      setOpportunities(data || []);
    } catch (err) {
      console.error('Failed to load opportunities:', err);
      const errMsg = err.response?.data?.message || 'Could not fetch your defined opportunities.';
      setAlert({ type: 'error', message: errMsg });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && (isRecruiter || isAdmin)) {
      fetchOpportunities();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isRecruiter, isAdmin]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12">
        <LoadingSpinner size="lg" text="Loading your opportunities..." />
      </div>
    );
  }

  const statusBadge = (status) => {
    switch (status) {
      case 'PUBLISHED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-950/80 text-emerald-300 border border-emerald-700/80">
            <CheckCircle2 className="w-3 h-3" />
            PUBLISHED
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800/60">
            <Clock className="w-3 h-3" />
            DRAFT
          </span>
        );
      case 'CLOSED':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
            <XCircle className="w-3 h-3" />
            CLOSED
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
              <Briefcase className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Role Opportunities & Matching
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Define precise capability requirements and discover anonymous candidates with proven evidence.
          </p>
        </div>

        <Link
          to="/recruiter/opportunities/new"
          className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
        >
          <Plus className="w-4 h-4" />
          <span>New Opportunity</span>
        </Link>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {opportunities.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No opportunities yet"
          description="Create your first role or project requirement to begin matching candidates against demonstrable skill evidence."
          actionText="Create an Opportunity"
          onAction={() => navigate('/recruiter/opportunities/new')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {opportunities.map((opp) => (
            <Link
              key={opp.id}
              to={`/recruiter/opportunities/${opp.id}`}
              className="bg-slate-900/90 border border-slate-800/90 hover:border-slate-700/80 rounded-2xl p-5 transition-all flex flex-col justify-between group shadow-sm"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded-md bg-slate-850 text-slate-300 border border-slate-700 uppercase tracking-wider">
                    {opp.type} • {opp.workType}
                  </span>
                  {statusBadge(opp.status)}
                </div>

                <h3 className="text-base font-bold text-white group-hover:text-teal-300 transition-colors mb-2 tracking-tight">
                  {opp.title}
                </h3>

                {opp.location && (
                  <p className="text-xs text-slate-400 flex items-center gap-1 mb-4">
                    <MapPin className="w-3.5 h-3.5 text-slate-500" />
                    <span>{opp.location}</span>
                  </p>
                )}
              </div>

              <div className="pt-3 border-t border-slate-800/80 mt-2 flex items-center justify-between text-xs text-slate-400">
                <div className="flex items-center gap-3">
                  <span className="flex items-center gap-1 text-slate-300">
                    <Layers className="w-3.5 h-3.5 text-teal-400" />
                    <span>{opp.requiredSkillsCount} req / {opp.preferredSkillsCount} pref</span>
                  </span>
                </div>

                <div className="flex items-center gap-1 text-teal-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <Users className="w-3.5 h-3.5" />
                  <span>{opp.matchedCandidatesCount} Matched</span>
                  <ArrowRight className="w-3 h-3 ml-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/studentApi';
import { evidenceApi } from '../api/evidenceApi';
import { skillApi } from '../api/skillApi';
import { opportunityApi } from '../api/opportunityApi';
import { connectionApi } from '../api/connectionApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { TemplatePickerModal } from '../components/evidence/TemplatePickerModal';
import { EvidenceFormModal } from '../components/evidence/EvidenceFormModal';
import { 
  ShieldCheck, 
  Target, 
  CheckCircle2, 
  Plus, 
  ArrowRight, 
  Sparkles,
  Inbox,
  UserCheck,
  FileCode2,
  Users,
  Briefcase,
  Clock,
  Compass,
  TrendingUp,
  Award
} from 'lucide-react';

import { NextMoveCard } from '../components/action/NextMoveCard';

export const DashboardPage = () => {
  const { user, isStudent, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [skills, setSkills] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Modals
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      if (isStudent) {
        const [dashMetrics, evidenceList, skillList, templateList, connList] = await Promise.all([
          studentApi.getDashboard().catch((err) => {
            console.warn('Could not fetch student metrics:', err);
            return { totalEvidenceCount: 0, verifiedEvidenceCount: 0, careerGoalsCount: 0, profileComplete: false };
          }),
          evidenceApi.getMyEvidence().catch((err) => {
            console.warn('Could not fetch student evidence:', err);
            return [];
          }),
          skillApi.getAllSkills().catch(() => []),
          evidenceApi.getTemplates().catch(() => []),
          connectionApi.getStudentConnections().catch(() => []),
        ]);
        setMetrics(dashMetrics);
        setRecentEvidence(evidenceList || []);
        setSkills(skillList || []);
        setTemplates(templateList || []);
        setConnections(connList || []);
      } else if (isRecruiter || isAdmin) {
        // Recruiter / Admin overview
        const [pendingList, skillList, connList, oppList] = await Promise.all([
          evidenceApi.getPendingVerification().catch((err) => {
            console.warn('Could not fetch pending verifications:', err);
            return [];
          }),
          skillApi.getAllSkills().catch(() => []),
          connectionApi.getRecruiterConnections().catch(() => []),
          opportunityApi.getMyOpportunities().catch(() => []),
        ]);
        setRecentEvidence(pendingList || []);
        setSkills(skillList || []);
        setConnections(connList || []);
        setOpportunities(oppList || []);
      }
    } catch (err) {
      console.error('Error loading dashboard data:', err);
      setError('Could not load live dashboard data from the database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboardData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, user?.role, isStudent, isRecruiter, isAdmin]);

  const handleOpenTemplatePicker = () => {
    setTemplateModalOpen(true);
  };

  const handleSelectTemplate = (template) => {
    setSelectedTemplate(template);
    setTemplateModalOpen(false);
    setFormModalOpen(true);
  };

  const handleOpenDirectForm = () => {
    setSelectedTemplate(null);
    setFormModalOpen(true);
  };

  const handleCreateEvidence = async (evidencePayload) => {
    await evidenceApi.createEvidence(evidencePayload);
    await loadDashboardData();
  };

  if (authLoading || loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Retrieving real database records..." />
      </div>
    );
  }

  // Recruiter / Admin Dashboard View
  if (isRecruiter || isAdmin) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Verifier & Recruiter Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Affiliation: <span className="text-teal-300 font-semibold">{user?.organizationName || 'Independent Reviewer'}</span>
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/recruiter/opportunities/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>New Opportunity</span>
            </Link>
            <Link
              to="/recruiter/verifications"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl shadow-sm transition"
            >
              <ShieldCheck className="w-4 h-4 text-teal-400" />
              <span>Verification Queue</span>
            </Link>
          </div>
        </div>

        {/* Real Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Role Opportunities
                </p>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-white mt-3 tracking-tight">
                {opportunities.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {opportunities.filter(o => o.status === 'PUBLISHED').length} active published roles
              </p>
            </div>
            <Link
              to="/recruiter/opportunities"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-800/80"
            >
              <span>Manage Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Pending Verifications
                </p>
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-amber-400 mt-3 tracking-tight">
                {recentEvidence.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Proof items awaiting accredited review
              </p>
            </div>
            <Link
              to="/recruiter/verifications"
              className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-800/80"
            >
              <span>Review Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between hover:border-slate-700 transition shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Trusted Connections
                </p>
                <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-emerald-400 mt-3 tracking-tight">
                {connections.filter(c => c.status === 'ACCEPTED').length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                {connections.filter(c => c.status === 'PENDING').length} pending consent requests
              </p>
            </div>
            <Link
              to="/recruiter/connections"
              className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-800/80"
            >
              <span>Candidate Connections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                  Taxonomy Skills
                </p>
                <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-teal-400 mt-3 tracking-tight">
                {skills.length}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                Standardized skills across taxonomy
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-800/80">
              Deterministic Matching
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard View
  const hasNoEvidence = metrics?.totalEvidenceCount === 0;
  const pendingStudentRequests = connections.filter(c => c.status === 'PENDING').length;
  const activeStudentConnections = connections.filter(c => c.status === 'ACCEPTED').length;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Student Intelligence Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Verifiable evidence footprint for <span className="text-slate-200 font-semibold">{user?.fullName || user?.email}</span>
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={handleOpenTemplatePicker}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-850 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-xs font-semibold rounded-xl transition"
          >
            <FileCode2 className="w-4 h-4 text-teal-400" />
            <span>Use Template</span>
          </button>

          <button
            onClick={handleOpenDirectForm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold rounded-xl shadow-sm transition active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Evidence</span>
          </button>
        </div>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* Feature 04: Personal Career Action & Adaptive Growth Engine */}
      <NextMoveCard onActionUpdated={loadDashboardData} />

      {/* Connection Alert Banner for Student */}
      {pendingStudentRequests > 0 && (
        <div className="bg-amber-950/40 border border-amber-800/60 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shadow-sm animate-in fade-in-50">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-900/50 text-amber-300 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-bold text-amber-200">
                You have {pendingStudentRequests} incoming recruiter connection request{pendingStudentRequests > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-300/80 mt-0.5 leading-relaxed">
                Recruiters discovered your proof footprint and requested to connect. You control what information to disclose.
              </p>
            </div>
          </div>
          <Link
            to="/student/connections"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white text-xs font-semibold rounded-xl shrink-0 transition shadow-sm active:scale-98"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* Real Computed Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Evidence */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Total Evidence
            </span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            {metrics?.totalEvidenceCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Submissions in platform database
          </p>
        </div>

        {/* Verified Evidence */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Verified Evidence
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-400 mt-3 tracking-tight">
            {metrics?.verifiedEvidenceCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Attested by accredited organizations
          </p>
        </div>

        {/* Career Goals */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              Career Goals
            </span>
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-white mt-3 tracking-tight">
            {metrics?.careerGoalsCount ?? 0}
          </p>
          <p className="text-xs text-slate-400 mt-1">
            Defined target role goals
          </p>
        </div>

        {/* Trusted Connections */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-2xl p-5 hover:border-slate-700 transition flex flex-col justify-between shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                Connections
              </span>
              <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-teal-400 mt-3 tracking-tight">
              {activeStudentConnections}
            </p>
            <p className="text-xs text-slate-400 mt-1">
              Active recruiter connections
            </p>
          </div>
          <Link
            to="/student/connections"
            className="text-xs text-teal-400 hover:text-teal-300 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-800/80"
          >
            <span>Manage Connections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Feature Navigation Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/student/intelligence"
          className="p-6 rounded-2xl bg-gradient-to-br from-teal-950/40 via-slate-900 to-indigo-950/40 border border-teal-500/30 hover:border-teal-500/60 transition group flex flex-col justify-between space-y-4 shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30">
                <Sparkles className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20">
                What-If Simulator
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-4 group-hover:text-teal-300 transition tracking-tight">
              Career Intelligence Hub
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Explore your Career Capability Map, Technology Demand rankings, and model what-if scenarios.
            </p>
          </div>
          <div className="text-xs font-bold text-teal-400 flex items-center gap-1 pt-2">
            <span>Explore Graphs & Models</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/student/discover"
          className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between space-y-4 shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Compass className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                Discovery Feed
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-4 group-hover:text-indigo-300 transition tracking-tight">
              Discover Opportunities
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Search roles with multi-dimensional criteria and review deterministic evidence matches.
            </p>
          </div>
          <div className="text-xs font-bold text-indigo-400 flex items-center gap-1 pt-2">
            <span>Discover Roles</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>

        <Link
          to="/student/gaps"
          className="p-6 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-slate-700 transition group flex flex-col justify-between space-y-4 shadow-lg"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                <TrendingUp className="w-5 h-5" />
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-300 border border-amber-500/20">
                Skill Leverage
              </span>
            </div>
            <h3 className="text-base font-bold text-white mt-4 group-hover:text-amber-300 transition tracking-tight">
              Technology Gap Roadmap
            </h3>
            <p className="text-xs text-slate-400 mt-1 leading-relaxed">
              Identify highest-leverage missing capabilities to unblock opportunities.
            </p>
          </div>
          <div className="text-xs font-bold text-amber-400 flex items-center gap-1 pt-2">
            <span>View Roadmap</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
      </div>

      {/* Evidence Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">Recent Evidence Submissions</h2>
          <Link
            to="/evidence"
            className="text-xs font-semibold text-teal-400 hover:text-teal-300 flex items-center gap-1"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {hasNoEvidence ? (
          <EmptyState
            icon={Inbox}
            title="No evidence submitted yet"
            description="Your proof record starts empty. Use a standardized template to add your first demonstrative code repository, project, or certificate."
            actionText="Use a Template to Begin"
            onAction={handleOpenTemplatePicker}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recentEvidence.slice(0, 4).map((ev) => (
              <EvidenceCard key={ev.id} evidence={ev} />
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <TemplatePickerModal
        isOpen={templateModalOpen}
        onClose={() => setTemplateModalOpen(false)}
        templates={templates}
        onSelectTemplate={handleSelectTemplate}
      />

      <EvidenceFormModal
        isOpen={formModalOpen}
        onClose={() => {
          setFormModalOpen(false);
          setSelectedTemplate(null);
        }}
        onSubmit={handleCreateEvidence}
        skills={skills}
        templateData={selectedTemplate}
      />
    </div>
  );
};

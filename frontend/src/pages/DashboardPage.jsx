import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { studentApi } from '../api/studentApi';
import { evidenceApi } from '../api/evidenceApi';
import { skillApi } from '../api/skillApi';
import { opportunityApi } from '../api/opportunityApi';
import { discoveryApi } from '../api/discoveryApi';
import { outcomeApi } from '../api/outcomeApi';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { Alert } from '../components/common/Alert';
import { EmptyState } from '../components/common/EmptyState';
import { EvidenceCard } from '../components/evidence/EvidenceCard';
import { TemplatePickerModal } from '../components/evidence/TemplatePickerModal';
import { EvidenceFormModal } from '../components/evidence/EvidenceFormModal';
import { CapabilityDetailModal } from '../components/capability/CapabilityDetailModal';
import { NextMoveCard } from '../components/action/NextMoveCard';
import { OutcomeIntelligenceSection } from '../components/action/OutcomeIntelligenceSection';

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
  Award,
  Search,
  CheckCircle,
  AlertTriangle,
  FolderGit2,
  Calendar,
  Layers,
  ChevronRight,
  BookmarkCheck,
  Bookmark,
  Building,
  MapPin,
  ExternalLink
} from 'lucide-react';

export const DashboardPage = () => {
  const { user, isStudent, isRecruiter, isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [recentEvidence, setRecentEvidence] = useState([]);
  const [skills, setSkills] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [connections, setConnections] = useState([]);
  const [opportunities, setOpportunities] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [outcomeData, setOutcomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Capability detail inspection modal state
  const [selectedCapability, setSelectedCapability] = useState(null);
  const [capabilityModalOpen, setCapabilityModalOpen] = useState(false);

  // Modals for Evidence creation
  const [templateModalOpen, setTemplateModalOpen] = useState(false);
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  // Search input state
  const [dashboardQuery, setDashboardQuery] = useState('');

  const loadDashboardData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      setError(null);

      if (isStudent) {
        const [dashMetrics, evidenceList, skillList, templateList, connList, recsList, outcomeIntelligence] = await Promise.all([
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
          discoveryApi.getRecommendations({ limit: 5 }).catch(() => []),
          outcomeApi.getOutcomeIntelligence().catch(() => null),
        ]);
        setMetrics(dashMetrics);
        setRecentEvidence(evidenceList || []);
        setSkills(skillList || []);
        setTemplates(templateList || []);
        setConnections(connList || []);
        setRecommendations(recsList || []);
        setOutcomeData(outcomeIntelligence);
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
      setError('Could not load live dashboard data from database.');
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

  const handleRecalculateOutcome = async () => {
    try {
      const fresh = await outcomeApi.recalculate();
      setOutcomeData(fresh);
    } catch (err) {
      console.error('Error recalculating outcome intelligence:', err);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (!dashboardQuery.trim()) return;
    navigate(`/student/discover?query=${encodeURIComponent(dashboardQuery.trim())}`);
  };

  const handleCapabilityClick = (skillObj, state) => {
    const evidenceCount = recentEvidence.filter((e) => e.skillId === skillObj.id).length;
    setSelectedCapability({
      id: skillObj.id,
      name: skillObj.name,
      category: skillObj.category,
      state: state,
      confidence: state === 'Strong' ? 95 : state === 'Developing' ? 70 : 40,
      reasoning: state === 'Strong'
        ? `Backed by ${evidenceCount} verified/active portfolio proof submission(s).`
        : state === 'Developing'
        ? `Supported by practical evidence. Submit additional verification to reach Strong state.`
        : `Identified capability in growth stage. Recommend adding project repository proof.`,
      lastActivity: 'Recent'
    });
    setCapabilityModalOpen(true);
  };

  // Derive time-of-day greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  if (authLoading || loading) {
    return (
      <div className="py-16">
        <LoadingSpinner size="lg" text="Retrieving live career records..." />
      </div>
    );
  }

  // Recruiter / Admin View
  if (isRecruiter || isAdmin) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
        {/* Header */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.fullName || user?.email.split('@')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Affiliation: <span className="text-indigo-700 font-semibold">{user?.organizationName || 'Accredited Reviewer'}</span> • Verifier Portal
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Link
              to="/recruiter/opportunities/new"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Create Opportunity</span>
            </Link>
            <Link
              to="/recruiter/verifications"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <ShieldCheck className="w-4 h-4 text-indigo-600" />
              <span>Verification Queue</span>
            </Link>
          </div>
        </div>

        {/* Real Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-indigo-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Role Opportunities
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Briefcase className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
                {opportunities.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {opportunities.filter(o => o.status === 'PUBLISHED').length} published active roles
              </p>
            </div>
            <Link
              to="/recruiter/opportunities"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
            >
              <span>Manage Opportunities</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-amber-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Pending Verifications
                </span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-amber-600 mt-3 tracking-tight">
                {recentEvidence.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Proof submissions awaiting verification
              </p>
            </div>
            <Link
              to="/recruiter/verifications"
              className="text-xs text-amber-600 hover:text-amber-700 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
            >
              <span>Review Audit Queue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs hover:border-emerald-200 transition">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Candidate Connections
                </span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
                  <Users className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-emerald-600 mt-3 tracking-tight">
                {connections.filter(c => c.status === 'ACCEPTED').length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                {connections.filter(c => c.status === 'PENDING').length} pending consent requests
              </p>
            </div>
            <Link
              to="/recruiter/connections"
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-4 pt-3 border-t border-slate-100"
            >
              <span>Candidate Connections</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between shadow-xs">
            <div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Taxonomy Skills
                </span>
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <p className="text-3xl font-extrabold text-indigo-600 mt-3 tracking-tight">
                {skills.length}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Standardized skills across taxonomy
              </p>
            </div>
            <span className="text-[11px] text-slate-400 font-mono mt-4 pt-3 border-t border-slate-100">
              Deterministic Evidence Matcher
            </span>
          </div>
        </div>
      </div>
    );
  }

  // Student Dashboard View
  const totalEv = metrics?.totalEvidenceCount ?? recentEvidence.length;
  const verifiedEv = metrics?.verifiedEvidenceCount ?? recentEvidence.filter((e) => e.verified).length;
  const pendingRequests = connections.filter((c) => c.status === 'PENDING').length;

  // Compute capability states from skills and evidence
  const demonstratedSkillIds = new Set(recentEvidence.map((e) => e.skillId));
  const verifiedSkillIds = new Set(recentEvidence.filter((e) => e.verified).map((e) => e.skillId));

  const strongCapabilities = skills.filter((s) => verifiedSkillIds.has(s.id));
  const developingCapabilities = skills.filter((s) => demonstratedSkillIds.has(s.id) && !verifiedSkillIds.has(s.id));
  const learningCapabilities = skills.filter((s) => !demonstratedSkillIds.has(s.id)).slice(0, 6);

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* 1. Personalized Greeting Banner & Global Search */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
                Career Intelligence Active
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {verifiedEv} / {totalEv} Proof Verified
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              {getGreeting()}, {user?.fullName || user?.email.split('@')[0]}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-xl">
              Your career roadmap is connected to real evidence. Explore opportunities, track capability states, and unlock next moves.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center gap-2 flex-wrap shrink-0">
            <button
              onClick={handleOpenTemplatePicker}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition"
            >
              <FileCode2 className="w-4 h-4 text-indigo-600" />
              <span>Use Template</span>
            </button>

            <button
              onClick={handleOpenDirectForm}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl shadow-xs transition active:scale-98"
            >
              <Plus className="w-4 h-4" />
              <span>Add Evidence</span>
            </button>
          </div>
        </div>

        {/* Global Opportunity / Skill / Company Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative">
          <Search className="w-4.5 h-4.5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={dashboardQuery}
            onChange={(e) => setDashboardQuery(e.target.value)}
            placeholder="Global search across opportunities, taxonomy skills, or target companies..."
            className="w-full pl-10 pr-24 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition"
          />
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold rounded-lg transition"
          >
            Search
          </button>
        </form>
      </div>

      <Alert type="error" message={error} onClose={() => setError(null)} />

      {/* 2. Today's Focus & Next Move Engine */}
      <NextMoveCard onActionUpdated={loadDashboardData} />

      {/* Feature 05: Evidence -> Outcome Intelligence & Graphical Progression */}
      <OutcomeIntelligenceSection outcomeData={outcomeData} onRecalculate={handleRecalculateOutcome} />

      {/* Incoming Connection Alert */}
      {pendingRequests > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-100 text-amber-700 shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-amber-900">
                You have {pendingRequests} incoming recruiter connection request{pendingRequests > 1 ? 's' : ''}
              </p>
              <p className="text-xs text-amber-700 mt-0.5">
                Recruiters discovered your proof footprint and requested to connect. You choose what information to disclose.
              </p>
            </div>
          </div>
          <Link
            to="/student/connections"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-xl shrink-0 transition shadow-xs"
          >
            <span>Review Requests</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      )}

      {/* 3. Capability Snapshot (Evidence-Backed States) */}
      <div className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                Capability Snapshot
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Evidence-backed states replacing arbitrary AI scores. Click any capability to inspect supporting proof items.
            </p>
          </div>

          <Link
            to="/student/intelligence"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Full Capability Map</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Capability States Columns */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Strong Capabilities (Verified Proof) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Strong ({strongCapabilities.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Verified Proof</span>
            </div>

            {strongCapabilities.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No verified capabilities yet. Request verification on uploaded evidence.
              </p>
            ) : (
              <div className="space-y-2">
                {strongCapabilities.map((sk) => (
                  <button
                    key={sk.id}
                    onClick={() => handleCapabilityClick(sk, 'Strong')}
                    className="w-full p-2.5 rounded-lg bg-white border border-emerald-200 hover:border-emerald-400 transition text-left flex items-center justify-between text-xs shadow-xs group"
                  >
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600">{sk.name}</span>
                      <span className="text-[10px] text-slate-400 block">{sk.category}</span>
                    </div>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                      Verified
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Developing Capabilities (Submitted Evidence) */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                Developing ({developingCapabilities.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Submitted Proof</span>
            </div>

            {developingCapabilities.length === 0 ? (
              <p className="text-xs text-slate-500 italic py-2">
                No developing capabilities. Submit code repos or certificates to build proof.
              </p>
            ) : (
              <div className="space-y-2">
                {developingCapabilities.map((sk) => (
                  <button
                    key={sk.id}
                    onClick={() => handleCapabilityClick(sk, 'Developing')}
                    className="w-full p-2.5 rounded-lg bg-white border border-indigo-200 hover:border-indigo-400 transition text-left flex items-center justify-between text-xs shadow-xs group"
                  >
                    <div>
                      <span className="font-bold text-slate-900 group-hover:text-indigo-600">{sk.name}</span>
                      <span className="text-[10px] text-slate-400 block">{sk.category}</span>
                    </div>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Developing
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Learning / Target Capabilities */}
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                Learning ({learningCapabilities.length})
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Growth Target</span>
            </div>

            <div className="space-y-2">
              {learningCapabilities.map((sk) => (
                <button
                  key={sk.id}
                  onClick={() => handleCapabilityClick(sk, 'Learning')}
                  className="w-full p-2.5 rounded-lg bg-white border border-slate-200 hover:border-indigo-300 transition text-left flex items-center justify-between text-xs shadow-xs group"
                >
                  <div>
                    <span className="font-semibold text-slate-800 group-hover:text-indigo-600">{sk.name}</span>
                    <span className="text-[10px] text-slate-400 block">{sk.category}</span>
                  </div>
                  <span className="text-[10px] font-medium text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Learning
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* 4. Evidence Sync & Portfolio Status */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Proof Items</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">{totalEv}</p>
          <p className="text-xs text-slate-500 mt-1">Direct portfolio submissions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-emerald-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Verified Proof</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-emerald-600 mt-3 tracking-tight">{verifiedEv}</p>
          <p className="text-xs text-slate-500 mt-1">Attested by accredited institutions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-indigo-200 transition">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Career Goals</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Target className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-extrabold text-slate-900 mt-3 tracking-tight">
            {metrics?.careerGoalsCount ?? 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Target role goals defined</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Recruiter Network</span>
              <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
                <Users className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-extrabold text-indigo-600 mt-3 tracking-tight">
              {connections.filter((c) => c.status === 'ACCEPTED').length}
            </p>
            <p className="text-xs text-slate-500 mt-1">Active recruiter connections</p>
          </div>
          <Link
            to="/student/connections"
            className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold flex items-center gap-1 mt-3 pt-2 border-t border-slate-100"
          >
            <span>Manage Connections</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* 5. Recommended Opportunities (Explainable Match UX) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Recommended Opportunities
            </h2>
            <p className="text-xs text-slate-500">
              Matched strictly to your verified skills and capability footprint.
            </p>
          </div>
          <Link
            to="/student/discover"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>Explore All Roles</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recommendations.length === 0 ? (
          <EmptyState
            icon={Compass}
            title="No opportunities found"
            description="Explore our opportunity market to discover open engineering, research, and technical roles."
            actionText="Discover Roles"
            onAction={() => navigate('/student/discover')}
          />
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {recommendations.slice(0, 3).map((opp) => {
              const supportedCount = opp.strongSkills?.length || 0;
              const gapCount = opp.missingSkills?.length || 0;
              const totalSpecs = supportedCount + gapCount || 5;

              return (
                <div
                  key={opp.id}
                  className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4 transition group"
                >
                  {/* Top Row: Match Level + Company + Work Mode + Deadline */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <span className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                        <span>
                          {opp.matchCategory === 'STRONG' ? 'Strong Match' : opp.matchCategory === 'GOOD' ? 'Good Match' : 'Potential Match'}
                        </span>
                        <span className="text-[10px] font-normal text-indigo-500 ml-1">
                          ({supportedCount}/{totalSpecs} core requirements supported)
                        </span>
                      </span>

                      <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                        <Building className="w-3.5 h-3.5 text-slate-500" />
                        {opp.organizationName}
                      </span>

                      <span className="text-xs font-mono px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                        {opp.type} • {opp.workType}
                      </span>
                    </div>

                    {opp.deadline && (
                      <span className="inline-flex items-center gap-1 text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 shrink-0">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{opp.deadlineNote || opp.deadline}</span>
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <div>
                    <h3
                      onClick={() => navigate(`/student/discover/${opp.id}`)}
                      className="text-lg font-bold text-slate-900 cursor-pointer hover:text-indigo-600 transition"
                    >
                      {opp.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Location: <span className="text-slate-700 font-medium">{opp.location || 'Remote'}</span>
                      {opp.compensation && ` • Compensation: ${opp.compensation}`}
                    </p>
                  </div>

                  {/* Explainable Why It Matches Highlight */}
                  {opp.whyRecommended && (
                    <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-3.5 text-xs">
                      <span className="font-bold text-indigo-900 block mb-0.5">Why this matches:</span>
                      <p className="text-slate-700 leading-relaxed">{opp.whyRecommended}</p>
                    </div>
                  )}

                  {/* Supported Specs & Missing Gap Chips */}
                  <div className="flex flex-wrap items-center justify-between gap-3 text-xs pt-1">
                    {opp.strongSkills?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-emerald-700 text-[11px] uppercase tracking-wider">Supported:</span>
                        {opp.strongSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200"
                          >
                            <CheckCircle className="w-3 h-3 text-emerald-600" />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {opp.missingSkills?.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-bold text-amber-700 text-[11px] uppercase tracking-wider">Missing Gap:</span>
                        {opp.missingSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200"
                          >
                            <AlertTriangle className="w-3 h-3 text-amber-600" />
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Action Link */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">Deterministic Matcher</span>
                    <button
                      onClick={() => navigate(`/student/discover/${opp.id}`)}
                      className="inline-flex items-center gap-1 font-bold text-indigo-600 hover:text-indigo-700"
                    >
                      <span>View Match Breakdown & Apply</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 6. Recent Evidence Footprint Submissions */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
            Recent Evidence Footprint
          </h2>
          <Link
            to="/evidence"
            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
          >
            <span>View Portfolio</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentEvidence.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No evidence submitted yet"
            description="Your evidence footprint starts empty. Use a standardized template to add your first demonstrative code repository, project, or certificate."
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

      <CapabilityDetailModal
        isOpen={capabilityModalOpen}
        onClose={() => setCapabilityModalOpen(false)}
        capability={selectedCapability}
        evidenceList={recentEvidence}
        opportunities={recommendations}
      />
    </div>
  );
};

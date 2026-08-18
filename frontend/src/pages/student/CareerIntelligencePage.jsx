import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Compass,
  Sparkles,
  TrendingUp,
  Layers,
  Network,
  Zap,
  Target,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  BookOpen,
  ShieldCheck,
  Search,
  ExternalLink,
  Plus,
  RefreshCw,
  HelpCircle,
  BarChart3,
  Sliders,
  FolderGit2
} from 'lucide-react';

export const CareerIntelligencePage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [intelligence, setIntelligence] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [catalog, setCatalog] = useState([]);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Navigation tab within Career Intelligence: 'HUB' | 'GRAPH' | 'WHAT_IF' | 'CLUSTERS' | 'ROI'
  const [activeTab, setActiveTab] = useState('HUB');

  // What-If Simulator State
  const [simulatedSkill, setSimulatedSkill] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState(null);

  // Capability Map Graph Search & Filter State
  const [graphSearch, setGraphSearch] = useState('');
  const [selectedEcosystem, setSelectedEcosystem] = useState('ALL');
  const [selectedNode, setSelectedNode] = useState(null);

  const fetchData = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const [intelRes, graphRes, catRes] = await Promise.all([
        discoveryApi.getCareerIntelligence(),
        discoveryApi.getTechnologyGraph(),
        discoveryApi.getTechnologyCatalog()
      ]);
      setIntelligence(intelRes);
      setGraphData(graphRes);
      setCatalog(catRes || []);

      // Default what-if skill to highest leverage if available
      if (intelRes?.highestLeverageSkills?.length > 0) {
        setSimulatedSkill(intelRes.highestLeverageSkills[0].skillName);
      }
    } catch (err) {
      console.error('Failed to load career intelligence:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not compute career intelligence.'
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchData();
    }
  }, [authLoading, user?.id, isStudent]);

  const handleRunWhatIf = async (skillNameToTest) => {
    const targetName = skillNameToTest || simulatedSkill;
    if (!targetName) return;

    try {
      setSimulating(true);
      const res = await discoveryApi.simulateCareerWhatIf({ targetSkillName: targetName });
      setWhatIfResult(res);
    } catch (err) {
      console.error('What-if simulation failed:', err);
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to compute counterfactual simulation.'
      });
    } finally {
      setSimulating(false);
    }
  };

  // Filtered graph nodes
  const filteredNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    return graphData.nodes.filter((node) => {
      const matchesSearch = !graphSearch || node.name.toLowerCase().includes(graphSearch.toLowerCase());
      const matchesEco = selectedEcosystem === 'ALL' || (node.ecosystem && node.ecosystem.toLowerCase() === selectedEcosystem.toLowerCase());
      return matchesSearch && matchesEco;
    });
  }, [graphData?.nodes, graphSearch, selectedEcosystem]);

  // Unique ecosystems in graph
  const ecosystems = useMemo(() => {
    if (!graphData?.nodes) return [];
    const set = new Set();
    graphData.nodes.forEach((n) => {
      if (n.ecosystem) set.add(n.ecosystem);
    });
    return Array.from(set);
  }, [graphData?.nodes]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20">
        <LoadingSpinner size="lg" text="Computing career intelligence, technology relationships & what-if models..." />
      </div>
    );
  }

  const hasData = intelligence && intelligence.totalOpportunitiesAnalyzed > 0;

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-400 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Technology Intelligence & Career What-If
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 max-w-3xl">
            Evidence-backed career roadmap generated from real opportunity demand and deterministic technology relationships.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/evidence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-500 text-white rounded-xl text-xs font-semibold transition shadow-sm active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portfolio Proof</span>
          </button>
          <button
            onClick={() => navigate('/student/discover')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-700/80 rounded-xl text-xs font-semibold transition"
          >
            <Compass className="w-4 h-4" />
            <span>Discover Roles</span>
          </button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Highest Leverage Banner */}
      {intelligence?.highestLeverageRecommendation && (
        <div className="p-5 rounded-2xl bg-gradient-to-r from-teal-950/60 via-slate-900 to-indigo-950/60 border border-teal-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-teal-500/20 text-teal-300 border border-teal-500/30 mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-teal-400">
                Highest-Leverage Capability Insight
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5">
                {intelligence.highestLeverageRecommendation}
              </p>
            </div>
          </div>

          {intelligence?.highestLeverageSkills?.length > 0 && (
            <button
              onClick={() => {
                setActiveTab('WHAT_IF');
                handleRunWhatIf(intelligence.highestLeverageSkills[0].skillName);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 text-xs font-bold rounded-xl transition shrink-0 shadow-sm active:scale-98"
            >
              <span>Simulate Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('HUB')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'HUB'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Market Demand & Leverage</span>
        </button>

        <button
          onClick={() => setActiveTab('GRAPH')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'GRAPH'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Career Capability Map</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
            {graphData?.nodes?.length || 0}
          </span>
        </button>

        <button
          onClick={() => {
            setActiveTab('WHAT_IF');
            if (!whatIfResult && simulatedSkill) {
              handleRunWhatIf(simulatedSkill);
            }
          }}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'WHAT_IF'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Career What-If Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('CLUSTERS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'CLUSTERS'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Opportunity Clusters</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
            {intelligence?.opportunityClusters?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ROI')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'ROI'
              ? 'bg-teal-600 text-white shadow-sm'
              : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Evidence ROI Blueprints</span>
        </button>
      </div>

      {/* TAB 1: HUB (Market Demand, Skill Leverage, Quick Stats) */}
      {activeTab === 'HUB' && (
        <div className="space-y-8">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Live Opportunities Surveyed
              </span>
              <div className="text-3xl font-black text-white">
                {intelligence?.totalOpportunitiesAnalyzed || 0}
              </div>
              <p className="text-xs text-slate-500">Active role requirements indexed</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                Demonstrated Proof Artifacts
              </span>
              <div className="text-3xl font-black text-teal-400">
                {intelligence?.studentVerifiedEvidenceCount || 0}
              </div>
              <p className="text-xs text-slate-500">Factual evidence pieces on file</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                Most Demanded Skill
              </span>
              <div className="text-2xl font-black text-indigo-300 truncate">
                {intelligence?.topDemandedTechnologies?.[0]?.technologyName || 'None'}
              </div>
              <p className="text-xs text-slate-500">
                Demanded in {intelligence?.topDemandedTechnologies?.[0]?.opportunityCount || 0} active roles
              </p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
              <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                Highest Leverage Gap
              </span>
              <div className="text-2xl font-black text-amber-300 truncate">
                {intelligence?.highestLeverageSkills?.[0]?.skillName || 'None'}
              </div>
              <p className="text-xs text-slate-500">
                Could unblock {intelligence?.highestLeverageSkills?.[0]?.opportunitiesUnlockedCount || 0} roles
              </p>
            </div>
          </div>

          {/* Graph 4: Market Technology Demand */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-teal-400" />
                  <h2 className="text-lg font-bold text-white">
                    Graph 4 — Market Technology Demand
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Actual frequency of technologies across live active opportunities in KASUMO.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800">
                Deterministic Counts
              </span>
            </div>

            {!intelligence?.topDemandedTechnologies?.length ? (
              <EmptyState
                icon={BarChart3}
                title="No Demand Data Available"
                description="Publish active opportunities with required skills to populate market technology demand."
              />
            ) : (
              <div className="space-y-3.5">
                {intelligence.topDemandedTechnologies.map((item, idx) => {
                  const maxCount = intelligence.topDemandedTechnologies[0]?.opportunityCount || 1;
                  const percentage = Math.round((item.opportunityCount / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-200">{item.technologyName}</span>
                          <span className="text-[10px] text-slate-500">({item.category})</span>
                          {item.studentPossesses ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Possessed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 border border-slate-700">
                              <span>Missing</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-teal-400 font-bold">{item.opportunityCount} roles</span>
                          <span className="text-slate-500 text-[10px]">
                            ({item.requiredCount} req / {item.preferredCount} pref)
                          </span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-950 rounded-full h-3 overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.studentPossesses
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-400'
                              : 'bg-gradient-to-r from-teal-600 to-indigo-500'
                          }`}
                          style={{ width: `${Math.max(8, percentage)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Skill Leverage Engine Table */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-white">
                    Skill Leverage Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Identifies which missing capability unlocks the highest number of active opportunities.
                </p>
              </div>
            </div>

            {!intelligence?.highestLeverageSkills?.length ? (
              <EmptyState
                icon={Zap}
                title="All Demanded Technologies Covered"
                description="Your evidence portfolio covers all current actively demanded technologies."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Skill</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Roles Unlocked</th>
                      <th className="px-4 py-3">Strategic Rationale</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-sans">
                    {intelligence.highestLeverageSkills.map((gap, i) => (
                      <tr key={i} className="hover:bg-slate-850/50 transition">
                        <td className="px-4 py-3.5 font-bold text-white flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-slate-800 text-[10px] font-mono flex items-center justify-center text-teal-400">
                            {i + 1}
                          </span>
                          <span>{gap.skillName}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400">{gap.category}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-300 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20">
                            +{gap.opportunitiesUnlockedCount}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-400 max-w-xs truncate">
                          {gap.rationale}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('WHAT_IF');
                              handleRunWhatIf(gap.skillName);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-teal-400 hover:text-teal-300 hover:underline"
                          >
                            <span>Model What-If</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: GRAPH (Career Capability Map - Graph 1) */}
      {activeTab === 'GRAPH' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search technology in graph (e.g. Docker, Python)..."
                  value={graphSearch}
                  onChange={(e) => setGraphSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-400 font-semibold shrink-0">Ecosystem:</span>
              <button
                onClick={() => setSelectedEcosystem('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedEcosystem === 'ALL'
                    ? 'bg-teal-600 text-white'
                    : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                All
              </button>
              {ecosystems.map((eco) => (
                <button
                  key={eco}
                  onClick={() => setSelectedEcosystem(eco)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                    selectedEcosystem === eco
                      ? 'bg-teal-600 text-white'
                      : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                  }`}
                >
                  {eco}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Visualization Container */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-teal-400" />
                  <h2 className="text-lg font-bold text-white">
                    Graph 1 — Career Capability Map
                  </h2>
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Interactive technology ecosystem graph generated from Java backend relationships and your factual evidence status.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verified / Strong
                </span>
                <span className="flex items-center gap-1 text-teal-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-500" /> Moderate
                </span>
                <span className="flex items-center gap-1 text-amber-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Inferred
                </span>
                <span className="flex items-center gap-1 text-slate-500">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-700" /> Missing Proof
                </span>
              </div>
            </div>

            {/* Interactive Grid of Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {filteredNodes.map((node) => {
                const isPossessed = node.possessionStatus === 'VERIFIED' || node.possessionStatus === 'STRONG' || node.possessionStatus === 'MODERATE';
                const isSelected = selectedNode?.id === node.id;

                let borderClass = 'border-slate-800';
                let bgClass = 'bg-slate-950';
                let textClass = 'text-slate-300';
                let statusBadge = 'bg-slate-800 text-slate-400';

                if (node.possessionStatus === 'VERIFIED') {
                  borderClass = 'border-emerald-500/40';
                  bgClass = 'bg-emerald-950/20';
                  textClass = 'text-emerald-200 font-bold';
                  statusBadge = 'bg-emerald-500/20 text-emerald-300';
                } else if (node.possessionStatus === 'STRONG') {
                  borderClass = 'border-emerald-500/30';
                  bgClass = 'bg-emerald-950/10';
                  textClass = 'text-emerald-300 font-bold';
                  statusBadge = 'bg-emerald-500/10 text-emerald-400';
                } else if (node.possessionStatus === 'MODERATE') {
                  borderClass = 'border-teal-500/30';
                  bgClass = 'bg-teal-950/10';
                  textClass = 'text-teal-300 font-bold';
                  statusBadge = 'bg-teal-500/10 text-teal-400';
                } else if (node.possessionStatus === 'INFERRED') {
                  borderClass = 'border-amber-500/30';
                  bgClass = 'bg-amber-950/10';
                  textClass = 'text-amber-300';
                  statusBadge = 'bg-amber-500/10 text-amber-400';
                }

                if (isSelected) {
                  borderClass = 'border-teal-400 ring-2 ring-teal-500/40';
                }

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-xl border text-left transition hover:scale-[1.02] flex flex-col justify-between h-28 ${bgClass} ${borderClass}`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">
                        {node.ecosystem || 'Tech'}
                      </div>
                      <div className={`text-xs mt-0.5 truncate ${textClass}`}>
                        {node.name}
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-[10px]">
                      <span className={`px-1.5 py-0.5 rounded-md font-mono ${statusBadge}`}>
                        {node.possessionStatus}
                      </span>
                      {node.opportunityDemandCount > 0 && (
                        <span className="text-teal-400 font-mono font-bold">
                          {node.opportunityDemandCount} opps
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Node Inspector Drawer */}
            {selectedNode && (
              <div className="p-5 rounded-2xl bg-slate-950 border border-teal-500/40 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-black text-white">{selectedNode.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-teal-300 font-mono">
                        {selectedNode.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1">
                      Ecosystem: <span className="text-slate-200 font-semibold">{selectedNode.ecosystem || 'General'}</span> | Subcategory: <span className="text-slate-200 font-semibold">{selectedNode.subcategory || 'Technology'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('WHAT_IF');
                        handleRunWhatIf(selectedNode.name);
                      }}
                      className="px-3 py-1.5 bg-teal-600 hover:bg-teal-500 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Model What-If</span>
                    </button>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="px-2.5 py-1 text-slate-400 hover:text-white text-xs"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-bold">YOUR EVIDENCE STATUS</span>
                    <span className="text-sm font-bold text-teal-300 mt-0.5 block">{selectedNode.possessionStatus}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-bold">CONFIDENCE METRIC</span>
                    <span className="text-sm font-bold text-white mt-0.5 block">{Math.round(selectedNode.confidence * 100)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                    <span className="text-slate-500 text-[10px] block font-bold">MARKET DEMAND</span>
                    <span className="text-sm font-bold text-indigo-300 mt-0.5 block">{selectedNode.opportunityDemandCount} Active Opportunities</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CAREER WHAT-IF SIMULATOR (Graph 8) */}
      {activeTab === 'WHAT_IF' && (
        <div className="space-y-6">
          {/* Simulator Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 shadow-xl">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Sliders className="w-5 h-5 text-teal-400" />
              <div>
                <h2 className="text-lg font-bold text-white">
                  Graph 8 — Career What-If & Counterfactual Intelligence
                </h2>
                <p className="text-xs text-slate-400">
                  Select a technology to model what happens to your opportunity match scores if you build and verify proof for it.
                </p>
              </div>
            </div>

            {/* Quick selector chips */}
            <div className="space-y-2">
              <span className="text-xs text-slate-400 font-bold block">Quick Select High-Leverage Technologies:</span>
              <div className="flex flex-wrap gap-2">
                {(intelligence?.highestLeverageSkills || []).map((gap) => (
                  <button
                    key={gap.skillId}
                    onClick={() => {
                      setSimulatedSkill(gap.skillName);
                      handleRunWhatIf(gap.skillName);
                    }}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                      simulatedSkill === gap.skillName
                        ? 'bg-teal-500 text-slate-950'
                        : 'bg-slate-950 text-slate-300 hover:text-white border border-slate-800'
                    }`}
                  >
                    <span>{gap.skillName}</span>
                    <span className="text-[10px] font-mono opacity-80">(+{gap.opportunitiesUnlockedCount})</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Input */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
              <div className="flex-1 relative">
                <input
                  type="text"
                  placeholder="Or enter any technology from taxonomy (e.g. Docker, Rust, PyTorch, Kubernetes)..."
                  value={simulatedSkill}
                  onChange={(e) => setSimulatedSkill(e.target.value)}
                  className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500"
                />
              </div>

              <button
                onClick={() => handleRunWhatIf(simulatedSkill)}
                disabled={!simulatedSkill || simulating}
                className="px-6 py-2.5 bg-teal-600 hover:bg-teal-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-sm"
              >
                {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{simulating ? 'Computing Modeled Scenario...' : 'Simulate Evidence Impact'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output */}
          {whatIfResult && (
            <div className="space-y-6">
              {/* Disclaimer Notice */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-200">
                  <span className="font-bold uppercase tracking-wide block mb-0.5">
                    {whatIfResult.scenarioDisclaimer}
                  </span>
                  Calculations are deterministic based on real requirements from active published opportunities in KASUMO.
                </div>
              </div>

              {/* Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                    Currently Relevant Roles (Score ≥ 50)
                  </span>
                  <div className="text-3xl font-black text-white">
                    {whatIfResult.currentRelevantOpportunitiesCount}
                  </div>
                  <p className="text-xs text-slate-500">Baseline match coverage</p>
                </div>

                <div className="bg-slate-900 border border-teal-500/30 rounded-2xl p-5 space-y-1 shadow-lg bg-teal-950/10">
                  <span className="text-[10px] font-bold text-teal-400 uppercase tracking-wider">
                    Modeled Relevant Roles (With {whatIfResult.simulatedSkillName})
                  </span>
                  <div className="text-3xl font-black text-teal-300">
                    {whatIfResult.modeledRelevantOpportunitiesCount}
                  </div>
                  <p className="text-xs text-teal-500 font-bold">
                    +{whatIfResult.netOpportunitiesUnlocked} newly unblocked opportunities
                  </p>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-1 shadow-lg">
                  <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">
                    Average Score Impact
                  </span>
                  <div className="text-3xl font-black text-indigo-300">
                    {whatIfResult.currentAverageMatchScore} → {whatIfResult.modeledAverageMatchScore}
                  </div>
                  <p className="text-xs text-slate-500">Across all surveyed opportunities</p>
                </div>
              </div>

              {/* Impacted Opportunities Table */}
              {whatIfResult.topImpactedOpportunities?.length > 0 && (
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Target className="w-4 h-4 text-teal-400" />
                    <span>Top Opportunities Boosted by {whatIfResult.simulatedSkillName}</span>
                  </h3>

                  <div className="space-y-3">
                    {whatIfResult.topImpactedOpportunities.map((opp) => (
                      <div
                        key={opp.opportunityId}
                        className="p-4 rounded-xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-slate-700 transition"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white text-xs sm:text-sm">{opp.opportunityTitle}</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-400">
                              {opp.organizationName}
                            </span>
                            {opp.isNewlyUnlocked && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                                NEWLY UNLOCKED
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-slate-400 mt-1">
                            Match category moves from <span className="text-slate-300 font-semibold">{opp.currentMatchCategory}</span> to <span className="text-teal-300 font-bold">{opp.modeledMatchCategory}</span>.
                          </p>
                        </div>

                        <div className="flex items-center gap-4 shrink-0">
                          <div className="text-right">
                            <div className="text-xs font-mono text-slate-400">
                              {opp.currentScore} → <span className="text-teal-400 font-bold text-sm">{opp.modeledScore}</span>
                            </div>
                            <span className="text-[10px] font-bold text-emerald-400 font-mono">
                              +{opp.scoreDelta} pts
                            </span>
                          </div>

                          <button
                            onClick={() => navigate(`/student/discover/${opp.opportunityId}`)}
                            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 transition"
                          >
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 4: CLUSTERS (Graph 7) */}
      {activeTab === 'CLUSTERS' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold text-white">
                  Graph 7 — Opportunity Clusters & Ecosystems
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Groupings of real active opportunities into technology domains with your personalized readiness metrics.
              </p>
            </div>

            {!intelligence?.opportunityClusters?.length ? (
              <EmptyState
                icon={Layers}
                title="No Opportunity Clusters"
                description="Publish active opportunities across diverse ecosystems to populate clusters."
              />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {intelligence.opportunityClusters.map((cluster, i) => (
                  <div
                    key={i}
                    className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-4 hover:border-slate-700 transition flex flex-col justify-between"
                  >
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-white">{cluster.clusterName}</span>
                        <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-lg bg-teal-500/10 text-teal-300 border border-teal-500/20">
                          {cluster.opportunityCount} roles
                        </span>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Your Average Match:</span>
                        <span className="font-mono font-bold text-slate-200">{cluster.averageMatchScore}%</span>
                      </div>

                      <div className="pt-2">
                        <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1.5">
                          Dominant Technologies
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {cluster.keyTechnologies.map((tech, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-slate-900 text-slate-300 border border-slate-800"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="border-t border-slate-900 pt-3">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold mb-1">
                        Sample Active Roles
                      </span>
                      <ul className="text-xs text-slate-400 space-y-1">
                        {cluster.sampleOpportunityTitles.map((t, idx) => (
                          <li key={idx} className="truncate flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                            <span>{t}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 5: EVIDENCE ROI BLUEPRINTS */}
      {activeTab === 'ROI' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-6 shadow-xl">
            <div className="border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2">
                <FolderGit2 className="w-5 h-5 text-teal-400" />
                <h2 className="text-lg font-bold text-white">
                  Evidence ROI Recommendations
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Multi-capability project templates that fulfill 3 to 5 capability gaps in one genuine verifiable portfolio artifact.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {(intelligence?.recommendedRoiProjects || []).map((project, i) => (
                <div
                  key={i}
                  className="p-5 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col justify-between space-y-4 hover:border-teal-500/40 transition shadow-lg"
                >
                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                        {project.targetDomain}
                      </span>
                      <h3 className="text-sm font-black text-white mt-1.5">{project.projectTitle}</h3>
                      <p className="text-xs text-slate-400 mt-1 leading-relaxed">{project.projectDescription}</p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-bold">
                        Skills Verified by this Single Project
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {project.targetedSkills.map((s, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] font-bold px-2 py-0.5 rounded-md bg-teal-500/10 text-teal-300 border border-teal-500/20"
                          >
                            ✓ {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                      <span className="font-bold text-slate-300 block">Implementation Roadmap:</span>
                      <p>{project.implementationBlueprint}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-900 pt-4 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      Unblocks approx. <strong className="text-teal-400 font-mono">+{project.opportunitiesUnlockedEstimate} roles</strong>
                    </span>

                    <button
                      onClick={() => navigate('/evidence')}
                      className="px-3.5 py-1.5 bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold rounded-xl transition flex items-center gap-1 shadow-sm"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Submit Proof</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CareerIntelligencePage;

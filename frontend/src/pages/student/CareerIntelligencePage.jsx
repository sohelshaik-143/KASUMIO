import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { outcomeApi } from '../../api/outcomeApi';
import { OutcomeIntelligenceSection } from '../../components/action/OutcomeIntelligenceSection';
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
  const [outcomeData, setOutcomeData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Navigation tab within Career Intelligence: 'HUB' | 'OUTCOME' | 'GRAPH' | 'WHAT_IF' | 'CLUSTERS' | 'ROI'
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
      const [intelRes, graphRes, catRes, outcomeRes] = await Promise.all([
        discoveryApi.getCareerIntelligence(),
        discoveryApi.getTechnologyGraph(),
        discoveryApi.getTechnologyCatalog(),
        outcomeApi.getOutcomeIntelligence().catch(() => null)
      ]);
      setIntelligence(intelRes);
      setGraphData(graphRes);
      setCatalog(catRes || []);
      setOutcomeData(outcomeRes);

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

  const handleRecalculateOutcome = async () => {
    try {
      const fresh = await outcomeApi.recalculate();
      setOutcomeData(fresh);
    } catch (err) {
      console.error('Error recalculating outcome intelligence:', err);
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Technology Intelligence & Career What-If
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-3xl">
            Evidence-backed career roadmap generated from real opportunity demand and deterministic technology relationships.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/evidence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-semibold transition shadow-xs active:scale-98"
          >
            <Plus className="w-4 h-4" />
            <span>Add Portfolio Proof</span>
          </button>
          <button
            onClick={() => navigate('/student/discover')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <Compass className="w-4 h-4 text-indigo-600" />
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
        <div className="p-5 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-start gap-3.5">
            <div className="p-2.5 rounded-xl bg-indigo-600 text-white shadow-xs mt-0.5">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase tracking-widest text-indigo-700">
                Highest-Leverage Capability Insight
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-900 mt-0.5">
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
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl transition shrink-0 shadow-xs active:scale-98"
            >
              <span>Simulate Impact</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      )}

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('HUB')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'HUB'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Market Demand & Leverage</span>
        </button>

        <button
          onClick={() => setActiveTab('OUTCOME')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'OUTCOME'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Evidence → Outcome Progression</span>
        </button>

        <button
          onClick={() => setActiveTab('GRAPH')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'GRAPH'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>Career Capability Map</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-indigo-100 text-indigo-700 font-mono">
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
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Sliders className="w-4 h-4" />
          <span>Career What-If Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('CLUSTERS')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'CLUSTERS'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Opportunity Clusters</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-slate-100 text-slate-700 font-mono">
            {intelligence?.opportunityClusters?.length || 0}
          </span>
        </button>

        <button
          onClick={() => setActiveTab('ROI')}
          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition flex items-center gap-2 ${
            activeTab === 'ROI'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
          }`}
        >
          <FolderGit2 className="w-4 h-4" />
          <span>Evidence ROI Blueprints</span>
        </button>
      </div>

      {/* TAB 0: OUTCOME INTELLIGENCE & PROGRESSION */}
      {activeTab === 'OUTCOME' && (
        <OutcomeIntelligenceSection outcomeData={outcomeData} onRecalculate={handleRecalculateOutcome} />
      )}

      {/* TAB 1: HUB (Market Demand, Skill Leverage, Quick Stats) */}
      {activeTab === 'HUB' && (
        <div className="space-y-8">
          {/* Quick Metrics Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                Live Opportunities Surveyed
              </span>
              <div className="text-3xl font-black text-slate-900">
                {intelligence?.totalOpportunitiesAnalyzed || 0}
              </div>
              <p className="text-xs text-slate-500">Active role requirements indexed</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                Demonstrated Proof Artifacts
              </span>
              <div className="text-3xl font-black text-emerald-600">
                {intelligence?.studentVerifiedEvidenceCount || 0}
              </div>
              <p className="text-xs text-slate-500">Factual evidence pieces on file</p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                Most Demanded Skill
              </span>
              <div className="text-2xl font-black text-indigo-600 truncate">
                {intelligence?.topDemandedTechnologies?.[0]?.technologyName || 'None'}
              </div>
              <p className="text-xs text-slate-500">
                Demanded in {intelligence?.topDemandedTechnologies?.[0]?.opportunityCount || 0} active roles
              </p>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-xs">
              <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">
                Highest Leverage Gap
              </span>
              <div className="text-2xl font-black text-amber-600 truncate">
                {intelligence?.highestLeverageSkills?.[0]?.skillName || 'None'}
              </div>
              <p className="text-xs text-slate-500">
                Could unblock {intelligence?.highestLeverageSkills?.[0]?.opportunitiesUnlockedCount || 0} roles
              </p>
            </div>
          </div>

          {/* Market Technology Demand Chart */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Market Technology Demand Frequency
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Frequency of technologies required across live active opportunities in KASUMIO.
                </p>
              </div>
              <span className="text-[10px] font-mono text-slate-500 bg-slate-50 px-2.5 py-1 rounded-lg border border-slate-200">
                Deterministic Requirement Counts
              </span>
            </div>

            {!intelligence?.topDemandedTechnologies?.length ? (
              <EmptyState
                icon={BarChart3}
                title="No Demand Data Available"
                description="Publish active opportunities with required skills to populate market technology demand."
              />
            ) : (
              <div className="space-y-4">
                {intelligence.topDemandedTechnologies.map((item, idx) => {
                  const maxCount = intelligence.topDemandedTechnologies[0]?.opportunityCount || 1;
                  const percentage = Math.round((item.opportunityCount / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{item.technologyName}</span>
                          <span className="text-[10px] text-slate-400">({item.category})</span>
                          {item.studentPossesses ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                              <span>Possessed</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 border border-slate-200">
                              <span>Missing</span>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3 font-mono text-xs">
                          <span className="text-indigo-600 font-bold">{item.opportunityCount} roles</span>
                          <span className="text-slate-400 text-[10px]">
                            ({item.requiredCount} req / {item.preferredCount} pref)
                          </span>
                        </div>
                      </div>

                      {/* Bar */}
                      <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden border border-slate-200/80">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            item.studentPossesses
                              ? 'bg-emerald-500'
                              : 'bg-indigo-600'
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
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Skill Leverage Engine
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
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
                <table className="w-full text-left text-xs text-slate-700">
                  <thead className="bg-slate-50 text-slate-500 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="px-4 py-3 rounded-l-xl">Skill</th>
                      <th className="px-4 py-3">Category</th>
                      <th className="px-4 py-3 text-center">Roles Unlocked</th>
                      <th className="px-4 py-3">Strategic Rationale</th>
                      <th className="px-4 py-3 text-right rounded-r-xl">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-sans">
                    {intelligence.highestLeverageSkills.map((gap, i) => (
                      <tr key={i} className="hover:bg-slate-50/80 transition">
                        <td className="px-4 py-3.5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-50 text-[10px] font-mono flex items-center justify-center text-indigo-700 font-bold">
                            {i + 1}
                          </span>
                          <span>{gap.skillName}</span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500">{gap.category}</td>
                        <td className="px-4 py-3.5 text-center">
                          <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 px-2 py-0.5 rounded-lg bg-amber-50 border border-amber-200">
                            +{gap.opportunitiesUnlockedCount}
                          </span>
                        </td>
                        <td className="px-4 py-3.5 text-slate-500 max-w-xs truncate">
                          {gap.rationale}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <button
                            onClick={() => {
                              setActiveTab('WHAT_IF');
                              handleRunWhatIf(gap.skillName);
                            }}
                            className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 hover:text-indigo-700 hover:underline"
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

      {/* TAB 2: GRAPH (Career Capability Map) */}
      {activeTab === 'GRAPH' && (
        <div className="space-y-6">
          {/* Controls Bar */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3 flex-1 max-w-md">
              <div className="relative w-full">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search technology in graph (e.g. Docker, Python)..."
                  value={graphSearch}
                  onChange={(e) => setGraphSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-slate-500 font-semibold shrink-0">Ecosystem:</span>
              <button
                onClick={() => setSelectedEcosystem('ALL')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition shrink-0 ${
                  selectedEcosystem === 'ALL'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
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
                      ? 'bg-indigo-600 text-white'
                      : 'bg-white text-slate-600 hover:text-slate-900 border border-slate-200'
                  }`}
                >
                  {eco}
                </button>
              ))}
            </div>
          </div>

          {/* Graph Container */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <Network className="w-5 h-5 text-indigo-600" />
                  <h2 className="text-lg font-bold text-slate-900">
                    Career Capability Map Graph
                  </h2>
                </div>
                <p className="text-xs text-slate-500 mt-0.5">
                  Interactive technology ecosystem graph generated from domain relationships and your factual evidence status.
                </p>
              </div>

              {/* Legend */}
              <div className="flex flex-wrap items-center gap-3 text-[10px] font-bold">
                <span className="flex items-center gap-1 text-emerald-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Verified / Strong
                </span>
                <span className="flex items-center gap-1 text-indigo-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" /> Developing
                </span>
                <span className="flex items-center gap-1 text-amber-700">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Learning
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-300" /> Missing Proof
                </span>
              </div>
            </div>

            {/* Interactive Grid of Nodes */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3.5">
              {filteredNodes.map((node) => {
                const isSelected = selectedNode?.id === node.id;

                let borderClass = 'border-slate-200';
                let bgClass = 'bg-white';
                let textClass = 'text-slate-800';
                let statusBadge = 'bg-slate-100 text-slate-500';

                if (node.possessionStatus === 'VERIFIED' || node.possessionStatus === 'STRONG') {
                  borderClass = 'border-emerald-300';
                  bgClass = 'bg-emerald-50/50';
                  textClass = 'text-emerald-900 font-bold';
                  statusBadge = 'bg-emerald-100 text-emerald-800';
                } else if (node.possessionStatus === 'MODERATE') {
                  borderClass = 'border-indigo-200';
                  bgClass = 'bg-indigo-50/40';
                  textClass = 'text-indigo-900 font-bold';
                  statusBadge = 'bg-indigo-100 text-indigo-800';
                } else if (node.possessionStatus === 'INFERRED') {
                  borderClass = 'border-amber-200';
                  bgClass = 'bg-amber-50/30';
                  textClass = 'text-amber-900';
                  statusBadge = 'bg-amber-100 text-amber-800';
                }

                if (isSelected) {
                  borderClass = 'border-indigo-600 ring-2 ring-indigo-500/30';
                }

                return (
                  <button
                    key={node.id}
                    onClick={() => setSelectedNode(node)}
                    className={`p-3.5 rounded-xl border text-left transition hover:shadow-xs flex flex-col justify-between h-28 ${bgClass} ${borderClass}`}
                  >
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
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
                        <span className="text-indigo-600 font-mono font-bold">
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
              <div className="p-5 rounded-2xl bg-slate-50 border border-indigo-200 space-y-4 animate-in fade-in duration-200">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{selectedNode.name}</h3>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-mono border border-indigo-200">
                        {selectedNode.category}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      Ecosystem: <span className="text-slate-800 font-semibold">{selectedNode.ecosystem || 'General'}</span> | Subcategory: <span className="text-slate-800 font-semibold">{selectedNode.subcategory || 'Technology'}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setActiveTab('WHAT_IF');
                        handleRunWhatIf(selectedNode.name);
                      }}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-bold transition flex items-center gap-1.5"
                    >
                      <Sliders className="w-3.5 h-3.5" />
                      <span>Model What-If</span>
                    </button>
                    <button
                      onClick={() => setSelectedNode(null)}
                      className="px-2.5 py-1 text-slate-400 hover:text-slate-700 text-xs font-medium"
                    >
                      Close
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-bold">EVIDENCE STATE</span>
                    <span className="text-sm font-bold text-indigo-700 mt-0.5 block">{selectedNode.possessionStatus}</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-bold">CONFIDENCE METRIC</span>
                    <span className="text-sm font-bold text-slate-900 mt-0.5 block">{Math.round(selectedNode.confidence * 100)}%</span>
                  </div>
                  <div className="p-3 rounded-xl bg-white border border-slate-200">
                    <span className="text-slate-400 text-[10px] block font-bold">MARKET DEMAND</span>
                    <span className="text-sm font-bold text-indigo-600 mt-0.5 block">{selectedNode.opportunityDemandCount} Active Opportunities</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: CAREER WHAT-IF SIMULATOR */}
      {activeTab === 'WHAT_IF' && (
        <div className="space-y-6">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5 shadow-xs">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Sliders className="w-5 h-5 text-indigo-600" />
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Career What-If & Counterfactual Simulator
                </h2>
                <p className="text-xs text-slate-500">
                  Select a technology to model what happens to your opportunity match scores if you build and verify proof for it.
                </p>
              </div>
            </div>

            {/* Quick selector chips */}
            <div className="space-y-2">
              <span className="text-xs text-slate-500 font-bold block">Quick Select High-Leverage Technologies:</span>
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
                        ? 'bg-indigo-600 text-white'
                        : 'bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200'
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
                  className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white"
                />
              </div>

              <button
                onClick={() => handleRunWhatIf(simulatedSkill)}
                disabled={!simulatedSkill || simulating}
                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs"
              >
                {simulating ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{simulating ? 'Computing Scenario...' : 'Simulate Evidence Impact'}</span>
              </button>
            </div>
          </div>

          {/* Simulation Output */}
          {whatIfResult && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-200 flex items-start gap-3">
                <HelpCircle className="w-5 h-5 text-indigo-600 shrink-0 mt-0.5" />
                <div className="text-xs text-indigo-950">
                  <span className="font-bold uppercase tracking-wide block mb-0.5">
                    {whatIfResult.scenarioDisclaimer}
                  </span>
                  Calculations are deterministic based on real requirements from active published opportunities in KASUMIO.
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    Currently Relevant Roles (Score ≥ 50)
                  </span>
                  <div className="text-3xl font-black text-slate-900">
                    {whatIfResult.currentRelevantOpportunitiesCount}
                  </div>
                  <p className="text-xs text-slate-500">Baseline match coverage</p>
                </div>

                <div className="bg-indigo-50/60 border border-indigo-200 rounded-xl p-5 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Modeled Relevant Roles (With {whatIfResult.simulatedSkillName})
                  </span>
                  <div className="text-3xl font-black text-indigo-600">
                    {whatIfResult.modeledRelevantOpportunitiesCount}
                  </div>
                  <p className="text-xs text-indigo-700 font-bold">
                    +{whatIfResult.netOpportunitiesUnlocked} newly unblocked opportunities
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-1 shadow-xs">
                  <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
                    Average Score Impact
                  </span>
                  <div className="text-3xl font-black text-indigo-600">
                    {whatIfResult.currentAverageMatchScore} → {whatIfResult.modeledAverageMatchScore}
                  </div>
                  <p className="text-xs text-slate-500">Across all surveyed opportunities</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

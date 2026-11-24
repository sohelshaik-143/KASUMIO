import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { outcomeApi } from '../../api/outcomeApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { OutcomeIntelligenceSection } from '../../components/action/OutcomeIntelligenceSection';
import { WhatIfSimulator } from '../../components/intelligence/WhatIfSimulator';
import { TechnologyGraphView } from '../../components/intelligence/TechnologyGraphView';
import { SkillDemandOverview } from '../../components/intelligence/SkillDemandOverview';
import {
  Compass,
  Sparkles,
  Layers,
  Network,
  Zap,
  BarChart3
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

  // Navigation tab: 'HUB' | 'WHAT_IF' | 'GRAPH' | 'OUTCOME'
  const [activeTab, setActiveTab] = useState('HUB');

  // What-If Simulator State
  const [simulatedSkill, setSimulatedSkill] = useState('');
  const [simulating, setSimulating] = useState(false);
  const [whatIfResult, setWhatIfResult] = useState(null);

  // Capability Map Graph State
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
      setAlert({ type: 'error', message: 'Failed to recalculate outcome telemetry.' });
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchData();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, isStudent]);

  const handleRunWhatIf = async (skillToModel) => {
    const skill = (skillToModel || simulatedSkill).trim();
    if (!skill) return;

    try {
      setSimulating(true);
      const result = await discoveryApi.simulateWhatIf({ skillName: skill });
      setWhatIfResult(result);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || `Failed to run simulation for ${skill}.`
      });
    } finally {
      setSimulating(false);
    }
  };

  const ecosystems = useMemo(() => {
    if (!graphData?.nodes) return [];
    const set = new Set();
    graphData.nodes.forEach((n) => {
      if (n.ecosystem) set.add(n.ecosystem);
    });
    return Array.from(set).sort();
  }, [graphData]);

  const filteredNodes = useMemo(() => {
    if (!graphData?.nodes) return [];
    return graphData.nodes.filter((node) => {
      const matchesSearch =
        !graphSearch.trim() ||
        node.name?.toLowerCase().includes(graphSearch.toLowerCase()) ||
        node.ecosystem?.toLowerCase().includes(graphSearch.toLowerCase());
      const matchesEco =
        selectedEcosystem === 'ALL' || node.ecosystem === selectedEcosystem;
      return matchesSearch && matchesEco;
    });
  }, [graphData, graphSearch, selectedEcosystem]);

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <LoadingSpinner size="lg" text="Analyzing institutional capability graph & demand intelligence..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-paper-border pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-verified-light border border-verified-border text-verified flex items-center justify-center">
              <Compass className="w-4 h-4" aria-hidden="true" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-ink tracking-tight font-serif">
              Career Intelligence Hub
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-ink-muted">
            Deterministic market telemetry, skill leverage modeling, and technology graph intelligence.
          </p>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-paper-border pb-1 overflow-x-auto" role="tablist" aria-label="Career intelligence sections">
        {[
          { key: 'HUB', label: 'Demand & Leverage', icon: BarChart3 },
          { key: 'WHAT_IF', label: 'What-If Simulator', icon: Sparkles },
          { key: 'GRAPH', label: 'Capability Map Graph', icon: Network },
          { key: 'OUTCOME', label: 'Outcome Intelligence', icon: Zap },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setActiveTab(tab.key)}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-xs font-semibold whitespace-nowrap transition focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified ${
                active
                  ? 'bg-verified text-white shadow-xs'
                  : 'bg-white text-ink-muted hover:text-ink border border-paper-border'
              }`}
            >
              <Icon className="w-4 h-4" aria-hidden="true" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Demand & Leverage */}
      {activeTab === 'HUB' && (
        <SkillDemandOverview
          intelligence={intelligence}
          onModelWhatIf={(skillName) => {
            setActiveTab('WHAT_IF');
            setSimulatedSkill(skillName);
            handleRunWhatIf(skillName);
          }}
        />
      )}

      {/* Tab 2: What-If Simulator */}
      {activeTab === 'WHAT_IF' && (
        <WhatIfSimulator
          simulatedSkill={simulatedSkill}
          setSimulatedSkill={setSimulatedSkill}
          simulating={simulating}
          onRunWhatIf={handleRunWhatIf}
          whatIfResult={whatIfResult}
          catalog={catalog}
          highestLeverageSkills={intelligence?.highestLeverageSkills}
          onNavigateOpportunities={() => navigate('/student/discover')}
          onNavigateAddEvidence={() =>
            navigate('/evidence', { state: { targetSkill: whatIfResult?.simulatedSkillName } })
          }
        />
      )}

      {/* Tab 3: Capability Graph */}
      {activeTab === 'GRAPH' && (
        <TechnologyGraphView
          graphSearch={graphSearch}
          setGraphSearch={setGraphSearch}
          selectedEcosystem={selectedEcosystem}
          setSelectedEcosystem={setSelectedEcosystem}
          ecosystems={ecosystems}
          filteredNodes={filteredNodes}
          selectedNode={selectedNode}
          setSelectedNode={setSelectedNode}
        />
      )}

      {/* Tab 4: Outcome Intelligence */}
      {activeTab === 'OUTCOME' && (
        <div className="space-y-6">
          <OutcomeIntelligenceSection outcomeData={outcomeData} onRecalculate={handleRecalculateOutcome} />
        </div>
      )}
    </div>
  );
};

export default CareerIntelligencePage;

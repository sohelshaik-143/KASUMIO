import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import { OpportunityFilterBar } from '../../components/discovery/OpportunityFilterBar';
import { DiscoveryOpportunityCard } from '../../components/discovery/DiscoveryOpportunityCard';
import {
  Compass,
  Bookmark,
  Clock,
  TrendingUp,
  Target,
  Sparkles
} from 'lucide-react';

/**
 * OpportunityDiscoveryPage coordinates discovery feeds, search, and matching telemetry.
 */
export const OpportunityDiscoveryPage = () => {
  const { user, isStudent, loading: authLoading } = useAuth();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [technologies, setTechnologies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [alert, setAlert] = useState({ type: null, message: null });

  // Filters and Query State
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('ALL'); // ALL, BEST, CLOSING, RECENT, STRETCH, SAVED
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [selectedType, setSelectedType] = useState('');
  const [selectedWorkType, setSelectedWorkType] = useState('');
  const [selectedMatchStrength, setSelectedMatchStrength] = useState('');
  const [selectedTech, setSelectedTech] = useState('');
  const [sortBy, setSortBy] = useState('MATCH_SCORE');

  const fetchCatalog = async () => {
    try {
      const data = await discoveryApi.getTechnologyCatalog();
      setTechnologies(data || []);
    } catch (err) {
      setAlert({ type: 'error', message: 'Unable to load full technology catalog. Search is still available.' });
    }
  };

  const fetchRecommendations = async (customParams = {}) => {
    if (!user) return;
    try {
      setFilterLoading(true);

      if (activeTab === 'SAVED') {
        const savedData = await discoveryApi.getSavedOpportunities();
        setOpportunities(savedData || []);
        return;
      }

      const params = {
        query: searchQuery || undefined,
        type: selectedType || undefined,
        workType: selectedWorkType || undefined,
        matchStrength: selectedMatchStrength || (activeTab === 'BEST' ? 'STRONG' : activeTab === 'STRETCH' ? 'STRETCH' : undefined),
        deadlineFilter: activeTab === 'CLOSING' ? 'CLOSING_SOON' : undefined,
        sortBy: activeTab === 'RECENT' ? 'RECENT' : activeTab === 'CLOSING' ? 'DEADLINE' : sortBy,
        technologies: selectedTech ? [selectedTech] : undefined,
        ...customParams
      };

      const data = await discoveryApi.getRecommendations(params);
      setOpportunities(data || []);
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Could not retrieve opportunity recommendations.'
      });
    } finally {
      setLoading(false);
      setFilterLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && user && isStudent) {
      fetchCatalog();
      fetchRecommendations();
    } else if (!authLoading && !user) {
      setLoading(false);
    }
  }, [authLoading, user?.id, isStudent, activeTab, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchRecommendations();
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedType('');
    setSelectedWorkType('');
    setSelectedMatchStrength('');
    setSelectedTech('');
    setSortBy('MATCH_SCORE');
    setActiveTab('ALL');
    fetchRecommendations({ query: '', type: '', workType: '', matchStrength: '', technologies: [] });
  };

  const handleToggleSave = async (oppId, currentSaved) => {
    try {
      if (currentSaved) {
        await discoveryApi.unsaveOpportunity(oppId);
        setOpportunities((prev) =>
          prev.map((o) => (o.id === oppId ? { ...o, isSaved: false, saveStatus: null } : o))
        );
        if (activeTab === 'SAVED') {
          setOpportunities((prev) => prev.filter((o) => o.id !== oppId));
        }
        setAlert({ type: 'info', message: 'Removed from saved opportunities.' });
      } else {
        await discoveryApi.saveOpportunity(oppId, 'SAVED');
        setOpportunities((prev) =>
          prev.map((o) => (o.id === oppId ? { ...o, isSaved: true, saveStatus: 'SAVED' } : o))
        );
        setAlert({ type: 'success', message: 'Opportunity saved to your portfolio.' });
      }
    } catch (err) {
      setAlert({ type: 'error', message: 'Failed to update saved status.' });
    }
  };

  const handleExpressInterest = async (oppId) => {
    try {
      await opportunityApi.expressInterest(oppId);
      setOpportunities((prev) =>
        prev.map((o) => (o.id === oppId ? { ...o, hasExpressedInterest: true } : o))
      );
      setAlert({
        type: 'success',
        message: 'Interest expressed! Hiring team can inspect your anonymous proof footprint.'
      });
    } catch (err) {
      setAlert({
        type: 'error',
        message: err.response?.data?.message || 'Failed to express interest.'
      });
    }
  };

  if (authLoading || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16">
        <LoadingSpinner size="lg" text="Analyzing opportunities matching your verified evidence & career goals..." />
      </div>
    );
  }

  const tabs = [
    { id: 'ALL', label: 'Recommended for You', icon: Sparkles },
    { id: 'BEST', label: 'Best Matches', icon: Target },
    { id: 'CLOSING', label: 'Closing Soon', icon: Clock },
    { id: 'RECENT', label: 'Recently Added', icon: Compass },
    { id: 'STRETCH', label: 'Stretch Opportunities', icon: TrendingUp },
    { id: 'SAVED', label: 'Saved Bookmarks', icon: Bookmark },
  ];

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Title & Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-100 text-teal-700 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight font-serif">
              Opportunity Discovery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Evidence-driven opportunities matched strictly to your verified skills, projects, and career direction.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/student/intelligence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-teal-50 hover:bg-teal-100 text-teal-800 border border-teal-200 rounded-xl text-xs font-semibold transition shadow-xs min-h-[44px]"
          >
            <Sparkles className="w-4 h-4 text-teal-700" />
            <span>Role Intelligence</span>
          </button>
          <button
            onClick={() => navigate('/student/gaps')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition min-h-[44px]"
          >
            <TrendingUp className="w-4 h-4 text-teal-700" />
            <span>Gap Analysis</span>
          </button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      <OpportunityFilterBar
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        filterPanelOpen={filterPanelOpen}
        setFilterPanelOpen={setFilterPanelOpen}
        selectedType={selectedType}
        setSelectedType={setSelectedType}
        selectedWorkType={selectedWorkType}
        setSelectedWorkType={setSelectedWorkType}
        selectedTech={selectedTech}
        setSelectedTech={setSelectedTech}
        technologies={technologies}
        sortBy={sortBy}
        setSortBy={setSortBy}
        onClearFilters={handleClearFilters}
        onApplyFilter={fetchRecommendations}
      />

      {/* Discovery Feeds Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition min-h-[44px] ${
                isActive
                  ? 'bg-teal-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-white border border-transparent hover:border-slate-200'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Opportunities Feed */}
      {filterLoading ? (
        <div className="py-16">
          <LoadingSpinner size="md" text="Evaluating live matches..." />
        </div>
      ) : opportunities.length === 0 ? (
        <EmptyState
          icon={Compass}
          title={activeTab === 'SAVED' ? 'No saved opportunities yet' : 'No matching opportunities found'}
          description={
            activeTab === 'SAVED'
              ? 'Bookmark interesting opportunities from the discovery feed to track them here.'
              : 'Try broadening your search query or reset your smart filters to explore more opportunities.'
          }
          actionText={activeTab === 'SAVED' ? 'Discover Opportunities' : 'Reset All Filters'}
          onAction={activeTab === 'SAVED' ? () => setActiveTab('ALL') : handleClearFilters}
        />
      ) : (
        <div className="grid grid-cols-1 gap-5">
          {opportunities.map((opp) => (
            <DiscoveryOpportunityCard
              key={opp.id}
              opportunity={opp}
              onInspect={(oppId) => navigate(`/student/discover/${oppId}`)}
              onToggleSave={handleToggleSave}
              onExpressInterest={handleExpressInterest}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default OpportunityDiscoveryPage;

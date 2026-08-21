import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { discoveryApi } from '../../api/discoveryApi';
import { opportunityApi } from '../../api/opportunityApi';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Alert } from '../../components/common/Alert';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Compass,
  Search,
  Filter,
  Sparkles,
  Bookmark,
  BookmarkCheck,
  Heart,
  Clock,
  MapPin,
  Building,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  SlidersHorizontal,
  X,
  Target,
  ArrowRight
} from 'lucide-react';

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
      console.error('Failed to load technology catalog:', err);
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
      console.error('Failed to load opportunities:', err);
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

  return (
    <div className="space-y-6 sm:space-y-8 animate-in fade-in-50 duration-200">
      {/* Page Title & Hero */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center">
              <Compass className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Opportunity Discovery
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 max-w-2xl">
            Evidence-driven opportunities matched strictly to your verified skills, projects, and career direction.
          </p>
        </div>

        {/* Quick Action Navigation Links */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => navigate('/student/intelligence')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-xl text-xs font-semibold transition shadow-xs active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>Career Intelligence & What-If</span>
          </button>
          <button
            onClick={() => navigate('/student/gaps')}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-xl text-xs font-semibold transition"
          >
            <TrendingUp className="w-4 h-4 text-indigo-600" />
            <span>Gap Analysis</span>
          </button>
        </div>
      </div>

      <Alert
        type={alert.type}
        message={alert.message}
        onClose={() => setAlert({ type: null, message: null })}
      />

      {/* Natural Language Search Bar */}
      <div className="space-y-2.5">
        <form onSubmit={handleSearchSubmit} className="relative">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder='Search roles: e.g. "Remote Java internships", "AI opportunities involving RAG", "Spring Boot"...'
              className="w-full pl-11 pr-28 py-3.5 bg-white border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-2xl text-sm text-slate-900 placeholder-slate-400 shadow-xs transition outline-none"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setFilterPanelOpen(!filterPanelOpen)}
                className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition ${
                  filterPanelOpen || selectedType || selectedWorkType || selectedTech
                    ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
                title="Toggle smart filters"
              >
                <SlidersHorizontal className="w-4 h-4" />
                <span className="hidden sm:inline">Filters</span>
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Discover
              </button>
            </div>
          </div>
        </form>

        {/* Natural Language Example Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-400 text-[11px] font-semibold shrink-0">Try searching:</span>
          {[
            'Find remote Java internships',
            'AI opportunities involving RAG',
            'Beginner cybersecurity roles',
            'Closing this week',
            'Matched to Spring Boot'
          ].map((chip, idx) => (
            <button
              key={idx}
              onClick={() => {
                setSearchQuery(chip);
                fetchRecommendations({ query: chip });
              }}
              className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-indigo-600 border border-slate-200 text-[11px] font-medium transition shrink-0"
            >
              "{chip}"
            </button>
          ))}
        </div>
      </div>

      {/* Smart Filters Panel (Expandable) */}
      {filterPanelOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Filter className="w-4 h-4 text-indigo-600" />
              <span>Smart Technology & Opportunity Filters</span>
            </div>
            <button
              onClick={handleClearFilters}
              className="text-xs text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition font-medium"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            {/* Opportunity Type */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Opportunity Type</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  fetchRecommendations({ type: e.target.value || undefined });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-indigo-500 outline-none"
              >
                <option value="">All Types</option>
                <option value="JOB">Full-Time Job</option>
                <option value="INTERNSHIP">Internship</option>
                <option value="PROJECT">Project / Fellowship</option>
                <option value="HACKATHON">Hackathon</option>
                <option value="COMPETITION">Competition</option>
                <option value="RESEARCH">Research</option>
                <option value="FREELANCE">Freelance</option>
                <option value="OPEN_SOURCE">Open Source</option>
              </select>
            </div>

            {/* Work Mode */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Work Mode</label>
              <select
                value={selectedWorkType}
                onChange={(e) => {
                  setSelectedWorkType(e.target.value);
                  fetchRecommendations({ workType: e.target.value || undefined });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-indigo-500 outline-none"
              >
                <option value="">All Modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            {/* Technology Picker */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Target Technology</label>
              <select
                value={selectedTech}
                onChange={(e) => {
                  setSelectedTech(e.target.value);
                  fetchRecommendations({ technologies: e.target.value ? [e.target.value] : [] });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-indigo-500 outline-none"
              >
                <option value="">All Technologies</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-slate-600 font-semibold mb-1">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  fetchRecommendations({ sortBy: e.target.value });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-indigo-500 outline-none"
              >
                <option value="MATCH_SCORE">Match Relevance (Highest First)</option>
                <option value="DEADLINE">Closing Deadline</option>
                <option value="RECENT">Recently Added</option>
                <option value="TITLE">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Discovery Feeds Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-200">
        {[
          { id: 'ALL', label: 'Recommended for You', icon: Sparkles },
          { id: 'BEST', label: 'Best Matches', icon: Target },
          { id: 'CLOSING', label: 'Closing Soon', icon: Clock },
          { id: 'RECENT', label: 'Recently Added', icon: Compass },
          { id: 'STRETCH', label: 'Stretch Opportunities', icon: TrendingUp },
          { id: 'SAVED', label: 'Saved Bookmarks', icon: Bookmark },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold whitespace-nowrap transition ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-xs'
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
          {opportunities.map((opp) => {
            const supportedCount = opp.strongSkills?.length || 0;
            const gapCount = opp.missingSkills?.length || 0;
            const totalSpecs = supportedCount + gapCount || 5;

            return (
              <div
                key={opp.id}
                className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-6 sm:p-7 shadow-xs space-y-5 transition group"
              >
                {/* Top Row: Match Category + Company + Work Type + Bookmark */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    {/* Explainable Match Badge (e.g. Strong Match — 4/5 core requirements supported) */}
                    <div className="px-3 py-1 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200 text-xs font-extrabold flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                      <span>
                        {opp.matchCategory === 'STRONG' ? 'Strong Match' : opp.matchCategory === 'GOOD' ? 'Good Match' : 'Potential Match'}
                      </span>
                      <span className="text-[10px] font-normal text-indigo-500 ml-1">
                        ({supportedCount}/{totalSpecs} core requirements supported)
                      </span>
                    </div>

                    <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700">
                      <Building className="w-3.5 h-3.5 text-slate-500" />
                      {opp.organizationName}
                    </span>

                    <span className="text-xs font-mono px-2 py-1 rounded bg-slate-50 text-slate-600 border border-slate-200">
                      {opp.type} • {opp.workType}
                    </span>

                    {opp.deadline && (
                      <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5 text-amber-600" />
                        <span>{opp.deadlineNote || opp.deadline}</span>
                      </span>
                    )}
                  </div>

                  {/* Bookmark Action */}
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleToggleSave(opp.id, opp.isSaved)}
                      className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1 transition ${
                        opp.isSaved
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : 'bg-slate-100 text-slate-500 hover:text-slate-900'
                      }`}
                      title={opp.isSaved ? 'Bookmarked' : 'Save opportunity'}
                    >
                      {opp.isSaved ? (
                        <BookmarkCheck className="w-4 h-4 text-indigo-600" />
                      ) : (
                        <Bookmark className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Opportunity Title & Details */}
                <div>
                  <h2
                    onClick={() => navigate(`/student/discover/${opp.id}`)}
                    className="text-xl font-bold text-slate-900 tracking-tight cursor-pointer hover:text-indigo-600 transition"
                  >
                    {opp.title}
                  </h2>

                  <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap">
                    {opp.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        {opp.location}
                      </span>
                    )}
                    {opp.compensation && (
                      <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                        {opp.compensation}
                      </span>
                    )}
                    {opp.duration && (
                      <span className="text-slate-400 font-medium">• {opp.duration}</span>
                    )}
                  </div>
                </div>

                {/* Explainable Why Recommended Highlight */}
                {opp.whyRecommended && (
                  <div className="bg-indigo-50/50 border border-indigo-100 rounded-xl p-4">
                    <span className="text-[10px] font-bold text-indigo-700 uppercase tracking-wider block mb-1">
                      Why KASUMIO Recommends This
                    </span>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
                      {opp.whyRecommended}
                    </p>
                  </div>
                )}

                {/* Technology Footprint Chips */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {opp.strongSkills && opp.strongSkills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider mr-1">
                        Demonstrated Specs:
                      </span>
                      {opp.strongSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium"
                        >
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}

                  {opp.missingSkills && opp.missingSkills.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap ml-auto">
                      <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider mr-1">
                        Missing Gaps:
                      </span>
                      {opp.missingSkills.map((s, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-0.5 rounded-lg bg-amber-50 text-amber-700 border border-amber-200 font-medium"
                        >
                          <AlertTriangle className="w-3 h-3 text-amber-600" />
                          {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Bottom Action Footer */}
                <div className="border-t border-slate-100 pt-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="text-xs text-slate-400">
                    Source: <span className="text-slate-600 font-medium">{opp.verificationStatus || 'Verified Partner'}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    {/* Feature 01 Interest Action */}
                    {opp.hasExpressedInterest ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-xl bg-rose-50 text-rose-700 border border-rose-200">
                        <Heart className="w-3.5 h-3.5 text-rose-600 fill-rose-600" />
                        <span>Interest Expressed</span>
                      </span>
                    ) : (
                      <button
                        onClick={() => handleExpressInterest(opp.id)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition"
                      >
                        <Heart className="w-3.5 h-3.5 text-rose-600" />
                        <span>Express Interest</span>
                      </button>
                    )}

                    {/* Inspect Match Full Detail Link */}
                    <button
                      onClick={() => navigate(`/student/discover/${opp.id}`)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition"
                    >
                      <span>Inspect Match Breakdown</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

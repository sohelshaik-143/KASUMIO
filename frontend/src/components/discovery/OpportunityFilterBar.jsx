import React from 'react';
import { Search, SlidersHorizontal, Filter, X } from 'lucide-react';

/**
 * Filter bar with search query, quick chips, and smart technology filters.
 */
export const OpportunityFilterBar = ({
  searchQuery,
  setSearchQuery,
  onSearchSubmit,
  filterPanelOpen,
  setFilterPanelOpen,
  selectedType,
  setSelectedType,
  selectedWorkType,
  setSelectedWorkType,
  selectedTech,
  setSelectedTech,
  technologies = [],
  sortBy,
  setSortBy,
  onClearFilters,
  onApplyFilter
}) => {
  const exampleChips = [
    'Find remote Java internships',
    'AI opportunities involving RAG',
    'Beginner cybersecurity roles',
    'Closing this week',
    'Matched to Spring Boot'
  ];

  return (
    <div className="space-y-2.5">
      <form onSubmit={onSearchSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder='Search roles: e.g. "Remote Java internships", "AI opportunities involving RAG", "Spring Boot"...'
            className="w-full pl-11 pr-28 py-3 bg-white border border-slate-200 focus:border-teal-600 focus:ring-1 focus:ring-teal-600 rounded-2xl text-sm text-slate-900 placeholder-slate-400 shadow-xs transition outline-none min-h-[44px]"
          />
          <div className="absolute right-2.5 flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => setFilterPanelOpen(!filterPanelOpen)}
              className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition min-h-[38px] ${
                filterPanelOpen || selectedType || selectedWorkType || selectedTech
                  ? 'bg-teal-50 text-teal-800 border border-teal-200'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
              title="Toggle smart filters"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline">Filters</span>
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white rounded-xl text-xs font-bold transition shadow-xs min-h-[38px]"
            >
              Discover
            </button>
          </div>
        </div>
      </form>

      {/* Example Query Chips */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        <span className="text-slate-400 text-xs font-semibold shrink-0">Try searching:</span>
        {exampleChips.map((chip, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => {
              setSearchQuery(chip);
              onApplyFilter({ query: chip });
            }}
            className="px-2.5 py-1 rounded-lg bg-white hover:bg-slate-50 text-slate-600 hover:text-teal-700 border border-slate-200 text-xs font-medium transition shrink-0 min-h-[32px]"
          >
            "{chip}"
          </button>
        ))}
      </div>

      {/* Smart Filters Panel (Expandable) */}
      {filterPanelOpen && (
        <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs space-y-4 animate-in fade-in duration-200">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700">
              <Filter className="w-4 h-4 text-teal-700" />
              <span>Smart Filters</span>
            </div>
            <button
              type="button"
              onClick={onClearFilters}
              className="text-xs text-slate-500 hover:text-teal-700 flex items-center gap-1 transition font-medium min-h-[32px]"
            >
              <X className="w-3.5 h-3.5" />
              <span>Reset Filters</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
            <div>
              <label htmlFor="filter-opp-type" className="block text-slate-600 font-semibold mb-1">Opportunity Type</label>
              <select
                id="filter-opp-type"
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  onApplyFilter({ type: e.target.value || undefined });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-teal-600 outline-none min-h-[40px]"
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

            <div>
              <label htmlFor="filter-work-mode" className="block text-slate-600 font-semibold mb-1">Work Mode</label>
              <select
                id="filter-work-mode"
                value={selectedWorkType}
                onChange={(e) => {
                  setSelectedWorkType(e.target.value);
                  onApplyFilter({ workType: e.target.value || undefined });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-teal-600 outline-none min-h-[40px]"
              >
                <option value="">All Modes</option>
                <option value="REMOTE">Remote</option>
                <option value="HYBRID">Hybrid</option>
                <option value="ON_SITE">On-Site</option>
              </select>
            </div>

            <div>
              <label htmlFor="filter-tech-picker" className="block text-slate-600 font-semibold mb-1">Target Technology</label>
              <select
                id="filter-tech-picker"
                value={selectedTech}
                onChange={(e) => {
                  setSelectedTech(e.target.value);
                  onApplyFilter({ technologies: e.target.value ? [e.target.value] : [] });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-teal-600 outline-none min-h-[40px]"
              >
                <option value="">All Technologies</option>
                {technologies.map((t) => (
                  <option key={t.id} value={t.name}>
                    {t.name} ({t.category})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="filter-sort-by" className="block text-slate-600 font-semibold mb-1">Sort By</label>
              <select
                id="filter-sort-by"
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  onApplyFilter({ sortBy: e.target.value });
                }}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-800 focus:border-teal-600 outline-none min-h-[40px]"
              >
                <option value="MATCH_SCORE">Match Relevance</option>
                <option value="DEADLINE">Closing Deadline</option>
                <option value="RECENT">Recently Added</option>
                <option value="TITLE">Title (A-Z)</option>
              </select>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

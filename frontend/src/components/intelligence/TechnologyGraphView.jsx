import React from 'react';
import { Search, Network } from 'lucide-react';

export const TechnologyGraphView = ({
  graphSearch,
  setGraphSearch,
  selectedEcosystem,
  setSelectedEcosystem,
  ecosystems = [],
  filteredNodes = [],
  selectedNode,
  setSelectedNode,
}) => {
  return (
    <div className="space-y-6">
      {/* Controls Bar */}
      <div className="kasumo-card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-ink-subtle absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            <input
              type="search"
              aria-label="Search technology in capability graph"
              placeholder="Search technology in graph (e.g. Docker, Python)..."
              value={graphSearch}
              onChange={(e) => setGraphSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-paper-subtle border border-paper-border rounded-lg text-xs text-ink placeholder-ink-subtle focus:outline-hidden focus:ring-2 focus:ring-verified focus:bg-white transition"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0" role="tablist" aria-label="Ecosystem filter">
          <span className="text-xs text-ink-muted font-semibold shrink-0">Ecosystem:</span>
          <button
            type="button"
            role="tab"
            aria-selected={selectedEcosystem === 'ALL'}
            onClick={() => setSelectedEcosystem('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
              selectedEcosystem === 'ALL'
                ? 'bg-verified text-white shadow-xs'
                : 'bg-white text-ink-muted hover:text-ink border border-paper-border'
            }`}
          >
            All
          </button>
          {ecosystems.map((eco) => (
            <button
              key={eco}
              type="button"
              role="tab"
              aria-selected={selectedEcosystem === eco}
              onClick={() => setSelectedEcosystem(eco)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition shrink-0 ${
                selectedEcosystem === eco
                  ? 'bg-verified text-white shadow-xs'
                  : 'bg-white text-ink-muted hover:text-ink border border-paper-border'
              }`}
            >
              {eco}
            </button>
          ))}
        </div>
      </div>

      {/* Graph Container */}
      <div className="kasumo-card p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-paper-border pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Network className="w-5 h-5 text-verified" aria-hidden="true" />
              <h2 className="text-lg font-bold text-ink font-serif">
                Career Capability Map Graph
              </h2>
            </div>
            <p className="text-xs text-ink-muted mt-0.5">
              Interactive technology ecosystem graph generated from domain relationships and your factual evidence status.
            </p>
          </div>

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3 text-xs font-medium">
            <span className="flex items-center gap-1.5 text-verified">
              <span className="w-2.5 h-2.5 rounded-full bg-verified" aria-hidden="true" /> Verified / Strong
            </span>
            <span className="flex items-center gap-1.5 text-ink">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-500" aria-hidden="true" /> Developing
            </span>
            <span className="flex items-center gap-1.5 text-unverified">
              <span className="w-2.5 h-2.5 rounded-full bg-unverified" aria-hidden="true" /> Learning
            </span>
            <span className="flex items-center gap-1.5 text-ink-subtle">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300" aria-hidden="true" /> Missing Proof
            </span>
          </div>
        </div>

        {/* Grid of Nodes */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {filteredNodes.map((node) => {
            const isSelected = selectedNode?.id === node.id;

            let borderClass = 'border-paper-border';
            let bgClass = 'bg-white';
            let statusBadge = 'bg-paper-subtle text-ink-muted';

            if (node.possessionStatus === 'VERIFIED' || node.possessionStatus === 'STRONG') {
              borderClass = 'border-verified-border';
              bgClass = 'bg-verified-light';
              statusBadge = 'bg-white text-verified font-bold';
            } else if (node.possessionStatus === 'MODERATE') {
              borderClass = 'border-slate-300';
              bgClass = 'bg-paper-subtle';
              statusBadge = 'bg-white text-ink font-medium';
            } else if (node.possessionStatus === 'INFERRED') {
              borderClass = 'border-unverified-border';
              bgClass = 'bg-unverified-light';
              statusBadge = 'bg-white text-unverified';
            }

            if (isSelected) {
              borderClass = 'border-verified ring-2 ring-verified';
            }

            return (
              <button
                key={node.id}
                type="button"
                onClick={() => setSelectedNode(node)}
                className={`p-3.5 rounded-xl border text-left transition hover:shadow-xs flex flex-col justify-between h-28 focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-verified ${bgClass} ${borderClass}`}
              >
                <div>
                  <span className="text-xs text-ink-subtle uppercase tracking-wider font-mono block">
                    {node.ecosystem || 'Tech'}
                  </span>
                  <span className="text-xs mt-0.5 truncate font-semibold text-ink block">
                    {node.name}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className={`px-1.5 py-0.5 rounded-md font-mono ${statusBadge}`}>
                    {node.possessionStatus}
                  </span>
                  {node.opportunityDemandCount > 0 && (
                    <span className="text-verified font-mono font-bold">
                      {node.opportunityDemandCount} opps
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TechnologyGraphView;

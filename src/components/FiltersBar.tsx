import React from 'react';
import { Search, Filter, X, ArrowUpDown, ChevronDown } from 'lucide-react';
import { DomainStrategy } from '../types/domain';

export type ExpirationFilter = 'all' | 'urgent30' | 'upcoming90' | 'safe';
export type SortOption = 'expiryAsc' | 'expiryDesc' | 'binDesc' | 'costDesc' | 'nameAsc';

interface FiltersBarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  strategyFilter: 'All' | DomainStrategy;
  onStrategyChange: (val: 'All' | DomainStrategy) => void;
  expirationFilter: ExpirationFilter;
  onExpirationChange: (val: ExpirationFilter) => void;
  registrarFilter: string;
  onRegistrarChange: (val: string) => void;
  registrars: string[];
  sortOption: SortOption;
  onSortChange: (val: SortOption) => void;
  counts: {
    all: number;
    sell: number;
    keep: number;
    drop: number;
    urgent: number;
  };
  onResetFilters: () => void;
}

export const FiltersBar: React.FC<FiltersBarProps> = ({
  searchQuery,
  onSearchChange,
  strategyFilter,
  onStrategyChange,
  expirationFilter,
  onExpirationChange,
  registrarFilter,
  onRegistrarChange,
  registrars,
  sortOption,
  onSortChange,
  counts,
  onResetFilters,
}) => {
  const isFiltered =
    searchQuery.trim() !== '' ||
    strategyFilter !== 'All' ||
    expirationFilter !== 'all' ||
    registrarFilter !== 'All';

  return (
    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-3.5 space-y-3 shadow-sm">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Search Bar */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search domain name, extension (e.g. .ai, .com), category..."
            className="w-full pl-9 pr-8 py-2 bg-slate-950/70 border border-slate-800 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-300"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Strategy Tabs */}
        <div className="flex items-center bg-slate-950/80 p-1 rounded-xl border border-slate-800 shrink-0">
          <button
            onClick={() => onStrategyChange('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              strategyFilter === 'All'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All <span className="ml-1 text-[11px] opacity-70">({counts.all})</span>
          </button>
          <button
            onClick={() => onStrategyChange('Sell')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              strategyFilter === 'Sell'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-slate-400 hover:text-emerald-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            For Sale <span className="text-[11px] opacity-75">({counts.sell})</span>
          </button>
          <button
            onClick={() => onStrategyChange('Keep')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              strategyFilter === 'Keep'
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'text-slate-400 hover:text-blue-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-blue-400"></span>
            Keep <span className="text-[11px] opacity-75">({counts.keep})</span>
          </button>
          <button
            onClick={() => onStrategyChange('Drop')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
              strategyFilter === 'Drop'
                ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                : 'text-slate-400 hover:text-rose-400'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            Drop <span className="text-[11px] opacity-75">({counts.drop})</span>
          </button>
        </div>
      </div>

      {/* Secondary filter & sort row */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 pt-2 border-t border-slate-800/60 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          {/* Expiration Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs font-medium">Expiry:</span>
            <select
              value={expirationFilter}
              onChange={(e) => onExpirationChange(e.target.value as ExpirationFilter)}
              className="bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="all">All Expirations</option>
              <option value="urgent30">Expiring &le; 30 Days ({counts.urgent})</option>
              <option value="upcoming90">Expiring &le; 90 Days</option>
              <option value="safe">Valid &gt; 90 Days</option>
            </select>
          </div>

          {/* Registrar Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-slate-400 text-xs font-medium">Registrar:</span>
            <select
              value={registrarFilter}
              onChange={(e) => onRegistrarChange(e.target.value)}
              className="bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
            >
              <option value="All">All Registrars</option>
              {registrars.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          {isFiltered && (
            <button
              onClick={onResetFilters}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
            >
              <X className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>

        {/* Sort Select */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <span className="text-slate-400 text-xs font-medium">Sort:</span>
          <select
            value={sortOption}
            onChange={(e) => onSortChange(e.target.value as SortOption)}
            className="bg-slate-950/70 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="expiryAsc">Expiry: Soonest First</option>
            <option value="expiryDesc">Expiry: Furthest First</option>
            <option value="binDesc">Price: Highest BIN First</option>
            <option value="costDesc">Renewal Cost: Highest First</option>
            <option value="nameAsc">Domain Name: A &rarr; Z</option>
          </select>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import {
  Sparkles,
  DollarSign,
  Edit2,
  Trash2,
  TrendingUp,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  Globe2,
  Server,
  Layers,
  Check,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { DomainItem, DomainStrategy, MarketplaceListing } from '../types/domain';
import { formatDateString, getExpiryBadgeProps } from '../utils/dateUtils';

interface DomainTableProps {
  domains: DomainItem[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onUpdateStrategy: (id: string, newStrategy: DomainStrategy) => void;
  onOpenSalesDrawer: (domain: DomainItem) => void;
  onOpenAppraisal: (domain: DomainItem) => void;
  onEditDomain: (domain: DomainItem) => void;
  onDeleteDomain: (id: string) => void;
  onBulkUpdateStrategy: (strategy: DomainStrategy) => void;
  onBulkDelete: () => void;
  onClearSelection: () => void;
}

export const DomainTable: React.FC<DomainTableProps> = ({
  domains,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onUpdateStrategy,
  onOpenSalesDrawer,
  onOpenAppraisal,
  onEditDomain,
  onDeleteDomain,
  onBulkUpdateStrategy,
  onBulkDelete,
  onClearSelection,
}) => {
  const isAllSelected = domains.length > 0 && selectedIds.length === domains.length;

  return (
    <div className="relative">
      {/* Floating bulk actions banner when rows are selected */}
      {selectedIds.length > 0 && (
        <div className="sticky top-20 z-20 mb-3 bg-gradient-to-r from-slate-900 to-slate-950 border border-emerald-500/40 rounded-xl px-4 py-2.5 shadow-xl flex items-center justify-between flex-wrap gap-2.5 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-md bg-emerald-500/20 text-emerald-400 font-bold text-xs flex items-center justify-center font-mono">
              {selectedIds.length}
            </span>
            <span className="text-xs font-medium text-slate-200">
              {selectedIds.length === 1 ? 'domain selected' : 'domains selected'}
            </span>
            <button
              onClick={onClearSelection}
              className="text-xs text-slate-400 hover:text-slate-200 underline ml-2"
            >
              Clear
            </button>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-slate-400">Bulk Strategy:</span>
            <button
              onClick={() => onBulkUpdateStrategy('Sell')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
            >
              Set Sell
            </button>
            <button
              onClick={() => onBulkUpdateStrategy('Keep')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-blue-500/20 text-blue-300 border border-blue-500/30 hover:bg-blue-500/30 transition-colors"
            >
              Set Keep
            </button>
            <button
              onClick={() => onBulkUpdateStrategy('Drop')}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30 transition-colors"
            >
              Set Drop
            </button>
            <div className="h-4 w-px bg-slate-800 mx-1" />
            <button
              onClick={onBulkDelete}
              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-rose-950/40 text-rose-300 border border-rose-800 hover:bg-rose-900/60 transition-colors flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete Selected
            </button>
          </div>
        </div>
      )}

      {/* Main Table Container */}
      <div className="bg-slate-900/70 border border-slate-800 rounded-2xl overflow-hidden shadow-md">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 bg-slate-950/60 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="py-3.5 px-4 w-10">
                  <input
                    type="checkbox"
                    checked={isAllSelected}
                    onChange={onToggleSelectAll}
                    className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer w-4 h-4"
                  />
                </th>
                <th className="py-3.5 px-4 min-w-[210px]">Domain Name</th>
                <th className="py-3.5 px-4 min-w-[150px]">Registrar & DNS</th>
                <th className="py-3.5 px-4 min-w-[130px]">Expiry & Renewal</th>
                <th className="py-3.5 px-4 min-w-[130px]">Strategy</th>
                <th className="py-3.5 px-4 min-w-[170px]">Listings & Offers</th>
                <th className="py-3.5 px-4 min-w-[120px] text-right">Target Value</th>
                <th className="py-3.5 px-4 min-w-[130px] text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {domains.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400">
                    <Layers className="w-8 h-8 mx-auto text-slate-600 mb-2" />
                    <p className="text-sm font-medium text-slate-300">No domains match your criteria</p>
                    <p className="text-xs text-slate-500 mt-1">Try resetting your search query or filters.</p>
                  </td>
                </tr>
              ) : (
                domains.map((d) => {
                  const isSelected = selectedIds.includes(d.id);
                  const expiryProps = getExpiryBadgeProps(d.expiryDate);
                  const activeListings = d.marketplaces.filter((m) => m.active);
                  const pendingOffers = d.offers?.filter((o) => o.status === 'Pending') || [];

                  return (
                    <tr
                      key={d.id}
                      className={`group transition-colors ${
                        isSelected
                          ? 'bg-emerald-950/20 hover:bg-emerald-950/30'
                          : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Checkbox */}
                      <td className="py-3.5 px-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => onToggleSelect(d.id)}
                          className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40 cursor-pointer w-4 h-4"
                        />
                      </td>

                      {/* Domain Name + TLD + Tags */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-start gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center justify-center shrink-0 text-slate-300 group-hover:border-emerald-500/40 group-hover:text-emerald-400 transition-colors">
                            <Globe2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-bold text-slate-100 font-mono tracking-tight text-[13px] hover:text-emerald-400 cursor-pointer"
                                onClick={() => {
                                  if (d.strategy === 'Sell') {
                                    onOpenSalesDrawer(d);
                                  } else {
                                    onEditDomain(d);
                                  }
                                }}
                              >
                                {d.name}
                              </span>
                              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-slate-800 text-slate-300 border border-slate-700">
                                {d.tld}
                              </span>
                            </div>

                            {/* Tags or Category */}
                            <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                              {d.category && (
                                <span className="text-[10px] text-slate-400 bg-slate-950/50 px-1.5 py-0.5 rounded border border-slate-800">
                                  {d.category}
                                </span>
                              )}
                              {d.trafficMonthly && d.trafficMonthly > 0 && (
                                <span className="text-[10px] text-slate-500 font-mono">
                                  ~{d.trafficMonthly} hits/mo
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Registrar & DNS */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1.5 text-slate-200 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-slate-500"></span>
                            <span>{d.registrar || 'Custom'}</span>
                          </div>
                          <div className="flex items-center gap-1 text-[11px] text-slate-400">
                            <Server className="w-3 h-3 text-slate-500" />
                            <span>{d.dnsProvider || 'Standard DNS'}</span>
                          </div>
                        </div>
                      </td>

                      {/* Expiry Date & Renewal Cost */}
                      <td className="py-3.5 px-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded-full text-[11px] font-semibold font-mono ${expiryProps.badgeClass}`}>
                              {expiryProps.label}
                            </span>
                          </div>
                          <div className="text-[11px] text-slate-400 flex items-center justify-between">
                            <span>{formatDateString(d.expiryDate)}</span>
                            <span className="font-mono text-slate-300 font-medium ml-1">
                              ${d.annualCost.toFixed(2)}/yr
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Strategy Dropdown (Inline Quick Toggle) */}
                      <td className="py-3.5 px-4">
                        <div className="relative inline-block w-full max-w-[120px]">
                          <select
                            value={d.strategy}
                            onChange={(e) => onUpdateStrategy(d.id, e.target.value as DomainStrategy)}
                            className={`w-full appearance-none pl-2.5 pr-7 py-1 rounded-lg text-xs font-semibold cursor-pointer border transition-colors focus:outline-none ${
                              d.strategy === 'Sell'
                                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40 hover:border-emerald-500'
                                : d.strategy === 'Keep'
                                ? 'bg-blue-950/40 text-blue-300 border-blue-500/40 hover:border-blue-500'
                                : 'bg-rose-950/40 text-rose-300 border-rose-500/40 hover:border-rose-500'
                            }`}
                          >
                            <option value="Keep">Keep</option>
                            <option value="Sell">Sell</option>
                            <option value="Drop">Drop</option>
                          </select>
                          <ChevronDown className="w-3.5 h-3.5 absolute right-2 top-2 pointer-events-none opacity-60" />
                        </div>
                      </td>

                      {/* Listings Badges & Offers */}
                      <td className="py-3.5 px-4">
                        <div
                          onClick={() => onOpenSalesDrawer(d)}
                          className="cursor-pointer group/listing"
                        >
                          {d.strategy === 'Sell' ? (
                            <div className="space-y-1.5">
                              {/* Marketplace chips */}
                              <div className="flex items-center gap-1 flex-wrap">
                                {activeListings.length > 0 ? (
                                  activeListings.slice(0, 3).map((m) => (
                                    <span
                                      key={m.name}
                                      className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300 border border-slate-700/80 group-hover/listing:border-emerald-500/40"
                                    >
                                      {m.name === 'Private Landing Page' ? 'Landing' : m.name}
                                    </span>
                                  ))
                                ) : (
                                  <span className="text-[11px] text-amber-400 italic">
                                    No marketplaces
                                  </span>
                                )}
                                {activeListings.length > 3 && (
                                  <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-800 text-slate-400 border border-slate-700">
                                    +{activeListings.length - 3}
                                  </span>
                                )}
                              </div>

                              {/* Offers pill */}
                              <div className="flex items-center gap-1.5 text-[11px]">
                                {pendingOffers.length > 0 ? (
                                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                                    <DollarSign className="w-3 h-3" />
                                    {pendingOffers.length} pending offer{pendingOffers.length > 1 ? 's' : ''}
                                  </span>
                                ) : d.offers?.length > 0 ? (
                                  <span className="text-slate-400 font-mono">
                                    {d.offers.length} offer{d.offers.length > 1 ? 's' : ''} logged
                                  </span>
                                ) : (
                                  <span className="text-slate-500 text-[10px]">Manage listings</span>
                                )}
                              </div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px] italic">
                              {d.strategy === 'Keep' ? 'Core asset (Not listed)' : 'Pending drop'}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Target BIN / Estimated Value */}
                      <td className="py-3.5 px-4 text-right">
                        {d.strategy === 'Sell' && d.binPrice ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-bold text-emerald-400 text-sm">
                              ${d.binPrice.toLocaleString()}
                            </span>
                            {d.minOffer && (
                              <div className="text-[10px] text-slate-400 font-mono">
                                Min: ${d.minOffer.toLocaleString()}
                              </div>
                            )}
                          </div>
                        ) : d.appraisal ? (
                          <div className="space-y-0.5">
                            <span className="font-mono font-semibold text-slate-300 text-xs">
                              ~${d.appraisal.fairMarket.toLocaleString()}
                            </span>
                            <span className="block text-[10px] text-slate-500">
                              Appraised
                            </span>
                          </div>
                        ) : (
                          <span className="font-mono text-slate-600 text-xs">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center justify-center gap-1">
                          {/* AI Appraisal button */}
                          <button
                            onClick={() => onOpenAppraisal(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
                            title="AI Appraisal & Outreach Pitch"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>

                          {/* Sales Drawer */}
                          <button
                            onClick={() => onOpenSalesDrawer(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 transition-colors"
                            title="Sales & Marketplace Drawer"
                          >
                            <TrendingUp className="w-4 h-4" />
                          </button>

                          {/* Edit Domain */}
                          <button
                            onClick={() => onEditDomain(d)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                            title="Edit Domain"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>

                          {/* Delete Domain */}
                          <button
                            onClick={() => onDeleteDomain(d.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                            title="Delete Domain"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

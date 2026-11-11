import React from 'react';
import {
  Layers,
  ShoppingBag,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  ArrowUpRight,
  Clock,
  Sparkles,
} from 'lucide-react';
import { DomainItem } from '../types/domain';
import { getDaysUntilExpiry } from '../utils/dateUtils';

interface MetricsCardsProps {
  domains: DomainItem[];
  onFilterExpiring: () => void;
  onFilterStrategy: (strategy: 'All' | 'Sell' | 'Keep' | 'Drop') => void;
}

export const MetricsCards: React.FC<MetricsCardsProps> = ({
  domains,
  onFilterExpiring,
  onFilterStrategy,
}) => {
  const totalDomains = domains.length;
  const sellDomains = domains.filter((d) => d.strategy === 'Sell');
  const keepDomains = domains.filter((d) => d.strategy === 'Keep');
  const dropDomains = domains.filter((d) => d.strategy === 'Drop');

  // Annual renewal cost sum
  const annualHoldingCost = domains.reduce((sum, d) => sum + (d.annualCost || 0), 0);
  const avgRenewalCost = totalDomains > 0 ? annualHoldingCost / totalDomains : 0;

  // Total Portfolio Value (sum of BIN prices for domains marked 'Sell')
  const totalPortfolioValue = sellDomains.reduce((sum, d) => sum + (d.binPrice || 0), 0);

  // Expiring within 30 days
  const expiringWithin30Days = domains.filter((d) => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days >= 0 && days <= 30;
  });

  // Calculate sell vs keep percentages for distribution bar
  const sellPct = totalDomains > 0 ? Math.round((sellDomains.length / totalDomains) * 100) : 0;
  const keepPct = totalDomains > 0 ? Math.round((keepDomains.length / totalDomains) * 100) : 0;
  const dropPct = totalDomains > 0 ? 100 - sellPct - keepPct : 0;

  return (
    <div className="space-y-4">
      {/* 5 primary KPI cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Total Domains */}
        <div
          onClick={() => onFilterStrategy('All')}
          className="group relative bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all cursor-pointer shadow-sm hover:shadow-md"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Total Domains</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              {totalDomains}
            </span>
            <span className="text-xs text-slate-400">active assets</span>
          </div>
          <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5 font-mono">
            <span className="text-emerald-400">{sellDomains.length} sell</span>
            <span className="text-slate-600">•</span>
            <span className="text-blue-400">{keepDomains.length} keep</span>
            <span className="text-slate-600">•</span>
            <span className="text-rose-400">{dropDomains.length} drop</span>
          </div>
        </div>

        {/* Card 2: Domains for Sale vs Keep */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Portfolio Strategy</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <ShoppingBag className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <div>
              <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
                {sellDomains.length}
              </span>
              <span className="text-xs text-slate-400 ml-1">For Sale</span>
            </div>
            <div className="text-right">
              <span className="text-lg font-semibold font-mono tracking-tight text-blue-400">
                {keepDomains.length}
              </span>
              <span className="text-xs text-slate-400 ml-1">Keep</span>
            </div>
          </div>
          {/* Ratio bar */}
          <div className="mt-2.5 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden flex">
            <div
              style={{ width: `${sellPct}%` }}
              className="bg-emerald-400 h-full rounded-l-full transition-all duration-500"
              title={`${sellPct}% For Sale`}
            />
            <div
              style={{ width: `${keepPct}%` }}
              className="bg-blue-400 h-full transition-all duration-500"
              title={`${keepPct}% Keep`}
            />
            <div
              style={{ width: `${dropPct}%` }}
              className="bg-rose-400 h-full rounded-r-full transition-all duration-500"
              title={`${dropPct}% Drop`}
            />
          </div>
        </div>

        {/* Card 3: Annual Holding Cost */}
        <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4.5 hover:border-slate-700 transition-all shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-400">Annual Holding Cost</span>
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-white">
              ${annualHoldingCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400 font-mono">
            Avg. <span className="text-slate-300 font-semibold">${avgRenewalCost.toFixed(2)}</span> / domain / yr
          </p>
        </div>

        {/* Card 4: Total Portfolio Value (BIN Sum) */}
        <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-emerald-500/30 rounded-2xl p-4.5 hover:border-emerald-500/50 transition-all shadow-sm shadow-emerald-500/5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-emerald-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              Target Portfolio Value
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-1.5">
            <span className="text-2xl font-bold font-mono tracking-tight text-emerald-400">
              ${totalPortfolioValue.toLocaleString()}
            </span>
          </div>
          <p className="mt-2 text-xs text-slate-400">
            Across {sellDomains.length} sales inventory listings
          </p>
        </div>

        {/* Card 5: Expiring Soon Alert */}
        <div
          onClick={onFilterExpiring}
          className={`rounded-2xl p-4.5 border transition-all cursor-pointer shadow-sm ${
            expiringWithin30Days.length > 0
              ? 'bg-amber-950/20 border-amber-500/40 hover:border-amber-500/60 hover:bg-amber-950/30'
              : 'bg-slate-900/70 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-center justify-between">
            <span
              className={`text-xs font-medium ${
                expiringWithin30Days.length > 0 ? 'text-amber-400' : 'text-slate-400'
              }`}
            >
              Expiring &le; 30 Days
            </span>
            <div
              className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                expiringWithin30Days.length > 0
                  ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tracking-tight ${
                expiringWithin30Days.length > 0 ? 'text-amber-300' : 'text-slate-300'
              }`}
            >
              {expiringWithin30Days.length}
            </span>
            <span className="text-xs text-slate-400">
              {expiringWithin30Days.length === 1 ? 'domain' : 'domains'}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-1 text-xs text-amber-400/90 font-medium hover:underline">
            <span>View urgent list</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

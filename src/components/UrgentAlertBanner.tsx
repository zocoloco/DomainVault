import React, { useState } from 'react';
import { AlertCircle, X, ArrowRight, Clock, ShieldAlert } from 'lucide-react';
import { DomainItem } from '../types/domain';
import { getDaysUntilExpiry } from '../utils/dateUtils';

interface UrgentAlertBannerProps {
  domains: DomainItem[];
  onReviewExpiring: () => void;
}

export const UrgentAlertBanner: React.FC<UrgentAlertBannerProps> = ({
  domains,
  onReviewExpiring,
}) => {
  const [dismissed, setDismissed] = useState(false);

  const urgentDomains = domains.filter((d) => {
    const days = getDaysUntilExpiry(d.expiryDate);
    return days >= 0 && days <= 30;
  });

  if (dismissed || urgentDomains.length === 0) return null;

  return (
    <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-slate-900/60 border border-amber-500/30 p-4 shadow-lg backdrop-blur-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="flex items-start sm:items-center gap-3">
          <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-amber-300">
                Action Required: {urgentDomains.length} {urgentDomains.length === 1 ? 'domain is' : 'domains are'} expiring within 30 days
              </h3>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 uppercase tracking-wider">
                Critical
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Renew these domains before expiration or mark them as <span className="font-semibold text-rose-300">Drop</span> to eliminate future carrying costs:
              <span className="font-mono text-amber-200 ml-1.5 font-medium">
                {urgentDomains.slice(0, 3).map((d) => `${d.name} (${getDaysUntilExpiry(d.expiryDate)}d)`).join(', ')}
                {urgentDomains.length > 3 ? ` +${urgentDomains.length - 3} more` : ''}
              </span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <button
            onClick={onReviewExpiring}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-amber-400 text-slate-950 hover:bg-amber-300 transition-colors shadow-sm"
          >
            Filter Expiring
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </button>
          <button
            onClick={() => setDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800/80 rounded-lg transition-colors"
            title="Dismiss alert for now"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};

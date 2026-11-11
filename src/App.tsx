/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Globe,
  Sparkles,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  FileSpreadsheet,
  Plus,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { DomainItem, DomainStrategy } from './types/domain';
import {
  loadDomainsFromStorage,
  saveDomainsToStorage,
  resetDomainsStorage,
} from './utils/storage';
import { getDaysUntilExpiry } from './utils/dateUtils';
import { Header } from './components/Header';
import { MetricsCards } from './components/MetricsCards';
import { UrgentAlertBanner } from './components/UrgentAlertBanner';
import { FiltersBar, ExpirationFilter, SortOption } from './components/FiltersBar';
import { DomainTable } from './components/DomainTable';
import { SalesDrawer } from './components/SalesDrawer';
import { AppraisalModal } from './components/AppraisalModal';
import { DomainModal } from './components/DomainModal';
import { CloudflareSyncModal } from './components/CloudflareSyncModal';

export default function App() {
  // Primary domain portfolio state (persistent with localStorage)
  const [domains, setDomains] = useState<DomainItem[]>(() => loadDomainsFromStorage());

  // Save to localStorage whenever domains state updates
  useEffect(() => {
    saveDomainsToStorage(domains);
  }, [domains]);

  // Selection state for bulk actions
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Filters and search state
  const [searchQuery, setSearchQuery] = useState('');
  const [strategyFilter, setStrategyFilter] = useState<'All' | DomainStrategy>('All');
  const [expirationFilter, setExpirationFilter] = useState<ExpirationFilter>('all');
  const [registrarFilter, setRegistrarFilter] = useState('All');
  const [sortOption, setSortOption] = useState<SortOption>('expiryAsc');

  // Modal and Drawer states
  const [salesDrawerDomain, setSalesDrawerDomain] = useState<DomainItem | null>(null);
  const [appraisalModalDomain, setAppraisalModalDomain] = useState<DomainItem | null>(null);
  const [editingDomain, setEditingDomain] = useState<DomainItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCloudflareModalOpen, setIsCloudflareModalOpen] = useState(false);

  // Notification toast state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Unique list of registrars for filter dropdown
  const uniqueRegistrars = useMemo(() => {
    const set = new Set<string>();
    domains.forEach((d) => {
      if (d.registrar) set.add(d.registrar);
    });
    return Array.from(set).sort();
  }, [domains]);

  // Counts for strategy badges and quick filter tabs
  const counts = useMemo(() => {
    const urgentCount = domains.filter((d) => {
      const days = getDaysUntilExpiry(d.expiryDate);
      return days >= 0 && days <= 30;
    }).length;

    return {
      all: domains.length,
      sell: domains.filter((d) => d.strategy === 'Sell').length,
      keep: domains.filter((d) => d.strategy === 'Keep').length,
      drop: domains.filter((d) => d.strategy === 'Drop').length,
      urgent: urgentCount,
    };
  }, [domains]);

  // Filtered and Sorted domains pipeline
  const filteredDomains = useMemo(() => {
    return domains
      .filter((d) => {
        // Search query filter
        if (searchQuery.trim() !== '') {
          const q = searchQuery.toLowerCase().trim();
          const matchName = d.name.toLowerCase().includes(q);
          const matchTld = d.tld.toLowerCase().includes(q);
          const matchCategory = d.category?.toLowerCase().includes(q) || false;
          const matchRegistrar = d.registrar?.toLowerCase().includes(q) || false;
          const matchTags = d.tags?.some((t) => t.toLowerCase().includes(q)) || false;
          const matchNotes = d.notes?.toLowerCase().includes(q) || false;

          if (!matchName && !matchTld && !matchCategory && !matchRegistrar && !matchTags && !matchNotes) {
            return false;
          }
        }

        // Strategy filter
        if (strategyFilter !== 'All' && d.strategy !== strategyFilter) {
          return false;
        }

        // Registrar filter
        if (registrarFilter !== 'All' && d.registrar !== registrarFilter) {
          return false;
        }

        // Expiration filter
        if (expirationFilter !== 'all') {
          const days = getDaysUntilExpiry(d.expiryDate);
          if (expirationFilter === 'urgent30' && (days < 0 || days > 30)) return false;
          if (expirationFilter === 'upcoming90' && (days < 0 || days > 90)) return false;
          if (expirationFilter === 'safe' && days <= 90) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortOption === 'expiryAsc') {
          return new Date(a.expiryDate).getTime() - new Date(b.expiryDate).getTime();
        }
        if (sortOption === 'expiryDesc') {
          return new Date(b.expiryDate).getTime() - new Date(a.expiryDate).getTime();
        }
        if (sortOption === 'binDesc') {
          return (b.binPrice || 0) - (a.binPrice || 0);
        }
        if (sortOption === 'costDesc') {
          return (b.annualCost || 0) - (a.annualCost || 0);
        }
        if (sortOption === 'nameAsc') {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });
  }, [domains, searchQuery, strategyFilter, registrarFilter, expirationFilter, sortOption]);

  // Handlers for individual actions
  const handleToggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredDomains.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredDomains.map((d) => d.id));
    }
  };

  const handleUpdateStrategy = (id: string, newStrategy: DomainStrategy) => {
    setDomains((prev) =>
      prev.map((d) => (d.id === id ? { ...d, strategy: newStrategy } : d))
    );
    showToast(`Updated strategy to "${newStrategy}"`);

    // If marked as Sell and domain has no BIN, offer to open sales drawer
    if (newStrategy === 'Sell') {
      const target = domains.find((d) => d.id === id);
      if (target && !target.binPrice) {
        setSalesDrawerDomain({ ...target, strategy: 'Sell' });
      }
    }
  };

  const handleDeleteDomain = (id: string) => {
    const target = domains.find((d) => d.id === id);
    if (!target) return;
    if (confirm(`Are you sure you want to delete ${target.name} from your portfolio?`)) {
      setDomains((prev) => prev.filter((d) => d.id !== id));
      setSelectedIds((prev) => prev.filter((item) => item !== id));
      showToast(`Deleted ${target.name}`);
    }
  };

  const handleSaveDomain = (updated: DomainItem) => {
    setDomains((prev) => {
      const exists = prev.some((d) => d.id === updated.id);
      if (exists) {
        return prev.map((d) => (d.id === updated.id ? updated : d));
      }
      return [updated, ...prev];
    });

    // Also update active drawer / modal references if matching
    if (salesDrawerDomain && salesDrawerDomain.id === updated.id) {
      setSalesDrawerDomain(updated);
    }
    if (appraisalModalDomain && appraisalModalDomain.id === updated.id) {
      setAppraisalModalDomain(updated);
    }

    showToast(`Saved ${updated.name}`);
  };

  // Bulk actions
  const handleBulkUpdateStrategy = (newStrategy: DomainStrategy) => {
    setDomains((prev) =>
      prev.map((d) => (selectedIds.includes(d.id) ? { ...d, strategy: newStrategy } : d))
    );
    showToast(`Updated ${selectedIds.length} domains to "${newStrategy}"`);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    if (
      confirm(
        `Are you sure you want to permanently delete ${selectedIds.length} selected domains?`
      )
    ) {
      setDomains((prev) => prev.filter((d) => !selectedIds.includes(d.id)));
      showToast(`Deleted ${selectedIds.length} domains`);
      setSelectedIds([]);
    }
  };

  const handleApplyValuation = (domainId: string, suggestedPrice: number) => {
    setDomains((prev) =>
      prev.map((d) =>
        d.id === domainId
          ? {
              ...d,
              strategy: 'Sell',
              binPrice: suggestedPrice,
            }
          : d
      )
    );
    showToast(`Applied $${suggestedPrice.toLocaleString()} Target BIN price!`);
  };

  const handleResetData = () => {
    if (
      confirm(
        'Reset portfolio to initial sample dataset with live offers and realistic valuations?'
      )
    ) {
      const fresh = resetDomainsStorage();
      setDomains(fresh);
      setSelectedIds([]);
      setSearchQuery('');
      setStrategyFilter('All');
      setExpirationFilter('all');
      setRegistrarFilter('All');
      showToast('Portfolio reset to default sample dataset');
    }
  };

  const handleImportData = (imported: DomainItem[]) => {
    setDomains(imported);
    saveDomainsToStorage(imported);
    setSelectedIds([]);
    showToast(`Imported ${imported.length} domains`);
  };

  const handleImportCloudflareDomains = (imported: DomainItem[]) => {
    setDomains((prev) => {
      const existingMap = new Map(prev.map((d) => [d.name.toLowerCase(), d]));
      imported.forEach((newD) => {
        const key = newD.name.toLowerCase();
        if (existingMap.has(key)) {
          const current = existingMap.get(key)!;
          existingMap.set(key, {
            ...current,
            registrar: newD.registrar || current.registrar,
            dnsProvider: 'Cloudflare',
            expiryDate: newD.expiryDate || current.expiryDate,
          });
        } else {
          existingMap.set(key, newD);
        }
      });
      return Array.from(existingMap.values());
    });
    showToast(`Synced ${imported.length} domains from Cloudflare!`);
  };

  return (
    <div className="min-h-screen bg-[#090d16] text-slate-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 border border-emerald-500/40 text-emerald-300 px-4 py-2.5 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header Navigation */}
      <Header
        domains={domains}
        onAddDomain={() => setIsAddModalOpen(true)}
        onResetData={handleResetData}
        onImportData={handleImportData}
        onOpenCloudflareSync={() => setIsCloudflareModalOpen(true)}
      />

      {/* Main Dashboard Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 flex-1 w-full">
        {/* Urgent Expiry Banner (if any domain <= 30 days) */}
        <UrgentAlertBanner
          domains={domains}
          onReviewExpiring={() => {
            setExpirationFilter('urgent30');
            window.scrollTo({ top: 380, behavior: 'smooth' });
          }}
        />

        {/* Overview Metric Cards */}
        <MetricsCards
          domains={domains}
          onFilterExpiring={() => setExpirationFilter('urgent30')}
          onFilterStrategy={(strategy) => setStrategyFilter(strategy)}
        />

        {/* Filters and Controls */}
        <FiltersBar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          strategyFilter={strategyFilter}
          onStrategyChange={setStrategyFilter}
          expirationFilter={expirationFilter}
          onExpirationChange={setExpirationFilter}
          registrarFilter={registrarFilter}
          onRegistrarChange={setRegistrarFilter}
          registrars={uniqueRegistrars}
          sortOption={sortOption}
          onSortChange={setSortOption}
          counts={counts}
          onResetFilters={() => {
            setSearchQuery('');
            setStrategyFilter('All');
            setExpirationFilter('all');
            setRegistrarFilter('All');
          }}
        />

        {/* Portfolio Table */}
        <DomainTable
          domains={filteredDomains}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onUpdateStrategy={handleUpdateStrategy}
          onOpenSalesDrawer={(d) => setSalesDrawerDomain(d)}
          onOpenAppraisal={(d) => setAppraisalModalDomain(d)}
          onEditDomain={(d) => setEditingDomain(d)}
          onDeleteDomain={handleDeleteDomain}
          onBulkUpdateStrategy={handleBulkUpdateStrategy}
          onBulkDelete={handleBulkDelete}
          onClearSelection={() => setSelectedIds([])}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/60 py-4 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-emerald-400" />
            <span>DomainVault &copy; {new Date().getFullYear()} • Enterprise Domain Asset Management</span>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span>Synchronized with Dan, Sedo, Afternic & Squadhelp</span>
            <span className="text-emerald-500 font-mono">Gemini 3.8 Flash Ready</span>
          </div>
        </div>
      </footer>

      {/* Sales & Marketplace Drawer */}
      <SalesDrawer
        isOpen={!!salesDrawerDomain}
        onClose={() => setSalesDrawerDomain(null)}
        domain={salesDrawerDomain}
        onSaveDomain={handleSaveDomain}
        onOpenAppraisal={(d) => {
          setAppraisalModalDomain(d);
        }}
      />

      {/* AI Appraisal & Sales Pitch Assistant Modal */}
      <AppraisalModal
        isOpen={!!appraisalModalDomain}
        onClose={() => setAppraisalModalDomain(null)}
        domain={appraisalModalDomain}
        onApplyValuation={handleApplyValuation}
      />

      {/* Add / Edit Domain Modal */}
      <DomainModal
        isOpen={isAddModalOpen || !!editingDomain}
        onClose={() => {
          setIsAddModalOpen(false);
          setEditingDomain(null);
        }}
        domainToEdit={editingDomain}
        onSaveDomain={handleSaveDomain}
      />

      {/* Cloudflare Auto-Sync Modal */}
      <CloudflareSyncModal
        isOpen={isCloudflareModalOpen}
        onClose={() => setIsCloudflareModalOpen(false)}
        existingDomains={domains}
        onImportDomains={handleImportCloudflareDomains}
      />
    </div>
  );
}

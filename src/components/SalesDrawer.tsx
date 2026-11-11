import React, { useState } from 'react';
import {
  X,
  DollarSign,
  TrendingUp,
  Tag,
  CheckCircle,
  Clock,
  Ban,
  Plus,
  ExternalLink,
  Percent,
  Calculator,
  AlertCircle,
  Share2,
  Trash2,
  Sparkles,
} from 'lucide-react';
import {
  DomainItem,
  MarketplaceListing,
  MarketplaceName,
  DomainOffer,
  OfferStatus,
} from '../types/domain';
import { DEFAULT_MARKETPLACES } from '../data/mockDomains';

interface SalesDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainItem | null;
  onSaveDomain: (updated: DomainItem) => void;
  onOpenAppraisal: (domain: DomainItem) => void;
}

export const SalesDrawer: React.FC<SalesDrawerProps> = ({
  isOpen,
  onClose,
  domain,
  onSaveDomain,
  onOpenAppraisal,
}) => {
  if (!isOpen || !domain) return null;

  // Local state for sales drawer
  const [binPrice, setBinPrice] = useState<number | undefined>(domain.binPrice);
  const [minOffer, setMinOffer] = useState<number | undefined>(domain.minOffer);
  const [marketplaces, setMarketplaces] = useState<MarketplaceListing[]>(() => {
    // Merge existing domain marketplaces with defaults
    const current = domain.marketplaces || [];
    return DEFAULT_MARKETPLACES.map((def) => {
      const match = current.find((m) => m.name === def.name);
      return match ? { ...match } : { ...def };
    });
  });

  const [offers, setOffers] = useState<DomainOffer[]>(domain.offers || []);

  // New offer form state
  const [showAddOffer, setShowAddOffer] = useState(false);
  const [newOfferAmount, setNewOfferAmount] = useState<string>('');
  const [newOfferBuyer, setNewOfferBuyer] = useState<string>('');
  const [newOfferPlatform, setNewOfferPlatform] = useState<string>('Afternic');
  const [newOfferNotes, setNewOfferNotes] = useState<string>('');
  const [saveSuccessNotice, setSaveSuccessNotice] = useState(false);

  const toggleMarketplace = (name: MarketplaceName) => {
    setMarketplaces((prev) =>
      prev.map((m) => (m.name === name ? { ...m, active: !m.active } : m))
    );
  };

  const updateMarketplaceUrl = (name: MarketplaceName, url: string) => {
    setMarketplaces((prev) =>
      prev.map((m) => (m.name === name ? { ...m, listingUrl: url } : m))
    );
  };

  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(newOfferAmount);
    if (!amountNum || isNaN(amountNum) || amountNum <= 0) {
      alert('Please enter a valid offer amount');
      return;
    }

    const newOffer: DomainOffer = {
      id: `off-${Date.now()}`,
      amount: amountNum,
      buyerName: newOfferBuyer.trim() || 'Anonymous Buyer',
      platform: newOfferPlatform,
      date: new Date().toISOString().split('T')[0],
      status: 'Pending',
      notes: newOfferNotes.trim() || undefined,
    };

    setOffers([newOffer, ...offers]);
    setNewOfferAmount('');
    setNewOfferBuyer('');
    setNewOfferNotes('');
    setShowAddOffer(false);
  };

  const handleUpdateOfferStatus = (offerId: string, newStatus: OfferStatus) => {
    setOffers((prev) =>
      prev.map((o) => (o.id === offerId ? { ...o, status: newStatus } : o))
    );
  };

  const handleDeleteOffer = (offerId: string) => {
    setOffers((prev) => prev.filter((o) => o.id !== offerId));
  };

  const handleSaveAll = () => {
    const updated: DomainItem = {
      ...domain,
      strategy: 'Sell', // When managing sales drawer, strategy is Sell
      binPrice: binPrice && binPrice > 0 ? binPrice : undefined,
      minOffer: minOffer && minOffer > 0 ? minOffer : undefined,
      marketplaces,
      offers,
    };
    onSaveDomain(updated);
    setSaveSuccessNotice(true);
    setTimeout(() => setSaveSuccessNotice(false), 2500);
  };

  // Payout calculations
  const currentBin = binPrice || 0;
  const highestOffer = offers.reduce((max, o) => Math.max(max, o.amount), 0);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative w-full max-w-2xl bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col h-full z-10 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-mono tracking-tight">
                  {domain.name}
                </h2>
                <span className="px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  For Sale
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Marketplace listings, floor pricing & received offer tracker
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => onOpenAppraisal(domain)}
              className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
              title="Open AI Appraisal"
            >
              <Sparkles className="w-3.5 h-3.5 mr-1" />
              AI Appraisal
            </button>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Section 1: Pricing Controls & Net Payout Estimator */}
          <div className="bg-slate-950/60 border border-slate-800 rounded-2xl p-4.5 space-y-4">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              Target BIN & Minimum Floor
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Target Buy-It-Now (BIN) Price ($)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={binPrice ?? ''}
                    onChange={(e) =>
                      setBinPrice(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="e.g. 15000"
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Public listing price across syndicated exchanges
                </span>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Minimum Acceptable Offer / Floor ($)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">
                    $
                  </span>
                  <input
                    type="number"
                    min="0"
                    step="100"
                    value={minOffer ?? ''}
                    onChange={(e) =>
                      setMinOffer(e.target.value ? parseFloat(e.target.value) : undefined)
                    }
                    placeholder="e.g. 7500"
                    className="w-full pl-8 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Auto-reject offers below this threshold
                </span>
              </div>
            </div>

            {/* Net Payout Calculator Cards */}
            {currentBin > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <Calculator className="w-3.5 h-3.5 text-cyan-400" />
                    Estimated Net Proceeds at ${currentBin.toLocaleString()} BIN
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Dan / Afternic (15%)</div>
                    <div className="text-sm font-bold font-mono text-emerald-400 mt-0.5">
                      ${Math.round(currentBin * 0.85).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Squadhelp (25%)</div>
                    <div className="text-sm font-bold font-mono text-slate-300 mt-0.5">
                      ${Math.round(currentBin * 0.75).toLocaleString()}
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    <div className="text-[11px] text-slate-400">Private Landing (0%)</div>
                    <div className="text-sm font-bold font-mono text-cyan-400 mt-0.5">
                      ${currentBin.toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Multi-Marketplace Listings */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Share2 className="w-4 h-4 text-blue-400" />
                Marketplace Syndication
              </h3>
              <span className="text-xs text-slate-400">
                {marketplaces.filter((m) => m.active).length} of {marketplaces.length} active
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {marketplaces.map((m) => (
                <div
                  key={m.name}
                  className={`p-3 rounded-xl border transition-all ${
                    m.active
                      ? 'bg-slate-900/90 border-emerald-500/40 text-slate-100'
                      : 'bg-slate-950/40 border-slate-800 text-slate-400'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.active}
                        onChange={() => toggleMarketplace(m.name)}
                        className="rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/40 w-4 h-4 cursor-pointer"
                      />
                      <span className="text-xs font-semibold">{m.name}</span>
                    </label>
                    <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                      {m.commissionPercent}% fee
                    </span>
                  </div>

                  {m.active && (
                    <div className="mt-2.5 pt-2 border-t border-slate-800">
                      <input
                        type="text"
                        value={m.listingUrl || ''}
                        onChange={(e) => updateMarketplaceUrl(m.name, e.target.value)}
                        placeholder={`Listing URL or ID on ${m.name}`}
                        className="w-full px-2.5 py-1 bg-slate-950/80 border border-slate-700 rounded-lg text-[11px] text-slate-300 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Section 3: Offer Tracker */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Tag className="w-4 h-4 text-emerald-400" />
                  Offer Tracker & Negotiations
                </h3>
                <p className="text-xs text-slate-400">
                  {offers.length} total logged • Highest offer:{' '}
                  <span className="font-mono text-emerald-400 font-semibold">
                    ${highestOffer > 0 ? highestOffer.toLocaleString() : '0'}
                  </span>
                </p>
              </div>

              <button
                onClick={() => setShowAddOffer(!showAddOffer)}
                className="inline-flex items-center px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-colors"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Log Offer
              </button>
            </div>

            {/* Add Offer Form */}
            {showAddOffer && (
              <form
                onSubmit={handleAddOffer}
                className="bg-slate-950/80 border border-emerald-500/40 rounded-xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-400 uppercase tracking-wider">
                    Log Inbound Offer
                  </span>
                  <button
                    type="button"
                    onClick={() => setShowAddOffer(false)}
                    className="text-slate-500 hover:text-slate-300"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Offer Amount ($) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={newOfferAmount}
                      onChange={(e) => setNewOfferAmount(e.target.value)}
                      placeholder="e.g. 5000"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Buyer / Organization
                    </label>
                    <input
                      type="text"
                      value={newOfferBuyer}
                      onChange={(e) => setNewOfferBuyer(e.target.value)}
                      placeholder="e.g. Apex Health Corp"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">
                      Platform Channel
                    </label>
                    <select
                      value={newOfferPlatform}
                      onChange={(e) => setNewOfferPlatform(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Afternic">Afternic</option>
                      <option value="Sedo">Sedo</option>
                      <option value="Dan">Dan.com</option>
                      <option value="GoDaddy">GoDaddy</option>
                      <option value="Squadhelp">Squadhelp</option>
                      <option value="Direct Inbound">Direct Inbound / Email</option>
                      <option value="Broker">Broker Referral</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">
                    Notes / Counter Conditions
                  </label>
                  <input
                    type="text"
                    value={newOfferNotes}
                    onChange={(e) => setNewOfferNotes(e.target.value)}
                    placeholder="e.g. Buyer asked for 14-day hold or 3-month lease-to-own"
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowAddOffer(false)}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-400 text-slate-950 hover:bg-emerald-300"
                  >
                    Save Offer
                  </button>
                </div>
              </form>
            )}

            {/* List of Offers */}
            {offers.length === 0 ? (
              <div className="p-4 rounded-xl border border-dashed border-slate-800 text-center text-xs text-slate-500">
                No inbound offers logged yet. Log an offer when an inquiry is received from Sedo, Dan, or direct email.
              </div>
            ) : (
              <div className="space-y-2">
                {offers.map((offer) => {
                  const statusColors: Record<OfferStatus, string> = {
                    Pending: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
                    Accepted: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
                    Declined: 'bg-rose-500/15 text-rose-300 border-rose-500/30',
                    Countered: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
                  };

                  return (
                    <div
                      key={offer.id}
                      className="p-3 rounded-xl bg-slate-950/60 border border-slate-800 hover:border-slate-700 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-base font-bold font-mono text-emerald-400">
                            ${offer.amount.toLocaleString()}
                          </span>
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusColors[offer.status]}`}>
                            {offer.status}
                          </span>
                          <span className="text-xs text-slate-300">
                            via <span className="font-medium text-slate-200">{offer.platform}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {offer.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => handleUpdateOfferStatus(offer.id, 'Accepted')}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
                                title="Accept this offer"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => handleUpdateOfferStatus(offer.id, 'Countered')}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                                title="Mark as countered"
                              >
                                Counter
                              </button>
                              <button
                                onClick={() => handleUpdateOfferStatus(offer.id, 'Declined')}
                                className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/20 text-rose-300 hover:bg-rose-500/30"
                                title="Decline this offer"
                              >
                                Decline
                              </button>
                            </>
                          )}
                          <button
                            onClick={() => handleDeleteOffer(offer.id)}
                            className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                            title="Delete offer log"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      <div className="mt-1 flex items-center justify-between text-[11px] text-slate-400">
                        <span>Buyer: {offer.buyerName}</span>
                        <span className="font-mono text-slate-500">{offer.date}</span>
                      </div>

                      {offer.notes && (
                        <p className="mt-1 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-800/80">
                          {offer.notes}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/90 flex items-center justify-between shrink-0">
          <div>
            {saveSuccessNotice && (
              <span className="text-xs font-semibold text-emerald-400 flex items-center gap-1 animate-fade-in">
                <CheckCircle className="w-4 h-4" />
                Sales settings saved!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Close
            </button>
            <button
              onClick={handleSaveAll}
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
            >
              Save Sales Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

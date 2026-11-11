import React, { useState, useEffect } from 'react';
import { X, Globe, DollarSign, Calendar, Tag, Server, FileText, Check } from 'lucide-react';
import { DomainItem, DomainStrategy } from '../types/domain';
import { DEFAULT_MARKETPLACES } from '../data/mockDomains';

interface DomainModalProps {
  isOpen: boolean;
  onClose: () => void;
  domainToEdit: DomainItem | null;
  onSaveDomain: (domain: DomainItem) => void;
}

const COMMON_REGISTRARS = [
  'GoDaddy',
  'Namecheap',
  'Porkbun',
  'Dynadot',
  'Cloudflare',
  'NameSilo',
  'Squarespace / Google Domains',
  'Network Solutions',
  'Other / Custom',
];

const COMMON_DNS = [
  'Cloudflare',
  'Vercel',
  'AWS Route 53',
  'GoDaddy DNS',
  'Namecheap DNS',
  'Porkbun DNS',
  'Custom Nameservers',
];

export const DomainModal: React.FC<DomainModalProps> = ({
  isOpen,
  onClose,
  domainToEdit,
  onSaveDomain,
}) => {
  if (!isOpen) return null;

  const isEditing = !!domainToEdit;

  const [name, setName] = useState(domainToEdit?.name || '');
  const [tld, setTld] = useState(domainToEdit?.tld || '.com');
  const [registrar, setRegistrar] = useState(domainToEdit?.registrar || 'Porkbun');
  const [customRegistrar, setCustomRegistrar] = useState('');
  const [dnsProvider, setDnsProvider] = useState(domainToEdit?.dnsProvider || 'Cloudflare');
  const [customDns, setCustomDns] = useState('');
  const [annualCost, setAnnualCost] = useState<number>(domainToEdit?.annualCost ?? 12.99);
  const [expiryDate, setExpiryDate] = useState(
    domainToEdit?.expiryDate ||
      new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [strategy, setStrategy] = useState<DomainStrategy>(domainToEdit?.strategy || 'Sell');
  const [binPrice, setBinPrice] = useState<number | undefined>(domainToEdit?.binPrice);
  const [minOffer, setMinOffer] = useState<number | undefined>(domainToEdit?.minOffer);
  const [category, setCategory] = useState(domainToEdit?.category || '');
  const [tagsInput, setTagsInput] = useState(domainToEdit?.tags?.join(', ') || '');
  const [trafficMonthly, setTrafficMonthly] = useState<number | undefined>(
    domainToEdit?.trafficMonthly
  );
  const [notes, setNotes] = useState(domainToEdit?.notes || '');

  // Auto-detect TLD when user types domain name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toLowerCase().trim();
    setName(val);
    const dotIndex = val.lastIndexOf('.');
    if (dotIndex !== -1 && dotIndex < val.length - 1) {
      setTld(val.substring(dotIndex));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Domain name is required');
      return;
    }

    const finalRegistrar =
      registrar === 'Other / Custom' && customRegistrar.trim()
        ? customRegistrar.trim()
        : registrar;

    const finalDns =
      dnsProvider === 'Custom Nameservers' && customDns.trim()
        ? customDns.trim()
        : dnsProvider;

    const tagsArray = tagsInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t.length > 0);

    const domainPayload: DomainItem = {
      id: domainToEdit?.id || `dom-${Date.now()}`,
      name: name.trim(),
      tld: tld || '.com',
      registrar: finalRegistrar,
      dnsProvider: finalDns,
      annualCost: annualCost >= 0 ? annualCost : 0,
      expiryDate,
      strategy,
      binPrice: strategy === 'Sell' && binPrice && binPrice > 0 ? binPrice : undefined,
      minOffer: strategy === 'Sell' && minOffer && minOffer > 0 ? minOffer : undefined,
      category: category.trim() || undefined,
      tags: tagsArray,
      trafficMonthly: trafficMonthly && trafficMonthly > 0 ? trafficMonthly : undefined,
      notes: notes.trim() || undefined,
      marketplaces: domainToEdit?.marketplaces || DEFAULT_MARKETPLACES.map((m) => ({ ...m })),
      offers: domainToEdit?.offers || [],
      appraisal: domainToEdit?.appraisal,
      createdAt: domainToEdit?.createdAt || new Date().toISOString().split('T')[0],
    };

    onSaveDomain(domainPayload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-2xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-emerald-400">
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white">
                {isEditing ? `Edit Domain: ${domainToEdit.name}` : 'Add New Domain to Vault'}
              </h2>
              <p className="text-xs text-slate-400">
                Configure registrar details, annual renewal cost, holding strategy, and pricing
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">
          {/* Row 1: Domain Name & TLD */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Domain Name *
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={name}
                  onChange={handleNameChange}
                  placeholder="e.g. cloudnexus.ai or fintechflow.com"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Extension (TLD)
              </label>
              <input
                type="text"
                value={tld}
                onChange={(e) => setTld(e.target.value)}
                placeholder=".com"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 2: Strategy Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Portfolio Strategy *
            </label>
            <div className="grid grid-cols-3 gap-2.5">
              <button
                type="button"
                onClick={() => setStrategy('Sell')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  strategy === 'Sell'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                Sell (List for Sale)
              </button>

              <button
                type="button"
                onClick={() => setStrategy('Keep')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  strategy === 'Keep'
                    ? 'bg-blue-500/20 text-blue-300 border-blue-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-blue-400"></span>
                Keep (Active Asset)
              </button>

              <button
                type="button"
                onClick={() => setStrategy('Drop')}
                className={`py-2 px-3 rounded-xl text-xs font-semibold border flex items-center justify-center gap-2 transition-all ${
                  strategy === 'Drop'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-sm'
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="w-2 h-2 rounded-full bg-rose-400"></span>
                Drop (Do Not Renew)
              </button>
            </div>
          </div>

          {/* Conditional Pricing for Sell */}
          {strategy === 'Sell' && (
            <div className="p-3.5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
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
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-emerald-400 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-emerald-300 mb-1">
                  Minimum Floor Offer ($)
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
                    className="w-full pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Row 3: Registrar & DNS Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Registrar
              </label>
              <select
                value={registrar}
                onChange={(e) => setRegistrar(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {COMMON_REGISTRARS.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
              {registrar === 'Other / Custom' && (
                <input
                  type="text"
                  value={customRegistrar}
                  onChange={(e) => setCustomRegistrar(e.target.value)}
                  placeholder="Enter custom registrar name"
                  className="mt-2 w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                DNS / Hosting Provider
              </label>
              <select
                value={dnsProvider}
                onChange={(e) => setDnsProvider(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                {COMMON_DNS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
              {dnsProvider === 'Custom Nameservers' && (
                <input
                  type="text"
                  value={customDns}
                  onChange={(e) => setCustomDns(e.target.value)}
                  placeholder="e.g. ns1.customhost.com"
                  className="mt-2 w-full px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none"
                />
              )}
            </div>
          </div>

          {/* Row 4: Annual Cost & Expiry Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Annual Renewal Fee ($ / year) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-slate-500 font-mono text-xs">
                  $
                </span>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={annualCost}
                  onChange={(e) => setAnnualCost(parseFloat(e.target.value) || 0)}
                  placeholder="12.99"
                  className="w-full pl-8 pr-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-sm font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Expiration Date *
              </label>
              <input
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Row 5: Category & Monthly Traffic */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Category / Vertical
              </label>
              <input
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Artificial Intelligence, FinTech, Health"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Monthly Traffic (Estimated hits/mo)
              </label>
              <input
                type="number"
                min="0"
                value={trafficMonthly ?? ''}
                onChange={(e) =>
                  setTrafficMonthly(e.target.value ? parseInt(e.target.value) : undefined)
                }
                placeholder="e.g. 450"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs font-mono text-slate-200 focus:outline-none focus:border-emerald-500"
              />
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Tags (comma-separated)
            </label>
            <input
              type="text"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
              placeholder="e.g. B2B, SaaS, .com, Brandable"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1.5">
              Internal Notes
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Private portfolio notes, acquisition rationale, or transfer authorization codes..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Submit Actions */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 transition-all shadow-md shadow-emerald-500/20"
            >
              {isEditing ? 'Save Changes' : 'Add Domain'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

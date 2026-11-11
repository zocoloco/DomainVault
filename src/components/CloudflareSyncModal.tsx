import React, { useState, useEffect } from 'react';
import {
  X,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ArrowRight,
  ShieldCheck,
  Globe,
  Plus,
  Server,
  Layers,
  Sparkles,
} from 'lucide-react';
import { DomainItem, DomainStrategy } from '../types/domain';
import { DEFAULT_MARKETPLACES } from '../data/mockDomains';

interface CloudflareSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  existingDomains: DomainItem[];
  onImportDomains: (domainsToImport: DomainItem[]) => void;
}

export const CloudflareSyncModal: React.FC<CloudflareSyncModalProps> = ({
  isOpen,
  onClose,
  existingDomains,
  onImportDomains,
}) => {
  if (!isOpen) return null;

  const [loading, setLoading] = useState(false);
  const [statusChecked, setStatusChecked] = useState(false);
  const [isConfigured, setIsConfigured] = useState(false);
  const [hasAccountId, setHasAccountId] = useState(false);
  const [hasEmail, setHasEmail] = useState(false);
  const [isGlobalKey, setIsGlobalKey] = useState(false);
  const [tokenClassification, setTokenClassification] = useState<string>('unknown');
  const [tokenLength, setTokenLength] = useState<number>(0);
  const [accountIdMismatch, setAccountIdMismatch] = useState<boolean>(false);
  const [accountEmail, setAccountEmail] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Pulled domains state for staging & review
  const [pulledDomains, setPulledDomains] = useState<
    Array<{
      domain: DomainItem;
      selected: boolean;
      alreadyExists: boolean;
    }>
  >([]);

  // Check connection status on open
  useEffect(() => {
    checkStatus();
  }, []);

  const checkStatus = async () => {
    try {
      const res = await fetch('/api/integrations/cloudflare/status');
      if (res.ok) {
        const data = await res.json();
        setIsConfigured(data.configured);
        setHasAccountId(data.hasAccountId);
        setHasEmail(data.hasEmail);
        setIsGlobalKey(data.isGlobalKey);
        setTokenClassification(data.tokenClassification || 'unknown');
        setTokenLength(data.tokenLength || 0);
        if (data.isAccountId || data.tokenLength === 32) {
          setAccountIdMismatch(true);
        }
      }
    } catch {
      // Fallback
    } finally {
      setStatusChecked(true);
    }
  };

  const handleLiveSync = async () => {
    setLoading(true);
    setErrorMessage(null);
    setAccountIdMismatch(false);
    try {
      const res = await fetch('/api/integrations/cloudflare/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: accountEmail.trim() || undefined,
        }),
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        if (data.isAccountIdMismatch || data.tokenLength === 32) {
          setAccountIdMismatch(true);
        }
        setErrorMessage(data.error || 'Failed to pull domains from Cloudflare.');
        return;
      }

      processIncomingDomains(data.domains);
    } catch (err: unknown) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Network error while contacting Cloudflare sync server.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handleDemoSync = async () => {
    setLoading(true);
    setErrorMessage(null);
    try {
      const res = await fetch('/api/integrations/cloudflare/demo-sync', {
        method: 'POST',
      });
      const data = await res.json();
      processIncomingDomains(data.domains);
    } catch (err: unknown) {
      setErrorMessage('Failed to run demo sync simulation.');
    } finally {
      setLoading(false);
    }
  };

  const processIncomingDomains = (rawList: DomainItem[]) => {
    const existingNames = new Set(existingDomains.map((d) => d.name.toLowerCase()));
    const staged = rawList.map((d) => ({
      domain: {
        ...d,
        marketplaces: DEFAULT_MARKETPLACES.map((m) => ({ ...m })),
        offers: [],
      },
      selected: !existingNames.has(d.name.toLowerCase()),
      alreadyExists: existingNames.has(d.name.toLowerCase()),
    }));
    setPulledDomains(staged);
  };

  const toggleSelectDomain = (index: number) => {
    setPulledDomains((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, selected: !item.selected } : item))
    );
  };

  const updateStagedStrategy = (index: number, newStrategy: DomainStrategy) => {
    setPulledDomains((prev) =>
      prev.map((item, idx) =>
        idx === index
          ? {
              ...item,
              domain: { ...item.domain, strategy: newStrategy },
            }
          : item
      )
    );
  };

  const handleConfirmImport = () => {
    const toImport = pulledDomains.filter((item) => item.selected).map((item) => item.domain);
    if (toImport.length === 0) {
      alert('Please select at least one domain to import.');
      return;
    }

    onImportDomains(toImport);
    onClose();
  };

  const selectedCount = pulledDomains.filter((d) => d.selected).length;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4.5 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-400 p-0.5 shadow-md shadow-orange-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Cloud className="w-5 h-5 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white tracking-tight">
                  Cloudflare Auto-Connect & Zone Sync
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    isConfigured
                      ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                      : 'bg-amber-500/15 text-amber-300 border border-amber-500/30'
                  }`}
                >
                  {isConfigured ? 'Token Connected' : 'Setup Required'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Automatically pull and synchronize all DNS zones and registrar domains from Cloudflare
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

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Account ID Mismatch Warning Card */}
          {(accountIdMismatch || tokenLength === 32 || tokenClassification === 'account_id') && (
            <div className="bg-gradient-to-r from-amber-950/60 via-amber-900/30 to-slate-950 border-2 border-amber-500/50 rounded-2xl p-4.5 space-y-3 shadow-lg shadow-amber-500/5">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5 text-amber-400" />
                </div>
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-bold text-amber-300">
                      Cloudflare Account ID Detected (32 Characters)
                    </h4>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-200 border border-amber-500/30">
                      Length: {tokenLength} chars
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    The value currently saved in <code className="text-amber-300 font-mono font-bold">CLOUDFLARE_API_TOKEN</code> is 32 characters long. In Cloudflare, 32-character strings are <strong>Account IDs</strong> or <strong>Zone IDs</strong>, not authentication credentials.
                  </p>
                </div>
              </div>

              {/* Step-by-step resolution box */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 text-xs text-slate-200 space-y-2">
                <div className="font-semibold text-amber-300 flex items-center justify-between">
                  <span>How to generate the correct 40-character API Token:</span>
                  <a
                    href="https://dash.cloudflare.com/profile/api-tokens"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-amber-400 hover:text-amber-300 underline font-semibold"
                  >
                    Open Cloudflare API Tokens Page &rarr;
                  </a>
                </div>
                <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px]">
                  <li>
                    Go to <strong>My Profile &rarr; API Tokens</strong> (<code className="text-amber-300">https://dash.cloudflare.com/profile/api-tokens</code>).
                  </li>
                  <li>
                    Click the blue <strong>"Create Token"</strong> button (do <em>not</em> copy the Account ID or Zone ID from the domain overview sidebar).
                  </li>
                  <li>
                    Under <strong>API Token Templates</strong>, click <strong>"Use template"</strong> next to <strong>Read all zones</strong>.
                  </li>
                  <li>
                    Scroll to the bottom and click <strong>"Continue to summary"</strong>, then <strong>"Create Token"</strong>.
                  </li>
                  <li>
                    Copy the newly generated <strong>40-character token</strong>.
                  </li>
                  <li>
                    Open <strong>Settings &rarr; Secrets</strong> in AI Studio and paste it into <code className="text-emerald-400 font-mono">CLOUDFLARE_API_TOKEN</code>.
                  </li>
                </ol>
              </div>

              <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                <span>Want to test the domain sync workflow right now?</span>
                <button
                  onClick={handleDemoSync}
                  className="px-3 py-1 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors"
                >
                  Test Simulated Sync (Demo)
                </button>
              </div>
            </div>
          )}

          {/* Connection Status Card */}
          <div className="bg-slate-950/70 border border-slate-800 rounded-2xl p-4.5 space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isConfigured && !accountIdMismatch
                      ? 'bg-emerald-400 animate-pulse'
                      : 'bg-amber-400'
                  }`}
                />
                <div>
                  <h4 className="text-xs font-bold text-slate-200">
                    {isConfigured
                      ? `Cloudflare Token Configured (${tokenLength} chars)`
                      : 'Cloudflare API Token Not Found in Environment'}
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    {isConfigured
                      ? tokenLength === 32
                        ? '32-character string detected (Account ID format). Needs 40-character API Token.'
                        : `Ready to pull live zones via api.cloudflare.com/client/v4/zones`
                      : 'Connect your Cloudflare account by adding your API token to Settings > Secrets.'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {isConfigured ? (
                  <button
                    onClick={handleLiveSync}
                    disabled={loading}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loading ? 'animate-spin' : ''}`} />
                    {loading ? 'Pulling Zones...' : 'Sync Live Cloudflare Domains'}
                  </button>
                ) : (
                  <button
                    onClick={handleDemoSync}
                    disabled={loading}
                    className="inline-flex items-center px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700 transition-colors disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                    {loading ? 'Loading Demo...' : 'Simulate Cloudflare Sync (Demo)'}
                  </button>
                )}
              </div>
            </div>

            {/* Cloudflare Account Email (for Global API Keys) */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex items-center justify-between mb-1">
                <label className="text-[11px] font-semibold text-slate-300">
                  Cloudflare Account Email
                </label>
                <span className="text-[10px] text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  Auto-detects API Token vs Global Key
                </span>
              </div>
              <div className="flex gap-2">
                <input
                  type="email"
                  value={accountEmail}
                  onChange={(e) => setAccountEmail(e.target.value)}
                  placeholder="e.g. user@example.com"
                  className="flex-1 px-3 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-400 font-mono"
                />
                {isConfigured && (
                  <button
                    onClick={handleLiveSync}
                    disabled={loading}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-semibold bg-amber-400 hover:bg-amber-300 text-slate-950 transition-colors shrink-0 disabled:opacity-50"
                  >
                    {loading ? 'Connecting...' : 'Sync Now'}
                  </button>
                )}
              </div>
              <p className="text-[10px] text-slate-400 mt-1">
                Required only if your <code className="text-amber-300 font-mono">CLOUDFLARE_API_TOKEN</code> is a 37-character Global API Key. If you created a modern scoped API Token, this email is safely ignored.
              </p>
            </div>

            {/* Error banner if sync fails */}
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs space-y-2">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <div className="flex-1 leading-relaxed">
                    <span className="font-bold">Sync Failed:</span> {errorMessage}
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] text-slate-300 space-y-1">
                  <div className="font-semibold text-amber-300">Quick Fix for "Invalid request headers":</div>
                  <ul className="list-disc list-inside text-slate-400 space-y-0.5">
                    <li>
                      <strong>If using a Cloudflare API Token:</strong> Go to Cloudflare &rarr; <em>My Profile &rarr; API Tokens &rarr; Create Token &rarr; Read all zones template</em>. Paste only the token string (without the word <code className="text-amber-300">Bearer</code> or quotes).
                    </li>
                    <li>
                      <strong>If using a Global API Key:</strong> Enter your Cloudflare account email in the box above or add <code className="text-amber-300">CLOUDFLARE_EMAIL</code> in Secrets.
                    </li>
                  </ul>
                </div>

                <div>
                  <button
                    onClick={handleDemoSync}
                    className="underline hover:text-rose-200 text-[11px] font-medium"
                  >
                    Click here to preview and test with simulated Cloudflare domains instead.
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Setup Instructions (accordion/helper) */}
          {!isConfigured && (
            <div className="p-4 rounded-2xl bg-slate-950/40 border border-slate-800/80 space-y-2.5 text-xs text-slate-300">
              <h5 className="font-bold text-slate-200 flex items-center gap-1.5 text-xs uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                How to set up Live Cloudflare Auto-Sync:
              </h5>
              <ol className="list-decimal list-inside space-y-1 text-slate-400 text-[11px] leading-relaxed">
                <li>
                  Go to Cloudflare Dashboard &rarr; <strong>My Profile &rarr; API Tokens</strong> &rarr; <strong>Create Token</strong>.
                </li>
                <li>
                  Select the template <strong>Read all zones</strong> (Permissions: <code className="text-amber-300 font-mono">Zone:Read</code> and optional <code className="text-amber-300 font-mono">Registrar:Read</code>).
                </li>
                <li>
                  Add the secret key in AI Studio <strong>Settings &rarr; Secrets</strong> as <code className="text-emerald-400 font-mono">CLOUDFLARE_API_TOKEN</code> (and optional <code className="text-emerald-400 font-mono">CLOUDFLARE_ACCOUNT_ID</code>).
                </li>
              </ol>
            </div>
          )}

          {/* Staging / Preview Table of Pulled Domains */}
          {pulledDomains.length > 0 && (
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">
                    Discovered Cloudflare Domains ({pulledDomains.length})
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Select domains to import into your DomainVault portfolio
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 font-semibold">
                  {selectedCount} selected
                </span>
              </div>

              <div className="border border-slate-800 rounded-xl overflow-hidden bg-slate-950/60 divide-y divide-slate-800/80">
                {pulledDomains.map((item, idx) => (
                  <div
                    key={item.domain.name}
                    className={`p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-colors ${
                      item.selected ? 'bg-amber-950/10' : 'opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="checkbox"
                        checked={item.selected}
                        onChange={() => toggleSelectDomain(idx)}
                        className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-amber-500/40 w-4 h-4 cursor-pointer"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-slate-100 text-xs">
                            {item.domain.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                            {item.domain.tld}
                          </span>
                          {item.alreadyExists && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                              Already in Portfolio
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                          <span>Expiry: {item.domain.expiryDate}</span>
                          <span>•</span>
                          <span>Renewal: ${item.domain.annualCost.toFixed(2)}/yr</span>
                          <span>•</span>
                          <span>DNS: Cloudflare</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <span className="text-[11px] text-slate-400">Strategy:</span>
                      <select
                        value={item.domain.strategy}
                        onChange={(e) =>
                          updateStagedStrategy(idx, e.target.value as DomainStrategy)
                        }
                        className="px-2 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
                      >
                        <option value="Keep">Keep</option>
                        <option value="Sell">Sell</option>
                        <option value="Drop">Drop</option>
                      </select>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-white transition-colors"
          >
            Cancel
          </button>

          {pulledDomains.length > 0 ? (
            <button
              onClick={handleConfirmImport}
              disabled={selectedCount === 0}
              className="inline-flex items-center px-5 py-2 rounded-xl text-xs font-bold text-slate-950 bg-amber-400 hover:bg-amber-300 disabled:opacity-50 transition-all shadow-md shadow-amber-500/20"
            >
              <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
              Import {selectedCount} {selectedCount === 1 ? 'Domain' : 'Domains'}
            </button>
          ) : (
            <div className="text-[11px] text-slate-500 italic">
              Click sync above to discover Cloudflare domains
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

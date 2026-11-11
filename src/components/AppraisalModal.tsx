import React, { useState, useEffect } from 'react';
import {
  X,
  Sparkles,
  DollarSign,
  TrendingUp,
  Mail,
  Copy,
  Check,
  RotateCw,
  Award,
  Zap,
  Building,
  ArrowRight,
  ShieldCheck,
  ChevronRight,
  BarChart2,
  ExternalLink,
} from 'lucide-react';
import { DomainItem, DomainAppraisal } from '../types/domain';
import { generateHeuristicAppraisal, generateOutreachPitch } from '../utils/valuationEngine';

interface AppraisalModalProps {
  isOpen: boolean;
  onClose: () => void;
  domain: DomainItem | null;
  onApplyValuation: (domainId: string, suggestedPrice: number) => void;
}

export const AppraisalModal: React.FC<AppraisalModalProps> = ({
  isOpen,
  onClose,
  domain,
  onApplyValuation,
}) => {
  if (!isOpen || !domain) return null;

  const [activeTab, setActiveTab] = useState<'valuation' | 'pitch'>('valuation');

  // Appraisal State
  const [appraisal, setAppraisal] = useState<DomainAppraisal | null>(domain.appraisal || null);
  const [loadingAppraisal, setLoadingAppraisal] = useState(false);
  const [appliedPriceNotice, setAppliedPriceNotice] = useState<number | null>(null);

  // Pitch Generator State
  const [tone, setTone] = useState('Direct & Professional');
  const [industry, setIndustry] = useState(domain.category || 'Technology & SaaS');
  const [targetBuyer, setTargetBuyer] = useState('Founder / CEO');
  const [pitchData, setPitchData] = useState<{
    subject: string;
    pitch: string;
    keySellingPoints: string[];
    callToAction: string;
  } | null>(null);
  const [loadingPitch, setLoadingPitch] = useState(false);
  const [copiedPitch, setCopiedPitch] = useState(false);

  // Auto-appraise if domain doesn't have an appraisal yet
  useEffect(() => {
    if (!domain.appraisal && !appraisal) {
      handleRunAppraisal();
    } else if (domain.appraisal) {
      setAppraisal(domain.appraisal);
    }
  }, [domain.id]);

  const handleRunAppraisal = async () => {
    setLoadingAppraisal(true);
    try {
      const res = await fetch('/api/ai/appraise', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.name,
          tld: domain.tld,
          category: domain.category,
          currentBin: domain.binPrice,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setAppraisal(data);
      } else {
        const fallback = generateHeuristicAppraisal(domain.name);
        setAppraisal(fallback);
      }
    } catch (err) {
      console.warn('API error, falling back to heuristic engine:', err);
      const fallback = generateHeuristicAppraisal(domain.name);
      setAppraisal(fallback);
    } finally {
      setLoadingAppraisal(false);
    }
  };

  const handleGeneratePitch = async () => {
    setLoadingPitch(true);
    try {
      const res = await fetch('/api/ai/pitch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          domain: domain.name,
          industry,
          tone,
          targetBuyer,
          binPrice: domain.binPrice || appraisal?.fairMarket,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setPitchData(data);
      } else {
        const fallback = generateOutreachPitch({
          domain: domain.name,
          industry,
          tone,
          targetBuyer,
          binPrice: domain.binPrice || appraisal?.fairMarket,
        });
        setPitchData(fallback);
      }
    } catch (err) {
      const fallback = generateOutreachPitch({
        domain: domain.name,
        industry,
        tone,
        targetBuyer,
        binPrice: domain.binPrice || appraisal?.fairMarket,
      });
      setPitchData(fallback);
    } finally {
      setLoadingPitch(false);
    }
  };

  const handleCopyPitch = () => {
    if (!pitchData) return;
    const fullText = `Subject: ${pitchData.subject}\n\n${pitchData.pitch}\n\nKey Strengths:\n${pitchData.keySellingPoints.map((p) => `• ${p}`).join('\n')}\n\n${pitchData.callToAction}`;
    navigator.clipboard.writeText(fullText);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2200);
  };

  const handleApplyPrice = (price: number) => {
    onApplyValuation(domain.id, price);
    setAppliedPriceNotice(price);
    setTimeout(() => setAppliedPriceNotice(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-slate-950/80 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-700/80 rounded-3xl shadow-2xl overflow-hidden z-10 flex flex-col max-h-[90vh]">
        {/* Modal Top Bar */}
        <div className="px-6 py-4 border-b border-slate-800 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-cyan-400 p-0.5 shadow-md shadow-emerald-500/20">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-emerald-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold font-mono text-white tracking-tight">
                  {domain.name}
                </h2>
                <span className="px-2 py-0.5 rounded text-[11px] font-mono font-semibold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                  AI Appraisal Engine
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Accredited commercial valuation & targeted outbound sales pitch assistant
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-800 bg-slate-950/40 px-6 shrink-0">
          <button
            onClick={() => setActiveTab('valuation')}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'valuation'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            Commercial Valuation & Comps
          </button>
          <button
            onClick={() => {
              setActiveTab('pitch');
              if (!pitchData) handleGeneratePitch();
            }}
            className={`py-3 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'pitch'
                ? 'border-emerald-400 text-emerald-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Mail className="w-4 h-4" />
            Outreach Sales Pitch Generator
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {activeTab === 'valuation' ? (
            <div className="space-y-6">
              {/* Appraisal Re-run Bar */}
              <div className="flex items-center justify-between bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                <span className="text-xs text-slate-300 flex items-center gap-2">
                  <Award className="w-4 h-4 text-emerald-400" />
                  {appraisal
                    ? `Last appraised: ${appraisal.appraisedAt}`
                    : 'Analyzing domain characteristics...'}
                </span>
                <button
                  onClick={handleRunAppraisal}
                  disabled={loadingAppraisal}
                  className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors disabled:opacity-50"
                >
                  <RotateCw
                    className={`w-3.5 h-3.5 mr-1.5 ${loadingAppraisal ? 'animate-spin' : ''}`}
                  />
                  {loadingAppraisal ? 'Evaluating...' : 'Re-run AI Valuation'}
                </button>
              </div>

              {appraisal && (
                <>
                  {/* Three-Tier Pricing Cards */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                    {/* Conservative / Wholesale */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
                            Wholesale / Floor
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            Fast Cash
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-slate-200 mt-2">
                          ${appraisal.conservative.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Estimated wholesale liquidation price among domain investors.
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyPrice(appraisal.conservative)}
                        className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                      >
                        Set as Floor
                      </button>
                    </div>

                    {/* Fair Market */}
                    <div className="p-4 rounded-2xl bg-gradient-to-b from-emerald-950/30 to-slate-950/70 border-2 border-emerald-500/50 flex flex-col justify-between relative shadow-lg shadow-emerald-500/5">
                      <div className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-400 text-slate-950 uppercase tracking-wider">
                        Recommended BIN
                      </div>
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-emerald-400 uppercase tracking-wider">
                            Fair Market Value
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-emerald-400 mt-2">
                          ${appraisal.fairMarket.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-300 mt-1">
                          Target retail price for commercial end-users on Dan & Afternic.
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyPrice(appraisal.fairMarket)}
                        className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors shadow-sm"
                      >
                        Apply Fair Market BIN
                      </button>
                    </div>

                    {/* Premium End-User */}
                    <div className="p-4 rounded-2xl bg-slate-950/70 border border-cyan-500/30 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[11px] font-semibold text-cyan-400 uppercase tracking-wider">
                            Premium End-User
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-950/60 text-cyan-300 border border-cyan-800">
                            Enterprise
                          </span>
                        </div>
                        <div className="text-2xl font-bold font-mono text-cyan-300 mt-2">
                          ${appraisal.premium.toLocaleString()}
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1">
                          Potential buyout ceiling for well-funded venture corporations.
                        </p>
                      </div>
                      <button
                        onClick={() => handleApplyPrice(appraisal.premium)}
                        className="mt-3 w-full py-1.5 rounded-lg text-xs font-semibold bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-800 transition-colors"
                      >
                        Apply Premium BIN
                      </button>
                    </div>
                  </div>

                  {/* Feedback toast when applied */}
                  {appliedPriceNotice && (
                    <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-between animate-fade-in">
                      <span>
                        Target Buy-It-Now price updated to ${appliedPriceNotice.toLocaleString()} for{' '}
                        {domain.name}!
                      </span>
                      <Check className="w-4 h-4 text-emerald-400" />
                    </div>
                  )}

                  {/* Domain Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Quality Score</span>
                      <div className="text-lg font-bold font-mono text-emerald-400 mt-0.5">
                        {appraisal.qualityScore}/100
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Memorability</span>
                      <div className="text-lg font-bold text-slate-200 mt-0.5">
                        {appraisal.memorability}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Commercial Intent</span>
                      <div className="text-lg font-bold text-slate-200 mt-0.5">
                        {appraisal.commercialIntent}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800">
                      <span className="text-[11px] text-slate-400">Syllables & Length</span>
                      <div className="text-lg font-bold font-mono text-slate-200 mt-0.5">
                        {appraisal.syllableCount} syl • {domain.name.split('.')[0].length} chars
                      </div>
                    </div>
                  </div>

                  {/* Comparable Historical Sales */}
                  {appraisal.comparables && appraisal.comparables.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                        <BarChart2 className="w-3.5 h-3.5 text-blue-400" />
                        Verified Comparable Sales
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {appraisal.comparables.map((comp, idx) => (
                          <div
                            key={idx}
                            className="p-2.5 rounded-xl bg-slate-950/40 border border-slate-800 flex items-center justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono font-semibold text-slate-200">
                                {comp.domain}
                              </span>
                              <span className="text-[10px] text-slate-500 block">
                                Year: {comp.year}
                              </span>
                            </div>
                            <span className="font-mono font-bold text-emerald-400">
                              {comp.price}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Key Strengths & Rationale */}
                  <div className="space-y-3 pt-2 border-t border-slate-800">
                    <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Commercial Merits & Valuation Rationale
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
                      {appraisal.rationale}
                    </p>
                    <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                      {appraisal.strengths.map((str, idx) => (
                        <li
                          key={idx}
                          className="flex items-start gap-2 p-2 rounded-lg bg-slate-950/40 border border-slate-800/80 text-slate-300"
                        >
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{str}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          ) : (
            /* Pitch Tab */
            <div className="space-y-5">
              {/* Pitch Configuration Controls */}
              <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-xs font-bold text-white uppercase tracking-wider block">
                  Outreach Pitch Customization
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Tone & Voice</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    >
                      <option value="Direct & Professional">Direct & Professional</option>
                      <option value="Executive & Strategic">Executive & Strategic</option>
                      <option value="Friendly Venture Investor">Friendly Venture Investor</option>
                      <option value="Creative & Brand-forward">Creative & Brand-forward</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Industry</label>
                    <input
                      type="text"
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. AI SaaS, FinTech, Health"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Target Persona</label>
                    <input
                      type="text"
                      value={targetBuyer}
                      onChange={(e) => setTargetBuyer(e.target.value)}
                      placeholder="e.g. Founder / CEO, CMO"
                      className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    onClick={handleGeneratePitch}
                    disabled={loadingPitch}
                    className="inline-flex items-center px-4 py-2 rounded-xl text-xs font-bold bg-emerald-400 hover:bg-emerald-300 text-slate-950 transition-colors shadow-sm disabled:opacity-50"
                  >
                    <Sparkles className="w-3.5 h-3.5 mr-1.5" />
                    {loadingPitch ? 'Drafting pitch...' : 'Regenerate Outreach Email'}
                  </button>
                </div>
              </div>

              {/* Pitch Result Preview */}
              {pitchData && (
                <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                    <div className="space-y-0.5">
                      <span className="text-[11px] text-slate-400">Subject:</span>
                      <h4 className="text-sm font-semibold text-white font-mono">
                        {pitchData.subject}
                      </h4>
                    </div>

                    <button
                      onClick={handleCopyPitch}
                      className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-slate-700 transition-colors"
                    >
                      {copiedPitch ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 mr-1" />
                          Copy Outreach Email
                        </>
                      )}
                    </button>
                  </div>

                  {/* Body Paragraphs */}
                  <div className="space-y-3 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line bg-slate-900/50 p-4 rounded-xl border border-slate-800/80">
                    {pitchData.pitch}
                  </div>

                  {/* Bullet points */}
                  {pitchData.keySellingPoints && (
                    <div className="space-y-2 pt-2">
                      <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                        Core Value Propositions:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                        {pitchData.keySellingPoints.map((point, idx) => (
                          <div
                            key={idx}
                            className="p-2 rounded-lg bg-slate-900/40 border border-slate-800 text-slate-300 flex items-start gap-2"
                          >
                            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                            <span>{point}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Call To Action */}
                  <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 text-xs text-emerald-300 font-medium flex items-center gap-2">
                    <ArrowRight className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>{pitchData.callToAction}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/80 flex items-center justify-between shrink-0">
          <span className="text-xs text-slate-500">
            DomainVault Broker AI Engine powered by Gemini 3.8
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

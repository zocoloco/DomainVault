import React, { useRef } from 'react';
import {
  Globe,
  Plus,
  Download,
  RotateCcw,
  Sparkles,
  Layers,
  FileSpreadsheet,
  FileCode,
  Upload,
  Cloud,
} from 'lucide-react';
import { DomainItem } from '../types/domain';
import { exportToCsv, exportToJson } from '../utils/storage';

interface HeaderProps {
  domains: DomainItem[];
  onAddDomain: () => void;
  onResetData: () => void;
  onImportData: (imported: DomainItem[]) => void;
  onOpenCloudflareSync: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  domains,
  onAddDomain,
  onResetData,
  onImportData,
  onOpenCloudflareSync,
}) => {
  const [showExportMenu, setShowExportMenu] = React.useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        const parsed = JSON.parse(text);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onImportData(parsed);
          alert(`Successfully imported ${parsed.length} domains!`);
        } else {
          alert('Invalid JSON file format. Expected an array of domain objects.');
        }
      } catch (err) {
        alert('Failed to parse JSON file.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center space-x-3.5">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-400 p-0.5 shadow-lg shadow-emerald-500/20 flex items-center justify-center">
            <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
              <Globe className="h-5 w-5 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Domain<span className="text-emerald-400">Vault</span>
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Sparkles className="w-3 h-3 mr-1 inline text-emerald-400" />
                AI Broker Ready
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Portfolio valuation, holding cost analyzer & multi-exchange sales drawer
            </p>
          </div>
        </div>

        {/* Global actions */}
        <div className="flex items-center flex-wrap gap-2.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileImport}
            accept=".json"
            className="hidden"
          />

          <button
            onClick={onOpenCloudflareSync}
            className="inline-flex items-center px-3 py-2 text-xs font-semibold rounded-lg text-amber-300 bg-amber-950/40 border border-amber-500/40 hover:bg-amber-900/60 hover:text-amber-200 transition-colors shadow-sm"
            title="Auto-connect and pull domains from Cloudflare"
          >
            <Cloud className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            Sync Cloudflare
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-colors"
            title="Import domains from JSON"
          >
            <Upload className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
            Import
          </button>

          {/* Export Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-slate-300 bg-slate-900 border border-slate-700/80 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <Download className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
              Export
            </button>
            {showExportMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowExportMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-xl py-1.5 z-50 text-xs">
                  <button
                    onClick={() => {
                      exportToCsv(domains);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                    Export CSV Spreadsheet
                  </button>
                  <button
                    onClick={() => {
                      exportToJson(domains);
                      setShowExportMenu(false);
                    }}
                    className="w-full text-left px-3.5 py-2 text-slate-300 hover:bg-slate-800 hover:text-white flex items-center gap-2"
                  >
                    <FileCode className="w-4 h-4 text-cyan-400" />
                    Export JSON Backup
                  </button>
                </div>
              </>
            )}
          </div>

          <button
            onClick={onResetData}
            className="inline-flex items-center px-3 py-2 text-xs font-medium rounded-lg text-slate-400 bg-slate-900/60 border border-slate-800 hover:bg-slate-800 hover:text-slate-200 transition-colors"
            title="Reset to sample portfolio dataset"
          >
            <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
            Reset Data
          </button>

          <button
            onClick={onAddDomain}
            className="inline-flex items-center px-3.5 py-2 text-xs font-semibold rounded-lg text-slate-950 bg-emerald-400 hover:bg-emerald-300 shadow-md shadow-emerald-500/20 transition-all active:scale-[0.98]"
          >
            <Plus className="w-4 h-4 mr-1.5 stroke-[2.5]" />
            Add Domain
          </button>
        </div>
      </div>
    </header>
  );
};

import React, { useState } from 'react';
import { Category, Tool } from '../types';
import Icon from './Icon';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  tools: Tool[];
  onImport: (importedData: { categories: Category[]; tools: Tool[] }) => void;
}

export default function ExportImportModal({
  isOpen,
  onClose,
  categories,
  tools,
  onImport,
}: ExportImportModalProps) {
  const [importJson, setImportJson] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleExport = () => {
    try {
      const dataToExport = {
        _exportMetadata: {
          app: 'Tech Stack Command Center',
          exportedAt: new Date().toISOString(),
          version: '1.0.0',
        },
        categories,
        tools,
      };
      
      const jsonString = JSON.stringify(dataToExport, null, 2);
      
      // Dynamic download link
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `tech-stack-command-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setSuccessMsg('Layout configuration exported successfully!');
      setTimeout(() => setSuccessMsg(null), 3500);
    } catch (e: any) {
      setErrorMsg('Failed to export. Please try again.');
    }
  };

  const handleCopyClipboard = () => {
    const dataToExport = {
      app: 'Tech Stack Command Center',
      categories,
      tools,
    };
    navigator.clipboard.writeText(JSON.stringify(dataToExport, null, 2));
    setSuccessMsg('Layout copied to clipboard!');
    setTimeout(() => setSuccessMsg(null), 3000);
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!importJson.trim()) {
      setErrorMsg('Please paste a valid JSON string.');
      return;
    }

    try {
      const parsed = JSON.parse(importJson);
      
      if (!parsed.categories || !Array.isArray(parsed.categories)) {
        throw new Error("Missing 'categories' array.");
      }
      if (!parsed.tools || !Array.isArray(parsed.tools)) {
        throw new Error("Missing 'tools' array.");
      }

      // Quick validate schemas
      const validatedCategories = parsed.categories.map((c: any) => {
        if (!c.id || !c.name) throw new Error(`Category item is missing standard required identification parameters.`);
        return {
          id: String(c.id),
          name: String(c.name),
          icon: c.icon ? String(c.icon) : 'Compass',
          color: c.color ? String(c.color) : 'sky',
          isCollapsed: typeof c.isCollapsed === 'boolean' ? c.isCollapsed : false,
        };
      });

      const validatedTools = parsed.tools.map((t: any) => {
        if (!t.name || !t.url || !t.category) {
          throw new Error(`Tool "${t.name || 'unnamed'}" is missing required category/destination parameters.`);
        }
        return {
          id: t.id ? String(t.id) : `tool-${Math.random().toString(36).substr(2, 9)}`,
          name: String(t.name),
          url: String(t.url),
          category: String(t.category),
          customLogoUrl: t.customLogoUrl ? String(t.customLogoUrl) : undefined,
          description: t.description ? String(t.description) : undefined,
          isPinned: typeof t.isPinned === 'boolean' ? t.isPinned : false,
          clickCount: typeof t.clickCount === 'number' ? t.clickCount : 0,
          lastUsed: t.lastUsed ? String(t.lastUsed) : undefined,
        };
      });

      onImport({
        categories: validatedCategories,
        tools: validatedTools,
      });

      setSuccessMsg('Configuration imported successfully! Refreshing workspace.');
      setImportJson('');
      setTimeout(() => {
        setSuccessMsg(null);
        onClose();
      }, 1500);
    } catch (err: any) {
      setErrorMsg(`Import failed: ${err.message || 'Malformed JSON content.'}`);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-6 text-slate-100 flex flex-col gap-6 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
              <Icon name="Upload" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-display tracking-tight text-white">Backups & Transfers</h2>
              <p className="subtitle text-xs text-slate-400">Export or paste a JSON configuration to migration command layouts.</p>
            </div>
          </div>
          <button 
            type="button" 
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Feedback Messages */}
        {errorMsg && (
          <div className="p-3 bg-rose-500/15 border border-rose-500/20 text-rose-400 rounded-lg text-xs flex items-center gap-2 font-medium">
            <Icon name="AlertCircle" size={16} />
            <span>{errorMsg}</span>
          </div>
        )}
        {successMsg && (
          <div className="p-3 bg-emerald-500/15 border border-emerald-500/20 text-emerald-400 rounded-lg text-xs flex items-center gap-2 font-medium">
            <Icon name="Check" size={16} />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Dynamic Options */}
        <div className="grid grid-cols-2 gap-4">
          <button
            type="button"
            onClick={handleExport}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 hover:scale-[1.02] active:scale-95 text-slate-300 transition-all gap-2 group"
          >
            <div className="p-3 rounded-full bg-slate-800 text-amber-400 group-hover:text-amber-300 group-hover:scale-110 transition-all">
              <Icon name="Download" size={22} />
            </div>
            <span className="text-xs font-semibold text-white">Download Backup File</span>
            <span className="text-[10px] text-slate-500 text-center">Save complete workspace as a JSON document.</span>
          </button>

          <button
            type="button"
            onClick={handleCopyClipboard}
            className="flex flex-col items-center justify-center p-4 rounded-xl border border-slate-850 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/80 hover:scale-[1.02] active:scale-95 text-slate-300 transition-all gap-2 group"
          >
            <div className="p-3 rounded-full bg-slate-800 text-sky-400 group-hover:text-sky-300 group-hover:scale-110 transition-all">
              <Icon name="Activity" size={22} />
            </div>
            <span className="text-xs font-semibold text-white">Copy to Clipboard</span>
            <span className="text-[10px] text-slate-500 text-center">Instantly duplicate JSON format setting.</span>
          </button>
        </div>

        {/* Paste to Import */}
        <form onSubmit={handleImportSubmit} className="flex flex-col gap-3 border-t border-slate-850 pt-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-white">Import Configuration JSON</label>
            <p className="text-[10px] text-slate-500">Paste backup string content here to replace existing layouts.</p>
            <textarea
              placeholder='{ "categories": [...], "tools": [...] }'
              rows={4}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              className="w-full font-mono p-3 text-xs rounded-lg bg-slate-950 border border-slate-850 focus:outline-none focus:border-emerald-500 text-slate-300 placeholder-slate-700 transition-colors"
            />
          </div>

          <div className="flex justify-end gap-3 mt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-slate-800 border border-slate-700 hover:border-slate-600 hover:bg-slate-700 text-white font-display transition-all"
            >
              Confirm Import
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

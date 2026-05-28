import React, { useState, useEffect } from 'react';
import { Category, Tool } from '../types';
import ToolLogo from './ToolLogo';
import Icon from './Icon';

interface AddToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: Category[];
  onAdd: (tool: Omit<Tool, 'id' | 'clickCount'>) => void;
  defaultCategoryId?: string;
}

export default function AddToolModal({
  isOpen,
  onClose,
  categories,
  onAdd,
  defaultCategoryId,
}: AddToolModalProps) {
  const [name, setName] = useState('');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('');
  const [customLogoUrl, setCustomLogoUrl] = useState('');
  const [description, setDescription] = useState('');
  const [isPinned, setIsPinned] = useState(false);
  const [isLocalApp, setIsLocalApp] = useState(false);
  const [localPath, setLocalPath] = useState('');

  useEffect(() => {
    if (isOpen) {
      setName('');
      setUrl('');
      setCategory(defaultCategoryId || categories[0]?.id || '');
      setCustomLogoUrl('');
      setDescription('');
      setIsPinned(false);
      setIsLocalApp(false);
      setLocalPath('');
    }
  }, [isOpen, defaultCategoryId, categories]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !category) return;
    
    // Fallback URL if we are running in local app mode
    const destinationPath = isLocalApp ? (localPath.trim() || 'local-app://launch') : url.trim();
    if (!destinationPath) return;

    // Standardize URL prefix for standard web links
    let formattedUrl = destinationPath;
    if (!isLocalApp) {
      if (!/^https?:\/\//i.test(formattedUrl)) {
        formattedUrl = 'https://' + formattedUrl;
      }
    }

    onAdd({
      name: name.trim(),
      url: formattedUrl,
      category,
      customLogoUrl: customLogoUrl.trim() || undefined,
      description: description.trim() || undefined,
      isPinned,
      isLocalApp,
      localPath: isLocalApp ? localPath.trim() : undefined,
    });
    onClose();
  };

  const isUrlValid = isLocalApp ? localPath.trim().length > 1 : url.trim().length > 3;

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
            <div className="p-2 rounded-lg bg-gold-500/10 text-gold-500">
              <Icon name="Plus" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold font-display tracking-tight text-white uppercase">Add Command Portal</h2>
              <p className="subtitle text-xs text-slate-400">Add a new portal card to your workspace launcher.</p>
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

        {/* Dynamic Live Logo Preview Box */}
        {isUrlValid && (
          <div className="flex items-center gap-4 p-4 rounded-xl bg-slate-950/50 border border-slate-800">
            <ToolLogo 
              name={name.trim() || 'Preview'} 
              url={isLocalApp ? 'https://localhost' : url} 
              customLogoUrl={customLogoUrl} 
              size="lg" 
            />
            <div className="flex-1 min-w-0">
              <span className="text-xs font-mono text-gold-500 uppercase tracking-widest block font-medium">Automatic Logo Mapping</span>
              <h4 className="text-sm font-semibold text-white truncate">{name.trim() || 'New Workspace App'}</h4>
              <p className="text-xs text-slate-400 truncate font-mono">{isLocalApp ? localPath || 'Desktop System App' : url}</p>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 max-h-[60vh] overflow-y-auto pr-1">
          
          {/* Tool Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Tool Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. GoHighLevel, Slack, Obsidian"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-gold-500 text-white placeholder-slate-600 transition-colors"
            />
          </div>

          {/* Portal Type Switcher */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300 font-mono text-gold-500">Portal Target Protocol *</label>
            <div className="grid grid-cols-2 gap-2 bg-slate-950 rounded-lg p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setIsLocalApp(false)}
                className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  !isLocalApp
                    ? 'bg-gold-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon name="Globe" size={13} />
                <span>🌐 Web Link</span>
              </button>
              
              <button
                type="button"
                onClick={() => setIsLocalApp(true)}
                className={`py-1.5 rounded-md text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors ${
                  isLocalApp
                    ? 'bg-gold-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Icon name="Cpu" size={13} />
                <span>💻 Desktop App</span>
              </button>
            </div>
          </div>

          {/* URL or Local Path Selector input */}
          {!isLocalApp ? (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <label className="text-xs font-medium text-slate-300">Destination URL *</label>
              <input
                type="text"
                required={!isLocalApp}
                placeholder="gohighlevel.com or https://tradingview.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-gold-500 text-white placeholder-slate-600 transition-colors"
              />
            </div>
          ) : (
            <div className="flex flex-col gap-1.5 animate-fade-in">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-slate-300">Local System App Path / custom URI Scheme *</label>
                <span className="text-[10px] text-slate-500">e.g. <code>slack://</code>, <code>obsidian://</code> or file paths</span>
              </div>
              <input
                type="text"
                required={isLocalApp}
                placeholder="e.g. slack:// or C:\Program Files\Office\Word.exe"
                value={localPath}
                onChange={(e) => setLocalPath(e.target.value)}
                className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-gold-500 text-white placeholder-slate-600 transition-colors font-mono text-xs"
              />
            </div>
          )}

          {/* Category Dropdown */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Category / Lane *</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-gold-500 text-white transition-colors cursor-pointer appearance-none"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id} className="bg-slate-950 text-slate-200">
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Custom Logo URL (Optional) */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-slate-300">Custom Logo Direct URL (Optional)</label>
              <span className="text-[10px] text-slate-500">Overrides automatic favicon</span>
            </div>
            <input
              type="text"
              placeholder="https://example.com/assets/logo.png"
              value={customLogoUrl}
              onChange={(e) => setCustomLogoUrl(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-gold-500 text-white placeholder-slate-600 transition-colors"
            />
          </div>

          {/* Business Unit Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Quick Description / CEO Notes (Optional)</label>
            <textarea
              placeholder="Explain what this tool accesses or what team runs it..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-gold-500 text-white placeholder-slate-600 transition-colors resize-none text-xs"
            />
          </div>

          {/* Is Pinned Pinboard */}
          <div className="flex items-center justify-between p-3 rounded-lg bg-slate-950 border border-slate-800 mb-2">
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white">Pin to Favorites Rail</span>
              <span className="text-[10px] text-slate-400">Places this inside the premium Hero Quick-Launcher.</span>
            </div>
            <input
              type="checkbox"
              id="pin-app-checkbox"
              checked={isPinned}
              onChange={(e) => setIsPinned(e.target.checked)}
              className="w-4 h-4 rounded text-gold-500 border-slate-800 bg-slate-950 focus:ring-gold-500 focus:ring-offset-slate-900 focus:ring-1 cursor-pointer"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 border-t border-slate-800 pt-4 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium rounded-lg text-slate-400 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 active:scale-95 text-slate-950 shadow-lg shadow-gold-500/10 font-display transition-all"
            >
              Secure App Card
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

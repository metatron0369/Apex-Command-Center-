import React, { useState, useEffect, useRef } from 'react';
import { Tool, Category } from '../types';
import Icon from './Icon';
import ToolLogo from './ToolLogo';

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
  tools: Tool[];
  categories: Category[];
  onLaunch: (id: string) => void;
  onEdit: (tool: Tool) => void;
  onPinToggle: (id: string) => void;
}

export default function CommandPaletteModal({
  isOpen,
  onClose,
  tools,
  categories,
  onLaunch,
  onEdit,
  onPinToggle,
}: CommandPaletteModalProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Close command palette on escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Handle focus
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Filter tools based on query
  const filteredTools = tools.filter((t) => {
    const categoryName = categories.find((c) => c.id === t.category)?.name || '';
    const matchString = `${t.name} ${t.description || ''} ${categoryName} ${t.url} ${t.isLocalApp ? 'desktop local app' : 'webLink'}`.toLowerCase();
    return matchString.includes(query.toLowerCase());
  });

  // Handle Keyboard Arrows & Action bindings
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filteredTools.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredTools.length) % Math.max(1, filteredTools.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        onLaunch(filteredTools[selectedIndex].id);
        onClose();
      }
    } else if (e.key === 'p' && (e.metaKey || e.ctrlKey)) {
      // Toggle Pin
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        onPinToggle(filteredTools[selectedIndex].id);
      }
    } else if (e.key === 'e' && (e.metaKey || e.ctrlKey)) {
      // Edit
      e.preventDefault();
      if (filteredTools[selectedIndex]) {
        onEdit(filteredTools[selectedIndex]);
        onClose();
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[15vh] p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/75 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Main Bar */}
      <div className="relative w-full max-w-2xl overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl flex flex-col max-h-[60vh] animate-in fade-in zoom-in-95 duration-200">
        
        {/* Glow accent */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-[1px] bg-gradient-to-r from-transparent via-gold-550/40 to-transparent" />

        {/* Input area */}
        <div className="flex items-center gap-3.5 px-4 py-3.5 border-b border-slate-800">
          <Icon name="Search" className="text-gold-500 animate-pulse shrink-0" size={18} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type command portal, category, or notes to filter..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            className="w-full bg-transparent text-sm focus:outline-none text-white placeholder-slate-500 font-sans"
          />
          <span className="text-[9px] font-mono font-bold text-slate-500 uppercase px-1.5 py-0.5 bg-slate-950 rounded border border-slate-850">
            ESC TO EXIT
          </span>
        </div>

        {/* List items block */}
        <div ref={listRef} className="flex-1 overflow-y-auto p-2 space-y-0.5 custom-scrollbar">
          {filteredTools.length === 0 ? (
            <div className="py-8 text-center text-slate-500 flex flex-col items-center justify-center gap-2">
              <Icon name="FolderGit2" size={18} className="text-slate-600" />
              <p className="text-xs font-mono">No Command Portals Matched Query</p>
              <p className="text-[10px] text-slate-600 max-w-xs leading-relaxed">
                Add portals or modify criteria to capture matches in search palette.
              </p>
            </div>
          ) : (
            filteredTools.map((tool, idx) => {
              const isSelected = idx === selectedIndex;
              const catObj = categories.find((c) => c.id === tool.category);
              const isPinned = !!tool.isPinned;

              return (
                <div
                  key={tool.id}
                  onClick={() => {
                    onLaunch(tool.id);
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`flex items-center justify-between p-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
                    isSelected 
                      ? 'bg-gold-500/10 border-l-2 border-gold-500 pl-3' 
                      : 'border-l-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <ToolLogo 
                      name={tool.name} 
                      url={tool.isLocalApp ? 'https://localhost' : tool.url} 
                      customLogoUrl={tool.customLogoUrl} 
                      size="sm" 
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-bold font-sans ${isSelected ? 'text-gold-400' : 'text-slate-100'}`}>
                          {tool.name}
                        </span>
                        {isPinned && (
                          <span className="text-[8px] font-mono text-gold-500 font-bold px-1 rounded bg-gold-950/40 border border-gold-550/30 shrink-0">
                            PINNED
                          </span>
                        )}
                        {tool.isLocalApp && (
                          <span className="text-[8px] font-mono text-cyan-400 font-bold px-1 rounded bg-slate-950 border border-slate-850 shrink-0">
                            LOCAL APP
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono truncate max-w-sm">
                        {tool.isLocalApp ? (tool.localPath || 'Desktop Launcher') : tool.url}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {catObj && (
                      <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-850">
                        {catObj.name}
                      </span>
                    )}

                    {/* Action Hint when active */}
                    {isSelected && (
                      <div className="hidden sm:flex items-center gap-1 text-[9px] font-mono text-slate-400 bg-slate-950/60 p-1 rounded border border-slate-850 pointer-events-none">
                        <span className="text-gold-400 font-bold">↵</span>
                        <span>Launch</span>
                        <span className="mx-0.5 text-slate-700">|</span>
                        <span>Ctrl+P</span>
                        <span>Pin</span>
                        <span className="mx-0.5 text-slate-700">|</span>
                        <span>Ctrl+E</span>
                        <span>Edit</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts helper strip */}
        <div className="px-4 py-2 border-t border-slate-800/80 bg-slate-950/45 text-[10px] font-mono text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigation</span>
            <span>↵ Select/Launch</span>
          </div>
          <p className="text-[9px] uppercase tracking-wider text-slate-600">
            Tech Command Center Interactive Index
          </p>
        </div>
      </div>
    </div>
  );
}

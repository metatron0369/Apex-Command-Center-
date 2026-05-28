import React, { useState } from 'react';
import { Category } from '../types';
import Icon from './Icon';

interface AddCategoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (category: Omit<Category, 'id'>) => void;
}

const AVAILABLE_ICONS = [
  { id: 'Shield', label: 'Security' },
  { id: 'TrendingUp', label: 'Growth' },
  { id: 'Cpu', label: 'Logic / AI' },
  { id: 'Coins', label: 'Finance' },
  { id: 'Compass', label: 'Overview' },
  { id: 'FolderPlus', label: 'Storage' },
  { id: 'Activity', label: 'Live telemetry' },
  { id: 'Clock', label: 'Scheduling' },
  { id: 'User', label: 'Profile / HR' },
  { id: 'Heart', label: 'Health / CRM' },
];

const AVAILABLE_COLORS = [
  { id: 'sky', bg: 'bg-sky-500/10 border-sky-500/30 text-sky-400 font-semibold' },
  { id: 'emerald', bg: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-semibold' },
  { id: 'indigo', bg: 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400 font-semibold' },
  { id: 'amber', bg: 'bg-amber-500/10 border-amber-500/30 text-amber-500 font-semibold' },
  { id: 'rose', bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400 font-semibold' },
  { id: 'violet', bg: 'bg-violet-500/10 border-violet-500/30 text-violet-400 font-semibold' },
  { id: 'cyan', bg: 'bg-cyan-500/10 border-cyan-500/30 text-cyan-400 font-semibold' },
  { id: 'fuchsia', bg: 'bg-fuchsia-500/10 border-fuchsia-500/30 text-fuchsia-400 font-semibold' },
];

export default function AddCategoryModal({
  isOpen,
  onClose,
  onAdd,
}: AddCategoryModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Compass');
  const [selectedColor, setSelectedColor] = useState('sky');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAdd({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      isCollapsed: false,
    });
    
    // reset form
    setName('');
    setSelectedIcon('Compass');
    setSelectedColor('sky');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-slate-950/85 backdrop-blur-md"
        onClick={onClose}
      />
      
      {/* Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl p-6 text-slate-100 flex flex-col gap-5 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Icon name="FolderPlus" size={20} />
            </div>
            <div>
              <h2 className="text-xl font-semibold font-display tracking-tight text-white">Add Command Lane</h2>
              <p className="subtitle text-xs text-slate-400 font-sans">Introduce a new visual category row for resource grouping.</p>
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

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Lane Name */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-slate-300">Lane Identifier Name *</label>
            <input
              type="text"
              required
              placeholder="e.g. Trading Software, Legal, Accounting"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-2 text-sm rounded-lg bg-slate-950 border border-slate-800 focus:outline-none focus:border-indigo-500 text-white placeholder-slate-600 transition-colors"
            />
          </div>

          {/* Icon Selector Grid */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-300">Select Lane Visual Icon</label>
            <div className="grid grid-cols-5 gap-2 max-h-36 overflow-y-auto p-1.5 rounded-lg bg-slate-950/50 border border-slate-850">
              {AVAILABLE_ICONS.map((ico) => {
                const isSelected = selectedIcon === ico.id;
                return (
                  <button
                    key={ico.id}
                    type="button"
                    onClick={() => setSelectedIcon(ico.id)}
                    title={ico.label}
                    className={`flex flex-col items-center justify-center p-2 rounded-lg border text-xs gap-1 transition-all ${
                      isSelected
                        ? 'bg-indigo-500/20 border-indigo-500 text-indigo-400 font-semibold shadow-inner shadow-indigo-500/10'
                        : 'border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                    }`}
                  >
                    <Icon name={ico.id} size={18} />
                    <span className="text-[9px] truncate max-w-full font-mono">{ico.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Color Badge Selector Grid */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium text-slate-300">Lane Theme Accent Color</label>
            <div className="grid grid-cols-4 gap-2">
              {AVAILABLE_COLORS.map((col) => {
                const isSelected = selectedColor === col.id;
                return (
                  <button
                    key={col.id}
                    type="button"
                    onClick={() => setSelectedColor(col.id)}
                    className={`flex items-center justify-center py-2 px-1.5 rounded-lg border text-[11px] font-mono capitalize transition-all ${col.bg} ${
                      isSelected
                        ? 'scale-105 border-slate-200/90 text-white ring-2 ring-indigo-500/50'
                        : 'opacity-60 hover:opacity-100 hover:scale-[1.02]'
                    }`}
                  >
                    {col.id}
                  </button>
                );
              })}
            </div>
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
              className="px-5 py-2 text-sm font-semibold rounded-lg bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-400 hover:to-indigo-500 active:scale-95 text-white shadow-lg shadow-indigo-500/10 font-display transition-all"
            >
              Secure Lane
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

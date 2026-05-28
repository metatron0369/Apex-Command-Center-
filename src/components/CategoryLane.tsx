import React, { useState } from 'react';
import { Category, Tool } from '../types';
import ToolCard from './ToolCard';
import Icon from './Icon';

interface CategoryLaneProps {
  key?: React.Key;
  category: Category;
  tools: Tool[];
  onLaunch: (id: string) => void;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onPinToggle: (id: string) => void;
  onAddToolClick: (categoryId: string) => void;
  onRenameCategory: (id: string, newName: string) => void;
  onDeleteCategory: (id: string) => void;
  onToggleCollapse: (id: string) => void;
  onMoveCategoryUp?: (id: string) => void;
  onMoveCategoryDown?: (id: string) => void;
  viewMode: 'bento-grid' | 'compact-list' | 'kanban-board';
  onDragStartCard: (e: React.DragEvent, id: string) => void;
  onDragOverCard: (e: React.DragEvent, id: string) => void;
  onDropCard: (e: React.DragEvent, targetId: string) => void;
  onDropOnLane: (e: React.DragEvent, categoryId: string) => void;
  draggingToolId: string | null;
  index?: number;
}

const colorMap: Record<string, { border: string; text: string; bg: string; dot: string; glow: string }> = {
  sky: { border: 'border-sky-500/20', text: 'text-sky-400', bg: 'bg-sky-500/10', dot: 'bg-sky-400', glow: 'shadow-[0_0_15px_rgba(56,189,248,0.12)] bg-slate-900/40 border-sky-500/30' },
  emerald: { border: 'border-emerald-500/20', text: 'text-emerald-400', bg: 'bg-emerald-500/10', dot: 'bg-emerald-400', glow: 'shadow-[0_0_15px_rgba(52,211,153,0.12)] bg-slate-900/40 border-emerald-500/30' },
  indigo: { border: 'border-indigo-500/20', text: 'text-indigo-400', bg: 'bg-indigo-500/10', dot: 'bg-indigo-400', glow: 'shadow-[0_0_15px_rgba(129,140,248,0.12)] bg-slate-900/40 border-indigo-500/30' },
  amber: { border: 'border-amber-500/20', text: 'text-amber-400', bg: 'bg-amber-500/10', dot: 'bg-amber-400', glow: 'shadow-[0_0_15px_rgba(245,158,11,0.12)] bg-slate-900/40 border-amber-500/30' },
  rose: { border: 'border-rose-500/20', text: 'text-rose-400', bg: 'bg-rose-500/10', dot: 'bg-rose-400', glow: 'shadow-[0_0_15px_rgba(251,113,133,0.12)] bg-slate-900/40 border-rose-500/30' },
  violet: { border: 'border-violet-500/20', text: 'text-violet-400', bg: 'bg-violet-500/10', dot: 'bg-violet-400', glow: 'shadow-[0_0_15px_rgba(167,139,250,0.12)] bg-slate-900/40 border-violet-500/30' },
  cyan: { border: 'border-cyan-500/20', text: 'text-cyan-400', bg: 'bg-cyan-500/10', dot: 'bg-cyan-400', glow: 'shadow-[0_0_15px_rgba(34,211,238,0.12)] bg-slate-900/40 border-cyan-500/30' },
  fuchsia: { border: 'border-fuchsia-500/20', text: 'text-fuchsia-400', bg: 'bg-fuchsia-500/10', dot: 'bg-fuchsia-400', glow: 'shadow-[0_0_15px_rgba(232,121,249,0.12)] bg-slate-900/40 border-fuchsia-500/30' }
};

export default function CategoryLane({
  category,
  tools,
  onLaunch,
  onEdit,
  onDelete,
  onPinToggle,
  onAddToolClick,
  onRenameCategory,
  onDeleteCategory,
  onToggleCollapse,
  onMoveCategoryUp,
  onMoveCategoryDown,
  viewMode,
  onDragStartCard,
  onDragOverCard,
  onDropCard,
  onDropOnLane,
  draggingToolId,
  index,
}: CategoryLaneProps) {
  const [isLaneHovered, setIsLaneHovered] = useState(false);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editedName, setEditedName] = useState(category.name);

  const colors = colorMap[category.color] || colorMap.sky;
  const isCollapsed = category.isCollapsed;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLaneHovered(true);
  };

  const handleDragLeave = () => {
    setIsLaneHovered(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsLaneHovered(false);
    onDropOnLane(e, category.id);
  };

  const handleSaveRename = (e: React.FormEvent) => {
    e.preventDefault();
    if (editedName.trim() && editedName.trim() !== category.name) {
      onRenameCategory(category.id, editedName.trim());
    }
    setIsEditingName(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setEditedName(category.name);
      setIsEditingName(false);
    }
  };

  const activeDropStyle = isLaneHovered && draggingToolId
    ? `${colors.glow} border-dashed border-amber-500/40`
    : 'border-slate-900 bg-slate-950/20';

  if (viewMode === 'kanban-board') {
    // RENDER AS VERTICAL KANBAN COLUMN
    return (
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`flex flex-col flex-shrink-0 w-80 rounded-xl border p-4 h-[calc(100vh-220px)] min-h-[500px] transition-all duration-200 ${activeDropStyle}`}
      >
        {/* Kanban Column Title Bar */}
        <div className="flex flex-col gap-2 mb-4 border-b border-slate-900/80 pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
              
              {isEditingName ? (
                <form onSubmit={handleSaveRename} className="flex-1 min-w-0">
                  <input
                    type="text"
                    autoFocus
                    required
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    onBlur={handleSaveRename}
                    onKeyDown={handleKeyDown}
                    className="w-full px-2 py-1 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-gold-500 font-mono"
                  />
                </form>
              ) : (
                <div className="flex items-center gap-1.5 min-w-0">
                  <Icon name={category.icon || 'Compass'} className={`${colors.text}`} size={14} />
                  <h3 
                    onClick={() => setIsEditingName(true)}
                    className="text-xs font-black uppercase tracking-[0.15em] text-slate-200 hover:text-gold-400 transition-colors truncate cursor-pointer"
                  >
                    {index !== undefined ? `${String(index + 1).padStart(2, '0')} / ` : ''}{category.name}
                  </h3>
                </div>
              )}
            </div>

            <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md bg-slate-900/80 border border-slate-850 text-slate-400">
              {tools.length}
            </span>
          </div>
          
          <div className="flex justify-end items-center gap-1.5 mt-1">
            {/* Launch all tools in this category */}
            {tools.length > 0 && (
              <button
                onClick={() => {
                  if (confirm(`Launch all ${tools.length} portal workspaces in "${category.name}" simultaneously?`)) {
                    tools.forEach(t => onLaunch(t.id));
                  }
                }}
                className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-gold-400 hover:border-gold-550/30 transition-colors"
                title="Launch all ports in this category lane simultaneously"
              >
                <Icon name="Play" size={11} className="fill-gold-500/20 text-gold-500" />
              </button>
            )}

            {/* Quick add tool button */}
            <button
              onClick={() => onAddToolClick(category.id)}
              className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-gold-400 hover:border-gold-550/30 transition-colors"
              title="Add tool to this lane"
            >
              <Icon name="Plus" size={12} />
            </button>
            
            {/* Rename tool trigger */}
            <button
              onClick={() => setIsEditingName(!isEditingName)}
              className="p-1 rounded bg-slate-900 border border-slate-850 text-slate-400 hover:text-white transition-colors"
              title="Rename lane"
            >
              <Icon name="Edit" size={11} />
            </button>

            {/* Delete category trigger */}
            <button
              onClick={() => {
                if (confirm(`Are you sure you want to delete the lane "${category.name}"? All tools in this category will be grouped into other pools.`)) {
                  onDeleteCategory(category.id);
                }
              }}
              className="p-1 rounded bg-slate-900 border border-slate-850 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 transition-colors"
              title="Delete Lane"
            >
              <Icon name="Trash2" size={11} />
            </button>
          </div>
        </div>

        {/* Scrollable List Container */}
        <div className="flex-1 overflow-y-auto space-y-3 pr-1 custom-scrollbar">
          {tools.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 px-4 border border-dashed border-slate-800 rounded-xl text-center text-slate-500 h-full">
              <Icon name="Minimize2" size={20} className="mb-2 text-slate-600" />
              <p className="text-[11px] font-mono">Empty Lane</p>
              <p className="text-[10px] text-slate-600 mt-1">Drag application gateways here to catalog.</p>
            </div>
          ) : (
            tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onLaunch={onLaunch}
                onEdit={onEdit}
                onDelete={onDelete}
                onPinToggle={onPinToggle}
                mode="kanban-board"
                onDragStart={onDragStartCard}
                onDragOverCard={onDragOverCard}
                onDropCard={onDropCard}
                isDraggingNow={draggingToolId === tool.id}
              />
            ))
          )}
        </div>
      </div>
    );
  }

  // STANDARD STACKED HORIZONTAL LANE (GRID/COMPACT)
  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`rounded-xl border p-5 transition-all duration-200 ${activeDropStyle} ${
        isCollapsed ? 'pb-3' : ''
      }`}
    >
      {/* Header Panel */}
      <div className="flex items-center justify-between mb-4 gap-4">
        {/* Core Info */}
        <div className="flex items-center gap-3 min-w-0 flex-1">
          <button
            onClick={() => onToggleCollapse(category.id)}
            className="p-1 text-slate-400 hover:text-white hover:bg-slate-900 border border-slate-850 rounded transition-all"
            title={isCollapsed ? 'Expand Lane' : 'Collapse Lane'}
          >
            <Icon name={isCollapsed ? 'ChevronDown' : 'ChevronUp'} size={12} />
          </button>

          <span className={`w-2 h-2 rounded-full ${colors.dot}`} />
          
          <div className="flex items-center gap-2 min-w-0 flex-1">
            <Icon name={category.icon || 'Compass'} className={`${colors.text} shrink-0`} size={16} />
            
            {isEditingName ? (
              <form onSubmit={handleSaveRename} className="inline-block max-w-xs">
                <input
                  type="text"
                  autoFocus
                  required
                  value={editedName}
                  onChange={(e) => setEditedName(e.target.value)}
                  onBlur={handleSaveRename}
                  onKeyDown={handleKeyDown}
                  className="px-2 py-0.5 text-xs bg-slate-950 border border-slate-800 rounded text-white focus:outline-none focus:border-gold-500 font-mono"
                />
              </form>
            ) : (
              <h3 
                onClick={() => setIsEditingName(true)}
                className="text-[11px] font-black uppercase tracking-[0.2em] text-gold-500/80 hover:text-gold-400 cursor-pointer select-none transition-colors truncate"
              >
                {index !== undefined ? `${String(index + 1).padStart(2, '0')} / ` : ''}{category.name}
              </h3>
            )}
            
            <div className="h-[1px] flex-1 min-w-[30px] bg-slate-800/80"></div>
          </div>

          <span className="text-[10px] font-mono font-medium px-2 py-0.5 rounded bg-slate-900/60 border border-slate-850 text-slate-400">
            {tools.length} ACTIVE
          </span>
        </div>

        {/* Administration Actions */}
        <div className="flex items-center gap-1.5 shrink-0">
          {/* Quick Category Move up/down triggers */}
          {onMoveCategoryUp && (
            <button
              onClick={() => onMoveCategoryUp(category.id)}
              className="p-1 text-slate-500 hover:text-white hover:bg-slate-900 border border-slate-850 rounded transition-colors"
              title="Move category up"
            >
              <Icon name="ChevronUp" size={11} />
            </button>
          )}
          {onMoveCategoryDown && (
            <button
              onClick={() => onMoveCategoryDown(category.id)}
              className="p-1 text-slate-500 hover:text-white hover:bg-slate-900 border border-slate-850 rounded transition-colors"
              title="Move category down"
            >
              <Icon name="ChevronDown" size={11} />
            </button>
          )}

          <div className="h-4 w-px bg-slate-800" />

          {/* Launch all tools inside category simultaneously */}
          {tools.length > 0 && !isCollapsed && (
            <button
              onClick={() => {
                if (confirm(`Do you want to launch all ${tools.length} resources in "${category.name}" simultaneously?`)) {
                  tools.forEach(t => onLaunch(t.id));
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 hover:bg-slate-800 text-gold-400 hover:text-gold-300 border border-slate-800 hover:border-slate-705 font-mono transition-all"
              title="Launch all portal workspaces inside this category lane simultaneously"
            >
              <Icon name="Play" size={10} className="fill-gold-500/10 text-gold-500" />
              <span>LAUNCH ALL</span>
            </button>
          )}

          {/* Add app inside here */}
          <button
            onClick={() => onAddToolClick(category.id)}
            className="flex items-center gap-1 px-2.5 py-1 text-[10px] rounded-lg bg-slate-900 hover:bg-slate-800 hover:text-gold-400 border border-slate-800 hover:border-slate-750 font-mono transition-all"
          >
            <Icon name="Plus" size={10} />
            <span>ADD PORTAL</span>
          </button>

          {/* Edit Button */}
          <button
            onClick={() => setIsEditingName(!isEditingName)}
            className="p-1 rounded hover:bg-slate-900 border border-transparent hover:border-slate-850 text-slate-400 hover:text-white transition-colors"
            title="Rename lane"
          >
            <Icon name="Edit" size={11} />
          </button>

          {/* Delete Lane */}
          <button
            onClick={() => {
              if (confirm(`Are you sure you want to delete the lane "${category.name}"? All tools in this category will be grouped into other pools.`)) {
                onDeleteCategory(category.id);
              }
            }}
            className="p-1 rounded hover:bg-rose-950/20 border border-transparent hover:border-rose-900/40 text-slate-500 hover:text-rose-400 transition-colors"
            title="Delete custom lane"
          >
            <Icon name="Trash2" size={11} />
          </button>
        </div>
      </div>

      {/* Grid of Inner Cards */}
      {!isCollapsed && (
        <div
          className={`${
            viewMode === 'bento-grid'
              ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'
              : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3'
          }`}
        >
          {tools.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center p-8 bg-slate-950/20 border border-dashed border-slate-850 rounded-xl text-center text-slate-500">
              <Icon name="Compass" size={24} className="mb-2 text-slate-600 animate-pulse" />
              <p className="text-xs font-mono font-medium text-slate-400">This Command Lane is Currently Empty</p>
              <p className="text-[10px] text-slate-600 mt-1 max-w-sm font-sans">
                Click "ADD PORTAL" or drag any existing application card from other lanes into this container to organize it.
              </p>
            </div>
          ) : (
            tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onLaunch={onLaunch}
                onEdit={onEdit}
                onDelete={onDelete}
                onPinToggle={onPinToggle}
                mode={viewMode}
                onDragStart={onDragStartCard}
                onDragOverCard={onDragOverCard}
                onDropCard={onDropCard}
                isDraggingNow={draggingToolId === tool.id}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}

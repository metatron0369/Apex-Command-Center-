import React, { useState } from 'react';
import { Tool } from '../types';
import ToolLogo from './ToolLogo';
import Icon from './Icon';
import { getDomainFromUrl } from '../utils/url';

interface ToolCardProps {
  key?: React.Key;
  tool: Tool;
  onLaunch: (id: string) => void;
  onEdit: (tool: Tool) => void;
  onDelete: (id: string) => void;
  onPinToggle: (id: string) => void;
  mode: 'bento-grid' | 'compact-list' | 'kanban-board';
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDragOverCard: (e: React.DragEvent, id: string) => void;
  onDropCard: (e: React.DragEvent, targetId: string) => void;
  isDraggingNow?: boolean;
}

export default function ToolCard({
  tool,
  onLaunch,
  onEdit,
  onDelete,
  onPinToggle,
  mode,
  onDragStart,
  onDragOverCard,
  onDropCard,
  isDraggingNow = false,
}: ToolCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const domain = getDomainFromUrl(tool.url);

  const handleClick = (e: React.MouseEvent) => {
    // Only launch if we didn't click inside an options overlay button
    const target = e.target as HTMLElement;
    if (target.closest('.card-action-btn')) {
      return;
    }
    onLaunch(tool.id);
  };

  // Drag styles
  const draggingOpacity = isDraggingNow ? 'opacity-30 scale-95' : 'opacity-100';

  if (mode === 'compact-list') {
    return (
      <div
        id={`card-${tool.id}`}
        draggable
        onDragStart={(e) => onDragStart(e, tool.id)}
        onDragOver={(e) => onDragOverCard(e, tool.id)}
        onDrop={(e) => onDropCard(e, tool.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={`group flex items-center justify-between p-2.5 rounded-xl border border-slate-800/80 bg-slate-900/45 hover:bg-slate-900/90 active:scale-[0.99] hover:border-slate-700/80 transition-all duration-150 cursor-pointer ${draggingOpacity}`}
      >
        <div className="flex items-center gap-3 min-w-0">
          <ToolLogo name={tool.name} url={tool.url} customLogoUrl={tool.customLogoUrl} size="sm" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-slate-100 group-hover:text-amber-400 font-display truncate transition-colors">
              {tool.name}
            </h4>
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block truncate">
              {domain}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Pinned Indicator Toggle */}
          <button
            type="button"
            title={tool.isPinned ? "Unpin from favorites" : "Pin to favorites"}
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle(tool.id);
            }}
            className="card-action-btn p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-amber-400 transition-all"
          >
            <Icon name="Star" size={13} className={tool.isPinned ? 'fill-amber-400 text-amber-400' : ''} />
          </button>

          {/* Edit Button */}
          <button
            type="button"
            title="Edit Tool"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tool);
            }}
            className="card-action-btn p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-all"
          >
            <Icon name="Edit" size={13} />
          </button>

          {/* Delete Button */}
          <button
            type="button"
            title="Delete Tool"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove "${tool.name}" from your workspace?`)) {
                onDelete(tool.id);
              }
            }}
            className="card-action-btn p-1 rounded hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 transition-all"
          >
            <Icon name="Trash2" size={13} />
          </button>
          
          <div className="p-1 text-slate-500 font-mono text-[9px] border border-slate-800 rounded bg-slate-950 px-1.5 ml-1">
            {tool.clickCount} clicks
          </div>
        </div>
      </div>
    );
  }

  // SPECIAL BENTO GRID MODE FOR HIGH-AESTHETIC LARGER IMAGE CARDS
  if (mode === 'bento-grid') {
    const isLocal = !!tool.isLocalApp;
    const extension = isLocal ? 'DESKTOP APP' : domain.includes('.') ? `.${domain.split('.').pop()}` : '.com';
    const isPinnedStyle = tool.isPinned 
      ? 'border-gold-550/35 bg-slate-900/75 shadow-lg shadow-gold-500/5' 
      : 'border-slate-900 bg-slate-950/20';

    const badgeText = tool.isPinned ? 'PINNED' : tool.clickCount > 15 ? 'ACTIVE' : extension;
    const badgeColor = tool.isPinned ? 'text-gold-500' : tool.clickCount > 15 ? 'text-emerald-500' : 'text-slate-500';

    return (
      <div
        id={`card-${tool.id}`}
        draggable
        onDragStart={(e) => onDragStart(e, tool.id)}
        onDragOver={(e) => onDragOverCard(e, tool.id)}
        onDrop={(e) => onDropCard(e, tool.id)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={handleClick}
        className={`group relative flex flex-col p-5 rounded-2xl border hover:border-gold-550/60 hover:bg-slate-900/90 hover:-translate-y-1 hover:shadow-xl active:scale-[0.98] transition-all duration-300 cursor-pointer select-none overflow-hidden ${isPinnedStyle} ${draggingOpacity}`}
      >
        {/* Ambient backdrop highlight */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-gold-550/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        {/* Bento Grid Header Badge */}
        <div className="flex items-center justify-between mb-3.5 relative z-10 w-full">
          <span className="flex items-center gap-1.5 text-[10px] font-mono tracking-wider font-bold text-slate-500 uppercase">
            {isLocal ? (
              <span className="flex items-center gap-1 text-slate-400">
                <Icon name="Cpu" size={11} className="text-gold-400" />
                LOCAL APPS
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <Icon name="Globe" size={10} />
                WEB APP
              </span>
            )}
          </span>
          
          <span className={`text-[10px] font-mono uppercase tracking-widest font-black ${badgeColor}`}>
            {badgeText}
          </span>
        </div>

        {/* Centered Magnified Premium Corporate Logo Box */}
        <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-slate-950 border border-slate-900/70 group-hover:border-gold-550/20 group-hover:bg-slate-900/40 shadow-inner group-hover:shadow-[0_0_25px_rgba(212,175,55,0.06)] transition-all duration-300 mb-4 h-32 relative">
          <ToolLogo 
            name={tool.name} 
            url={tool.url} 
            customLogoUrl={tool.customLogoUrl} 
            size="lg" 
            className="w-16 h-16 sm:w-20 sm:h-20 transition-transform group-hover:scale-105 duration-300 shadow-md p-1.5 border-slate-800" 
          />
          
          {tool.isPinned && (
            <div className="absolute top-2 right-2 p-1 rounded-md bg-gold-950/60 border border-gold-550/30 text-gold-400">
              <Icon name="Star" size={10} className="fill-gold-400" />
            </div>
          )}
        </div>

        {/* Dynamic Descriptive Section */}
        <div className="flex-1 min-w-0 mb-4 relative z-10 text-center sm:text-left">
          <h4 className="text-sm font-black text-slate-100 group-hover:text-gold-400 font-display tracking-tight truncate transition-colors mb-1">
            {tool.name}
          </h4>
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 truncate">
            {isLocal ? 'Desktop Local Path' : domain}
          </span>
          
          {tool.description ? (
            <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2 h-8">
              {tool.description}
            </p>
          ) : (
            <p className="text-[11px] text-slate-600 font-mono italic leading-relaxed line-clamp-2 h-8">
              No specific workspace logs mapped for this app.
            </p>
          )}
        </div>

        {/* Bottom controls & launches counter */}
        <div className="flex items-center justify-between mt-auto border-t border-slate-900/80 pt-3 relative z-10 text-[10px] font-mono text-slate-500">
          <div className="flex items-center gap-1.5">
            <span className={`w-1.5 h-1.5 rounded-full animate-pulse mr-0.5 ${isLocal ? 'bg-gold-550' : 'bg-emerald-500'}`}></span>
            <span>{tool.clickCount} launched</span>
          </div>

          {/* Quick action buttons */}
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            {/* Pinned indicator toggle */}
            <button
              type="button"
              title={tool.isPinned ? "Unpin Portal" : "Pin Portal"}
              onClick={(e) => {
                e.stopPropagation();
                onPinToggle(tool.id);
              }}
              className="card-action-btn p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-gold-400 hover:border-gold-550/30 transition-colors"
            >
              <Icon name="Star" size={11} className={tool.isPinned ? 'fill-gold-400 text-gold-400' : ''} />
            </button>

            {/* Edit button */}
            <button
              type="button"
              title="Edit Portal Parameters"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(tool);
              }}
              className="card-action-btn p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
            >
              <Icon name="Edit" size={11} />
            </button>

            {/* Delete button */}
            <button
              type="button"
              title="De-register Command"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Remove App Portal "${tool.name}" from command system?`)) {
                  onDelete(tool.id);
                }
              }}
              className="card-action-btn p-1 rounded bg-slate-950 border border-slate-850 text-slate-400 hover:text-rose-400 hover:border-rose-950/40 transition-colors"
            >
              <Icon name="Trash2" size={11} />
            </button>
          </div>
        </div>
      </div>
    );
  }

  // STANDARD KANBAN VIEW
  const extension = domain.includes('.') ? `.${domain.split('.').pop()}` : '.com';
  const isPinnedStyle = tool.isPinned 
    ? 'border-gold-550/35 bg-slate-900/80 shadow-md shadow-gold-500/2' 
    : 'border-slate-850 bg-slate-900/40';

  const badgeText = tool.isPinned ? 'PINNED' : tool.clickCount > 15 ? 'ACTIVE' : extension;
  const badgeColor = tool.isPinned ? 'text-gold-500' : tool.clickCount > 15 ? 'text-emerald-500' : 'text-slate-500';

  return (
    <div
      id={`card-${tool.id}`}
      draggable
      onDragStart={(e) => onDragStart(e, tool.id)}
      onDragOver={(e) => onDragOverCard(e, tool.id)}
      onDrop={(e) => onDropCard(e, tool.id)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      className={`group relative flex flex-col p-4 rounded-lg border hover:border-gold-550/50 hover:bg-slate-900 hover:-translate-y-0.5 hover:shadow-lg active:scale-[0.99] transition-all duration-200 cursor-pointer select-none overflow-hidden ${isPinnedStyle} ${draggingOpacity}`}
    >
      {/* Background radial highlight */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/0 via-slate-800/0 to-gold-550/2 opacity-0 group-hover:opacity-100 transition-opacity" />

      {/* Grid Header */}
      <div className="flex items-start justify-between gap-4 mb-3 relative z-10">
        <ToolLogo name={tool.name} url={tool.url} customLogoUrl={tool.customLogoUrl} size="md" />

        {/* Monospace Bento status token */}
        <span className={`text-[10px] font-mono uppercase tracking-widest ${badgeColor}`}>
          {badgeText}
        </span>
      </div>

      {/* Body Metadata */}
      <div className="flex-1 min-w-0 mb-3 relative z-10">
        <h4 className="text-sm font-bold text-slate-100 group-hover:text-gold-400 font-display tracking-tight truncate transition-colors mb-0.5">
          {tool.name}
        </h4>
        <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block mb-2 truncate">
          {tool.isLocalApp ? 'Local Desktop path' : domain}
        </span>
        
        {tool.description ? (
          <p className="text-[11px] text-slate-400 font-sans leading-relaxed line-clamp-2 h-8">
            {tool.description}
          </p>
        ) : (
          <p className="text-[11px] text-slate-600 font-mono italic leading-relaxed line-clamp-2 h-8">
            No dynamic notes recorded for this launcher.
          </p>
        )}
      </div>

      {/* Footer controls & analytics bar */}
      <div className="flex items-center justify-between mt-auto border-t border-slate-900 pt-2.5 relative z-10 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse mr-0.5"></span>
          <span>{tool.clickCount} launches</span>
        </div>

        {/* Quick action group layout */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {/* Pinned indicator toggle */}
          <button
            type="button"
            title={tool.isPinned ? "Unpin from Favorites" : "Pin to Favorites"}
            onClick={(e) => {
              e.stopPropagation();
              onPinToggle(tool.id);
            }}
            className="card-action-btn p-1 rounded bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-gold-400 hover:border-slate-700 transition-colors"
          >
            <Icon name="Star" size={11} className={tool.isPinned ? 'fill-gold-400 text-gold-400' : ''} />
          </button>

          {/* Edit button */}
          <button
            type="button"
            title="Edit portal"
            onClick={(e) => {
              e.stopPropagation();
              onEdit(tool);
            }}
            className="card-action-btn p-1 rounded bg-slate-950/70 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
          >
            <Icon name="Edit" size={11} />
          </button>

          {/* Delete button */}
          <button
            type="button"
            title="Remove portal launcher"
            onClick={(e) => {
              e.stopPropagation();
              if (confirm(`Remove "${tool.name}" from your workspace?`)) {
                onDelete(tool.id);
              }
            }}
            className="card-action-btn p-1 rounded bg-slate-950/70 border border-slate-850 text-slate-400 hover:text-rose-450 hover:border-rose-900/50 transition-colors"
          >
            <Icon name="Trash2" size={11} />
          </button>
        </div>
      </div>
    </div>
  );
}

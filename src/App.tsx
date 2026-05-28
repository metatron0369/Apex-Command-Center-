import React, { useState, useEffect } from 'react';
import { Category, Tool, ActivityLog, ViewMode } from './types';
import { DEFAULT_CATEGORIES, DEFAULT_TOOLS } from './data/defaultData';
import Icon from './components/Icon';
import CategoryLane from './components/CategoryLane';
import ToolLogo from './components/ToolLogo';
import AddToolModal from './components/AddToolModal';
import EditToolModal from './components/EditToolModal';
import AddCategoryModal from './components/AddCategoryModal';
import ExportImportModal from './components/ExportImportModal';
import LocalAppAssistantModal from './components/LocalAppAssistantModal';
import CommandPaletteModal from './components/CommandPaletteModal';

export default function App() {
  // ----------------------------------------------------
  // Stateful Variables
  // ----------------------------------------------------
  const [categories, setCategories] = useState<Category[]>([]);
  const [tools, setTools] = useState<Tool[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('bento-grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string | null>(null);

  // Drag & Drop tracking
  const [draggingToolId, setDraggingToolId] = useState<string | null>(null);

  // Modal controls
  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [isEditToolOpen, setIsEditToolOpen] = useState(false);
  const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
  const [isBackupOpen, setIsBackupOpen] = useState(false);
  const [isLocalAssistantOpen, setIsLocalAssistantOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [currentLocalAppTool, setCurrentLocalAppTool] = useState<Tool | null>(null);
  const [activeCategoryIdForQuickAdd, setActiveCategoryIdForQuickAdd] = useState<string | undefined>(undefined);
  const [currentEditingTool, setCurrentEditingTool] = useState<Tool | null>(null);

  // Intercept Cmd+K or Ctrl+K to toggle core command palette
  useEffect(() => {
    const handleGlobalPaletteShortcut = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleGlobalPaletteShortcut);
    return () => window.removeEventListener('keydown', handleGlobalPaletteShortcut);
  }, []);

  // Drawer / details triggers
  const [showLogsDrawer, setShowLogsDrawer] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  // ----------------------------------------------------
  // LocalStorage Persistence Core Loader
  // ----------------------------------------------------
  useEffect(() => {
    const storedCat = localStorage.getItem('tech_stack_center_categories');
    const storedTools = localStorage.getItem('tech_stack_center_tools');
    const storedLogs = localStorage.getItem('tech_stack_center_logs');
    const storedView = localStorage.getItem('tech_stack_center_viewmode');

    if (storedCat) {
      setCategories(JSON.parse(storedCat));
    } else {
      setCategories(DEFAULT_CATEGORIES);
      localStorage.setItem('tech_stack_center_categories', JSON.stringify(DEFAULT_CATEGORIES));
    }

    if (storedTools) {
      setTools(JSON.parse(storedTools));
    } else {
      setTools(DEFAULT_TOOLS);
      localStorage.setItem('tech_stack_center_tools', JSON.stringify(DEFAULT_TOOLS));
    }

    if (storedLogs) {
      setActivityLogs(JSON.parse(storedLogs));
    } else {
      const initialLog: ActivityLog = {
        id: 'sys-start',
        timestamp: new Date().toISOString(),
        action: 'reset',
        details: 'Command Center initiated with default workspace resources.',
      };
      setActivityLogs([initialLog]);
      localStorage.setItem('tech_stack_center_logs', JSON.stringify([initialLog]));
    }

    if (storedView) {
      setViewMode(storedView as ViewMode);
    }
  }, []);

  const saveCategoriesToLocal = (newCats: Category[]) => {
    setCategories(newCats);
    localStorage.setItem('tech_stack_center_categories', JSON.stringify(newCats));
  };

  const saveToolsToLocal = (newTools: Tool[]) => {
    setTools(newTools);
    localStorage.setItem('tech_stack_center_tools', JSON.stringify(newTools));
  };

  const logActivity = (action: ActivityLog['action'], details: string) => {
    const newLog: ActivityLog = {
      id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
    };
    
    const updated = [newLog, ...activityLogs].slice(0, 80); // Keep last 80 logs
    setActivityLogs(updated);
    localStorage.setItem('tech_stack_center_logs', JSON.stringify(updated));
  };

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  // ----------------------------------------------------
  // Dynamic Launch (Increment count & log & navigate)
  // ----------------------------------------------------
  const handleLaunchTool = (id: string) => {
    const targetTool = tools.find(t => t.id === id);
    if (!targetTool) return;

    // Increment clickCount & update timestamp
    const updated = tools.map(t => {
      if (t.id === id) {
        return {
          ...t,
          clickCount: t.clickCount + 1,
          lastUsed: new Date().toISOString(),
        };
      }
      return t;
    });

    saveToolsToLocal(updated);
    logActivity('click', `Launches App portal: "${targetTool.name}"`);

    if (targetTool.isLocalApp) {
      // Trigger execution modal
      setCurrentLocalAppTool(targetTool);
      setIsLocalAssistantOpen(true);
      // Try launching scheme if it's formatted as custom URI protocol like slack://, obsidian://, etc.
      const localPathOrScheme = targetTool.localPath || targetTool.url;
      if (/^[a-zA-Z0-9-]{2,15}:\/\//i.test(localPathOrScheme)) {
        try {
          window.location.href = localPathOrScheme;
          showToast(`Triggering application URI protocol launch for ${targetTool.name}!`, 'info');
        } catch (err) {
          console.warn("URI protocol navigation restricted by sandbox rules", err);
        }
      } else {
        showToast(`Desktop command execution directive initiated for ${targetTool.name}!`, 'info');
      }
    } else {
      // Smooth navigation in a new window tab
      window.open(targetTool.url, '_blank', 'noreferrer,noopener');
      showToast(`Navigated directly to ${targetTool.name}!`, 'success');
    }
  };

  // ----------------------------------------------------
  // CRUD - Tool Actions
  // ----------------------------------------------------
  const handleAddTool = (newToolData: Omit<Tool, 'id' | 'clickCount'>) => {
    const newTool: Tool = {
      ...newToolData,
      id: `tool-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      clickCount: 0,
      lastUsed: undefined,
    };

    saveToolsToLocal([...tools, newTool]);
    logActivity('create', `Created dynamic card launcher "${newTool.name}" in column "${newTool.category}"`);
    showToast(`"${newTool.name}" successfully added to lane!`, 'success');
  };

  const handleUpdateTool = (updatedTool: Tool) => {
    const updated = tools.map(t => t.id === updatedTool.id ? updatedTool : t);
    saveToolsToLocal(updated);
    logActivity('update', `Properties updated for card "${updatedTool.name}"`);
    showToast(`"${updatedTool.name}" parameters saved!`, 'success');
  };

  const handleDeleteTool = (id: string) => {
    const target = tools.find(t => t.id === id);
    const updated = tools.filter(t => t.id !== id);
    saveToolsToLocal(updated);
    if (target) {
      logActivity('delete', `Terminated portal card launcher for "${target.name}"`);
    }
    showToast(`Portal card removed.`, 'info');
  };

  const handlePinToggle = (id: string) => {
    const target = tools.find(t => t.id === id);
    const updated = tools.map(t => {
      if (t.id === id) {
        return { ...t, isPinned: !t.isPinned };
      }
      return t;
    });
    saveToolsToLocal(updated);
    if (target) {
      const isPinnedNow = !target.isPinned;
      logActivity('update', `${isPinnedNow ? 'Pinned' : 'Unpinned'} portal workspace shortcut "${target.name}"`);
      showToast(`${target.name} ${isPinnedNow ? 'added to' : 'removed from'} favorites dashboard.`, 'info');
    }
  };

  // ----------------------------------------------------
  // CRUD - Category Lane Actions
  // ----------------------------------------------------
  const handleAddCategory = (newCatData: Omit<Category, 'id'>) => {
    const id = newCatData.name.toLowerCase().replace(/\s+/g, '-').replace(/[^\w-]/g, '');
    const finalId = id || `lane-${Date.now()}`;
    
    // Prevent duplicated IDs
    if (categories.some(c => c.id === finalId)) {
      showToast('A lane with that identifier name already exists.', 'error');
      return;
    }

    const newCategory: Category = {
      ...newCatData,
      id: finalId,
    };

    saveCategoriesToLocal([...categories, newCategory]);
    logActivity('create', `Constructed custom dashboard lane widget: "${newCategory.name}"`);
    showToast(`Constructed lane: "${newCategory.name}"`, 'success');
  };

  const handleRenameCategory = (id: string, newName: string) => {
    const updated = categories.map(c => c.id === id ? { ...c, name: newName } : c);
    saveCategoriesToLocal(updated);
    logActivity('update', `Renamed lane "${id}" to "${newName}"`);
    showToast(`Lane description renamed.`, 'success');
  };

  const handleDeleteCategory = (id: string) => {
    // Save elements of this lane into "admin" or just keep them loose (any existing other category)
    const fallbackCategory = categories.find(c => c.id !== id)?.id || '';
    
    const updatedTools = tools.map(t => {
      if (t.category === id) {
        return { ...t, category: fallbackCategory }; // migration fallback
      }
      return t;
    });

    const updatedCategories = categories.filter(c => c.id !== id);
    saveCategoriesToLocal(updatedCategories);
    saveToolsToLocal(updatedTools);
    logActivity('delete', `Deleted command lane node "${id}"`);
    showToast(`Lane terminated. Assets migrated.`, 'info');
  };

  const handleToggleLaneCollapse = (id: string) => {
    const updated = categories.map(c => c.id === id ? { ...c, isCollapsed: !c.isCollapsed } : c);
    saveCategoriesToLocal(updated);
  };

  const handleMoveCategoryUp = (id: string) => {
    const idx = categories.findIndex(c => c.id === id);
    if (idx <= 0) return;
    const items = [...categories];
    const temp = items[idx];
    items[idx] = items[idx - 1];
    items[idx - 1] = temp;
    saveCategoriesToLocal(items);
    logActivity('reorder', `Reordered lane position upwards.`);
  };

  const handleMoveCategoryDown = (id: string) => {
    const idx = categories.findIndex(c => c.id === id);
    if (idx === -1 || idx >= categories.length - 1) return;
    const items = [...categories];
    const temp = items[idx];
    items[idx] = items[idx + 1];
    items[idx + 1] = temp;
    saveCategoriesToLocal(items);
    logActivity('reorder', `Reordered lane position downwards.`);
  };

  // ----------------------------------------------------
  // Drag and Drop (Reordering + Re-categorization) Event Handlers
  // ----------------------------------------------------
  const handleDragStartCard = (e: React.DragEvent, toolId: string) => {
    setDraggingToolId(toolId);
    e.dataTransfer.effectAllowed = 'move';
    // Firefox fallback parameters
    e.dataTransfer.setData('text/plain', toolId);
  };

  const handleDragOverCard = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
  };

  const handleDropCardOnCard = (e: React.DragEvent, targetCardId: string) => {
    e.preventDefault();
    const draggedId = draggingToolId;
    if (!draggedId || draggedId === targetCardId) return;

    const dragTool = tools.find(t => t.id === draggedId);
    const targetTool = tools.find(t => t.id === targetCardId);
    if (!dragTool || !targetTool) return;

    // Mutate state orders
    const updatedTools = [...tools];
    const dragIdx = updatedTools.findIndex(t => t.id === draggedId);
    
    // Change category of drag to target
    dragTool.category = targetTool.category;
    
    // Extract and splice placement
    if (dragIdx > -1) {
      const [removed] = updatedTools.splice(dragIdx, 1);
      const targetIdx = updatedTools.findIndex(t => t.id === targetCardId);
      updatedTools.splice(targetIdx, 0, removed);
    }

    saveToolsToLocal(updatedTools);
    logActivity('reorder', `Rearranged launcher "${dragTool.name}" directly next to "${targetTool.name}"`);
    setDraggingToolId(null);
  };

  const handleDropCardOnLane = (e: React.DragEvent, targetCategoryId: string) => {
    e.preventDefault();
    const draggedId = draggingToolId;
    if (!draggedId) return;

    const dragTool = tools.find(t => t.id === draggedId);
    if (!dragTool) return;

    if (dragTool.category !== targetCategoryId) {
      const updated = tools.map(t => {
        if (t.id === draggedId) {
          return { ...t, category: targetCategoryId };
        }
        return t;
      });

      const catName = categories.find(c => c.id === targetCategoryId)?.name || targetCategoryId;
      saveToolsToLocal(updated);
      logActivity('reorder', `Shifted workspace card "${dragTool.name}" to lane "${catName}"`);
    }
    setDraggingToolId(null);
  };

  // ----------------------------------------------------
  // Reset Workspace & Backup Commands
  // ----------------------------------------------------
  const handleResetToWorkspaceDefaults = () => {
    if (confirm('Restore the original Workspace configuration? This overwrite-replaces all bespoke local configurations with pristine default settings.')) {
      setCategories(DEFAULT_CATEGORIES);
      setTools(DEFAULT_TOOLS);
      localStorage.setItem('tech_stack_center_categories', JSON.stringify(DEFAULT_CATEGORIES));
      localStorage.setItem('tech_stack_center_tools', JSON.stringify(DEFAULT_TOOLS));
      
      const newLog: ActivityLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString(),
        action: 'reset',
        details: 'Re-sync complete system parameters with original whiteboard setup.',
      };
      setActivityLogs([newLog]);
      localStorage.setItem('tech_stack_center_logs', JSON.stringify([newLog]));
      
      showToast('Dashboard restored to pristine workspace designs!', 'info');
    }
  };

  const handleImportConfig = (imported: { categories: Category[]; tools: Tool[] }) => {
    setCategories(imported.categories);
    setTools(imported.tools);
    localStorage.setItem('tech_stack_center_categories', JSON.stringify(imported.categories));
    localStorage.setItem('tech_stack_center_tools', JSON.stringify(imported.tools));
    logActivity('import', `Duplicated and parsed config backup file (${imported.tools.length} apps)`);
    showToast('Dashboard configuration loaded cleanly!', 'success');
  };

  // ----------------------------------------------------
  // Layout views filtering core calculations
  // ----------------------------------------------------
  const filteredTools = tools.filter(tool => {
    // Search queries
    const searchString = `${tool.name} ${tool.url} ${tool.description || ''}`.toLowerCase();
    const matchesSearch = searchString.includes(searchQuery.toLowerCase());
    
    // Category shortcut filters
    const matchesCategory = selectedCategoryFilter ? tool.category === selectedCategoryFilter : true;
    
    return matchesSearch && matchesCategory;
  });

  // Calculate high value favorites pinning launcher
  const pinnedShortcuts = tools.filter(t => t.isPinned);

  // Analytics top calculations
  const topLaunches = [...tools].sort((a, b) => b.clickCount - a.clickCount).slice(0, 5);
  const recentLaunches = [...tools]
    .filter(t => !!t.lastUsed)
    .sort((a, b) => new Date(b.lastUsed!).getTime() - new Date(a.lastUsed!).getTime())
    .slice(0, 5);

  return (
    <div id="command-center-root" className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-16 selection:bg-gold-500 selection:text-slate-950">
      
      {/* Toast notifications */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-2 px-4 py-3 rounded-xl border shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-top-4 bg-slate-900 border-slate-800 text-slate-100">
          <span className={`w-2 h-2 rounded-full ${
            notification.type === 'success' ? 'bg-emerald-500' : notification.type === 'error' ? 'bg-rose-500' : 'bg-sky-500'
          }`} />
          <p className="text-xs font-mono font-semibold text-gold-400">{notification.message}</p>
        </div>
      )}

      {/* DASHBOARD HEADER */}
      <header className="border-b border-slate-900 bg-slate-950/40 backdrop-blur-md sticky top-0 z-40 px-4 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Logo Brand Title (Bento Command Panel Style) */}
          <div className="flex items-center gap-4">
            <div className="w-12 h-10 bg-gold-500 rounded flex items-center justify-center font-black text-slate-950 shrink-0 font-display text-sm tracking-widest shadow-md shadow-gold-500/10">
              ACC
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-sm font-black tracking-widest text-white uppercase font-display">
                  Apex Command Center <span className="text-gold-500 font-mono text-xs">v1.1</span>
                </h1>
              </div>
              <p className="text-[9px] uppercase tracking-[0.2em] text-slate-500 font-mono">
                Operational Tech Stack • System Active • gadkins@flafamilyoffice.com
              </p>
            </div>
          </div>

          {/* Quick Search Palette Trigger */}
          <div className="hidden lg:flex items-center gap-4">
            <button
              onClick={() => setIsCommandPaletteOpen(true)}
              className="flex items-center gap-2.5 text-[11px] font-mono text-slate-400 hover:text-white bg-slate-950/80 hover:bg-slate-900 border border-slate-900 hover:border-gold-500/20 px-3 py-1.5 rounded-xl transition-all duration-200 cursor-pointer shadow-sm group"
            >
              <Icon name="Search" size={12} className="text-gold-500 group-hover:scale-110 transition-transform" />
              <span>LAUNCHER PALETTE: ⌘K</span>
            </button>
          </div>

          {/* Quick Config Actions Bar */}
          <div className="flex items-center gap-2 shrink-0">
            {/* View Activity Audit Logs */}
            <button
              onClick={() => setShowLogsDrawer(!showLogsDrawer)}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded border font-mono transition-all ${
                showLogsDrawer
                  ? 'bg-gold-500/10 border-gold-500/30 text-gold-400 font-bold'
                  : 'bg-slate-900/60 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white'
              }`}
            >
              <Icon name="Activity" size={11} />
              <span>Audit Logs</span>
            </button>

            {/* Backups trigger */}
            <button
              onClick={() => setIsBackupOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded border bg-slate-900/60 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white font-mono transition-all"
            >
              <Icon name="Upload" size={11} />
              <span>Backups</span>
            </button>

            {/* Sync default whiteboard structure */}
            <button
              onClick={handleResetToWorkspaceDefaults}
              className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] rounded border bg-slate-900/60 border-slate-850 hover:border-slate-750 text-slate-400 hover:text-white font-mono transition-all"
              title="Restore original whiteboard layout presets"
            >
              <Icon name="RotateCcw" size={11} />
              <span>Reset Workspace</span>
            </button>
          </div>
        </div>
      </header>

      {/* CORE CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6">
        
        {/* HERO SUMMARY & FAVORITES RAIL */}
        {pinnedShortcuts.length > 0 && (
          <div className="mb-6 p-5 rounded-2xl border border-gold-500/10 bg-slate-900/25 relative overflow-hidden backdrop-blur-sm">
            <div className="absolute top-0 right-0 p-8 opacity-5">
              <Icon name="Star" size={120} className="text-gold-400 stroke-1" />
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <Icon name="Star" className="text-gold-400 fill-gold-400" size={16} />
              <h2 className="text-xs font-bold font-mono tracking-widest text-gold-400 uppercase">
                CEO Premium Quick Launcher
              </h2>
            </div>

            {/* Grid of pinned launchers */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
              {pinnedShortcuts.map((pin) => (
                <button
                  key={pin.id}
                  onClick={() => handleLaunchTool(pin.id)}
                  className="flex items-center gap-2.5 p-2 rounded-xl border border-slate-800 bg-slate-950/45 hover:bg-slate-950 hover:border-gold-450/40 hover:-translate-y-0.5 active:scale-95 text-left transition-all duration-200 group"
                >
                  <ToolLogo name={pin.name} url={pin.url} customLogoUrl={pin.customLogoUrl} size="sm" />
                  <div className="min-w-0 flex-1">
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-gold-400 font-display truncate transition-colors">
                      {pin.name}
                    </h4>
                    <span className="text-[9px] font-mono text-slate-500 truncate block">
                      {pin.clickCount} clicks
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* CONTROLS WORKSPACE PANEL */}
        <div className="flex flex-col lg:flex-row gap-4 items-stretch justify-between mb-6">
          
          {/* Quick Filter, Lane Toggle and Text Search Searchbar */}
          <div className="flex-1 bg-slate-900/35 border border-slate-850 p-4 rounded-2xl flex flex-col sm:flex-row gap-3 items-center">
            
            {/* Search inputs */}
            <div className="relative w-full sm:flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-500">
                <Icon name="Search" size={16} />
              </span>
              <input
                type="text"
                placeholder="Find specific tools, notes or custom domains..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-24 py-2 text-sm rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-gold-500 text-white placeholder-slate-600 transition-colors font-sans"
              />
              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="absolute inset-y-1.5 right-1.5 hidden sm:inline-flex items-center gap-1 px-1.5 bg-slate-900 border border-slate-800 rounded-md text-[9px] font-mono text-slate-400 hover:text-white transition-colors"
                title="Trigger global command search indices shortcut"
              >
                <span>Command</span>
                <span className="font-bold text-gold-450 bg-slate-950 border border-slate-850 px-1 rounded">⌘K</span>
              </button>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-28 flex items-center pr-3 text-slate-500 hover:text-white"
                >
                  <Icon name="X" size={14} />
                </button>
              )}
            </div>

            {/* Specific Filter dropdown lists */}
            <div className="w-full sm:w-48 flex items-center gap-2">
              <select
                value={selectedCategoryFilter || ''}
                onChange={(e) => setSelectedCategoryFilter(e.target.value || null)}
                className="w-full px-3 py-2 text-xs rounded-xl bg-slate-950 border border-slate-850 focus:outline-none focus:border-gold-500 text-slate-300 transition-colors cursor-pointer"
              >
                <option value="">All Lanes</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* VIEW SELECTOR & MAIN CREATION BUTTON OPERATIONS */}
          <div className="flex items-center gap-3 bg-slate-900/35 border border-slate-850 p-4 rounded-2xl">
            
            {/* Split Button Mode Selection */}
            <div className="flex items-center rounded-lg bg-slate-950 border border-slate-850 p-1">
              <button
                onClick={() => {
                  setViewMode('bento-grid');
                  localStorage.setItem('tech_stack_center_viewmode', 'bento-grid');
                }}
                className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
                  viewMode === 'bento-grid'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Sleek visual Bento layout grid style"
              >
                <Icon name="Grid" size={13} />
                <span className="hidden sm:inline">Bento Grid</span>
              </button>
              
              <button
                onClick={() => {
                  setViewMode('compact-list');
                  localStorage.setItem('tech_stack_center_viewmode', 'compact-list');
                }}
                className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
                  viewMode === 'compact-list'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Premium, space-saving list model"
              >
                <Icon name="List" size={13} />
                <span className="hidden sm:inline">Compact</span>
              </button>
              
              <button
                onClick={() => {
                  setViewMode('kanban-board');
                  localStorage.setItem('tech_stack_center_viewmode', 'kanban-board');
                }}
                className={`p-1.5 rounded text-xs flex items-center gap-1.5 transition-colors ${
                  viewMode === 'kanban-board'
                    ? 'bg-slate-800 text-white font-medium'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
                title="Drag-able vertical board lanes"
              >
                <Icon name="Kanban" size={13} />
                <span className="hidden sm:inline font-mono">Kanban</span>
              </button>
            </div>

            <div className="h-6 w-px bg-slate-800" />

            {/* Trigger modal: Add category lane */}
            <button
              onClick={() => setIsAddCategoryOpen(true)}
              className="flex items-center gap-1 px-3.5 py-2 text-xs font-semibold rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-800 hover:border-slate-750 transition-all font-display"
              title="Add category lane"
            >
              <Icon name="FolderPlus" size={14} />
              <span className="hidden md:inline">Add Lane</span>
            </button>

            {/* Trigger modal: Add tools */}
            <button
              onClick={() => {
                setActiveCategoryIdForQuickAdd(undefined);
                setIsAddToolOpen(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-gradient-to-r from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 active:scale-95 text-slate-950 font-display shadow-lg shadow-gold-500/10 transition-all font-sans"
            >
              <Icon name="Plus" size={14} className="stroke-[2.5]" />
              <span>Add Command Tool</span>
            </button>
          </div>
        </div>

        {/* ANALYTICS & RECENT INSIGHTS GRID BAR (COLLAPSIBLE / DESKTOP OPTIMIZED) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          
          {/* Top Launches Widget */}
          <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/15">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="TrendingUp" size={14} className="text-emerald-400" />
              <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase">
                Most Visited Enterprise Applications
              </h4>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {topLaunches.map((t, index) => (
                <button
                  key={t.id}
                  onClick={() => handleLaunchTool(t.id)}
                  title={`Launch portal (${t.clickCount} times visited)`}
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-xs text-slate-300 transition-colors"
                >
                  <span className="font-mono text-[9px] text-slate-500">#{index + 1}</span>
                  <span className="font-semibold">{t.name}</span>
                  <span className="font-mono text-[9px] text-emerald-400 bg-emerald-500/5 px-1 rounded ml-1">
                    {t.clickCount}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Recently Opened Assets */}
          <div className="p-4 rounded-2xl border border-slate-900 bg-slate-900/15">
            <div className="flex items-center gap-2 mb-2">
              <Icon name="Clock" size={14} className="text-sky-400" />
              <h4 className="text-[11px] font-bold font-mono tracking-widest text-slate-400 uppercase">
                Recently Accessed Gateways
              </h4>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {recentLaunches.length === 0 ? (
                <span className="text-xs text-slate-600 font-mono italic p-1">No launching logs recorded in this session.</span>
              ) : (
                recentLaunches.map((t) => {
                  const daysAgoStr = t.lastUsed ? new Date(t.lastUsed).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
                  return (
                    <button
                      key={t.id}
                      onClick={() => handleLaunchTool(t.id)}
                      title={`Launch portal (Last open: ${t.lastUsed})`}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-900/60 hover:bg-slate-900 border border-slate-850 hover:border-slate-700 text-xs text-slate-300 transition-colors"
                    >
                      <span className="font-semibold">{t.name}</span>
                      <span className="font-mono text-[8px] text-sky-400 ml-1">
                        at {daysAgoStr}
                      </span>
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* CORE GRID VIEW OF LANES */}
        {categories.length === 0 ? (
          <div className="p-16 border-2 border-dashed border-slate-800 rounded-3xl text-center bg-slate-900/10">
            <div className="w-16 h-16 rounded-2xl bg-gold-500/5 text-gold-500 flex items-center justify-center mx-auto mb-4 border border-gold-500/10">
              <Icon name="Compass" size={32} />
            </div>
            <h2 className="text-xl font-bold text-white font-display">No Custom Lanes Configured</h2>
            <p className="text-sm text-slate-400 mt-2 max-w-md mx-auto">
              Please click the "Add Lane" buttons above or reset the workspace schema to sync original layout assets.
            </p>
            <button
              onClick={handleResetToWorkspaceDefaults}
              className="mt-4 px-5 py-2 rounded-xl bg-slate-800 border border-slate-700 hover:border-slate-600 text-white font-semibold transition-all font-mono text-xs tracking-wider"
            >
              Restore Default Layout Presets
            </button>
          </div>
        ) : viewMode === 'kanban-board' ? (
          
          /* SCROLLABLE HORIZONTAL KANBAN COLS WRAPPER */
          <div className="overflow-x-auto pb-4 custom-scrollbar">
            <div className="flex gap-4 pb-4 select-none">
              {categories.map((cat, index) => {
                const laneTools = filteredTools.filter((t) => t.category === cat.id);
                return (
                  <CategoryLane
                    key={cat.id}
                    category={cat}
                    tools={laneTools}
                    onLaunch={handleLaunchTool}
                    onEdit={(tool) => {
                       setCurrentEditingTool(tool);
                       setIsEditToolOpen(true);
                    }}
                    onDelete={handleDeleteTool}
                    onPinToggle={handlePinToggle}
                    onAddToolClick={(catId) => {
                      setActiveCategoryIdForQuickAdd(catId);
                      setIsAddToolOpen(true);
                    }}
                    onRenameCategory={handleRenameCategory}
                    onDeleteCategory={handleDeleteCategory}
                    onToggleCollapse={handleToggleLaneCollapse}
                    viewMode={viewMode}
                    onDragStartCard={handleDragStartCard}
                    onDragOverCard={handleDragOverCard}
                    onDropCard={handleDropCardOnCard}
                    onDropOnLane={handleDropCardOnLane}
                    draggingToolId={draggingToolId}
                    index={index}
                  />
                );
              })}
            </div>
          </div>
        ) : (
          
          /* STANDARD VERTICAL STACKED ROWS OF LANES */
          <div className="space-y-6">
            {categories.map((cat, index) => {
              const laneTools = filteredTools.filter((t) => t.category === cat.id);
              return (
                <CategoryLane
                  key={cat.id}
                  category={cat}
                  tools={laneTools}
                  onLaunch={handleLaunchTool}
                  onEdit={(tool) => {
                    setCurrentEditingTool(tool);
                    setIsEditToolOpen(true);
                  }}
                  onDelete={handleDeleteTool}
                  onPinToggle={handlePinToggle}
                  onAddToolClick={(catId) => {
                    setActiveCategoryIdForQuickAdd(catId);
                    setIsAddToolOpen(true);
                  }}
                  onRenameCategory={handleRenameCategory}
                  onDeleteCategory={handleDeleteCategory}
                  onToggleCollapse={handleToggleLaneCollapse}
                  onMoveCategoryUp={handleMoveCategoryUp}
                  onMoveCategoryDown={handleMoveCategoryDown}
                  viewMode={viewMode}
                  onDragStartCard={handleDragStartCard}
                  onDragOverCard={handleDragOverCard}
                  onDropCard={handleDropCardOnCard}
                  onDropOnLane={handleDropCardOnLane}
                  draggingToolId={draggingToolId}
                  index={index}
                />
              );
            })}
          </div>
        )}
      </main>

      {/* Bottom Analytics Bar */}
      <footer className="mt-12 bg-slate-900/30 border-t border-slate-900/80 py-4 px-6 md:px-8 flex flex-col sm:flex-row items-center justify-between text-[10px] font-mono text-slate-500 gap-4 max-w-7xl mx-auto rounded-t-xl mb-4">
        <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-center sm:text-left">
          <div className="flex gap-1 uppercase"><span className="text-gold-550">Resources:</span> {tools.length} Total</div>
          <div className="flex gap-1 uppercase"><span className="text-emerald-500">Categories:</span> {categories.length} Lanes</div>
          <div className="flex gap-1 uppercase"><span className="text-slate-300">Total Launches:</span> {tools.reduce((acc, t) => acc + t.clickCount, 0)} visits</div>
        </div>
        <div className="flex items-center gap-4">
          <span className="animate-pulse flex items-center gap-1.5 text-emerald-450">
            <span className="w-1.5 h-1.5 bg-emerald-550 rounded-full"></span>
            ● SYSTEM OPERATIONAL
          </span>
          <span className="text-slate-600">V-1.0.0</span>
        </div>
      </footer>

      {/* AUDIT LOG DETAILS SIDE DRAWER SHELF */}
      {showLogsDrawer && (
        <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-slate-900 border-l border-slate-800 shadow-2xl flex flex-col p-6 animate-in slide-in-from-right duration-300">
          
          {/* Drawer Header */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
            <div className="flex items-center gap-2">
              <Icon name="Activity" className="text-gold-400 animate-pulse" size={18} />
              <h3 className="text-lg font-bold font-display tracking-tight text-white font-serif">System Operations Logs</h3>
            </div>
            
            <button
              onClick={() => setShowLogsDrawer(false)}
              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <Icon name="X" size={18} />
            </button>
          </div>

          <p className="text-xs text-slate-400 mb-4 font-sans leading-relaxed">
            Real-time track history of clicks, launches, re-categorizations, and layout overrides. Backed by client side localStorage.
          </p>

          {/* Logs scroll container */}
          <div className="flex-1 overflow-y-auto space-y-3 font-mono text-[11px] pr-1">
            {activityLogs.length === 0 ? (
              <p className="text-slate-600 italic">No operations logged.</p>
            ) : (
              activityLogs.map((log) => {
                const formattedTime = new Date(log.timestamp).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                });
                
                // Coloring actions
                const actionColors: Record<string, string> = {
                  click: 'text-emerald-400',
                  create: 'text-sky-400 font-semibold',
                  update: 'text-gold-400',
                  delete: 'text-rose-400',
                  reorder: 'text-indigo-400',
                  import: 'text-indigo-400 font-semibold',
                  reset: 'text-gold-500 font-bold',
                };

                return (
                  <div key={log.id} className="p-2.5 rounded bg-slate-950/60 border border-slate-850 flex flex-col gap-1.5 line-clamp-2">
                    <div className="flex items-center justify-between">
                      <span className={`uppercase font-bold tracking-wider ${actionColors[log.action] || 'text-slate-300'}`}>
                        {log.action}
                      </span>
                      <span className="text-slate-500 text-[9px]">
                        {formattedTime}
                      </span>
                    </div>
                    <p className="text-slate-300 leading-normal">{log.details}</p>
                  </div>
                );
              })
            )}
          </div>

          {/* Flush logs block */}
          <button
            onClick={() => {
              if (confirm('Erase complete audit records history?')) {
                const fresh: ActivityLog = {
                  id: `sys-${Date.now()}`,
                  timestamp: new Date().toISOString(),
                  action: 'reset',
                  details: 'History log database cleared.',
                };
                setActivityLogs([fresh]);
                localStorage.setItem('tech_stack_center_logs', JSON.stringify([fresh]));
                showToast('Audit records cleared.', 'info');
              }
            }}
            className="w-full mt-4 py-2 font-mono text-xs font-semibold rounded-lg bg-slate-950 hover:bg-slate-800 hover:text-white text-slate-500 transition-colors border border-slate-850"
          >
            Clear Log Database
          </button>
        </div>
      )}

      {/* BACKDROP FOR SIDE DRAWER */}
      {showLogsDrawer && (
        <div 
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm"
          onClick={() => setShowLogsDrawer(false)}
        />
      )}

      {/* DYNAMIC MODALS GRID */}
      <AddToolModal
        isOpen={isAddToolOpen}
        onClose={() => setIsAddToolOpen(false)}
        categories={categories}
        onAdd={handleAddTool}
        defaultCategoryId={activeCategoryIdForQuickAdd}
      />

      <EditToolModal
        isOpen={isEditToolOpen}
        tool={currentEditingTool}
        onClose={() => {
          setIsEditToolOpen(false);
          setCurrentEditingTool(null);
        }}
        categories={categories}
        onUpdate={handleUpdateTool}
      />

      <AddCategoryModal
        isOpen={isAddCategoryOpen}
        onClose={() => setIsAddCategoryOpen(false)}
        onAdd={handleAddCategory}
      />

      <ExportImportModal
        isOpen={isBackupOpen}
        onClose={() => setIsBackupOpen(false)}
        categories={categories}
        tools={tools}
        onImport={handleImportConfig}
      />

      <LocalAppAssistantModal
        isOpen={isLocalAssistantOpen}
        tool={currentLocalAppTool}
        onClose={() => {
          setIsLocalAssistantOpen(false);
          setCurrentLocalAppTool(null);
        }}
      />

      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        tools={tools}
        categories={categories}
        onLaunch={handleLaunchTool}
        onEdit={(tool) => {
          setCurrentEditingTool(tool);
          setIsEditToolOpen(true);
        }}
        onPinToggle={handlePinToggle}
      />

    </div>
  );
}

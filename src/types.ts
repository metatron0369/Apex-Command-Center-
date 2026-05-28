export interface Tool {
  id: string;
  name: string;
  url: string;
  category: string; // references Category.id
  customLogoUrl?: string;
  description?: string;
  isPinned?: boolean;
  clickCount: number;
  lastUsed?: string; // ISO date format
  isLocalApp?: boolean;
  localPath?: string;
}

export interface Category {
  id: string;
  name: string;
  icon?: string; // lucide icon name
  color: string; // tailwind color class prefix (e.g., 'amber', 'sky', 'emerald', 'violet')
  isCollapsed?: boolean;
}

export interface ActivityLog {
  id: string;
  timestamp: string;
  action: 'click' | 'create' | 'update' | 'delete' | 'reorder' | 'import' | 'reset';
  details: string;
}

export type ViewMode = 'bento-grid' | 'compact-list' | 'kanban-board';

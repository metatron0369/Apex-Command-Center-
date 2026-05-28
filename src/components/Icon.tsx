import React from 'react';
import {
  Shield,
  TrendingUp,
  Cpu,
  Coins,
  Search,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Minimize2,
  Maximize2,
  Grid,
  List,
  Kanban,
  Download,
  Upload,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
  Star,
  Activity,
  FolderPlus,
  Compass,
  Link,
  X,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  Clock,
  Layout,
  User,
  Heart
} from 'lucide-react';

const iconMap: Record<string, React.ComponentType<any>> = {
  Shield,
  TrendingUp,
  Cpu,
  Coins,
  Search,
  Plus,
  Trash2,
  Edit,
  ExternalLink,
  Minimize2,
  Maximize2,
  Grid,
  List,
  Kanban,
  Download,
  Upload,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  Settings,
  Star,
  Activity,
  FolderPlus,
  Compass,
  Link,
  X,
  Sparkles,
  Info,
  Calendar,
  AlertCircle,
  Clock,
  Layout,
  User,
  Heart
};

interface IconProps {
  name: string;
  className?: string;
  size?: number;
}

export default function Icon({ name, className = '', size = 20 }: IconProps) {
  // Safe lookup with robust fallback to Link icon
  const IconComponent = iconMap[name] || Link;
  return <IconComponent className={className} size={size} />;
}

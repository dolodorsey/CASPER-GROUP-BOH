export interface Brand {
  id: string;
  name: string;
  logo: string;
  mascot?: string;
  tagline: string;
  theme: {
    primary: string;
    secondary: string;
  };
  kpi: {
    aov: number;
    margin: number;
    orders30d: number;
    topSeller: string;
  };
  status: 'active' | 'paused' | 'maintenance';
}

export interface Location {
  id: string;
  name: string;
  address: string;
  brandIds: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  status: 'open' | 'closed' | 'surge' | 'maintenance';
  kpi: {
    rev30d: number;
    ontime: number;
    incidents: number;
    employees: number;
  };
  equipment: Equipment[];
  hours: {
    [key: string]: { open: string; close: string };
  };
}

export interface Equipment {
  id: string;
  name: string;
  type: string;
  status: 'operational' | 'maintenance' | 'down';
  lastService: string;
  nextService: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  roles: Role[];
  assignments: {
    brandIds: string[];
    locationIds: string[];
  };
  status: 'active' | 'inactive';
  lastLogin: string;
}

export interface Role {
  id: string;
  name: 'super_admin' | 'regional_admin' | 'brand_admin' | 'location_admin';
  permissions: string[];
}

export interface Shift {
  id: string;
  userId: string;
  locationId: string;
  role: string;
  start: string;
  end: string;
  station: string;
  status: 'scheduled' | 'active' | 'completed' | 'cancelled';
}

export interface Schedule {
  id: string;
  locationId: string;
  weekOf: string;
  shifts: Shift[];
  status: 'draft' | 'published' | 'locked';
}

export interface Ticket {
  id: string;
  provider: 'doordash' | 'ubereats' | 'grubhub' | 'direct';
  items: TicketItem[];
  status: 'new' | 'in_progress' | 'ready' | 'outbound' | 'completed' | 'exception';
  slaStart: string;
  slaTarget: number;
  priority: 'normal' | 'high' | 'vip';
  locationId: string;
  total: number;
}

export interface TicketItem {
  id: string;
  name: string;
  quantity: number;
  modifications: string[];
  price: number;
}

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: string;
  par: number;
  onHand: number;
  unit: string;
  cost: number;
  vendorId: string;
  locationId: string;
  lastUpdated: string;
}

export interface Reorder {
  id: string;
  items: ReorderItem[];
  vendorId: string;
  locationId: string;
  eta: string;
  status: 'pending' | 'approved' | 'ordered' | 'delivered';
  total: number;
}

export interface ReorderItem {
  inventoryItemId: string;
  quantity: number;
  cost: number;
}

export interface Incident {
  id: string;
  type: 'safety' | 'equipment' | 'customer' | 'employee' | 'other';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  description: string;
  locationId: string;
  reportedBy: string;
  assignedTo?: string;
  media: string[];
  status: 'reported' | 'investigating' | 'resolved' | 'closed';
  createdAt: string;
  resolvedAt?: string;
  insurerPackUrl?: string;
}

export interface TrainingModule {
  id: string;
  title: string;
  description: string;
  version: string;
  contentRefs: string[];
  quizSchema: QuizQuestion[];
  brandIds: string[];
  roles: string[];
  estimatedMinutes: number;
}

export interface QuizQuestion {
  id: string;
  question: string;
  type: 'multiple_choice' | 'true_false' | 'text';
  options?: string[];
  correctAnswer: string | number;
  points: number;
}

export interface TrainingAssignment {
  id: string;
  moduleId: string;
  userId: string;
  assignedBy: string;
  dueAt: string;
  status: 'assigned' | 'in_progress' | 'completed' | 'overdue';
  score?: number;
  completedAt?: string;
  certUrl?: string;
}

export interface Message {
  id: string;
  channelId: string;
  actorId: string;
  body: string;
  attachments: string[];
  timestamp: string;
  readBy: string[];
  priority: 'normal' | 'high' | 'critical';
}

export interface Channel {
  id: string;
  name: string;
  type: 'global' | 'brand' | 'location' | 'role' | 'incident';
  brandId?: string;
  locationId?: string;
  cohort?: string;
  members: string[];
  isArchived: boolean;
}

export interface Alert {
  id: string;
  type: 'inventory_low' | 'sla_breach' | 'equipment_down' | 'training_overdue' | 'surge_forecast';
  severity: 'info' | 'warning' | 'error' | 'critical';
  title: string;
  message: string;
  targetId: string;
  targetType: 'location' | 'brand' | 'user' | 'equipment';
  createdAt: string;
  status: 'active' | 'acknowledged' | 'resolved';
  actionable: boolean;
  playbook?: ActionPlaybook;
}

export interface ActionPlaybook {
  id: string;
  name: string;
  description: string;
  actions: PlaybookAction[];
  estimatedImpact: string;
}

export interface PlaybookAction {
  id: string;
  type: 'add_shift' | 'increase_inventory' | 'send_notification' | 'update_menu' | 'toggle_status';
  params: Record<string, any>;
  targetPortal: 'employee' | 'partner' | 'admin';
}

export interface KPIMetric {
  id: string;
  name: string;
  value: number | string;
  unit?: string;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
  target?: number;
  status: 'good' | 'warning' | 'critical';
  lastUpdated: string;
}

export interface DashboardWidget {
  id: string;
  type: 'kpi' | 'chart' | 'map' | 'alerts' | 'recent_activity';
  title: string;
  size: 'small' | 'medium' | 'large';
  data: any;
  refreshInterval?: number;
}

export interface AdminState {
  currentUser: User | null;
  selectedLocation: Location | null;
  selectedBrand: Brand | null;
  activeTab: string;
  notifications: Alert[];
  isLoading: boolean;
  lastSync: string;
}
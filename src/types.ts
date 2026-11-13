export type Priority = 'Critical' | 'High' | 'Medium' | 'Low';
export type TicketStatus = 'Open' | 'In Progress' | 'Waiting on Customer' | 'Escalated' | 'Resolved';
export type Department = 'Billing & Finance' | 'API & Infrastructure' | 'Account Access' | 'Security' | 'Product & Features';
export type Sentiment = 'Positive' | 'Neutral' | 'Negative';
export type CustomerTier = 'Enterprise' | 'Growth' | 'Startup';

export interface ActivityLog {
  id: string;
  timestamp: Date;
  actor: string;
  actorType: 'system' | 'ai' | 'agent';
  action: string;
  details?: string;
}

export interface Ticket {
  id: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  customerTier: CustomerTier;
  subject: string;
  body: string;
  department: Department;
  priority: Priority;
  status: TicketStatus;
  sentiment: Sentiment;
  aiDiagnosis: string;
  aiConfidence: number;
  assignedAgent: string;
  createdAt: Date;
  firstResponseAt: Date | null;
  resolvedAt: Date | null;
  firstResponseSlaHours: number;
  resolutionSlaHours: number;
  activityLog: ActivityLog[];
  tags: string[];
}

export interface SlaMetrics {
  totalTickets: number;
  openBacklog: number;
  firstResponseCompliance: number;
  resolutionCompliance: number;
  sentimentPositive: number;
  sentimentNeutral: number;
  sentimentNegative: number;
}

export interface DepartmentStat {
  department: Department;
  count: number;
  criticalCount: number;
  avgResolutionHours: number;
  breachCount: number;
}

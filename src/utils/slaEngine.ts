import type { Ticket, SlaMetrics, DepartmentStat } from '../types';

export function getRemainingHours(ticket: Ticket): number {
  const now = new Date();
  const created = ticket.createdAt;
  const elapsedHours = (now.getTime() - created.getTime()) / 3600000;

  if (ticket.status === 'Resolved' && ticket.resolvedAt) {
    return 0;
  }

  if (ticket.firstResponseAt === null) {
    return ticket.firstResponseSlaHours - elapsedHours;
  }

  return ticket.resolutionSlaHours - elapsedHours;
}

export type SlaStatusType = 'ok' | 'warning' | 'breach';

export function getSlaStatus(remaining: number): SlaStatusType {
  if (remaining < 0) return 'breach';
  if (remaining < 1) return 'warning';
  return 'ok';
}

export function computeMetrics(tickets: Ticket[]): SlaMetrics {
  const totalTickets = tickets.length;
  const openBacklog = tickets.filter(
    (t) => t.status !== 'Resolved'
  ).length;

  const responded = tickets.filter((t) => t.firstResponseAt !== null);
  const firstResponseCompliant = responded.filter((t) => {
    if (!t.firstResponseAt) return false;
    const elapsed =
      (t.firstResponseAt.getTime() - t.createdAt.getTime()) / 3600000;
    return elapsed <= t.firstResponseSlaHours;
  });
  const firstResponseCompliance =
    totalTickets > 0 ? (firstResponseCompliant.length / totalTickets) * 100 : 100;

  const resolved = tickets.filter((t) => t.status === 'Resolved' && t.resolvedAt);
  const resolutionCompliant = resolved.filter((t) => {
    if (!t.resolvedAt) return false;
    const elapsed =
      (t.resolvedAt.getTime() - t.createdAt.getTime()) / 3600000;
    return elapsed <= t.resolutionSlaHours;
  });
  const resolutionCompliance =
    resolved.length > 0
      ? (resolutionCompliant.length / resolved.length) * 100
      : 100;

  const sentimentPositive = tickets.filter((t) => t.sentiment === 'Positive').length;
  const sentimentNeutral = tickets.filter((t) => t.sentiment === 'Neutral').length;
  const sentimentNegative = tickets.filter((t) => t.sentiment === 'Negative').length;

  return {
    totalTickets,
    openBacklog,
    firstResponseCompliance: Math.round(firstResponseCompliance),
    resolutionCompliance: Math.round(resolutionCompliance),
    sentimentPositive,
    sentimentNeutral,
    sentimentNegative,
  };
}

export function computeDepartmentStats(tickets: Ticket[]): DepartmentStat[] {
  const depts = [
    'Billing & Finance',
    'API & Infrastructure',
    'Account Access',
    'Security',
    'Product & Features',
  ] as const;

  return depts.map((dept) => {
    const deptTickets = tickets.filter((t) => t.department === dept);
    const criticalCount = deptTickets.filter((t) => t.priority === 'Critical').length;
    const resolved = deptTickets.filter((t) => t.resolvedAt !== null);
    const avgResolutionHours =
      resolved.length > 0
        ? resolved.reduce((acc, t) => {
            const hours = t.resolvedAt
              ? (t.resolvedAt.getTime() - t.createdAt.getTime()) / 3600000
              : 0;
            return acc + hours;
          }, 0) / resolved.length
        : 0;

    const breachCount = deptTickets.filter((t) => {
      const remaining = getRemainingHours(t);
      return remaining < 0 && t.status !== 'Resolved';
    }).length;

    return {
      department: dept,
      count: deptTickets.length,
      criticalCount,
      avgResolutionHours: Math.round(avgResolutionHours * 10) / 10,
      breachCount,
    };
  });
}

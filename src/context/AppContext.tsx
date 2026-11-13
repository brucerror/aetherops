import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { Ticket, TicketStatus, Department, Priority } from '../types';
import { seedTickets } from '../data/seedTickets';
import { classifyTicket, generateActivityLogEntry } from '../utils/aiEngine';

export type ThemeMode = 'dark' | 'light';
export type UserRole = 'manager' | 'agent';

interface AppContextValue {
  tickets: Ticket[];
  selectedTicket: Ticket | null;
  setSelectedTicket: (ticket: Ticket | null) => void;
  updateTicketStatus: (id: string, status: TicketStatus) => void;
  updateTicketDepartment: (id: string, department: Department) => void;
  updateTicketPriority: (id: string, priority: Priority) => void;
  addTicket: (data: {
    customerName: string;
    customerEmail: string;
    customerTier: Ticket['customerTier'];
    subject: string;
    body: string;
  }) => Ticket;
  sendDraftResponse: (ticketId: string, draftText: string) => void;
  theme: ThemeMode;
  toggleTheme: () => void;
  role: UserRole;
  setRole: (role: UserRole) => void;
  currentUser: string;
}

const AppContext = createContext<AppContextValue | null>(null);

function generateId(): string {
  const num = Math.floor(Math.random() * 900) + 100;
  return `TKT-0${num}`;
}

function generateCustomerId(): string {
  const num = Math.floor(Math.random() * 9000) + 1000;
  return `CUST-${num}`;
}

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [tickets, setTickets] = useState<Ticket[]>(seedTickets);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [theme, setTheme] = useState<ThemeMode>('dark');
  const [role, setRole] = useState<UserRole>('manager');

  const currentUser = role === 'manager' ? 'Marcus Chen (Operations Director)' : 'Priya Nair (Support Engineer)';

  const toggleTheme = useCallback(() => {
    setTheme((prev) => {
      const next = prev === 'dark' ? 'light' : 'dark';
      if (typeof document !== 'undefined') {
        document.body.classList.toggle('light', next === 'light');
      }
      return next;
    });
  }, []);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.body.classList.toggle('light', theme === 'light');
    }
  }, [theme]);

  const updateTicketStatus = useCallback((id: string, status: TicketStatus) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const logEntry = generateActivityLogEntry('Agent', `Status changed to: ${status}`);
        return {
          ...t,
          status,
          resolvedAt: status === 'Resolved' ? new Date() : t.resolvedAt,
          activityLog: [
            ...t.activityLog,
            { ...logEntry, id: `AL-${Date.now()}` },
          ],
        };
      })
    );
    setSelectedTicket((prev) => {
      if (!prev || prev.id !== id) return prev;
      const logEntry = generateActivityLogEntry('Agent', `Status changed to: ${status}`);
      return {
        ...prev,
        status,
        resolvedAt: status === 'Resolved' ? new Date() : prev.resolvedAt,
        activityLog: [
          ...prev.activityLog,
          { ...logEntry, id: `AL-${Date.now()}` },
        ],
      };
    });
  }, []);

  const updateTicketDepartment = useCallback((id: string, department: Department) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const logEntry = generateActivityLogEntry('Agent', `Department overridden to: ${department}`);
        return {
          ...t,
          department,
          activityLog: [
            ...t.activityLog,
            { ...logEntry, id: `AL-${Date.now()}` },
          ],
        };
      })
    );
    setSelectedTicket((prev) => {
      if (!prev || prev.id !== id) return prev;
      const logEntry = generateActivityLogEntry('Agent', `Department overridden to: ${department}`);
      return {
        ...prev,
        department,
        activityLog: [
          ...prev.activityLog,
          { ...logEntry, id: `AL-${Date.now()}` },
        ],
      };
    });
  }, []);

  const updateTicketPriority = useCallback((id: string, priority: Priority) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== id) return t;
        const logEntry = generateActivityLogEntry('Agent', `Priority overridden to: ${priority}`);
        return {
          ...t,
          priority,
          activityLog: [
            ...t.activityLog,
            { ...logEntry, id: `AL-${Date.now()}` },
          ],
        };
      })
    );
    setSelectedTicket((prev) => {
      if (!prev || prev.id !== id) return prev;
      const logEntry = generateActivityLogEntry('Agent', `Priority overridden to: ${priority}`);
      return {
        ...prev,
        priority,
        activityLog: [
          ...prev.activityLog,
          { ...logEntry, id: `AL-${Date.now()}` },
        ],
      };
    });
  }, []);

  const addTicket = useCallback(
    (data: {
      customerName: string;
      customerEmail: string;
      customerTier: Ticket['customerTier'];
      subject: string;
      body: string;
    }): Ticket => {
      const classification = classifyTicket(data.subject, data.body);
      const now = new Date();
      const newTicket: Ticket = {
        id: generateId(),
        customerId: generateCustomerId(),
        customerName: data.customerName,
        customerEmail: data.customerEmail,
        customerTier: data.customerTier,
        subject: data.subject,
        body: data.body,
        department: classification.department,
        priority: classification.priority,
        status: 'Open',
        sentiment: classification.sentiment,
        aiDiagnosis: classification.aiDiagnosis,
        aiConfidence: classification.aiConfidence,
        assignedAgent: 'Unassigned',
        createdAt: now,
        firstResponseAt: null,
        resolvedAt: null,
        firstResponseSlaHours: classification.priority === 'Critical' ? 1 : classification.priority === 'High' ? 2 : 4,
        resolutionSlaHours: classification.priority === 'Critical' ? 4 : classification.priority === 'High' ? 8 : 24,
        activityLog: [
          {
            id: `AL-${Date.now()}`,
            timestamp: now,
            actor: 'System',
            actorType: 'system',
            action: 'Ticket ingested',
            details: `Auto-routed to ${classification.department}`,
          },
          {
            id: `AL-${Date.now() + 1}`,
            timestamp: new Date(now.getTime() + 2000),
            actor: 'AetherOps AI',
            actorType: 'ai',
            action: 'Classification complete',
            details: `Priority: ${classification.priority}, Confidence: ${Math.round(classification.aiConfidence * 100)}%`,
          },
        ],
        tags: classification.tags,
      };
      setTickets((prev) => [newTicket, ...prev]);
      return newTicket;
    },
    []
  );

  const sendDraftResponse = useCallback((ticketId: string, draftText: string) => {
    setTickets((prev) =>
      prev.map((t) => {
        if (t.id !== ticketId) return t;
        const now = new Date();
        const logEntry: Ticket['activityLog'][0] = {
          id: `AL-${Date.now()}`,
          timestamp: now,
          actor: t.assignedAgent,
          actorType: 'agent',
          action: 'Response approved & sent',
          details: draftText.substring(0, 120) + (draftText.length > 120 ? '…' : ''),
        };
        return {
          ...t,
          firstResponseAt: t.firstResponseAt ?? now,
          status: t.status === 'Open' ? 'In Progress' : t.status,
          activityLog: [...t.activityLog, logEntry],
        };
      })
    );
    setSelectedTicket((prev) => {
      if (!prev || prev.id !== ticketId) return prev;
      const now = new Date();
      const logEntry: Ticket['activityLog'][0] = {
        id: `AL-${Date.now()}`,
        timestamp: now,
        actor: prev.assignedAgent,
        actorType: 'agent',
        action: 'Response approved & sent',
        details: draftText.substring(0, 120) + (draftText.length > 120 ? '…' : ''),
      };
      return {
        ...prev,
        firstResponseAt: prev.firstResponseAt ?? now,
        status: prev.status === 'Open' ? 'In Progress' : prev.status,
        activityLog: [...prev.activityLog, logEntry],
      };
    });
  }, []);

  return (
    <AppContext.Provider
      value={{
        tickets,
        selectedTicket,
        setSelectedTicket,
        updateTicketStatus,
        updateTicketDepartment,
        updateTicketPriority,
        addTicket,
        sendDraftResponse,
        theme,
        toggleTheme,
        role,
        setRole,
        currentUser,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextValue {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

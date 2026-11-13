import type { Ticket, Department, Priority, Sentiment, ActivityLog } from '../types';

interface ClassificationResult {
  department: Department;
  priority: Priority;
  sentiment: Sentiment;
  aiDiagnosis: string;
  aiConfidence: number;
  tags: string[];
}

const keywordMap: Array<{
  keywords: string[];
  department: Department;
  priority: Priority;
  tags: string[];
}> = [
  {
    keywords: ['invoice', 'billing', 'charge', 'payment', 'refund', 'subscription', 'overcharge', 'credit', 'currency', 'ach', 'fx'],
    department: 'Billing & Finance',
    priority: 'High',
    tags: ['billing'],
  },
  {
    keywords: ['kubernetes', 'k8s', 'pod', 'oom', 'memory', 'cpu', 'docker', 'container', 'deployment', 'cluster', 'node', 'api', 'webhook', 'rate limit', '429', '503', '401', 'endpoint', 'timeout', 'latency', 'ci/cd', 'github actions', 'pipeline', 'cache'],
    department: 'API & Infrastructure',
    priority: 'Medium',
    tags: ['infrastructure'],
  },
  {
    keywords: ['login', 'password', 'reset', 'access', 'account', 'sso', 'saml', 'oauth', 'locked', 'authentication', 'sign in', 'mfa', 'totp', '2fa', 'email', 'delivery'],
    department: 'Account Access',
    priority: 'Medium',
    tags: ['access'],
  },
  {
    keywords: ['security', 'breach', 'vulnerability', 'exploit', 'gdpr', 'compliance', 'audit', 'api key', 'exfiltration', 'dsar', 'data export', 'mfa bypass', 'certificate'],
    department: 'Security',
    priority: 'High',
    tags: ['security'],
  },
  {
    keywords: ['feature', 'request', 'roadmap', 'enhancement', 'suggestion', 'improve', 'wish', 'add', 'functionality', 'export', 'report', 'dashboard'],
    department: 'Product & Features',
    priority: 'Low',
    tags: ['feature-request'],
  },
];

const criticalKeywords = ['critical', 'urgent', 'down', 'outage', 'breach', 'exfiltration', 'oom', 'locked out', 'expired', 'compromise', 'data loss', 'regulatory', 'gdpr penalty', 'all users'];
const highKeywords = ['high', 'severe', 'failing', 'error', 'blocked', 'unauthorized', 'vulnerability', 'duplicate charge', 'deadline'];
const negativeKeywords = ['frustrated', 'unacceptable', 'demand', 'immediately', 'urgent', 'angry', 'disappointed', 'failure', 'breach', 'loss', 'issue', 'problem', 'bug', 'error', 'failed'];
const positiveKeywords = ['please', 'thank', 'appreciate', 'great', 'love', 'wonderful', 'happy', 'helpful', 'improve', 'request'];

function matchKeywords(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.filter((kw) => lower.includes(kw)).length;
}

export function classifyTicket(subject: string, body: string): ClassificationResult {
  const fullText = `${subject} ${body}`.toLowerCase();

  // Department classification
  let bestDept: Department = 'Product & Features';
  let bestScore = 0;
  let bestPriority: Priority = 'Low';
  let bestTags: string[] = [];

  for (const mapping of keywordMap) {
    const score = matchKeywords(fullText, mapping.keywords);
    if (score > bestScore) {
      bestScore = score;
      bestDept = mapping.department;
      bestPriority = mapping.priority;
      bestTags = [...mapping.tags];
    }
  }

  // Priority override
  const critScore = matchKeywords(fullText, criticalKeywords);
  const highScore = matchKeywords(fullText, highKeywords);

  let priority: Priority = bestPriority;
  if (critScore >= 2) priority = 'Critical';
  else if (critScore === 1 || highScore >= 2) priority = 'High';
  else if (highScore === 1) priority = 'Medium';

  // Sentiment
  const negScore = matchKeywords(fullText, negativeKeywords);
  const posScore = matchKeywords(fullText, positiveKeywords);
  let sentiment: Sentiment = 'Neutral';
  if (negScore > posScore + 1) sentiment = 'Negative';
  else if (posScore > negScore) sentiment = 'Positive';

  // Confidence
  const confidence = Math.min(0.95, 0.60 + bestScore * 0.03 + critScore * 0.02);

  // AI Diagnosis
  const diagnosisMap: Record<Department, string> = {
    'Billing & Finance': `Billing anomaly detected in subject: "${subject}". AI analysis indicates potential payment processing or invoicing issue. Recommended: audit payment gateway logs, verify charge idempotency, review subscription state machine for the affected account. Coordinate with finance team for credit memo if duplicate confirmed.`,
    'API & Infrastructure': `Infrastructure or API issue identified: "${subject}". System pattern analysis suggests service degradation or integration failure. Recommended: check service health dashboards, review recent deployments (last 72h), examine error logs for correlated failures across the stack.`,
    'Account Access': `Account access disruption detected: "${subject}". Authentication or account lifecycle issue identified. Recommended: verify identity provider configuration, check email delivery pipeline, review account state and recent admin actions. Prioritize if multiple users affected.`,
    'Security': `Security-sensitive ticket identified: "${subject}". Potential compliance or security control concern. Recommended: escalate to security engineering, preserve relevant logs under audit hold, assess GDPR/SOC2 notification obligations, engage legal if breach indicators present.`,
    'Product & Features': `Product enhancement request received: "${subject}". User-initiated feature suggestion logged. Recommended: assess against existing roadmap, check for similar requests in backlog (demand clustering), route to Product Management for prioritization in next planning cycle.`,
  };

  const aiDiagnosis = diagnosisMap[bestDept];

  // Extract additional tags from text
  const additionalTags: string[] = [];
  if (fullText.includes('kubernetes') || fullText.includes('k8s')) additionalTags.push('kubernetes');
  if (fullText.includes('gdpr')) additionalTags.push('gdpr');
  if (fullText.includes('saml') || fullText.includes('sso')) additionalTags.push('sso');
  if (fullText.includes('webhook')) additionalTags.push('webhook');
  if (fullText.includes('mfa') || fullText.includes('totp')) additionalTags.push('mfa');
  if (fullText.includes('api key')) additionalTags.push('api-key');
  if (fullText.includes('invoice') || fullText.includes('billing')) additionalTags.push('invoice');

  return {
    department: bestDept,
    priority,
    sentiment,
    aiDiagnosis,
    aiConfidence: Math.round(confidence * 100) / 100,
    tags: [...new Set([...bestTags, ...additionalTags])],
  };
}

export function generateDraftResponse(ticket: Ticket): string {
  const tierGreeting: Record<string, string> = {
    Enterprise: `Dear ${ticket.customerName} team`,
    Growth: `Hi ${ticket.customerName} team`,
    Startup: `Hi there`,
  };

  const greeting = tierGreeting[ticket.customerTier] || `Dear ${ticket.customerName} team`;

  const priorityAck: Record<string, string> = {
    Critical: 'We recognize the critical business impact of this issue and have assigned our highest priority response resources.',
    High: 'We understand the urgency of this matter and have elevated the priority of your case.',
    Medium: 'Thank you for bringing this to our attention. We have reviewed your case and are actively working toward a resolution.',
    Low: 'Thank you for your feedback. We appreciate you taking the time to share this with us.',
  };

  const deptAction: Record<string, string> = {
    'Billing & Finance': `Our billing engineering and finance operations teams are conducting a detailed audit of your account (${ticket.id}). We will provide a comprehensive resolution including any applicable credits within the timeframe specified in your SLA agreement.`,
    'API & Infrastructure': `Our platform reliability engineering team has been engaged and is actively investigating the technical root cause. We will provide diagnostic findings and an estimated remediation timeline in our next update.`,
    'Account Access': `Our identity and access management team has been engaged immediately. We are taking steps to restore access while ensuring all security protocols are maintained throughout the process.`,
    'Security': `Our security engineering team and compliance officers have been immediately engaged. This matter is being treated with the utmost urgency in accordance with our security incident response procedures.`,
    'Product & Features': `Your feature request has been formally logged in our product backlog (reference: ${ticket.id}) and shared with our Product Management team for evaluation against our strategic roadmap.`,
  };

  const nextSteps: Record<string, string> = {
    Critical: `We will provide a status update within 1 hour. If you need to reach us directly, please reference ticket ${ticket.id} with your dedicated account manager.`,
    High: `We will provide a status update within 2 hours. Please reference ${ticket.id} in any follow-up communications.`,
    Medium: `We will provide a comprehensive update within 4 hours. Please reference ${ticket.id} in any follow-up communications.`,
    Low: `Our team will follow up with more details within 1-2 business days. Please reference ${ticket.id} in any follow-up communications.`,
  };

  return `${greeting},

Thank you for contacting AetherOps Support. This is to confirm we have received your request (Ticket ID: ${ticket.id}) regarding: "${ticket.subject}".

${priorityAck[ticket.priority]}

${deptAction[ticket.department]}

**Next Steps:**
${nextSteps[ticket.priority]}

We sincerely value your partnership with AetherOps and are committed to resolving this matter to your complete satisfaction.

Warm regards,
${ticket.assignedAgent}
AetherOps Enterprise Support
support@aetherops.io | +1 (888) 243-7677`;
}

export function generateActivityLogEntry(
  actor: string,
  action: string,
  details?: string
): Omit<ActivityLog, 'id'> {
  return {
    timestamp: new Date(),
    actor,
    actorType: actor === 'AetherOps AI' ? 'ai' : actor === 'System' ? 'system' : 'agent',
    action,
    details,
  };
}

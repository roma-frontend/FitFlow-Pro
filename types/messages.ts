// types/messages.ts (обновленная версия)
import { Id } from "@/convex/_generated/dataModel";

export interface Message {
  _id: Id<"messages">;
  _creationTime: number;
  type: "direct" | "group" | "announcement" | "notification";
  subject?: string;
  content: string;
  senderId: Id<"users">;
  senderName: string;
  recipientIds: Id<"users">[];
  recipientNames: string[];
  groupId?: Id<"messageGroups">;
  priority: "low" | "normal" | "high" | "urgent";
  status: "draft" | "sent" | "delivered" | "read";
  readAt: Record<string, string>;
  isArchived: boolean;
  scheduledAt?: number; // Добавляем это поле
  metadata?: {
    tags?: string[];
    relatedTo?: {
      type: string;
      id: string;
      title: string;
    };
    templateInfo?: {
      templateId: string;
      templateName: string;
      variables: Record<string, string>;
      batchId: string;
    };
    digestInfo?: {
      type: string;
      period: {
        start: number;
        end: number;
      };
      includedMessages: string[];
      stats: any;
    };
  };
  _version?: number;
  _lastSync?: number;
  _isDirty?: boolean;
}

export interface MessageGroup {
  _id: Id<"messageGroups">;
  _creationTime: number;
  name: string;
  description?: string;
  memberIds: Id<"users">[];
  memberNames: string[];
  createdBy: Id<"users">;
  isActive: boolean;
  groupType: "manual" | "auto" | "role-based";
  rules?: {
    roles?: string[];
    departments?: string[];
    conditions?: string[];
  };
  settings?: {
    allowSelfJoin?: boolean;
    requireApproval?: boolean;
    maxMembers?: number;
  };
}

export interface MessageFilter {
  type?: Message["type"];
  priority?: Message["priority"];
  status?: Message["status"];
  senderId?: Id<"users">;
  recipientId?: Id<"users">;
  groupId?: Id<"messageGroups">;
  unreadOnly?: boolean;
  archived?: boolean;
  dateFrom?: number;
  dateTo?: number;
  searchTerm?: string;
}

export interface MessageStats {
  totalMessages: number;
  unreadCount: number;
  byType: Record<Message["type"], number>;
  byPriority: Record<Message["priority"], number>;
  byStatus: Record<Message["status"], number>;
  readRate: number;
  avgResponseTime: number;
}

export interface BulkMessageOperation {
  messageIds: (string | Id<"messages">)[];
  operation: "markAsRead" | "archive" | "delete" | "updatePriority";
  userId?: Id<"users">;
  newPriority?: Message["priority"];
}

export interface NotificationTemplate {
  _id: Id<"notificationTemplates">;
  _creationTime: number;
  name: string;
  description?: string;
  type: "email" | "sms" | "push" | "in-app";
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdBy: Id<"users">;
  category?: string;
  priority: "low" | "normal" | "high" | "urgent";
  trigger?: "manual" | "event_reminder" | "payment_due" | "membership_expiry" | "new_member";
  settings?: {
    allowScheduling?: boolean;
    requireApproval?: boolean;
    maxRecipients?: number;
  };
  _version?: number;
  _lastSync?: number;
  _isDirty?: boolean;
}

export interface MessageTemplate {
  _id: Id<"notificationTemplates">;
  _creationTime: number;
  name: string;
  description?: string;
  type: string;
  subject: string;
  content: string;
  variables: string[];
  isActive: boolean;
  createdBy: Id<"users">;
  category: string;
  priority: Message["priority"];
  settings: {
    allowScheduling: boolean;
    requireApproval: boolean;
    maxRecipients: number;
  };
}

export interface ScheduledMessage extends Message {
  scheduledAt: number;
  originalScheduledAt?: number;
  rescheduledCount?: number;
}

export interface MessageAnalytics {
  deliveryRate: number;
  readRate: number;
  avgResponseTime: number;
  topSenders: Array<{
    userId: Id<"users">;
    name: string;
    messageCount: number;
    readRate: number;
  }>;
  timeDistribution: Array<{
    hour: number;
    messageCount: number;
    readRate: number;
  }>;
  priorityEffectiveness: Record<Message["priority"], {
    count: number;
    readRate: number;
    avgResponseTime: number;
  }>;
}

// Утилитарные типы
export type MessageWithRecipients = Message & {
  recipients: Array<{
    id: Id<"users">;
    name: string;
    isRead: boolean;
    readAt?: string;
  }>;
};

export type MessageDigest = {
  period: string;
  totalMessages: number;
  unreadCount: number;
  urgentCount: number;
  topMessages: Message[];
  stats: MessageStats;
};

export type MessageSearchResult = {
  message: Message;
  matchType: "subject" | "content" | "sender" | "recipient";
  matchText: string;
  relevanceScore: number;
};

// Константы
export const MESSAGE_TYPES = {
  DIRECT: "direct" as const,
  GROUP: "group" as const,
  ANNOUNCEMENT: "announcement" as const,
  NOTIFICATION: "notification" as const,
};

export const MESSAGE_PRIORITIES = {
  LOW: "low" as const,
  NORMAL: "normal" as const,
  HIGH: "high" as const,
  URGENT: "urgent" as const,
};

export const MESSAGE_STATUSES = {
  DRAFT: "draft" as const,
  SENT: "sent" as const,
  DELIVERED: "delivered" as const,
  READ: "read" as const,
};

// Валидаторы
export function isValidMessageType(type: string): type is Message["type"] {
  return Object.values(MESSAGE_TYPES).includes(type as Message["type"]);
}

export function isValidMessagePriority(priority: string): priority is Message["priority"] {
  return Object.values(MESSAGE_PRIORITIES).includes(priority as Message["priority"]);
}

export function isValidMessageStatus(status: string): status is Message["status"] {
  return Object.values(MESSAGE_STATUSES).includes(status as Message["status"]);
}

// Хелперы
export function getMessageTypeLabel(type: Message["type"]): string {
  const labels = {
    direct: "Личное сообщение",
    group: "Групповое сообщение",
    announcement: "Объявление",
    notification: "Уведомление",
  };
  return labels[type] || type;
}

export function getMessagePriorityLabel(priority: Message["priority"]): string {
  const labels = {
    low: "Низкий",
    normal: "Обычный",
    high: "Высокий",
    urgent: "Срочный",
  };
  return labels[priority] || priority;
}

export function getMessageStatusLabel(status: Message["status"]): string {
  const labels = {
    draft: "Черновик",
    sent: "Отправлено",
    delivered: "Доставлено",
    read: "Прочитано",
  };
    return labels[status] || status;
}

export function getMessagePriorityColor(priority: Message["priority"]): string {
  const colors = {
    low: "text-blue-600",
    normal: "text-gray-600", 
    high: "text-orange-600",
    urgent: "text-red-600",
  };
  return colors[priority] || "text-gray-600";
}

export function getMessageTypeIcon(type: Message["type"]): string {
  const icons = {
    direct: "💬",
    group: "👥",
    announcement: "📢",
    notification: "🔔",
  };
  return icons[type] || "📄";
}

export function isMessageUnread(message: Message, userId: Id<"users">): boolean {
  const readAt = message.readAt || {};
  return !readAt[userId] && message.recipientIds.includes(userId);
}

export function isMessageScheduled(message: Message): boolean {
  return !!(message.scheduledAt && message.scheduledAt > Date.now());
}

export function getMessageAge(message: Message): string {
  const now = Date.now();
  const diff = now - message._creationTime;
  
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  
  if (minutes < 1) return "только что";
  if (minutes < 60) return `${minutes} мин назад`;
  if (hours < 24) return `${hours} ч назад`;
  if (days < 7) return `${days} дн назад`;
  
  return new Date(message._creationTime).toLocaleDateString('ru');
}

export function formatMessageContent(content: string, maxLength: number = 100): string {
  if (content.length <= maxLength) return content;
  return content.substring(0, maxLength) + "...";
}

export function getMessageRecipientCount(message: Message): number {
  return message.recipientIds.length;
}

export function getMessageReadCount(message: Message): number {
  return Object.keys(message.readAt || {}).length;
}

export function getMessageReadRate(message: Message): number {
  const total = getMessageRecipientCount(message);
  const read = getMessageReadCount(message);
  return total > 0 ? (read / total) * 100 : 0;
}

export function sortMessagesByDate(messages: Message[], ascending: boolean = false): Message[] {
  return [...messages].sort((a, b) => {
    const diff = a._creationTime - b._creationTime;
    return ascending ? diff : -diff;
  });
}

export function sortMessagesByPriority(messages: Message[]): Message[] {
  const priorityOrder = { urgent: 0, high: 1, normal: 2, low: 3 };
  return [...messages].sort((a, b) => {
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

export function filterMessagesByDateRange(
  messages: Message[], 
  startDate: number, 
  endDate: number
): Message[] {
  return messages.filter(msg => 
    msg._creationTime >= startDate && msg._creationTime <= endDate
  );
}

export function groupMessagesByDate(messages: Message[]): Record<string, Message[]> {
  return messages.reduce((groups, message) => {
    const date = new Date(message._creationTime).toISOString().split('T')[0];
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
}

export function groupMessagesBySender(messages: Message[]): Record<string, Message[]> {
  return messages.reduce((groups, message) => {
    const sender = message.senderName;
    if (!groups[sender]) {
      groups[sender] = [];
    }
    groups[sender].push(message);
    return groups;
  }, {} as Record<string, Message[]>);
}

export function searchMessages(messages: Message[], searchTerm: string): MessageSearchResult[] {
  if (!searchTerm.trim()) return [];
  
  const term = searchTerm.toLowerCase();
  const results: MessageSearchResult[] = [];
  
  messages.forEach(message => {
    let relevanceScore = 0;
    let matchType: MessageSearchResult["matchType"] | null = null;
    let matchText = "";
    
    // Поиск в теме
    if (message.subject && message.subject.toLowerCase().includes(term)) {
      relevanceScore += 10;
      matchType = "subject";
      matchText = message.subject;
    }
    
    // Поиск в содержании
    if (message.content.toLowerCase().includes(term)) {
      relevanceScore += 5;
      if (!matchType) {
        matchType = "content";
        matchText = message.content;
      }
    }
    
    // Поиск в имени отправителя
    if (message.senderName.toLowerCase().includes(term)) {
      relevanceScore += 7;
      if (!matchType) {
        matchType = "sender";
        matchText = message.senderName;
      }
    }
    
    // Поиск в именах получателей
    const recipientMatch = message.recipientNames.find(name => 
      name.toLowerCase().includes(term)
    );
    if (recipientMatch) {
      relevanceScore += 6;
      if (!matchType) {
        matchType = "recipient";
        matchText = recipientMatch;
      }
    }
    
    if (matchType && relevanceScore > 0) {
      results.push({
        message,
        matchType,
        matchText,
        relevanceScore
      });
    }
  });
  
  return results.sort((a, b) => b.relevanceScore - a.relevanceScore);
}

// components/messaging/types.ts
export interface Message {
  _id: string;
  type: 'direct' | 'group' | 'announcement' | 'notification';
  subject?: string;
  content: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  recipientIds: string[];
  recipientNames: string[];
  groupId?: string;
  groupName?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  status: 'draft' | 'sent' | 'delivered' | 'read';
  attachments?: MessageAttachment[];
  relatedTo?: {
    type: 'event' | 'user' | 'payment' | 'membership';
    id: string;
    title: string;
  };
  createdAt: string;
  readAt?: Record<string, string>; // userId -> timestamp
  isArchived: boolean;
  tags?: string[];
}

export interface MessageAttachment {
  _id: string;
  name: string;
  type: string;
  size: number;
  url: string;
}

export interface NotificationTemplate {
  _id: string;
  name: string;
  type: 'email' | 'sms' | 'push' | 'in-app';
  trigger: 'manual' | 'event_reminder' | 'payment_due' | 'membership_expiry' | 'new_member';
  subject: string;
  content: string;
  variables: string[]; // {{userName}}, {{eventDate}}, etc.
  isActive: boolean;
}

export interface MessageGroup {
  _id: string;
  name: string;
  description?: string;
  type: 'trainers' | 'members' | 'staff' | 'custom';
  memberIds: string[];
  createdBy: string;
  createdAt: string;
  isActive: boolean;
}

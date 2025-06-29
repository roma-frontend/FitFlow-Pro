// lib/api/memberships.ts
import type { Membership, MembershipPlan, MembershipFormData } from '@/types/membership';

const API_BASE_URL = '/api/memberships';

// Получить текущий абонемент пользователя
export async function fetchCurrentMembership(userId: string): Promise<Membership | null> {
  const response = await fetch(`${API_BASE_URL}/current?userId=${userId}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка получения текущего абонемента');
  }
  
  return data.data;
}

// Получить все абонементы пользователя
export async function fetchUserMemberships(userId: string): Promise<Membership[]> {
  const response = await fetch(`${API_BASE_URL}?userId=${userId}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка получения абонементов');
  }
  
  return data.data || [];
}

// Получить планы абонементов
export async function fetchMembershipPlans(): Promise<MembershipPlan[]> {
  const response = await fetch(`${API_BASE_URL}/plans`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка получения планов');
  }
  
  return data.data || [];
}

// Создать новый абонемент (покупка)
export async function createMembership(membershipData: MembershipFormData): Promise<Membership> {
  const response = await fetch(API_BASE_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(membershipData),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка создания абонемента');
  }
  
  return data.data;
}

// Продлить абонемент
export async function renewMembership(membershipId: string, planId: string): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/${membershipId}/renew`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ planId }),
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка продления абонемента');
  }
  
  return data.data;
}

// Отменить абонемент
export async function cancelMembership(membershipId: string): Promise<void> {
  const response = await fetch(`${API_BASE_URL}/${membershipId}/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка отмены абонемента');
  }
}

// Получить историю абонементов
export async function fetchMembershipHistory(userId: string, includeExpired = true): Promise<Membership[]> {
  const params = new URLSearchParams({
    userId,
    includeExpired: includeExpired.toString()
  });
  
  const response = await fetch(`${API_BASE_URL}/history?${params}`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка получения истории');
  }
  
  return data.data || [];
}

// Получить статистику абонементов
export async function fetchMembershipStats(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/stats`);
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка получения статистики');
  }
  
  return data.data;
}

// Проверить истекшие абонементы (для админов)
export async function checkExpiredMemberships(): Promise<any> {
  const response = await fetch(`${API_BASE_URL}/check-expired`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  
  const data = await response.json();
  
  if (!response.ok) {
    throw new Error(data.error || 'Ошибка проверки истекших абонементов');
  }
  
  return data.data;
}

// Вспомогательные функции для работы с абонементами
export function getMembershipStatus(membership: Membership): 'active' | 'expired' | 'cancelled' {
  if (!membership.isActive) return 'cancelled';
  if (new Date(membership.expiresAt) <= new Date()) return 'expired';
  return 'active';
}

export function getRemainingDays(membership: Membership): number {
  const now = new Date();
  const expiryDate = new Date(membership.expiresAt);
  const diffTime = expiryDate.getTime() - now.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(0, diffDays);
}

export function formatMembershipType(type: string): string {
  const types: Record<string, string> = {
    'basic': 'Базовый',
    'premium': 'Премиум',
    'vip': 'VIP',
    'unlimited': 'Безлимит'
  };
  return types[type] || type;
}

export function getMembershipBadgeColor(type: string): string {
  const colors: Record<string, string> = {
    'basic': 'bg-gray-100 text-gray-800',
    'premium': 'bg-blue-100 text-blue-800',
    'vip': 'bg-purple-100 text-purple-800',
    'unlimited': 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-800'
  };
  return colors[type] || 'bg-gray-100 text-gray-800';
}
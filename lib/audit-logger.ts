// lib/audit-logger.ts
import { ConvexHttpClient } from "convex/browser";

const convex = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

interface AuditLogData {
  action: string;
  entityType: string;
  entityId: string;
  performedBy: string;
  ip?: string;
  userAgent?: string;
  sessionId?: string;
  oldValues?: any;
  newValues?: any;
  changedFields?: string[];
  metadata?: any;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  success?: boolean;
  errorMessage?: string;
}

export async function logAuditEvent(data: AuditLogData) {
  try {
    const auditLogId = await convex.mutation("auditLogs:createAuditLog", data);
    console.log('✅ Audit log created:', auditLogId);
    return auditLogId;
  } catch (error) {
    console.error('❌ Failed to create audit log:', error);
    // Не бросаем ошибку, чтобы не нарушить основной процесс
  }
}

// Утилита для определения измененных полей
export function getChangedFields(oldValues: any, newValues: any): string[] {
  const changedFields: string[] = [];
  
  Object.keys(newValues).forEach(key => {
    if (oldValues[key] !== newValues[key]) {
      changedFields.push(key);
    }
  });
  
  return changedFields;
}

// Утилита для определения серьезности изменений
export function determineSeverity(action: string, changedFields: string[]): 'low' | 'medium' | 'high' | 'critical' {
  if (action.includes('delete')) return 'critical';
  if (action.includes('role') || changedFields.includes('role')) return 'high';
  if (action.includes('password') || changedFields.includes('password')) return 'high';
  if (action.includes('email') || changedFields.includes('email')) return 'medium';
  return 'low';
}

// lib/email-config.ts
interface EmailConfig {
  provider: string;
  host?: string;
  port?: number;
  secure?: boolean;
  user?: string;
  pass?: string;
  domain: string;
  companyName: string;
  supportEmail: string;
  maxRetries: number;
  retryDelay: number;
}

export const getEmailConfig = (): EmailConfig => {
  return {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    domain: process.env.EMAIL_DOMAIN || 'fitaccess.com',
    companyName: process.env.COMPANY_NAME || 'FitAccess',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@fitaccess.com',
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '1000')
  };
};

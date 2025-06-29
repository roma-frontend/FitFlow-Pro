// lib/email-metrics.ts
import nodemailer from 'nodemailer';

// Импортируем интерфейс EmailResult из основного файла email
export interface EmailResult {
  success: boolean;
  messageId?: string;
  attempt?: number;
  previewUrl?: string | false;
  error?: string;
}

interface EmailMetrics {
  sent: number;
  failed: number;
  retries: number;
  lastError?: string;
  lastSuccess?: Date;
}

// Утилита для проверки типа ошибки 【190-3】【190-9】
function isError(error: unknown): error is Error {
  return error instanceof Error;
}

// Утилита для получения сообщения об ошибке из unknown типа
function getErrorMessage(error: unknown): string {
  if (isError(error)) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  if (error && typeof error === 'object' && 'message' in error) {
    return String((error as any).message);
  }
  
  return 'Unknown error occurred';
}

class EmailMetricsCollector {
  private static metrics: EmailMetrics = {
    sent: 0,
    failed: 0,
    retries: 0
  };

  static recordSuccess(): void {
    this.metrics.sent++;
    this.metrics.lastSuccess = new Date();
  }

  static recordFailure(error: unknown): void {
    this.metrics.failed++;
    this.metrics.lastError = getErrorMessage(error);
  }

  static recordRetry(): void {
    this.metrics.retries++;
  }

  static getMetrics(): EmailMetrics {
    return { ...this.metrics };
  }

  static reset(): void {
    this.metrics = {
      sent: 0,
      failed: 0,
      retries: 0
    };
  }

  // Дополнительные методы для анализа метрик
  static getSuccessRate(): number {
    const total = this.metrics.sent + this.metrics.failed;
    return total > 0 ? (this.metrics.sent / total) * 100 : 0;
  }

  static getFailureRate(): number {
    const total = this.metrics.sent + this.metrics.failed;
    return total > 0 ? (this.metrics.failed / total) * 100 : 0;
  }

  static getTotalAttempts(): number {
    return this.metrics.sent + this.metrics.failed + this.metrics.retries;
  }
}

// Пример использования в функции отправки email 【190-0】【190-4】
export async function sendWelcomeEmail(
  to: string,
  name: string,
  userType: 'staff' | 'member'
): Promise<EmailResult> {
  try {
    // Создаем transporter (упрощенная версия для примера)
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const mailOptions = {
      from: `"FitFlow-Pro" <noreply@fitflow-pro.com>`,
      to,
      subject: `Добро пожаловать в FitFlow-Pro!`,
      html: `
        <h1>Добро пожаловать, ${name}!</h1>
        <p>Ваш аккаунт ${userType} успешно создан.</p>
      `,
      text: `Добро пожаловать, ${name}! Ваш аккаунт ${userType} успешно создан.`
    };

    // Отправляем email 【190-0】
    const info = await transporter.sendMail(mailOptions);
    
    // Записываем успешную отправку
    EmailMetricsCollector.recordSuccess();
    
    return { 
      success: true, 
      messageId: info.messageId,
      previewUrl: nodemailer.getTestMessageUrl(info) || false
    };

  } catch (error: unknown) {
    // Правильная обработка ошибок с unknown типом 【190-9】
    EmailMetricsCollector.recordFailure(error);
    
    return { 
      success: false, 
      error: getErrorMessage(error)
    };
  }
}

// Функция для отправки email с retry логикой
export async function sendEmailWithRetry(
  transporter: nodemailer.Transporter,
  mailOptions: nodemailer.SendMailOptions,
  maxRetries: number = 3
): Promise<EmailResult> {
  let lastError: unknown = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      
      EmailMetricsCollector.recordSuccess();
      console.log(`✅ Email sent successfully on attempt ${attempt}:`, info.messageId);
      
      return { 
        success: true, 
        messageId: info.messageId, 
        attempt,
        previewUrl: nodemailer.getTestMessageUrl(info) || false
      };
      
    } catch (error: unknown) {
      lastError = error;
      EmailMetricsCollector.recordRetry();
      console.error(`❌ Email send attempt ${attempt} failed:`, getErrorMessage(error));
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Экспоненциальная задержка между попытками
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  EmailMetricsCollector.recordFailure(lastError);
  
  return {
    success: false,
    error: `Не удалось отправить email после ${maxRetries} попыток: ${getErrorMessage(lastError)}`
  };
}

// Функция для получения детальной статистики
export function getEmailStatistics() {
  const metrics = EmailMetricsCollector.getMetrics();
  
  return {
    ...metrics,
    successRate: EmailMetricsCollector.getSuccessRate(),
    failureRate: EmailMetricsCollector.getFailureRate(),
    totalAttempts: EmailMetricsCollector.getTotalAttempts(),
    lastSuccessFormatted: metrics.lastSuccess?.toLocaleString() || 'Never',
  };
}

// Экспорт класса для использования в других модулях
export { EmailMetricsCollector };

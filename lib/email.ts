// lib/email.ts
import nodemailer from 'nodemailer';
import validator from 'validator';

interface PasswordResetEmailData {
  to: string;
  name: string;
  resetUrl: string;
  userType: 'staff' | 'member';
}

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  auth?: {
    user: string;
    pass: string;
  };
  tls?: {
    rejectUnauthorized: boolean;
  };
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  attempt?: number;
  previewUrl?: string | false;
  error?: string;
}

interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

interface TemplateData {
  [key: string]: any;
}

interface EmailMetrics {
  sent: number;
  failed: number;
  retries: number;
  lastError?: string;
  lastSuccess?: Date;
}

// Конфигурация email сервиса 【182-2】
const getEmailConfig = () => {
  return {
    provider: process.env.EMAIL_PROVIDER || 'smtp',
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
    domain: process.env.EMAIL_DOMAIN || 'fitflow-pro.com',
    companyName: process.env.COMPANY_NAME || 'FitFlow-Pro',
    supportEmail: process.env.SUPPORT_EMAIL || 'support@fitflow-pro.com',
    maxRetries: parseInt(process.env.EMAIL_MAX_RETRIES || '3'),
    retryDelay: parseInt(process.env.EMAIL_RETRY_DELAY || '1000')
  };
};

// Кэшируем transporter и тестовый аккаунт для переиспользования
let cachedTransporter: nodemailer.Transporter | null = null;
let cachedTestAccount: any = null;

// Rate Limiter для предотвращения спама 【182-2】
class EmailRateLimiter {
  private static requests: Map<string, number[]> = new Map();
  private static readonly WINDOW_MS = 60 * 1000; // 1 минута
  private static readonly MAX_REQUESTS = 10; // 10 писем в минуту

  static canSend(email: string): boolean {
    const now = Date.now();
    const requests = this.requests.get(email) || [];
    
    // Удаляем старые запросы
    const validRequests = requests.filter(time => now - time < this.WINDOW_MS);
    
    if (validRequests.length >= this.MAX_REQUESTS) {
      return false;
    }
    
    validRequests.push(now);
    this.requests.set(email, validRequests);
    
    return true;
  }

  static getRemainingRequests(email: string): number {
    const now = Date.now();
    const requests = this.requests.get(email) || [];
    const validRequests = requests.filter(time => now - time < this.WINDOW_MS);
    
    return Math.max(0, this.MAX_REQUESTS - validRequests.length);
  }
}

// Метрики для мониторинга 【182-3】
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

  static recordFailure(error: string): void {
    this.metrics.failed++;
    this.metrics.lastError = error;
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
}

// Шаблонизатор email 【182-5】
class EmailTemplateEngine {
  private static replaceVariables(template: string, data: TemplateData): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return data[key] || match;
    });
  }

  static getWelcomeTemplate(data: {
    name: string;
    userType: string;
    companyName: string;
    loginUrl: string;
  }): EmailTemplate {
    const subject = `🎉 Добро пожаловать в {{companyName}}!`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>{{subject}}</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #28a745; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .features { background: #e3f2fd; border: 1px solid #bbdefb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Добро пожаловать в {{companyName}}!</h1>
            <p>Спасибо за регистрацию {{userType}}</p>
          </div>
          
          <div class="content">
            <h2>Привет, {{name}}!</h2>
            
            <p>Мы рады приветствовать вас в нашей системе {{companyName}}. Ваш аккаунт {{userType}} успешно создан!</p>
            
            <div class="features">
              <h3>🚀 Что вас ждет:</h3>
              <ul>
                <li>Удобная система бронирования тренировок</li>
                <li>Персональный кабинет с историей активности</li>
                <li>Уведомления о важных событиях</li>
                <li>Возможность связи с тренерами</li>
              </ul>
            </div>
            
            <div style="text-align: center;">
              <a href="{{loginUrl}}" class="button">Войти в систему</a>
            </div>
            
            <p>Если у вас есть вопросы, не стесняйтесь обращаться к нашей службе поддержки.</p>
          </div>
          
          <div class="footer">
            <p>С уважением, команда {{companyName}}</p>
            <p>© ${new Date().getFullYear()} {{companyName}}. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Добро пожаловать в {{companyName}}, {{name}}!
      
      Мы рады приветствовать вас как {{userType}}.
      
      Войти в систему: {{loginUrl}}
      
      С уважением,
      Команда {{companyName}}
    `;

    return {
      subject: this.replaceVariables(subject, data),
      html: this.replaceVariables(html, data),
      text: this.replaceVariables(text, data)
    };
  }

  static getPasswordResetTemplate(data: {
    name: string;
    userType: string;
    companyName: string;
    resetUrl: string;
  }): EmailTemplate {
    const subject = `🔐 Восстановление пароля {{userType}} - {{companyName}}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Восстановление пароля</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #dc3545 0%, #c82333 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #dc3545; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0; }
          .warning { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🔐 Восстановление пароля</h1>
            <p>Запрос на сброс пароля {{userType}}</p>
          </div>
          
          <div class="content">
            <h2>Здравствуйте, {{name}}!</h2>
            
            <p>Мы получили запрос на восстановление пароля для вашего аккаунта {{userType}} в системе {{companyName}}.</p>
            
            <div style="text-align: center;">
              <a href="{{resetUrl}}" class="button">Сбросить пароль</a>
            </div>
            
            <div class="warning">
              <strong>⏰ Важно:</strong> Ссылка действительна в течение 1 часа с момента отправки.
            </div>
            
            <p>Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо. Ваш пароль останется без изменений.</p>
            
            <p>Для безопасности не передавайте эту ссылку третьим лицам.</p>
          </div>
          
          <div class="footer">
            <p>С уважением, команда {{companyName}}</p>
            <p>© ${new Date().getFullYear()} {{companyName}}. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const text = `
      Восстановление пароля {{userType}} - {{companyName}}
      
      Здравствуйте, {{name}}!
      
      Мы получили запрос на восстановление пароля для вашего аккаунта {{userType}}.
      
      Для сброса пароля перейдите по ссылке:
      {{resetUrl}}
      
      Ссылка действительна в течение 1 часа.
      
      Если вы не запрашивали восстановление пароля, просто проигнорируйте это письмо.
      
      С уважением,
      Команда {{companyName}}
    `;

    return {
      subject: this.replaceVariables(subject, data),
      html: this.replaceVariables(html, data),
      text: this.replaceVariables(text, data)
    };
  }
}

// Валидация email адресов 【182-3】
const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

// Валидация входных данных
const validateEmailData = (to: string, name: string): string | null => {
  if (!validateEmail(to)) {
    return 'Неверный формат email адреса';
  }

  if (!name.trim()) {
    return 'Имя пользователя не может быть пустым';
  }

  return null;
};

// Создание transporter с улучшенной конфигурацией 【182-0】【182-4】
const createTransporter = async (): Promise<nodemailer.Transporter> => {
  // Если transporter уже создан, возвращаем его
  if (cachedTransporter) {
    return cachedTransporter;
  }

  const config = {
    pool: true, // Используем пул соединений
    maxConnections: 5,
    maxMessages: 100,
    rateDelta: 1000, // 1 секунда
    rateLimit: 5, // 5 писем в секунду
    connectionTimeout: 5000, // 5 секунд timeout 【182-3】
    greetingTimeout: 2000, // 2 секунды timeout для greeting
  };

  if (process.env.NODE_ENV === 'development') {
    try {
      // Правильная работа с Ethereal - создаем тестовый аккаунт динамически
      if (!cachedTestAccount) {
        console.log('🧪 Creating Ethereal test account...');
        cachedTestAccount = await nodemailer.createTestAccount();
        
        console.log('✅ Ethereal test account created:');
        console.log('📧 User:', cachedTestAccount.user);
        console.log('🔑 Pass:', cachedTestAccount.pass);
        console.log('🌐 SMTP Host:', cachedTestAccount.smtp.host);
        console.log('🌐 Web URL: https://ethereal.email/login');
        console.log('💡 Use these credentials to login and view sent emails');
      }

      cachedTransporter = nodemailer.createTransport({
        ...config,
        host: cachedTestAccount.smtp.host,
        port: cachedTestAccount.smtp.port,
        secure: cachedTestAccount.smtp.secure,
        auth: {
          user: cachedTestAccount.user,
          pass: cachedTestAccount.pass,
        },
      });

      console.log('✅ Ethereal transporter created successfully');
      return cachedTransporter;
      
    } catch (error) {
      console.error('❌ Failed to create Ethereal transporter:', error);
      throw new Error('Не удалось создать Ethereal transporter для разработки');
    }
  }

  // Для продакшена - поддержка разных провайдеров
  const emailConfig = getEmailConfig();
  
  try {
    switch (emailConfig.provider) {
      case 'sendgrid':
        if (!process.env.SENDGRID_API_KEY) {
          throw new Error('SENDGRID_API_KEY не найден в переменных окружения');
        }
        cachedTransporter = nodemailer.createTransport({
          ...config,
          service: 'SendGrid',
          auth: {
            user: 'apikey',
            pass: process.env.SENDGRID_API_KEY
          }
        });
        break;
        
      case 'gmail':
        if (!process.env.GMAIL_USER || !process.env.GMAIL_APP_PASSWORD) {
          throw new Error('GMAIL_USER или GMAIL_APP_PASSWORD не найдены в переменных окружения');
        }
        // Используем App Password для Gmail 【182-4】
        cachedTransporter = nodemailer.createTransport({
          ...config,
          service: 'Gmail',
          auth: {
            user: process.env.GMAIL_USER,
            pass: process.env.GMAIL_APP_PASSWORD // App Password, не обычный пароль
          }
        });
        break;
        
      default:
        if (!emailConfig.host || !emailConfig.user || !emailConfig.pass) {
          throw new Error('SMTP настройки не найдены в переменных окружения');
        }
        cachedTransporter = nodemailer.createTransport({
          ...config,
          host: emailConfig.host,
          port: emailConfig.port,
          secure: emailConfig.secure,
          auth: {
            user: emailConfig.user,
            pass: emailConfig.pass
          },
          // Добавляем TLS конфигурацию
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production'
          }
        });
    }

    console.log(`✅ ${emailConfig.provider.toUpperCase()} transporter created successfully`);
    return cachedTransporter;
    
  } catch (error) {
    console.error(`❌ Failed to create ${emailConfig.provider} transporter:`, error);
    throw error;
  }
};

// Функция отправки email с retry логикой и метриками
const sendEmailWithRetry = async (
  transporter: nodemailer.Transporter,
  mailOptions: nodemailer.SendMailOptions,
  maxRetries: number = 3
): Promise<EmailResult> => {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const info = await transporter.sendMail(mailOptions);
      
      EmailMetricsCollector.recordSuccess();
      console.log(`✅ Email sent successfully on attempt ${attempt}:`, info.messageId);
      
      // Показываем URL для просмотра в Ethereal (только для разработки)
      const previewUrl = process.env.NODE_ENV === 'development' ? 
        nodemailer.getTestMessageUrl(info) : undefined;
      
      if (previewUrl) {
        console.log('👀 Preview email at:', previewUrl);
      }

      return { 
        success: true, 
        messageId: info.messageId, 
        attempt,
        previewUrl 
      };
      
    } catch (error) {
      lastError = error as Error;
      EmailMetricsCollector.recordRetry();
      console.error(`❌ Email send attempt ${attempt} failed:`, error);
      
      if (attempt === maxRetries) {
        break;
      }
      
      // Экспоненциальная задержка между попытками
      await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
    }
  }
  
  EmailMetricsCollector.recordFailure(lastError?.message || 'Unknown error');
  throw new Error(`Не удалось отправить email после ${maxRetries} попыток: ${lastError?.message}`);
};

// Основные функции отправки email
export async function sendWelcomeEmail({
  to,
  name,
  userType
}: {
  to: string;
  name: string;
  userType: 'staff' | 'member';
}): Promise<EmailResult> {
  // Валидация входных данных
  const validationError = validateEmailData(to, name);
  if (validationError) {
    return {
      success: false,
      error: validationError
    };
  }

  // Проверка rate limiting
  if (!EmailRateLimiter.canSend(to)) {
    return {
      success: false,
      error: `Превышен лимит отправки писем. Осталось попыток: ${EmailRateLimiter.getRemainingRequests(to)}`
    };
  }
  
  try {
    const transporter = await createTransporter();
    const config = getEmailConfig();
    const userTypeText = userType === 'staff' ? 'персонала' : 'участника';

    // Используем шаблонизатор
    const template = EmailTemplateEngine.getWelcomeTemplate({
      name,
      userType: userTypeText,
      companyName: config.companyName,
      loginUrl: `${process.env.NEXT_PUBLIC_APP_URL}/login`
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.companyName}" <noreply@${config.domain}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html
    };

    return await sendEmailWithRetry(transporter, mailOptions, config.maxRetries);

  } catch (error) {
    console.error('❌ Error sending welcome email:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
  userType
}: PasswordResetEmailData): Promise<EmailResult> {
  // Валидация входных данных
  const validationError = validateEmailData(to, name);
  if (validationError) {
    return {
      success: false,
      error: validationError
    };
  }

  // Проверка rate limiting
  if (!EmailRateLimiter.canSend(to)) {
    return {
      success: false,
      error: `Превышен лимит отправки писем. Осталось попыток: ${EmailRateLimiter.getRemainingRequests(to)}`
    };
  }

  try {
    const transporter = await createTransporter();
    const config = getEmailConfig();
    const userTypeText = userType === 'staff' ? 'персонала' : 'участника';

    // Используем шаблонизатор
    const template = EmailTemplateEngine.getPasswordResetTemplate({
      name,
      userType: userTypeText,
      companyName: config.companyName,
      resetUrl
    });

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.companyName}" <noreply@${config.domain}>`,
      to,
      subject: template.subject,
      text: template.text,
      html: template.html,
      // Добавляем приоритет для важных писем
      priority: 'high',
      // Добавляем заголовки для лучшей доставляемости
      headers: {
        'X-Priority': '1',
        'X-MSMail-Priority': 'High',
        'Importance': 'high'
      }
    };

    return await sendEmailWithRetry(transporter, mailOptions, config.maxRetries);
    
  } catch (error) {
    console.error('❌ Error in sendPasswordResetEmail:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Функция для отправки уведомления о смене пароля
export async function sendPasswordChangedNotification({
  to,
  name,
  userType,
  timestamp
}: {
  to: string;
  name: string;
  userType: 'staff' | 'member';
  timestamp: Date;
}): Promise<EmailResult> {
  // Валидация входных данных
  const validationError = validateEmailData(to, name);
  if (validationError) {
    return {
      success: false,
      error: validationError
    };
  }

  try {
    const transporter = await createTransporter();
    const config = getEmailConfig();
    const userTypeText = userType === 'staff' ? 'персонала' : 'участника';
    const formattedTime = timestamp.toLocaleString('ru-RU');

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Пароль изменен</title>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #28a745 0%, #20c997 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .alert { background: #d4edda; border: 1px solid #c3e6cb; padding: 15px; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; color: #666; font-size: 12px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Пароль успешно изменен</h1>
            <p>Уведомление о смене пароля ${userTypeText}</p>
          </div>
          
          <div class="content">
            <h2>Здравствуйте, ${name}!</h2>
            
            <div class="alert">
              <strong>🔐 Ваш пароль был успешно изменен</strong><br>
              Время: ${formattedTime}
            </div>
            
            <p>Если это были не вы, немедленно обратитесь к администратору системы.</p>
            
            <p>Для дополнительной безопасности рекомендуем:</p>
            <ul>
              <li>Проверить активные сессии в вашем аккаунте</li>
              <li>Убедиться, что никто посторонний не имеет доступа к вашей почте</li>
              <li>Включить двухфакторную аутентификацию, если доступна</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>Это автоматическое уведомление от системы ${config.companyName}</p>
            <p>© ${new Date().getFullYear()} ${config.companyName}. Все права защищены.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions: nodemailer.SendMailOptions = {
      from: `"${config.companyName}" <noreply@${config.domain}>`,
      to,
      subject: `✅ Пароль ${userTypeText} изменен - ${config.companyName}`,
      html: htmlContent
    };

    return await sendEmailWithRetry(transporter, mailOptions, config.maxRetries);

  } catch (error) {
    console.error('❌ Error sending password change notification:', error);
    // Не возвращаем ошибку, так как это не критично для основного процесса
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

// Вспомогательная функция для тестирования email в development
export async function testEmailConnection(): Promise<boolean> {
  try {
    console.log('🔧 Testing email connection...');
    const transporter = await createTransporter();
    const config = getEmailConfig();
    
    // Проверяем соединение 【182-3】
    await transporter.verify();
    console.log('✅ Email connection verified successfully');
    
    // Отправляем тестовое письмо
    const testInfo = await transporter.sendMail({
      from: `"Test ${config.companyName}" <test@${config.domain}>`,
      to: 'test@example.com',
      subject: `🧪 Test Email Connection - ${config.companyName}`,
      text: 'This is a test email to verify the email connection is working properly.',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #28a745;">🧪 Test Email Connection</h1>
          <p>This is a test email to verify that the email connection is working properly.</p>
          <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
            <strong>✅ Connection Status:</strong> Successfully connected and email sent!
          </div>
          <p style="color: #666; font-size: 12px;">
            Sent at: ${new Date().toLocaleString('ru-RU')}<br>
            Environment: ${process.env.NODE_ENV || 'unknown'}
          </p>
        </div>
      `
    });
    
    console.log('📧 Test email sent successfully:', testInfo.messageId);
    
    // Показываем URL для просмотра в Ethereal (только для разработки)
    if (process.env.NODE_ENV === 'development') {
      const previewUrl = nodemailer.getTestMessageUrl(testInfo);
      if (previewUrl) {
        console.log('👀 Preview test email at:', previewUrl);
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Email connection test failed:', error);
    return false;
  }
}

// Функция для получения метрик
export function getEmailMetrics(): EmailMetrics {
  return EmailMetricsCollector.getMetrics();
}

// Функция для сброса метрик
export function resetEmailMetrics(): void {
  EmailMetricsCollector.reset();
}

// Функция для очистки кэша (полезно для тестирования)
export function clearEmailCache(): void {
  cachedTransporter = null;
  cachedTestAccount = null;
  console.log('🧹 Email cache cleared');
}

// Экспортируем типы для использования в других файлах
export type { PasswordResetEmailData, EmailResult, EmailMetrics };

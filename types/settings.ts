// types/settings.ts
export interface SystemConfig {
  general: {
    siteName: string;
    siteDescription: string;
    contactEmail: string;
    contactPhone: string;
    address: string;
    timezone: string;
    language: string;
    currency: string;
  };
  business: {
    workingHours: {
      monday: { start: string; end: string; closed: boolean };
      tuesday: { start: string; end: string; closed: boolean };
      wednesday: { start: string; end: string; closed: boolean };
      thursday: { start: string; end: string; closed: boolean };
      friday: { start: string; end: string; closed: boolean };
      saturday: { start: string; end: string; closed: boolean };
      sunday: { start: string; end: string; closed: boolean };
    };
    bookingSettings: {
      advanceBookingDays: number;
      cancellationHours: number;
      autoConfirmBookings: boolean;
      allowWaitlist: boolean;
    };
    paymentSettings: {
      acceptedMethods: string[];
      autoChargeEnabled: boolean;
      lateFeeAmount: number;
      gracePeriodDays: number;
    };
  };
  notifications: {
    email: {
      enabled: boolean;
      smtpHost: string;
      smtpPort: number;
      smtpUser: string;
      smtpPassword: string;
      fromEmail: string;
      fromName: string;
    };
    sms: {
      enabled: boolean;
      provider: string;
      apiKey: string;
      fromNumber: string;
    };
    push: {
      enabled: boolean;
      firebaseKey: string;
    };
    templates: {
      bookingConfirmation: boolean;
      bookingReminder: boolean;
      paymentDue: boolean;
      membershipExpiry: boolean;
      welcomeMessage: boolean;
    };
  };
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
    };
    sessionSettings: {
      sessionTimeout: number;
      maxConcurrentSessions: number;
      requireTwoFactor: boolean;
    };
    accessControl: {
      ipWhitelist: string[];
      maxLoginAttempts: number;
      lockoutDuration: number;
    };
  };
  appearance: {
    theme: 'light' | 'dark' | 'auto';
    primaryColor: string;
    secondaryColor: string;
    logo: string;
    favicon: string;
    customCSS: string;
  };
  integrations: {
    googleCalendar: {
      enabled: boolean;
      clientId: string;
      clientSecret: string;
    };
    stripe: {
      enabled: boolean;
      publicKey: string;
      secretKey: string;
      webhookSecret: string;
    };
    mailchimp: {
      enabled: boolean;
      apiKey: string;
      listId: string;
    };
  };
  system: {
    maintenance: {
      enabled: boolean;
      message: string;
      allowedIPs: string[];
    };
    logging: {
      level: 'error' | 'warn' | 'info' | 'debug';
      retentionDays: number;
    };
    performance: {
      cacheEnabled: boolean;
      cacheTTL: number;
      compressionEnabled: boolean;
    };
  };
}

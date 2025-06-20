// hooks/useSettingsManager.ts
"use client";

import { useState, useEffect, useCallback } from 'react';
import { toast } from '@/hooks/use-toast';
import type { SystemConfig } from '@/types/settings';

export function useSettingsManager() {
  const [config, setConfig] = useState<SystemConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      // Имитация API запроса
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockConfig: SystemConfig = {
        general: {
          siteName: 'FitAccess',
          siteDescription: 'Современный фитнес-центр с персональным подходом',
          contactEmail: 'info@fitaccess.ru',
          contactPhone: '+7 (495) 123-45-67',
          address: 'г. Москва, ул. Спортивная, д. 1',
          timezone: 'Europe/Moscow',
          language: 'ru',
          currency: 'RUB'
        },
        business: {
          workingHours: {
            monday: { start: '06:00', end: '23:00', closed: false },
            tuesday: { start: '06:00', end: '23:00', closed: false },
            wednesday: { start: '06:00', end: '23:00', closed: false },
            thursday: { start: '06:00', end: '23:00', closed: false },
            friday: { start: '06:00', end: '23:00', closed: false },
            saturday: { start: '08:00', end: '22:00', closed: false },
            sunday: { start: '08:00', end: '22:00', closed: false }
          },
          bookingSettings: {
            advanceBookingDays: 30,
            cancellationHours: 24,
            autoConfirmBookings: true,
            allowWaitlist: true
          },
          paymentSettings: {
            acceptedMethods: ['card', 'cash', 'bank_transfer'],
            autoChargeEnabled: true,
            lateFeeAmount: 500,
            gracePeriodDays: 3
          }
        },
        notifications: {
          email: {
            enabled: true,
            smtpHost: 'smtp.gmail.com',
            smtpPort: 587,
            smtpUser: 'noreply@fitaccess.ru',
            smtpPassword: '',
            fromEmail: 'noreply@fitaccess.ru',
            fromName: 'FitAccess'
          },
          sms: {
            enabled: false,
            provider: 'twilio',
            apiKey: '',
            fromNumber: ''
          },
          push: {
            enabled: true,
            firebaseKey: ''
          },
          templates: {
            bookingConfirmation: true,
            bookingReminder: true,
            paymentDue: true,
            membershipExpiry: true,
            welcomeMessage: true
          }
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: false
          },
          sessionSettings: {
            sessionTimeout: 30,
            maxConcurrentSessions: 3,
            requireTwoFactor: false
          },
          accessControl: {
            ipWhitelist: [],
            maxLoginAttempts: 5,
            lockoutDuration: 15
          }
        },
        appearance: {
          theme: 'light',
          primaryColor: '#3B82F6',
          secondaryColor: '#8B5CF6',
          logo: '',
          favicon: '',
          customCSS: ''
        },
        integrations: {
          googleCalendar: {
            enabled: false,
            clientId: '',
            clientSecret: ''
          },
          stripe: {
            enabled: true,
            publicKey: '',
            secretKey: '',
            webhookSecret: ''
          },
          mailchimp: {
            enabled: false,
            apiKey: '',
            listId: ''
          }
        },
        system: {
          maintenance: {
            enabled: false,
            message: 'Сайт временно недоступен для технического обслуживания',
            allowedIPs: ['127.0.0.1']
          },
          logging: {
            level: 'info',
            retentionDays: 30
          },
          performance: {
            cacheEnabled: true,
            cacheTTL: 3600,
            compressionEnabled: true
          }
        }
      };

      setConfig(mockConfig);
      setLastSaved(new Date());
    } catch (error) {
      console.error('Ошибка загрузки настроек:', error);
      toast({
        title: "Ошибка загрузки",
        description: "Не удалось загрузить настройки",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const saveSettings = useCallback(async () => {
    if (!config) return;

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setLastSaved(new Date());
      setHasUnsavedChanges(false);

      toast({
        title: "Успешно сохранено",
        description: "Настройки системы успешно обновлены",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Ошибка сохранения",
        description: "Не удалось сохранить настройки. Попробуйте еще раз.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  }, [config]);

  const updateConfig = useCallback((section: keyof SystemConfig, updates: any) => {
    if (!config) return;

    setConfig(prev => prev ? {
      ...prev,
      [section]: {
        ...prev[section],
        ...updates
      }
    } : null);
    setHasUnsavedChanges(true);
  }, [config]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  return {
    config,
    loading,
    saving,
    lastSaved,
    hasUnsavedChanges,
    setHasUnsavedChanges,
    loadSettings,
    saveSettings,
    updateConfig,
    setConfig,
  };
}

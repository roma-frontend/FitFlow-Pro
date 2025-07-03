// components/BadgeTemplateSelector.tsx (исправленная версия)
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BadgeIcon from '@/components/ui/BadgeIcon';
import type { BadgeTemplateBase, BadgeVariant } from '@/types/badge'; // ✅ Правильный импорт

interface BadgeTemplateSelectorProps {
  onSelectTemplate: (template: BadgeTemplateBase) => void;
  onCreateBlank: () => void;
}

// ✅ Предустановленные шаблоны
const PRESET_TEMPLATES: BadgeTemplateBase[] = [
  {
    name: "Новая функция",
    description: "Для новых возможностей и обновлений",
    variant: "neural-new",
    defaultText: "NEW",
    category: "feature",
    presetData: {
      priority: 1,
      targetRoles: [],
      targetDevices: [],
      conditions: {
        requireAuth: false,
        minUserLevel: 0,
        showOnlyOnce: false,
        hideAfterClick: false,
      }
    }
  },
  {
    name: "Горячее предложение",
    description: "Для акций и специальных предложений",
    variant: "cosmic",
    defaultText: "HOT",
    category: "promotion",
    presetData: {
      priority: 2,
      targetRoles: [],
      targetDevices: [],
      conditions: {
        requireAuth: false,
        minUserLevel: 0,
        showOnlyOnce: false,
        hideAfterClick: true,
      }
    }
  },
  {
    name: "Премиум функция",
    description: "Только для премиум пользователей",
    variant: "quantum-ai",
    defaultText: "PRO",
    category: "premium",
    presetData: {
      priority: 1,
      targetRoles: ["admin", "premium"],
      targetDevices: [],
      conditions: {
        requireAuth: true,
        minUserLevel: 5,
        showOnlyOnce: false,
        hideAfterClick: false,
      }
    }
  },
  {
    name: "Голографический эффект",
    description: "Яркий привлекающий внимание badge",
    variant: "holographic",
    defaultText: "SALE",
    category: "promotion",
    presetData: {
      priority: 3,
      targetRoles: [],
      targetDevices: [],
      conditions: {
        requireAuth: false,
        minUserLevel: 0,
        showOnlyOnce: true,
        hideAfterClick: true,
      }
    }
  },
  {
    name: "Матричный стиль",
    description: "Для технических разделов",
    variant: "matrix",
    defaultText: "CODE",
    category: "technical",
    presetData: {
      priority: 2,
      targetRoles: ["developer", "admin"],
      targetDevices: [],
      conditions: {
        requireAuth: true,
        minUserLevel: 3,
        showOnlyOnce: false,
        hideAfterClick: false,
      }
    }
  },
  {
    name: "Минимальный стиль",
    description: "Простой и ненавязчивый",
    variant: "minimal",
    defaultText: "INFO",
    category: "information",
    presetData: {
      priority: 5,
      targetRoles: [],
      targetDevices: [],
      conditions: {
        requireAuth: false,
        minUserLevel: 0,
        showOnlyOnce: false,
        hideAfterClick: false,
      }
    }
  }
];

export function BadgeTemplateSelector({ onSelectTemplate, onCreateBlank }: BadgeTemplateSelectorProps) {
  const categories = [...new Set(PRESET_TEMPLATES.map(t => t.category))];

  return (
    <div className="space-y-6">
      {/* Кнопка создания с нуля */}
      <Card className="border-dashed border-2 border-gray-300 hover:border-gray-400 transition-colors">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Создать с нуля
            </h3>
            <p className="text-gray-600 mb-4">
              Настройте все параметры badge самостоятельно
            </p>
            <Button onClick={onCreateBlank} variant="outline">
              Начать с пустого badge
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Шаблоны по категориям */}
      {categories.map(category => (
        <div key={category} className="space-y-3">
          <h3 className="text-lg font-semibold text-gray-900 capitalize">
            {category === 'feature' && 'Функции'}
            {category === 'promotion' && 'Акции'}
            {category === 'premium' && 'Премиум'}
            {category === 'technical' && 'Техническое'}
            {category === 'information' && 'Информация'}
            {category === 'other' && 'Прочее'}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {PRESET_TEMPLATES
              .filter(template => template.category === category)
              .map((template, index) => (
                <Card 
                  key={index} 
                  className="cursor-pointer hover:shadow-md transition-shadow overflow-clip"
                  onClick={() => onSelectTemplate(template)}
                >
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center justify-between">
                      <span>{template.name}</span>
                      <div className="relative">
                        <div className="w-8 h-8 bg-gray-100 rounded border flex items-center justify-center">
                          <span className="text-xs text-gray-500">Nav</span>
                        </div>
                        <BadgeIcon 
                          variant={template.variant}
                          text={template.defaultText}
                          size="sm"
                          animated={true}
                        />
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="text-sm text-gray-600">
                      {template.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-1">
                      <Badge variant="special" className="text-xs">
                        {template.variant}
                      </Badge>
                      <Badge variant="custom" className="text-xs">
                        Приоритет: {template.presetData?.priority || 1}
                      </Badge>
                    </div>

                    {template.presetData?.targetRoles && template.presetData.targetRoles.length > 0 && (
                      <div className="text-xs text-gray-500">
                        Роли: {template.presetData.targetRoles.join(', ')}
                      </div>
                    )}

                    <div className="flex justify-between items-center pt-2">
                      <span className="text-xs text-gray-500">
                        Нажмите для использования
                      </span>
                      <Button size="sm" variant="ghost">
                        Выбрать
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

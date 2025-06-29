// components/admin/QuickBadgeCreator.tsx
"use client";
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import BadgeIcon from '@/components/ui/BadgeIcon';
import { Zap, Plus } from 'lucide-react';
import { useHeaderBadgeManagement } from '@/hooks/useHeaderBadgeManagement';

const QUICK_TEMPLATES = [
  { variant: "holographic", text: "NEW", href: "/programs", label: "Новые программы" },
  { variant: "quantum-ai", text: "AI", href: "/auth/face-auth", label: "Face ID" },
  { variant: "holographic", text: "SALE", href: "/shop", label: "Распродажа" },
  { variant: "minimal", text: "TOP", href: "/trainers", label: "Топ тренеры" },
  { variant: "standard", text: "PRO", href: "/about", label: "О нас" },
];

interface QuickBadgeCreatorProps {
  onBadgeCreated?: () => void;
}

export function QuickBadgeCreator({ onBadgeCreated }: QuickBadgeCreatorProps) {
  const { createBadgeSetting } = useHeaderBadgeManagement();
  const [isCreating, setIsCreating] = useState(false);

  const handleQuickCreate = async (template: typeof QUICK_TEMPLATES[0]) => {
    setIsCreating(true);
    try {
      await createBadgeSetting({
        navigationItemHref: template.href,
        badgeVariant: template.variant as any,
        badgeText: template.text,
        badgeEnabled: true,
        priority: 5,
        targetRoles: [],
        targetDevices: [],
        conditions: {
          requireAuth: false,
          minUserLevel: 0,
          showOnlyOnce: false,
          hideAfterClick: false,
        },
        createdBy: "current-user-id"
      });
      
      onBadgeCreated?.();
    } catch (error) {
      console.error('Ошибка создания badge:', error);
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-yellow-500" />
          Быстрое создание Badge
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {QUICK_TEMPLATES.map((template, index) => (
            <Button
              key={index}
              variant="outline"
              className="h-auto p-3 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
              onClick={() => handleQuickCreate(template)}
              disabled={isCreating}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                  <Plus className="h-4 w-4 text-gray-400" />
                </div>
                <BadgeIcon variant={template.variant as any} text={template.text} />
              </div>
              <div className="text-center">
                <div className="font-medium text-sm">{template.label}</div>
                <Badge variant="outline" className="text-xs mt-1">
                  {template.text}
                </Badge>
              </div>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

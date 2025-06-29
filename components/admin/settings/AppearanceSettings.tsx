// components/admin/settings/AppearanceSettings.tsx
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Palette, Upload, Eye } from "lucide-react";
import { useState } from "react";

interface AppearanceSettingsProps {
  config: any;
  onUpdate: (updates: any) => void;
}

export function AppearanceSettings({ config, onUpdate }: AppearanceSettingsProps) {
  const [previewMode, setPreviewMode] = useState(false);

  const predefinedColors = [
    { name: 'Синий', value: '#3B82F6' },
    { name: 'Фиолетовый', value: '#8B5CF6' },
    { name: 'Зеленый', value: '#10B981' },
    { name: 'Красный', value: '#EF4444' },
    { name: 'Оранжевый', value: '#F59E0B' },
    { name: 'Розовый', value: '#EC4899' },
    { name: 'Индиго', value: '#6366F1' },
    { name: 'Серый', value: '#6B7280' }
  ];

  const handleFileUpload = (type: 'logo' | 'favicon') => {
    // Имитация загрузки файла
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = type === 'logo' ? 'image/*' : '.ico,.png';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        // В реальном приложении здесь была бы загрузка файла на сервер
        const fakeUrl = URL.createObjectURL(file);
        onUpdate({ [type]: fakeUrl });
      }
    };
    input.click();
  };

  return (
    <div className="space-y-6">
      {/* Тема */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Тема оформления
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>Цветовая схема</Label>
            <Select value={config.theme} onValueChange={(value) => onUpdate({ theme: value })}>
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Светлая</SelectItem>
                <SelectItem value="dark">Темная</SelectItem>
                <SelectItem value="auto">Автоматическая</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="primaryColor">Основной цвет</Label>
              <div className="flex gap-2 mt-1">
                                <Input
                  id="primaryColor"
                  type="color"
                  value={config.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.primaryColor}
                  onChange={(e) => onUpdate({ primaryColor: e.target.value })}
                  placeholder="#3B82F6"
                  className="flex-1"
                />
              </div>
              <div className="flex flex-wrap gap-1 mt-2">
                {predefinedColors.map(color => (
                  <button
                    key={color.value}
                    onClick={() => onUpdate({ primaryColor: color.value })}
                    className="w-6 h-6 rounded border-2 border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  />
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="secondaryColor">Дополнительный цвет</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  id="secondaryColor"
                  type="color"
                  value={config.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  className="w-16 h-10 p-1"
                />
                <Input
                  value={config.secondaryColor}
                  onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
                  placeholder="#8B5CF6"
                  className="flex-1"
                />
              </div>
            </div>
          </div>

          <Button 
            variant="outline" 
            onClick={() => setPreviewMode(!previewMode)}
            className="flex items-center gap-2"
          >
            <Eye className="h-4 w-4" />
            {previewMode ? 'Выключить предпросмотр' : 'Предпросмотр'}
          </Button>
        </CardContent>
      </Card>

      {/* Логотип и иконки */}
      <Card>
        <CardHeader>
          <CardTitle>Логотип и иконки</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <Label>Логотип</Label>
              <div className="mt-2 space-y-3">
                {config.logo && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <img 
                      src={config.logo} 
                      alt="Логотип" 
                      className="max-h-16 max-w-full object-contain"
                    />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleFileUpload('logo')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Загрузить логотип
                </Button>
                <p className="text-sm text-gray-600">
                  Рекомендуемый размер: 200x60px, формат PNG или SVG
                </p>
              </div>
            </div>

            <div>
              <Label>Favicon</Label>
              <div className="mt-2 space-y-3">
                {config.favicon && (
                  <div className="p-4 border rounded-lg bg-gray-50">
                    <img 
                      src={config.favicon} 
                      alt="Favicon" 
                      className="w-8 h-8 object-contain"
                    />
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={() => handleFileUpload('favicon')}
                  className="flex items-center gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Загрузить favicon
                </Button>
                <p className="text-sm text-gray-600">
                  Размер: 32x32px или 16x16px, формат ICO или PNG
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Пользовательский CSS */}
      <Card>
        <CardHeader>
          <CardTitle>Пользовательские стили</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="customCSS">Дополнительный CSS</Label>
            <Textarea
              id="customCSS"
              value={config.customCSS}
              onChange={(e) => onUpdate({ customCSS: e.target.value })}
              placeholder="/* Ваши пользовательские стили */
.custom-header {
  background: linear-gradient(45deg, #3B82F6, #8B5CF6);
}

.custom-button {
  border-radius: 8px;
  transition: all 0.3s ease;
}"
              rows={10}
              className="font-mono text-sm"
            />
            <p className="text-sm text-gray-600 mt-2">
              Добавьте свои CSS стили для дополнительной кастомизации интерфейса
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline">
              Проверить синтаксис
            </Button>
            <Button variant="outline">
              Сбросить к умолчаниям
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Предпросмотр */}
      {previewMode && (
        <Card>
          <CardHeader>
            <CardTitle>Предпросмотр темы</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-6 border rounded-lg"
              style={{
                '--primary-color': config.primaryColor,
                '--secondary-color': config.secondaryColor
              } as React.CSSProperties}
            >
              <div className="space-y-4">
                <div 
                  className="p-4 rounded-lg text-white"
                  style={{ backgroundColor: config.primaryColor }}
                >
                  <h3 className="text-lg font-semibold">Основной цвет</h3>
                  <p>Пример использования основного цвета в интерфейсе</p>
                </div>

                <div 
                  className="p-4 rounded-lg text-white"
                  style={{ backgroundColor: config.secondaryColor }}
                >
                  <h3 className="text-lg font-semibold">Дополнительный цвет</h3>
                  <p>Пример использования дополнительного цвета</p>
                </div>

                <div className="flex gap-2">
                  <button 
                    className="px-4 py-2 rounded text-white"
                    style={{ backgroundColor: config.primaryColor }}
                  >
                    Основная кнопка
                  </button>
                  <button 
                    className="px-4 py-2 rounded border"
                    style={{ borderColor: config.primaryColor, color: config.primaryColor }}
                  >
                    Вторичная кнопка
                  </button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

                

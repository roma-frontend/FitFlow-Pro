// components/messaging/QuickMessageModal.tsx
"use client";

import { useState } from 'react';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Send, Phone, Mail } from "lucide-react";

interface QuickMessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  recipients: Array<{
    id: string;
    name: string;
    role: string;
    phone?: string;
    email?: string;
  }>;
  relatedTo?: {
    type: 'event' | 'user' | 'payment' | 'membership';
    id: string;
    title: string;
  };
  defaultSubject?: string;
}

export function QuickMessageModal({ 
  isOpen, 
  onClose, 
  recipients, 
  relatedTo,
  defaultSubject 
}: QuickMessageModalProps) {
  const [messageType, setMessageType] = useState<'message' | 'sms' | 'email'>('message');
  const [subject, setSubject] = useState(defaultSubject || '');
  const [content, setContent] = useState('');
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    recipients.map(r => r.id)
  );

  const handleSend = async () => {
    if (!content.trim()) return;

    const messageData = {
      type: messageType,
      subject,
      content,
      recipientIds: selectedRecipients,
      relatedTo
    };

    console.log('Отправка сообщения:', messageData);
    
    // Здесь отправка через API
    switch (messageType) {
      case 'message':
        // Отправка через систему сообщений
        break;
      case 'sms':
        // Отправка SMS
        recipients
          .filter(r => selectedRecipients.includes(r.id) && r.phone)
          .forEach(r => {
            console.log(`SMS to ${r.phone}: ${content}`);
          });
        break;
      case 'email':
        // Отправка Email
        recipients
          .filter(r => selectedRecipients.includes(r.id) && r.email)
          .forEach(r => {
            console.log(`Email to ${r.email}: ${subject} - ${content}`);
          });
        break;
    }

    alert('Сообщение отправлено!');
    onClose();
  };

  const getMessageTypeTemplates = () => {
    const templates = {
      message: [
        'Напоминание о тренировке',
        'Изменение в расписании',
        'Благодарность за тренировку'
      ],
      sms: [
        'Напоминание: тренировка через час',
        'Тренировка отменена',
        'Подтвердите участие'
      ],
      email: [
        'Подробная информация о тренировке',
        'Программа тренировок на неделю',
        'Рекомендации по питанию'
      ]
    };
    return templates[messageType];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            Быстрое сообщение
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Тип сообщения */}
          <div>
            <label className="text-sm font-medium">Способ отправки</label>
            <div className="flex gap-2 mt-2">
              <Button
                size="sm"
                variant={messageType === 'message' ? 'default' : 'outline'}
                onClick={() => setMessageType('message')}
                className="flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Сообщение
              </Button>
              <Button
                size="sm"
                variant={messageType === 'sms' ? 'default' : 'outline'}
                onClick={() => setMessageType('sms')}
                className="flex items-center gap-2"
              >
                <Phone className="h-4 w-4" />
                SMS
              </Button>
              <Button
                size="sm"
                variant={messageType === 'email' ? 'default' : 'outline'}
                onClick={() => setMessageType('email')}
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </div>

          {/* Получатели */}
          <div>
            <label className="text-sm font-medium">Получатели</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {recipients.map(recipient => (
                <Badge
                  key={recipient.id}
                  variant={selectedRecipients.includes(recipient.id) ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => {
                    setSelectedRecipients(prev => 
                      prev.includes(recipient.id)
                        ? prev.filter(id => id !== recipient.id)
                        : [...prev, recipient.id]
                    );
                  }}
                >
                  {recipient.name} ({recipient.role})
                </Badge>
              ))}
            </div>
          </div>

          {/* Связанный объект */}
          {relatedTo && (
            <div className="p-3 bg-blue-50 rounded-lg">
              <div className="text-sm text-blue-800">
                Связано с: <strong>{relatedTo.title}</strong>
              </div>
            </div>
          )}

          {/* Тема (для email и сообщений) */}
          {messageType !== 'sms' && (
            <div>
              <label className="text-sm font-medium">Тема</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Введите тему"
                className="mt-1"
              />
            </div>
          )}

          {/* Быстрые шаблоны */}
          <div>
            <label className="text-sm font-medium">Быстрые шаблоны</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {getMessageTypeTemplates().map(template => (
                <Button
                  key={template}
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    if (messageType === 'sms') {
                      setContent(template);
                    } else {
                      setSubject(template);
                      setContent(`Здравствуйте!\n\n${template.toLowerCase()}.\n\nС уважением,\nКоманда FitAccess`);
                    }
                  }}
                  className="text-xs"
                >
                  {template}
                </Button>
              ))}
            </div>
          </div>

          {/* Содержимое */}
          <div>
            <label className="text-sm font-medium">
              {messageType === 'sms' ? 'Текст SMS' : 'Сообщение'}
            </label>
            <Textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={
                messageType === 'sms' 
                  ? 'Введите текст SMS (до 160 символов)' 
                  : 'Введите текст сообщения'
              }
              rows={messageType === 'sms' ? 3 : 5}
              maxLength={messageType === 'sms' ? 160 : undefined}
              className="mt-1"
            />
            {messageType === 'sms' && (
              <div className="text-xs text-gray-500 mt-1">
                {content.length}/160 символов
              </div>
            )}
          </div>

          {/* Действия */}
          <div className="flex gap-3 pt-4 border-t">
            <Button onClick={handleSend} className="flex-1 flex items-center gap-2">
              <Send className="h-4 w-4" />
              Отправить
            </Button>
            <Button variant="outline" onClick={onClose} className="flex-1">
              Отмена
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

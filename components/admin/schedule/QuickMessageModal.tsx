// components/admin/schedule/QuickMessageModal.tsx
import React, { memo, useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { X, Send, MessageCircle } from "lucide-react";

interface MessageRecipient {
  id: string;
  name: string;
  role: string;
  phone?: string;
  email?: string;
}

interface MessageRelatedTo {
  type: string;
  id: string;
  title: string;
}

interface QuickMessageModalProps {
  isOpen: boolean;
  recipients: MessageRecipient[];
  relatedTo: MessageRelatedTo | null;
  onClose: () => void;
}

export const QuickMessageModal = memo(function QuickMessageModal({
  isOpen,
  recipients,
  relatedTo,
  onClose,
}: QuickMessageModalProps) {
  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [selectedRecipients, setSelectedRecipients] = useState<string[]>(
    recipients.map(r => r.id)
  );
  const [isSending, setIsSending] = useState(false);

  const handleSend = useCallback(async () => {
    if (!message.trim() || selectedRecipients.length === 0) {
      alert("Заполните сообщение и выберите получателей");
      return;
    }

    setIsSending(true);
    try {
      // Здесь будет логика отправки сообщения
      console.log("Отправка сообщения:", {
        subject,
        message,
        recipients: selectedRecipients,
        relatedTo,
      });

      // Имитация отправки
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      alert("Сообщение отправлено!");
      onClose();
    } catch (error) {
      console.error("Ошибка отправки сообщения:", error);
      alert("Ошибка отправки сообщения");
    } finally {
      setIsSending(false);
    }
  }, [message, subject, selectedRecipients, relatedTo, onClose]);

  const toggleRecipient = useCallback((recipientId: string) => {
    setSelectedRecipients(prev => 
      prev.includes(recipientId)
        ? prev.filter(id => id !== recipientId)
        : [...prev, recipientId]
    );
  }, []);

  const roleColors = {
    trainer: "bg-blue-100 text-blue-800",
    member: "bg-green-100 text-green-800",
    admin: "bg-purple-100 text-purple-800",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2 text-gray-600">
            <MessageCircle className="h-5 w-5" />
            <span>Быстрое сообщение</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Related To */}
          {relatedTo && (
            <div className="bg-gray-50 p-3 rounded-lg">
              <div className="text-sm text-gray-600">Связано с:</div>
              <div className="font-medium text-gray-600">{relatedTo.title}</div>
              <div className="text-xs text-gray-500 capitalize">{relatedTo.type}</div>
            </div>
          )}

          {/* Recipients */}
          <div>
            <Label className="text-sm font-medium">Получатели</Label>
            <div className="mt-2 space-y-2">
              {recipients.map(recipient => (
                <div
                  key={recipient.id}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedRecipients.includes(recipient.id)
                      ? "bg-blue-50 border-blue-200"
                      : "bg-white border-gray-200 hover:bg-gray-50"
                  }`}
                  onClick={() => toggleRecipient(recipient.id)}
                >
                  <div className="flex items-center space-x-3">
                    <input
                      type="checkbox"
                      checked={selectedRecipients.includes(recipient.id)}
                      onChange={() => toggleRecipient(recipient.id)}
                      className="rounded"
                    />
                    <div>
                      <div className="font-medium text-gray-600">{recipient.name}</div>
                      <div className="text-sm text-gray-500">
                        {recipient.phone && <span>{recipient.phone}</span>}
                        {recipient.email && (
                          <span className="ml-2">{recipient.email}</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <Badge
                    className={roleColors[recipient.role as keyof typeof roleColors] || "bg-gray-100 text-gray-800"}
                  >
                    {recipient.role}
                  </Badge>
                </div>
              ))}
            </div>
          </div>

          {/* Subject */}
          <div>
            <Label htmlFor="subject" className="text-sm font-medium">
              Тема (необязательно)
            </Label>
            <Input
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Введите тему сообщения..."
              className="mt-1"
            />
          </div>

          {/* Message */}
          <div>
            <Label htmlFor="message" className="text-sm font-medium">
              Сообщение *
            </Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Введите ваше сообщение..."
              rows={4}
              className="mt-1"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3">
            <Button
              onClick={onClose}
              variant="outline"
              disabled={isSending}
            >
              Отмена
            </Button>
            <Button
              onClick={handleSend}
              disabled={isSending || !message.trim() || selectedRecipients.length === 0}
            >
              {isSending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Отправка...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Отправить
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
});

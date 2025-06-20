"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Download, Mail, Printer } from "lucide-react";

interface ReceiptModalProps {
  receipt: any;
  isOpen: boolean;
  onClose: () => void;
}

export default function ReceiptModal({
  receipt,
  isOpen,
  onClose,
}: ReceiptModalProps) {
  if (!receipt) return null;

  const handlePrint = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(generatePrintableReceipt(receipt));
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownload = () => {
    const receiptText = generateReceiptText(receipt);
    const blob = new Blob([receiptText], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `receipt-${receipt.receiptId}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleEmailReceipt = async () => {
    try {
      await fetch("/api/receipts/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiptId: receipt.receiptId }),
      });
      alert("Чек отправлен на email");
    } catch (error) {
      alert("Ошибка отправки чека");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Чек об оплате</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Заголовок чека */}
          <div className="text-center border-b pb-4">
            <h3 className="font-bold text-lg">FitAccess</h3>
            <p className="text-sm text-gray-600">Фитнес-центр и магазин</p>
            {receipt.company && (
              <div className="text-xs text-gray-500 mt-2">
                <p>{receipt.company.address}</p>
                <p>ИНН: {receipt.company.inn}</p>
                <p>{receipt.company.phone}</p>
              </div>
            )}
          </div>

          {/* Информация о чеке */}
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Чек №:</span>
              <span className="text-sm font-mono">{receipt.receiptId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600">Дата:</span>
              <span className="text-sm">
                {new Date(receipt.paidAt).toLocaleString()}
              </span>
            </div>
            {receipt.customer?.email && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Email:</span>
                <span className="text-sm">{receipt.customer.email}</span>
              </div>
            )}
            {receipt.paymentMethod && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Способ оплаты:</span>
                <span className="text-sm">{receipt.paymentMethod}</span>
              </div>
            )}
          </div>

          {/* Товары */}
          <div className="border-t pt-4">
            <h4 className="font-medium mb-3">Товары:</h4>
            <div className="space-y-2">
              {receipt.items?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between text-sm">
                  <div className="flex-1">
                    <p className="font-medium">
                      {item.name || item.productName}
                    </p>
                    <p className="text-gray-600">
                      {item.price} ₽ × {item.quantity}
                    </p>
                  </div>
                  <span className="font-medium">
                    {item.total || item.totalPrice} ₽
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Итого */}
          <div className="border-t pt-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-lg">Итого:</span>
              <span className="font-bold text-xl">
                {receipt.amount} {receipt.currency || "₽"}
              </span>
            </div>

            {receipt.fiscalData && (
              <div className="mt-4 p-3 bg-gray-50 rounded text-xs">
                <h5 className="font-medium mb-2">Фискальные данные:</h5>
                <div className="space-y-1">
                  {receipt.fiscalData.fiscalDocumentNumber && (
                    <p>ФД: {receipt.fiscalData.fiscalDocumentNumber}</p>
                  )}
                  {receipt.fiscalData.fiscalStorageNumber && (
                    <p>ФН: {receipt.fiscalData.fiscalStorageNumber}</p>
                  )}
                  {receipt.fiscalData.fiscalAttribute && (
                    <p>ФПД: {receipt.fiscalData.fiscalAttribute}</p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Статус */}
          <div className="text-center">
            <Badge className="bg-green-100 text-green-800">✓ Оплачено</Badge>
          </div>

          {/* Действия */}
          <div className="flex gap-2 pt-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="flex-1"
            >
              <Printer className="h-4 w-4 mr-2" />
              Печать
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleDownload}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Скачать
            </Button>
            {receipt.customer?.email && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleEmailReceipt}
                className="flex-1"
              >
                <Mail className="h-4 w-4 mr-2" />
                Email
              </Button>
            )}
          </div>

          <div className="text-center pt-4">
            <p className="text-xs text-gray-500">
              Спасибо за покупку! Приятных тренировок!
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function generatePrintableReceipt(receipt: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <title>Чек ${receipt.receiptId}</title>
      <style>
        body { font-family: monospace; max-width: 300px; margin: 0 auto; padding: 20px; }
        .center { text-align: center; }
        .line { border-bottom: 1px dashed #000; margin: 10px 0; }
        .total { font-weight: bold; font-size: 1.2em; }
        .item { display: flex; justify-content: space-between; margin: 5px 0; }
      </style>
    </head>
    <body>
      <div class="center">
        <h2>FitAccess</h2>
        <p>Фитнес-центр и магазин</p>
        ${
          receipt.company
            ? `
          <p>${receipt.company.address}</p>
          <p>ИНН: ${receipt.company.inn}</p>
          <p>${receipt.company.phone}</p>
        `
            : ""
        }
      </div>
      
      <div class="line"></div>
      
      <p>Чек №: ${receipt.receiptId}</p
      <p>Дата: ${new Date(receipt.paidAt).toLocaleString()}</p>
      ${receipt.customer?.email ? `<p>Email: ${receipt.customer.email}</p>` : ""}
      
      <div class="line"></div>
      
      <h3>Товары:</h3>
      ${
        receipt.items
          ?.map(
            (item: any) => `
        <div class="item">
          <div>
            <div>${item.name || item.productName}</div>
            <div>${item.price} ₽ × ${item.quantity}</div>
          </div>
          <div>${item.total || item.totalPrice} ₽</div>
        </div>
      `
          )
          .join("") || ""
      }
      
      <div class="line"></div>
      
      <div class="item total">
        <span>ИТОГО:</span>
        <span>${receipt.amount} ${receipt.currency || "₽"}</span>
      </div>
      
      ${
        receipt.fiscalData
          ? `
        <div class="line"></div>
        <h4>Фискальные данные:</h4>
        ${receipt.fiscalData.fiscalDocumentNumber ? `<p>ФД: ${receipt.fiscalData.fiscalDocumentNumber}</p>` : ""}
        ${receipt.fiscalData.fiscalStorageNumber ? `<p>ФН: ${receipt.fiscalData.fiscalStorageNumber}</p>` : ""}
        ${receipt.fiscalData.fiscalAttribute ? `<p>ФПД: ${receipt.fiscalData.fiscalAttribute}</p>` : ""}
      `
          : ""
      }
      
      <div class="line"></div>
      <div class="center">
        <p>✓ ОПЛАЧЕНО</p>
        <p>Спасибо за покупку!</p>
        <p>Приятных тренировок!</p>
      </div>
    </body>
    </html>
  `;
}

function generateReceiptText(receipt: any): string {
  let text = `
========================================
              FitAccess
         Фитнес-центр и магазин
========================================

Чек №: ${receipt.receiptId}
Дата: ${new Date(receipt.paidAt).toLocaleString()}
${receipt.customer?.email ? `Email: ${receipt.customer.email}` : ""}

----------------------------------------
                ТОВАРЫ
----------------------------------------
`;

  receipt.items?.forEach((item: any) => {
    text += `${item.name || item.productName}\n`;
    text += `${item.price} ₽ × ${item.quantity} = ${item.total || item.totalPrice} ₽\n\n`;
  });

  text += `----------------------------------------
ИТОГО: ${receipt.amount} ${receipt.currency || "₽"}
----------------------------------------

✓ ОПЛАЧЕНО

Спасибо за покупку!
Приятных тренировок!

========================================
`;

  return text;
}

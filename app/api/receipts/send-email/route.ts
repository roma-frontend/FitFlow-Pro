// app/api/receipts/send-email/route.ts
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { ConvexHttpClient } from "convex/browser";

const client = new ConvexHttpClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

// Настройка транспорта для отправки email
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function POST(request: NextRequest) {
  try {
    const { receiptId } = await request.json();

    // Получаем данные чека из базы
    const receipt = await client.query("receipts:getById", { receiptId });
    
    if (!receipt) {
      return NextResponse.json(
        { error: 'Чек не найден' },
        { status: 404 }
      );
    }

    // Генерируем HTML для email
    const emailHtml = generateEmailReceipt(receipt);

    // Отправляем email
    await transporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@fitaccess.ru',
      to: receipt.customer.email,
      subject: `Чек FitAccess №${receiptId}`,
      html: emailHtml,
      attachments: [
        {
          filename: `receipt-${receiptId}.pdf`,
          content: await generateReceiptPDF(receipt),
          contentType: 'application/pdf',
        },
      ],
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Ошибка отправки чека на email:', error);
    return NextResponse.json(
      { error: 'Ошибка отправки email' },
      { status: 500 }
    );
  }
}

function generateEmailReceipt(receipt: any): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Чек FitAccess</title>
      <style>
        body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { text-align: center; background: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .receipt-info { background: #fff; border: 1px solid #dee2e6; border-radius: 8px; padding: 20px; }
        .item { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .total { font-weight: bold; font-size: 1.2em; background: #e9ecef; padding: 15px; border-radius: 4px; }
        .footer { text-align: center; margin-top: 20px; color: #6c757d; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>FitAccess</h1>
        <p>Спасибо за вашу покупку!</p>
      </div>
      
      <div class="receipt-info">
        <h2>Чек об оплате №${receipt.receiptId}</h2>
        
        <p><strong>Дата:</strong> ${new Date(receipt.paidAt).toLocaleString()}</p>
        <p><strong>Способ оплаты:</strong> ${receipt.paymentMethod || 'Банковская карта'}</p>
        
        <h3>Товары:</h3>
        ${receipt.items?.map((item: any) => `
          <div class="item">
            <div>
              <strong>${item.name || item.productName}</strong><br>
              ${item.price} ₽ × ${item.quantity}
            </div>
            <div><strong>${item.total || item.totalPrice} ₽</strong></div>
          </div>
        `).join('') || ''}
        
        <div class="total">
          <div style="display: flex; justify-content: space-between;">
            <span>ИТОГО:</span>
            <span>${receipt.amount} ${receipt.currency || '₽'}</span>
          </div>
        </div>
        
        ${receipt.fiscalData ? `
          <div style="margin-top: 20px; padding: 15px; background: #f8f9fa; border-radius: 4px;">
            <h4>Фискальные данные:</h4>
            ${receipt.fiscalData.fiscalDocumentNumber ? `<p>ФД: ${receipt.fiscalData.fiscalDocumentNumber}</p>` : ''}
            ${receipt.fiscalData.fiscalStorageNumber ? `<p>ФН: ${receipt.fiscalData.fiscalStorageNumber}</p>` : ''}
            ${receipt.fiscalData.fiscalAttribute ? `<p>ФПД: ${receipt.fiscalData.fiscalAttribute}</p>` : ''}
          </div>
        ` : ''}
      </div>
      
      <div class="footer">
        <p>Этот чек был отправлен автоматически.</p>
        <p>Если у вас есть вопросы, свяжитесь с нами: support@fitaccess.ru</p>
      </div>
    </body>
    </html>
  `;
}

async function generateReceiptPDF(receipt: any): Promise<Buffer> {
  // Здесь можно использовать библиотеку типа puppeteer или jsPDF
  // Для простоты возвращаем пустой буфер
  return Buffer.from('');
}

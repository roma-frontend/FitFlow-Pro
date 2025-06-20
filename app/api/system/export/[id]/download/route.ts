// app/api/system/export/[id]/download/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions } from '@/lib/mock-data';

// GET /api/system/export/[id]/download - Скачивание экспорта
export const GET = async (
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'export' },
    async (req: AuthenticatedRequest) => {
      try {
        const params = await context.params;
        const { id: exportId } = params;
        const { user } = req;

        if (!exportId) {
          return NextResponse.json(
            { success: false, error: 'ID экспорта не указан' },
            { status: 400 }
          );
        }

        console.log(`📥 API: скачивание экспорта ${exportId}`);

        // Проверка прав доступа
        if (user.role === 'trainer' && !exportId.includes(user.id)) {
          return NextResponse.json(
            { success: false, error: 'Нет прав на скачивание этого экспорта' },
            { status: 403 }
          );
        }

        // Определение формата файла
        const format = exportId.includes('xlsx') ? 'xlsx' : 
                      exportId.includes('csv') ? 'csv' : 'json';

        // Подготовка данных для экспорта
        const trainers = user.role === 'trainer' 
          ? mockTrainers.filter(t => t.id === user.id)
          : mockTrainers;
        
        const clients = user.role === 'trainer'
          ? mockClients.filter(c => c.trainerId === user.id)
          : mockClients;
        
        const sessions = user.role === 'trainer'
          ? mockSessions.filter(s => s.trainerId === user.id)
          : mockSessions;

        let fileContent: string | Buffer;
        let contentType: string;
        let fileName: string;

        switch (format) {
          case 'json':
            const jsonData = generateEnhancedJSONData(user, trainers, clients, sessions);
            fileContent = JSON.stringify(jsonData, null, 2);
            contentType = 'application/json';
            fileName = `fitness_export_${exportId}_${new Date().toISOString().split('T')[0]}.json`;
            break;

          case 'csv':
            fileContent = generateDetailedCSVData(user, trainers, clients, sessions);
            contentType = 'text/csv; charset=utf-8';
            fileName = `fitness_export_${exportId}_${new Date().toISOString().split('T')[0]}.csv`;
            break;

          case 'xlsx':
            fileContent = generateXLSXData(user, trainers, clients, sessions);
            contentType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileName = `fitness_export_${exportId}_${new Date().toISOString().split('T')[0]}.xlsx`;
            break;

          default:
            return NextResponse.json(
              { success: false, error: 'Неподдерживаемый формат экспорта' },
              { status: 400 }
            );
        }

        console.log(`✅ API: экспорт отправлен - ${exportId} (${format})`);

        // Возвращаем файл для скачивания
        return new NextResponse(fileContent, {
          status: 200,
          headers: {
            'Content-Type': contentType,
            'Content-Disposition': `attachment; filename="${fileName}"`,
            'Content-Length': fileContent.length.toString(),
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

      } catch (error) {
        console.error('💥 API: ошибка скачивания экспорта:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка скачивания экспорта' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// Функция для генерации JSON экспорта с дополнительной статистикой
function generateEnhancedJSONData(user: any, trainers: any[], clients: any[], sessions: any[]): any {
  // Генерация статистики
  const stats = {
    totalTrainers: trainers.length,
    totalClients: clients.length,
    totalSessions: sessions.length,
    activeClients: clients.filter(c => c.status === 'active').length,
    completedSessions: sessions.filter(s => s.status === 'completed').length,
    scheduledSessions: sessions.filter(s => s.status === 'scheduled').length,
    cancelledSessions: sessions.filter(s => s.status === 'cancelled').length,
    averageRating: trainers.length > 0 
      ? trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length 
      : 0,
    totalRevenue: sessions
      .filter(s => s.status === 'completed')
      .reduce((sum, session) => {
        const trainer = trainers.find(t => t.id === session.trainerId);
        return sum + (trainer?.hourlyRate || 0);
      }, 0)
  };

  return {
    metadata: {
      exportedAt: new Date().toISOString(),
      exportedBy: user.id,
      exportedByRole: user.role,
      format: 'json',
      version: '1.1',
      totalRecords: trainers.length + clients.length + sessions.length
    },
    statistics: stats,
    data: {
      trainers,
      clients,
      sessions
    },
    relationships: {
      trainerClientMapping: clients.reduce((acc: any, client) => {
        if (client.trainerId) {
          if (!acc[client.trainerId]) {
            acc[client.trainerId] = [];
          }
          acc[client.trainerId].push(client.id);
        }
        return acc;
      }, {}),
      clientSessionMapping: sessions.reduce((acc: any, session) => {
        if (!acc[session.clientId]) {
          acc[session.clientId] = [];
        }
        acc[session.clientId].push(session.id);
        return acc;
      }, {})
    }
  };
}

// Функция для генерации детального CSV экспорта
function generateDetailedCSVData(user: any, trainers: any[], clients: any[], sessions: any[]): string {
  let csvContent = '';

  // Добавляем BOM для корректного отображения UTF-8 в Excel
  csvContent += '\uFEFF';

  // Секция тренеров
  csvContent += 'TRAINERS\n';
  csvContent += 'ID,Name,Email,Phone,Role,Status,Specialization,Experience,Rating,Active Clients,Total Sessions,Hourly Rate,Created At\n';
  
  trainers.forEach(trainer => {
    const row = [
      trainer.id,
      `"${trainer.name}"`,
      trainer.email,
      `"${trainer.phone || ''}"`,
      trainer.role || 'trainer',
      trainer.status,
      `"${trainer.specialization?.join('; ') || ''}"`,
      trainer.experience || 0,
      trainer.rating || 0,
      trainer.activeClients || 0,
      trainer.totalSessions || 0,
      trainer.hourlyRate || 0,
      trainer.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\nCLIENTS\n';
  csvContent += 'ID,Name,Email,Phone,Status,Trainer ID,Membership Type,Join Date,Total Sessions,Birth Date,Goals,Created At\n';
  
  clients.forEach(client => {
    const row = [
      client.id,
      `"${client.name}"`,
      client.email,
      `"${client.phone || ''}"`,
      client.status,
      client.trainerId || '',
      client.membershipType || '',
      client.joinDate || '',
      client.totalSessions || 0,
      client.birthDate || '',
      `"${client.goals?.join('; ') || ''}"`,
      client.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  csvContent += '\n\nSESSIONS\n';
  csvContent += 'ID,Trainer ID,Client ID,Date,Start Time,End Time,Type,Status,Notes,Created At\n';
  
  sessions.forEach(session => {
    const row = [
      session.id,
      session.trainerId,
      session.clientId,
      session.date,
      session.startTime,
      session.endTime,
      session.type,
      session.status,
      `"${session.notes || ''}"`,
      session.createdAt
    ];
    csvContent += row.join(',') + '\n';
  });

  // Добавляем статистику в конец
  csvContent += '\n\nSTATISTICS\n';
  csvContent += 'Metric,Value\n';
  csvContent += `Total Trainers,${trainers.length}\n`;
  csvContent += `Total Clients,${clients.length}\n`;
  csvContent += `Total Sessions,${sessions.length}\n`;
  csvContent += `Active Clients,${clients.filter(c => c.status === 'active').length}\n`;
  csvContent += `Completed Sessions,${sessions.filter(s => s.status === 'completed').length}\n`;
  csvContent += `Export Date,${new Date().toISOString()}\n`;
  csvContent += `Exported By,${user.id}\n`;

  return csvContent;
}

// Функция для генерации XLSX данных (имитация)
function generateXLSXData(user: any, trainers: any[], clients: any[], sessions: any[]): Buffer {
  // В реальном приложении здесь использовалась бы библиотека типа xlsx или exceljs
  // Возвращаем имитацию Excel файла в виде структурированного текста
  const mockXlsxContent = `
FITNESS MANAGEMENT SYSTEM EXPORT
Generated: ${new Date().toISOString()}
User: ${user.id} (${user.role})
Total Records: ${trainers.length + clients.length + sessions.length}

===============================================
TRAINERS (${trainers.length} records)
===============================================
ID\tName\tEmail\tPhone\tStatus\tRating\tHourly Rate
${trainers.map(t => 
  `${t.id}\t${t.name}\t${t.email}\t${t.phone || ''}\t${t.status}\t${t.rating || 0}\t${t.hourlyRate || 0}`
).join('\n')}

===============================================
CLIENTS (${clients.length} records)
===============================================
ID\tName\tEmail\tPhone\tStatus\tTrainer ID\tMembership
${clients.map(c => 
  `${c.id}\t${c.name}\t${c.email}\t${c.phone || ''}\t${c.status}\t${c.trainerId || ''}\t${c.membershipType || ''}`
).join('\n')}

===============================================
SESSIONS (${sessions.length} records)
===============================================
ID\tTrainer ID\tClient ID\tDate\tTime\tType\tStatus
${sessions.map(s => 
  `${s.id}\t${s.trainerId}\t${s.clientId}\t${s.date}\t${s.startTime}-${s.endTime}\t${s.type}\t${s.status}`
).join('\n')}

===============================================
STATISTICS
===============================================
Total Trainers: ${trainers.length}
Total Clients: ${clients.length}
Total Sessions: ${sessions.length}
Active Clients: ${clients.filter(c => c.status === 'active').length}
Completed Sessions: ${sessions.filter(s => s.status === 'completed').length}
Average Rating: ${trainers.length > 0 ? (trainers.reduce((sum, t) => sum + (t.rating || 0), 0) / trainers.length).toFixed(2) : 0}

This would be a properly formatted Excel file in production.
Generated by Fitness Management System v1.0
  `;
  
  return Buffer.from(mockXlsxContent, 'utf-8');
}

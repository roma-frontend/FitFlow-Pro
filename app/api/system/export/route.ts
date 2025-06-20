// app/api/system/export/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions, type Trainer, type Client, type Session } from '@/lib/mock-data';

// Интерфейсы для экспорта
interface ExportData {
  trainers?: Trainer[];
  clients?: Client[];
  sessions?: Session[];
}

interface ExportFilters {
  status?: string;
  role?: string;
  membershipType?: string;
  sessionType?: string;
}

interface DateRange {
  start: string;
  end: string;
}

interface ExportRequest {
  format?: 'json' | 'csv' | 'xlsx';
  entities?: string[];
  dateRange?: DateRange | null;
  filters?: ExportFilters;
  includeMetadata?: boolean;
}

interface ExportMetadata {
  exportedAt: string;
  exportedBy: string;
  format: string;
  entities: string[];
  totalRecords: number;
  filters: ExportFilters & { dateRange?: DateRange | null };
  recordCounts: {
    trainers?: number;
    clients?: number;
    sessions?: number;
  };
}

// POST /api/system/export - Экспорт данных
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'export' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📤 API: экспорт данных');

        const { user } = req;
        const body: ExportRequest = await req.json();
        const { 
          format = 'json',
          entities = ['trainers', 'clients', 'sessions'],
          dateRange = null,
          filters = {},
          includeMetadata = true
        } = body;

        // Валидация параметров
        const validFormats = ['json', 'csv', 'xlsx'];
        if (!validFormats.includes(format)) {
          return NextResponse.json(
            { success: false, error: 'Неподдерживаемый формат экспорта' },
            { status: 400 }
          );
        }

        const validEntities = ['trainers', 'clients', 'sessions'];
        const entitiesToExport = entities.filter(entity => validEntities.includes(entity));
        
        if (entitiesToExport.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Не указаны корректные сущности для экспорта' },
            { status: 400 }
          );
        }

        const exportData: ExportData = {};
        const recordCounts: { [key: string]: number } = {};

        // Экспорт тренеров
        if (entitiesToExport.includes('trainers')) {
          let trainers = [...mockTrainers];
          
          // Фильтрация по правам доступа
          if (user.role === 'trainer') {
            trainers = trainers.filter(t => t.id === user.id);
          } else if (user.role === 'manager') {
            trainers = trainers.filter(t => t.role !== 'admin' && t.role !== 'super-admin');
          }
          
          // Применение фильтров
          if (filters.status) {
            trainers = trainers.filter(t => t.status === filters.status);
          }
          
          if (filters.role) {
            trainers = trainers.filter(t => t.role === filters.role);
          }
          
          exportData.trainers = trainers;
          recordCounts.trainers = trainers.length;
        }

        // Экспорт клиентов
        if (entitiesToExport.includes('clients')) {
          let clients = [...mockClients];
          
          // Фильтрация по правам доступа
          if (user.role === 'trainer') {
            clients = clients.filter(c => c.trainerId === user.id);
          }
          
          // Применение фильтров
          if (filters.status) {
            clients = clients.filter(c => c.status === filters.status);
          }
          
          if (filters.membershipType) {
            clients = clients.filter(c => c.membershipType === filters.membershipType);
          }
          
          exportData.clients = clients;
          recordCounts.clients = clients.length;
        }

        // Экспорт сессий
        if (entitiesToExport.includes('sessions')) {
          let sessions = [...mockSessions];
          
          // Фильтрация по правам доступа
          if (user.role === 'trainer') {
            sessions = sessions.filter(s => s.trainerId === user.id);
          } else if (user.role === 'client') {
            sessions = sessions.filter(s => s.clientId === user.id);
          }
          
          // Фильтрация по диапазону дат
          if (dateRange) {
            const startDate = new Date(dateRange.start);
            const endDate = new Date(dateRange.end);
            sessions = sessions.filter(s => {
              const sessionDate = new Date(s.date);
              return sessionDate >= startDate && sessionDate <= endDate;
            });
          }
          
          // Применение фильтров
          if (filters.status) {
            sessions = sessions.filter(s => s.status === filters.status);
          }
          
          if (filters.sessionType) {
            sessions = sessions.filter(s => s.type === filters.sessionType);
          }
          
          exportData.sessions = sessions;
          recordCounts.sessions = sessions.length;
        }

        // Подготовка метаданных
        const totalRecords = Object.values(recordCounts).reduce((sum, count) => sum + count, 0);
        
        const metadata: ExportMetadata = {
          exportedAt: new Date().toISOString(),
          exportedBy: user.id,
          format,
          entities: entitiesToExport,
          totalRecords,
          filters: {
            ...filters,
            dateRange
          },
          recordCounts
        };

        const exportId = `export_${Date.now()}_${user.id}_${format}`;
        
        // Определение MIME типа и URL для скачивания
        let mimeType = 'application/json';
        let fileExtension = 'json';
        
        switch (format) {
          case 'csv':
            mimeType = 'text/csv';
            fileExtension = 'csv';
            break;
          case 'xlsx':
            mimeType = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            fileExtension = 'xlsx';
            break;
        }

        const downloadUrl = `/api/system/export/${exportId}/download`;
        const fileName = `fitness_export_${new Date().toISOString().split('T')[0]}.${fileExtension}`;

        // В реальном приложении здесь была бы генерация файла и сохранение во временное хранилище
        console.log(`✅ API: экспорт создан - ${exportId} (${format}, ${totalRecords} записей)`);

        // Имитация сохранения экспорта (в реальном приложении это было бы в БД или кэше)
        const exportInfo = {
          id: exportId,
          userId: user.id,
          format,
          entities: entitiesToExport,
          totalRecords,
          createdAt: metadata.exportedAt,
          expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
          data: exportData,
          metadata: includeMetadata ? metadata : undefined
        };

        return NextResponse.json({
          success: true,
          data: {
            exportId,
            format,
            fileName,
            totalRecords,
            recordCounts,
            createdAt: metadata.exportedAt,
            downloadUrl,
            mimeType,
            expiresAt: exportInfo.expiresAt,
            entities: entitiesToExport
          },
          message: 'Экспорт успешно создан'
        });

      } catch (error) {
        console.error('💥 API: ошибка экспорта данных:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка экспорта данных' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// GET /api/system/export - Получение списка экспортов
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'export' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📋 API: получение списка экспортов');

        const { user } = req;
        const url = new URL(req.url);
        const page = parseInt(url.searchParams.get('page') || '1');
        const limit = parseInt(url.searchParams.get('limit') || '10');
        const format = url.searchParams.get('format');
        const status = url.searchParams.get('status') || 'all';

        // В реальном приложении здесь был бы запрос к БД
        // Имитация списка экспортов
        let mockExports = [
          {
            id: `export_${Date.now() - 7200000}_${user.id}_xlsx`,
            format: 'xlsx' as const,
            entities: ['clients', 'sessions'],
            totalRecords: user.role === 'trainer' ? 61 : 150,
            createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 часа назад
            expiresAt: new Date(Date.now() + 22 * 60 * 60 * 1000).toISOString(), // через 22 часа
            status: 'completed' as const,
            downloadUrl: `/api/system/export/export_${Date.now() - 7200000}_${user.id}_xlsx/download`,
            fileSize: '2.1 MB',
            createdBy: user.id
          },
          {
            id: `export_${Date.now() - 18000000}_${user.id}_json`,
            format: 'json' as const,
            entities: ['trainers'],
            totalRecords: user.role === 'trainer' ? 1 : 25,
            createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 часов назад
            expiresAt: new Date(Date.now() + 19 * 60 * 60 * 1000).toISOString(), // через 19 часов
            status: 'completed' as const,
            downloadUrl: `/api/system/export/export_${Date.now() - 18000000}_${user.id}_json/download`,
            fileSize: '0.8 MB',
            createdBy: user.id
          },
          {
            id: `export_${Date.now() - 86400000}_${user.id}_csv`,
            format: 'csv' as const,
            entities: ['clients', 'sessions'],
            totalRecords: user.role === 'trainer' ? 45 : 120,
            createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 24 часа назад
            expiresAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // истек час назад
            status: 'expired' as const,
            downloadUrl: null,
            fileSize: '1.5 MB',
            createdBy: user.id
          }
        ];

        // Фильтрация по пользователю (тренеры видят только свои экспорты)
        if (user.role === 'trainer') {
          mockExports = mockExports.filter(exp => exp.createdBy === user.id);
        }

        // Фильтрация по формату
        if (format) {
          mockExports = mockExports.filter(exp => exp.format === format);
        }

        // Фильтрация по статусу
        if (status !== 'all') {
          mockExports = mockExports.filter(exp => exp.status === status);
        }

        // Пагинация
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedExports = mockExports.slice(startIndex, endIndex);

        return NextResponse.json({
          success: true,
          data: paginatedExports,
          pagination: {
            page,
            limit,
            total: mockExports.length,
            pages: Math.ceil(mockExports.length / limit),
            hasMore: endIndex < mockExports.length
          },
          filters: {
            format,
            status
          }
        });

      } catch (error) {
        console.error('💥 API: ошибка получения списка экспортов:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения списка экспортов' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// DELETE /api/system/export - Удаление экспорта
export const DELETE = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'delete' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('🗑️ API: удаление экспорта');

        const { user } = req;
        const body = await req.json();
        const { exportIds } = body;

        if (!exportIds || !Array.isArray(exportIds) || exportIds.length === 0) {
          return NextResponse.json(
            { success: false, error: 'Список ID экспортов не указан' },
            { status: 400 }
          );
        }

        const deletedExports: string[] = [];
        const failedDeletes: string[] = [];

        for (const exportId of exportIds) {
          // Проверка прав доступа (тренеры могут удалять только свои экспорты)
          if (user.role === 'trainer' && !exportId.includes(user.id)) {
            failedDeletes.push(exportId);
            continue;
          }

          // В реальном приложении здесь было бы удаление файла и записи из БД
          console.log(`✅ API: экспорт удален - ${exportId}`);
          deletedExports.push(exportId);
        }

        return NextResponse.json({
          success: true,
          data: {
                        deletedCount: deletedExports.length,
            deletedExports,
            failedCount: failedDeletes.length,
            failedDeletes,
            deletedBy: user.id,
            deletedAt: new Date().toISOString()
          },
          message: `Удалено ${deletedExports.length} экспортов${failedDeletes.length > 0 ? `, не удалось удалить ${failedDeletes.length}` : ''}`
        });

      } catch (error) {
        console.error('💥 API: ошибка удаления экспорта:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка удаления экспорта' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};


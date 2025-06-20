// app/api/system/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withPermissions, type AuthenticatedRequest } from '@/lib/api-middleware';
import { mockTrainers, mockClients, mockSessions, type Trainer, type Client, type Session } from '@/lib/mock-data';

// Интерфейсы для импорта
interface ImportData {
  trainers?: any[];
  clients?: any[];
  sessions?: any[];
}

interface ImportResults {
  trainers: { imported: number; skipped: number; errors: number };
  clients: { imported: number; skipped: number; errors: number };
  sessions: { imported: number; skipped: number; errors: number };
  validationErrors: Array<{
    entity: string;
    record: any;
    error: string;
  }>;
  startTime: string;
  endTime: string | null;
}

interface ValidationError {
  entity: string;
  record: any;
  error: string;
}

// POST /api/system/import - Импорт данных
export const POST = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'import' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📥 API: импорт данных');

        const { user } = req;
        
        const body = await req.json();
        const { 
          data,
          mode = 'merge',
          validateOnly = false,
          skipDuplicates = true
        }: {
          data: ImportData;
          mode?: 'merge' | 'replace' | 'append';
          validateOnly?: boolean;
          skipDuplicates?: boolean;
        } = body;

        const importResults: ImportResults = {
          trainers: { imported: 0, skipped: 0, errors: 0 },
          clients: { imported: 0, skipped: 0, errors: 0 },
          sessions: { imported: 0, skipped: 0, errors: 0 },
          validationErrors: [],
          startTime: new Date().toISOString(),
          endTime: null
        };

        // Валидация входных данных
        if (!data || typeof data !== 'object') {
          return NextResponse.json(
            { success: false, error: 'Некорректные данные для импорта' },
            { status: 400 }
          );
        }

        // Валидация и импорт тренеров
        if (data.trainers && Array.isArray(data.trainers)) {
          for (const trainerData of data.trainers) {
            try {
              // Валидация обязательных полей
              if (!trainerData.name || !trainerData.email) {
                const error: ValidationError = {
                  entity: 'trainer',
                  record: trainerData,
                  error: 'Отсутствуют обязательные поля (name, email)'
                };
                importResults.validationErrors.push(error);
                importResults.trainers.errors++;
                continue;
              }

              // Валидация email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(trainerData.email)) {
                const error: ValidationError = {
                  entity: 'trainer',
                  record: trainerData,
                  error: 'Некорректный формат email'
                };
                importResults.validationErrors.push(error);
                importResults.trainers.errors++;
                continue;
              }

              // Проверка дубликатов
              const existingTrainer = mockTrainers.find(t => t.email === trainerData.email);
              if (existingTrainer && skipDuplicates) {
                importResults.trainers.skipped++;
                continue;
              }

              // Валидация роли
              const validRoles = ['trainer', 'admin', 'manager'];
              if (trainerData.role && !validRoles.includes(trainerData.role)) {
                const error: ValidationError = {
                  entity: 'trainer',
                  record: trainerData,
                  error: 'Некорректная роль'
                };
                importResults.validationErrors.push(error);
                importResults.trainers.errors++;
                continue;
              }

              // Валидация статуса
              const validStatuses = ['active', 'inactive', 'suspended'];
              if (trainerData.status && !validStatuses.includes(trainerData.status)) {
                const error: ValidationError = {
                  entity: 'trainer',
                  record: trainerData,
                  error: 'Некорректный статус'
                };
                importResults.validationErrors.push(error);
                importResults.trainers.errors++;
                continue;
              }

              // Валидация рабочих часов
              if (trainerData.workingHours) {
                const workingHoursErrors = validateWorkingHours(trainerData.workingHours);
                if (workingHoursErrors.length > 0) {
                  const error: ValidationError = {
                    entity: 'trainer',
                    record: trainerData,
                    error: `Некорректные рабочие часы: ${workingHoursErrors.join(', ')}`
                  };
                  importResults.validationErrors.push(error);
                  importResults.trainers.errors++;
                  continue;
                }
              }

              if (!validateOnly) {
                if (existingTrainer && mode === 'merge') {
                  // Обновление существующего тренера
                  const trainerIndex = mockTrainers.findIndex(t => t.id === existingTrainer.id);
                  if (trainerIndex !== -1) {
                    mockTrainers[trainerIndex] = {
                      ...existingTrainer,
                      ...trainerData,
                      id: existingTrainer.id,
                      specialization: trainerData.specializations || trainerData.specialization || existingTrainer.specialization,
                      createdAt: existingTrainer.createdAt,
                      createdBy: existingTrainer.createdBy,
                      updatedAt: new Date().toISOString(),
                      updatedBy: user.id
                    };
                  }
                } else {
                  // Создание нового тренера
                  const newTrainer: Trainer = {
                    id: trainerData.id || `trainer_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: trainerData.name,
                    email: trainerData.email,
                    phone: trainerData.phone || '',
                    role: trainerData.role || 'trainer',
                    status: trainerData.status || 'active',
                    specialization: trainerData.specializations || trainerData.specialization || [],
                    experience: trainerData.experience || 0,
                    rating: trainerData.rating || 0,
                    activeClients: trainerData.activeClients || 0,
                    totalSessions: trainerData.totalSessions || 0,
                    hourlyRate: trainerData.hourlyRate || 0,
                    certifications: trainerData.certifications || [],
                    workingHours: trainerData.workingHours || createDefaultWorkingHours(),
                    createdAt: trainerData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: user.id,
                    updatedBy: user.id
                  };
                  mockTrainers.push(newTrainer);
                }
              }

              importResults.trainers.imported++;

            } catch (error: any) {
              const validationError: ValidationError = {
                entity: 'trainer',
                record: trainerData,
                error: error?.message || 'Неизвестная ошибка'
              };
              importResults.validationErrors.push(validationError);
              importResults.trainers.errors++;
            }
          }
        }

        // Валидация и импорт клиентов
        if (data.clients && Array.isArray(data.clients)) {
          for (const clientData of data.clients) {
            try {
              // Валидация обязательных полей
              if (!clientData.name || !clientData.email) {
                const error: ValidationError = {
                  entity: 'client',
                  record: clientData,
                  error: 'Отсутствуют обязательные поля (name, email)'
                };
                importResults.validationErrors.push(error);
                importResults.clients.errors++;
                continue;
              }

              // Валидация email
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (!emailRegex.test(clientData.email)) {
                const error: ValidationError = {
                  entity: 'client',
                  record: clientData,
                  error: 'Некорректный формат email'
                };
                importResults.validationErrors.push(error);
                importResults.clients.errors++;
                continue;
              }

              // Проверка существования тренера
              if (clientData.trainerId) {
                const trainer = mockTrainers.find(t => t.id === clientData.trainerId);
                if (!trainer) {
                  const error: ValidationError = {
                    entity: 'client',
                    record: clientData,
                    error: `Тренер с ID ${clientData.trainerId} не найден`
                  };
                  importResults.validationErrors.push(error);
                  importResults.clients.errors++;
                  continue;
                }
              }

              // Валидация статуса
              const validStatuses = ['active', 'inactive', 'suspended', 'trial'];
              if (clientData.status && !validStatuses.includes(clientData.status)) {
                const error: ValidationError = {
                  entity: 'client',
                  record: clientData,
                  error: 'Некорректный статус'
                };
                importResults.validationErrors.push(error);
                importResults.clients.errors++;
                continue;
              }

              // Валидация типа членства
              const validMembershipTypes = ['basic', 'premium', 'vip'];
              if (clientData.membershipType && !validMembershipTypes.includes(clientData.membershipType)) {
                const error: ValidationError = {
                  entity: 'client',
                  record: clientData,
                  error: 'Некорректный тип членства'
                };
                importResults.validationErrors.push(error);
                importResults.clients.errors++;
                continue;
              }

              // Проверка дубликатов
              const existingClient = mockClients.find(c => c.email === clientData.email);
              if (existingClient && skipDuplicates) {
                importResults.clients.skipped++;
                continue;
              }

              if (!validateOnly) {
                if (existingClient && mode === 'merge') {
                  // Обновление существующего клиента
                  const clientIndex = mockClients.findIndex(c => c.id === existingClient.id);
                  if (clientIndex !== -1) {
                    mockClients[clientIndex] = {
                      ...existingClient,
                      ...clientData,
                      id: existingClient.id,
                      createdAt: existingClient.createdAt,
                      createdBy: existingClient.createdBy,
                      updatedAt: new Date().toISOString(),
                      updatedBy: user.id
                    };
                  }
                } else {
                  // Создание нового клиента
                  const newClient: Client = {
                    id: clientData.id || `client_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    name: clientData.name,
                    email: clientData.email,
                    phone: clientData.phone || '',
                    status: clientData.status || 'active',
                    trainerId: clientData.trainerId || undefined,
                    membershipType: clientData.membershipType || 'basic',
                    joinDate: clientData.joinDate || new Date().toISOString().split('T')[0],
                    totalSessions: clientData.totalSessions || 0,
                    createdAt: clientData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: user.id,
                    updatedBy: user.id
                  };
                  mockClients.push(newClient);
                }
              }

              importResults.clients.imported++;

            } catch (error: any) {
              const validationError: ValidationError = {
                entity: 'client',
                record: clientData,
                error: error?.message || 'Неизвестная ошибка'
              };
              importResults.validationErrors.push(validationError);
              importResults.clients.errors++;
            }
          }
        }

        // Валидация и импорт сессий
        if (data.sessions && Array.isArray(data.sessions)) {
          for (const sessionData of data.sessions) {
            try {
              // Валидация обязательных полей
              if (!sessionData.date || !sessionData.startTime || !sessionData.endTime || 
                  !sessionData.trainerId || !sessionData.clientId) {
                const error: ValidationError = {
                  entity: 'session',
                  record: sessionData,
                  error: 'Отсутствуют обязательные поля (date, startTime, endTime, trainerId, clientId)'
                };
                importResults.validationErrors.push(error);
                importResults.sessions.errors++;
                continue;
              }

              // Проверка существования тренера и клиента
              const trainer = mockTrainers.find(t => t.id === sessionData.trainerId);
              const client = mockClients.find(c => c.id === sessionData.clientId);

              if (!trainer) {
                const error: ValidationError = {
                  entity: 'session',
                  record: sessionData,
                  error: `Тренер с ID ${sessionData.trainerId} не найден`
                };
                importResults.validationErrors.push(error);
                importResults.sessions.errors++;
                continue;
              }

              if (!client) {
                const error: ValidationError = {
                  entity: 'session',
                  record: sessionData,
                  error: `Клиент с ID ${sessionData.clientId} не найден`
                };
                importResults.validationErrors.push(error);
                importResults.sessions.errors++;
                continue;
              }

              // Валидация статуса
              const validStatuses = ['scheduled', 'completed', 'cancelled', 'no-show'];
              if (sessionData.status && !validStatuses.includes(sessionData.status)) {
                const error: ValidationError = {
                  entity: 'session',
                  record: sessionData,
                  error: 'Некорректный статус сессии'
                };
                importResults.validationErrors.push(error);
                importResults.sessions.errors++;
                continue;
              }

              // Валидация типа сессии
              const validTypes = ['personal', 'group', 'consultation'];
              if (sessionData.type && !validTypes.includes(sessionData.type)) {
                const error: ValidationError = {
                  entity: 'session',
                  record: sessionData,
                  error: 'Некорректный тип сессии'
                };
                importResults.validationErrors.push(error);
                importResults.sessions.errors++;
                continue;
              }

              // Проверка конфликтов времени
              const sessionDateTime = new Date(`${sessionData.date}T${sessionData.startTime}`);
              const sessionEndTime = new Date(`${sessionData.date}T${sessionData.endTime}`);

              const conflictingSession = mockSessions.find(s => 
                s.trainerId === sessionData.trainerId &&
                s.status !== 'cancelled' &&
                s.id !== sessionData.id &&
                s.date === sessionData.date &&
                (
                  (sessionDateTime >= new Date(`${s.date}T${s.startTime}`) && 
                   sessionDateTime < new Date(`${s.date}T${s.endTime}`)) ||
                  (sessionEndTime > new Date(`${s.date}T${s.startTime}`) && 
                   sessionEndTime <= new Date(`${s.date}T${s.endTime}`))
                )
              );

              if (conflictingSession) {
                const error: ValidationError = {
                  entity: 'session',
                  record: sessionData,
                  error: 'Конфликт времени с существующей сессией'
                };
                importResults.validationErrors.push(error);
                importResults.sessions.errors++;
                continue;
              }

              if (!validateOnly) {
                const existingSession = mockSessions.find(s => s.id === sessionData.id);
                
                if (existingSession && mode === 'merge') {
                  // Обновление существующей сессии
                  const sessionIndex = mockSessions.findIndex(s => s.id === existingSession.id);
                  if (sessionIndex !== -1) {
                    mockSessions[sessionIndex] = {
                      ...existingSession,
                      ...sessionData,
                      id: existingSession.id,
                      createdAt: existingSession.createdAt,
                      createdBy: existingSession.createdBy,
                      updatedAt: new Date().toISOString(),
                      updatedBy: user.id
                    };
                  }
                } else {
                  // Создание новой сессии
                  const newSession: Session = {
                    id: sessionData.id || `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    trainerId: sessionData.trainerId,
                    clientId: sessionData.clientId,
                    date: sessionData.date,
                    startTime: sessionData.startTime,
                    endTime: sessionData.endTime,
                    type: sessionData.type || 'personal',
                    status: sessionData.status || 'scheduled',
                    notes: sessionData.notes || '',
                    createdAt: sessionData.createdAt || new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    createdBy: user.id,
                    updatedBy: user.id
                  };
                  mockSessions.push(newSession);
                }
              }

              importResults.sessions.imported++;

            } catch (error: any) {
              const validationError: ValidationError = {
                entity: 'session',
                record: sessionData,
                error: error?.message || 'Неизвестная ошибка'
              };
              importResults.validationErrors.push(validationError);
              importResults.sessions.errors++;
            }
          }
        }

        // Завершение импорта
        importResults.endTime = new Date().toISOString();

        const totalProcessed = importResults.trainers.imported + importResults.trainers.skipped + importResults.trainers.errors +
                              importResults.clients.imported + importResults.clients.skipped + importResults.clients.errors +
                              importResults.sessions.imported + importResults.sessions.skipped + importResults.sessions.errors;

        const hasErrors = importResults.validationErrors.length > 0;
        const hasImported = importResults.trainers.imported + importResults.clients.imported + importResults.sessions.imported > 0;

        // Обновление счетчиков после импорта
        if (!validateOnly && hasImported) {
          updateCountersAfterImport();
        }

        console.log(`${hasErrors ? '⚠️' : '✅'} API: импорт ${validateOnly ? 'валидирован' : 'завершен'} - ${totalProcessed} записей`);

        return NextResponse.json({
          success: !hasErrors || validateOnly,
          data: {
            ...importResults,
            summary: {
              totalProcessed,
              totalImported: importResults.trainers.imported + importResults.clients.imported + importResults.sessions.imported,
              totalSkipped: importResults.trainers.skipped + importResults.clients.skipped + importResults.sessions.skipped,
              totalErrors: importResults.trainers.errors + importResults.clients.errors + importResults.sessions.errors,
              mode,
              validateOnly,
              skipDuplicates
            }
          },
          message: validateOnly 
            ? `Валидация завершена. Обработано ${totalProcessed} записей. ${hasErrors ? `Найдено ${importResults.validationErrors.length} ошибок` : 'Ошибок не найдено'}`
            : `Импорт завершен. Обработано ${totalProcessed} записей. ${hasErrors ? `С ${importResults.validationErrors.length} ошибками` : 'Успешно'}`
        }, { status: hasErrors && !validateOnly ? 400 : 200 });

      } catch (error: any) {
        console.error('💥 API: ошибка импорта данных:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка импорта данных: ' + (error?.message || 'Неизвестная ошибка') },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// GET /api/system/import - Получение шаблона для импорта
export const GET = async (
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  const handler = withPermissions(
    { resource: 'system', action: 'import' },
    async (req: AuthenticatedRequest) => {
      try {
        console.log('📋 API: получение шаблона импорта');

        const url = new URL(req.url);
        const format = url.searchParams.get('format') || 'json';
        const entity = url.searchParams.get('entity') || 'all';

        const templates = {
          trainer: {
            id: 'trainer_example',
            name: 'Иван Иванов',
            email: 'ivan.ivanov@example.com',
            phone: '+7 (999) 123-45-67',
            role: 'trainer',
            status: 'active',
            specialization: ['Силовые тренировки', 'Кардио'],
            experience: 5,
            rating: 4.8,
            activeClients: 15,
            totalSessions: 250,
            hourlyRate: 2500,
            certifications: ['Сертификат персонального тренера', 'Сертификат по фитнесу'],
            workingHours: {
              monday: { start: '09:00', end: '18:00', available: true },
              tuesday: { start: '09:00', end: '18:00', available: true },
              wednesday: { start: '09:00', end: '18:00', available: true },
              thursday: { start: '09:00', end: '18:00', available: true },
              friday: { start: '09:00', end: '18:00', available: true },
              saturday: { start: '10:00', end: '16:00', available: true },
              sunday: { start: '10:00', end: '16:00', available: false }
            }
          },
          client: {
            id: 'client_example',
            name: 'Анна Петрова',
            email: 'anna.petrova@example.com',
            phone: '+7 (999) 234-56-78',
            status: 'active',
            trainerId: 'trainer_example',
            membershipType: 'premium',
            joinDate: '2024-01-15',
            totalSessions: 20
          },
          session: {
            id: 'session_example',
            trainerId: 'trainer_example',
            clientId: 'client_example',
            date: '2024-01-20',
            startTime: '10:00',
            endTime: '11:00',
            type: 'personal',
            status: 'scheduled',
            notes: 'Первая тренировка'
          }
        };

        let responseData;

        switch (entity) {
          case 'trainers':
            responseData = { trainers: [templates.trainer] };
            break;
          case 'clients':
            responseData = { clients: [templates.client] };
            break;
          case 'sessions':
            responseData = { sessions: [templates.session] };
            break;
          default:
            responseData = {
              trainers: [templates.trainer],
              clients: [templates.client],
              sessions: [templates.session]
            };
        }

        if (format === 'csv') {
          const csvHeaders = {
            trainers: 'id,name,email,phone,role,status,specialization,experience,rating,activeClients,totalSessions,hourlyRate,certifications,workingHours',
            clients: 'id,name,email,phone,status,trainerId,membershipType,joinDate,totalSessions',
            sessions: 'id,trainerId,clientId,date,startTime,endTime,type,status,notes'
          };

          return new NextResponse(
            entity === 'all' 
              ? Object.values(csvHeaders).join('\n\n')
              : csvHeaders[entity as keyof typeof csvHeaders] || csvHeaders.trainers,
            {
              status: 200,
              headers: {
                'Content-Type': 'text/csv',
                'Content-Disposition': `attachment; filename="import_template_${entity}.csv"`
              }
            }
          );
        }

        return NextResponse.json({
          success: true,
          data: responseData,
          meta: {
            format,
            entity,
            description: 'Шаблон для импорта данных',
            instructions: {
              required_fields: {
                trainers: ['name', 'email'],
                clients: ['name', 'email'],
                sessions: ['trainerId', 'clientId', 'date', 'startTime', 'endTime']
              },
              valid_values: {
                trainer_roles: ['trainer', 'admin', 'manager'],
                statuses: ['active', 'inactive', 'suspended', 'trial'],
                membership_types: ['basic', 'premium', 'vip'],
                session_types: ['personal', 'group', 'consultation'],
                session_statuses: ['scheduled', 'completed', 'cancelled', 'no-show']
              },
              date_formats: {
                date: 'YYYY-MM-DD (например: 2024-01-20)',
                time: 'HH:MM (например: 10:00)',
                datetime: 'YYYY-MM-DDTHH:MM:SSZ (например: 2024-01-20T10:00:00Z)'
              },
              field_descriptions: {
                trainers: {
                  specialization: 'Массив специализаций тренера',
                  experience: 'Опыт работы в годах',
                  rating: 'Рейтинг от 0 до 5',
                  activeClients: 'Количество активных клиентов',
                  totalSessions: 'Общее количество проведенных сессий',
                  hourlyRate: 'Почасовая ставка в рублях',
                  certifications: 'Массив сертификатов тренера',
                  workingHours: 'Рабочие часы по дням недели'
                },
                clients: {
                  trainerId: 'ID тренера (необязательно)',
                  membershipType: 'Тип членства: basic, premium, vip',
                  joinDate: 'Дата присоединения в формате YYYY-MM-DD',
                  totalSessions: 'Общее количество сессий клиента',
                  status: 'Статус: active, inactive, suspended, trial'
                },
                sessions: {
                  trainerId: 'ID тренера (обязательно)',
                  clientId: 'ID клиента (обязательно)',
                  type: 'Тип сессии: personal, group, consultation',
                  status: 'Статус: scheduled, completed, cancelled, no-show',
                  notes: 'Дополнительные заметки'
                }
              },
              notes: [
                'Все поля с email должны быть уникальными',
                'trainerId и clientId должны существовать в системе',
                'Время сессий не должно пересекаться для одного тренера',
                'Валидация выполняется перед импортом',
                'Поле specialization для тренеров должно быть массивом строк',
                'При обновлении (режим merge) существующие записи будут изменены',
                'Статус клиента может быть: active, inactive, suspended, trial',
                'hourlyRate указывается в рублях',
                'certifications - массив строк с названиями сертификатов',
                'workingHours - объект с расписанием работы по дням недели'
              ]
            }
          }
        });

      } catch (error: any) {
        console.error('💥 API: ошибка получения шаблона импорта:', error);
        return NextResponse.json(
          { success: false, error: 'Ошибка получения шаблона импорта' },
          { status: 500 }
        );
      }
    }
  );

  return handler(req, { params: {} });
};

// Вспомогательные функции

// Функция для валидации рабочих часов
function validateWorkingHours(workingHours: any): string[] {
  const errors: string[] = [];
  
  if (!workingHours || typeof workingHours !== 'object') {
    errors.push('workingHours должно быть объектом');
    return errors;
  }

  const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

  days.forEach(day => {
    if (workingHours[day]) {
      const daySchedule = workingHours[day];
      
      if (typeof daySchedule !== 'object') {
        errors.push(`Расписание для ${day} должно быть объектом`);
        return;
      }

      if (typeof daySchedule.available !== 'boolean') {
        errors.push(`Поле available для ${day} должно быть булевым`);
      }

      if (daySchedule.available) {
        if (!daySchedule.start || !timeRegex.test(daySchedule.start)) {
          errors.push(`Некорректное время начала для ${day}`);
        }

        if (!daySchedule.end || !timeRegex.test(daySchedule.end)) {
          errors.push(`Некорректное время окончания для ${day}`);
        }

        if (daySchedule.start && daySchedule.end) {
          const start = new Date(`2000-01-01T${daySchedule.start}`);
          const end = new Date(`2000-01-01T${daySchedule.end}`);
          if (start >= end) {
            errors.push(`Время начала должно быть раньше времени окончания для ${day}`);
          }
        }
      }
    }
  });

  return errors;
}

// Функция для создания рабочих часов по умолчанию
function createDefaultWorkingHours(): any {
  return {
    monday: { start: '09:00', end: '18:00', available: true },
    tuesday: { start: '09:00', end: '18:00', available: true },
    wednesday: { start: '09:00', end: '18:00', available: true },
    thursday: { start: '09:00', end: '18:00', available: true },
    friday: { start: '09:00', end: '18:00', available: true },
    saturday: { start: '10:00', end: '16:00', available: true },
    sunday: { start: '10:00', end: '16:00', available: false }
  };
}

// Функция для обновления счетчиков после импорта
function updateCountersAfterImport() {
  try {
    // Обновляем счетчики активных клиентов у тренеров
    mockTrainers.forEach(trainer => {
      const activeClientsCount = mockClients.filter(
        client => client.trainerId === trainer.id && client.status === 'active'
      ).length;
      trainer.activeClients = activeClientsCount;

      // Обновляем общее количество сессий
      const trainerSessions = mockSessions.filter(
        session => session.trainerId === trainer.id
      ).length;
      trainer.totalSessions = trainerSessions;
    });

    // Обновляем счетчики сессий у клиентов
    mockClients.forEach(client => {
      const clientSessions = mockSessions.filter(
        session => session.clientId === client.id && session.status === 'completed'
      ).length;
      client.totalSessions = clientSessions;
    });

    console.log('✅ Счетчики обновлены после импорта');
  } catch (error) {
    console.error('⚠️ Ошибка обновления счетчиков:', error);
  }
}

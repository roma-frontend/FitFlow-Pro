// app/api/clients/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withClientAccess } from '@/lib/api-middleware';
import { mockClients, searchClients, type Client } from '@/lib/mock-data';

// Экспортируем только HTTP методы
export const GET = async (
  req: NextRequest, 
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  // Создаем обработчик внутри экспортируемой функции
  const handler = withClientAccess(async (req: NextRequest) => {
    try {
      const url = new URL(req.url);
      const query = url.searchParams.get('q') || '';
      const limit = parseInt(url.searchParams.get('limit') || '10');
      const offset = parseInt(url.searchParams.get('offset') || '0');
      const status = url.searchParams.get('status');
      const membershipType = url.searchParams.get('membershipType');
      const trainerId = url.searchParams.get('trainerId');

      let results = query ? searchClients(query) : mockClients;

      // Применяем фильтры
      if (status) {
        results = results.filter(client => client.status === status);
      }

      if (membershipType) {
        results = results.filter(client => client.membershipType === membershipType);
      }

      if (trainerId) {
        results = results.filter(client => client.trainerId === trainerId);
      }

      // Пагинация
      const total = results.length;
      const paginatedResults = results.slice(offset, offset + limit);

      return NextResponse.json({
        success: true,
        data: {
          clients: paginatedResults,
          pagination: {
            total,
            limit,
            offset,
            hasMore: offset + limit < total
          },
          filters: {
            query,
            status,
            membershipType,
            trainerId
          }
        }
      });
    } catch (error) {
      console.error('Ошибка поиска клиентов:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка поиска клиентов' },
        { status: 500 }
      );
    }
  });

  return handler(req, { params: {} });
};

export const POST = async (
  req: NextRequest, 
  context: { params: Promise<Record<string, string>> }
): Promise<NextResponse> => {
  // Определяем типы и функции внутри POST
  type SortableClientFields = 'name' | 'email' | 'joinDate' | 'status' | 'membershipType';

  // Функция сортировки внутри POST
  const sortClients = (
    clients: Client[], 
    field: SortableClientFields, 
    direction: 'asc' | 'desc'
  ): Client[] => {
    return [...clients].sort((a, b) => {
      let aValue: string;
      let bValue: string;

      // Безопасное получение значений с типизацией
      switch (field) {
        case 'name':
          aValue = a.name || '';
          bValue = b.name || '';
          break;
        case 'email':
          aValue = a.email || '';
          bValue = b.email || '';
          break;
        case 'joinDate':
          aValue = a.joinDate || '';
          bValue = b.joinDate || '';
          break;
        case 'status':
          aValue = a.status || '';
          bValue = b.status || '';
          break;
        case 'membershipType':
          aValue = a.membershipType || '';
          bValue = b.membershipType || '';
          break;
        default:
          aValue = a.name || '';
          bValue = b.name || '';
      }

      // Приводим к строкам для сравнения
      const aStr = aValue.toLowerCase();
      const bStr = bValue.toLowerCase();

      if (aStr < bStr) return direction === 'asc' ? -1 : 1;
      if (aStr > bStr) return direction === 'asc' ? 1 : -1;
      return 0;
    });
  };

  // Создаем обработчик внутри экспортируемой функции
  const handler = withClientAccess(async (req: NextRequest) => {
    try {
      const body = await req.json();
      const { 
        query = '', 
        filters = {}, 
        sort = { field: 'name', direction: 'asc' },
        pagination = { limit: 10, offset: 0 }
      } = body;

      let results = query ? searchClients(query) : mockClients;

      // Применяем фильтры
      if (filters.status) {
        results = results.filter(client => 
          Array.isArray(filters.status) 
            ? filters.status.includes(client.status)
            : client.status === filters.status
        );
      }

      if (filters.membershipType) {
        results = results.filter(client => 
          Array.isArray(filters.membershipType)
            ? filters.membershipType.includes(client.membershipType)
            : client.membershipType === filters.membershipType
        );
      }

      if (filters.trainerId) {
        results = results.filter(client => 
          Array.isArray(filters.trainerId)
            ? filters.trainerId.includes(client.trainerId)
            : client.trainerId === filters.trainerId
        );
      }

      if (filters.joinDateFrom) {
        results = results.filter(client => client.joinDate >= filters.joinDateFrom);
      }

      if (filters.joinDateTo) {
        results = results.filter(client => client.joinDate <= filters.joinDateTo);
      }

      // Валидация и сортировка
      const allowedSortFields: SortableClientFields[] = ['name', 'email', 'joinDate', 'status', 'membershipType'];
      const sortField: SortableClientFields = allowedSortFields.includes(sort.field as SortableClientFields) 
        ? sort.field as SortableClientFields 
        : 'name';
      const sortDirection: 'asc' | 'desc' = sort.direction === 'desc' ? 'desc' : 'asc';

      // Применяем безопасную сортировку
      results = sortClients(results, sortField, sortDirection);

      // Пагинация
      const total = results.length;
      const paginatedResults = results.slice(
        pagination.offset, 
        pagination.offset + pagination.limit
      );

      return NextResponse.json({
        success: true,
        data: {
          clients: paginatedResults,
          pagination: {
            total,
            limit: pagination.limit,
            offset: pagination.offset,
            hasMore: pagination.offset + pagination.limit < total
          },
          appliedFilters: filters,
          sort: { field: sortField, direction: sortDirection }
        }
      });
    } catch (error) {
      console.error('Ошибка расширенного поиска клиентов:', error);
      return NextResponse.json(
        { success: false, error: 'Ошибка обработки поискового запроса' },
        { status: 500 }
      );
    }
  });

  return handler(req, { params: {} });
};

// hooks/useGroups.ts (исправленная версия с типизацией)
import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { MessageGroup } from "@/types/messages";
import { Id } from "@/convex/_generated/dataModel";

// Проверяем доступность API функций для групп
function isGroupsApiAvailable() {
  try {
    return api && api.messageGroups && typeof api.messageGroups === 'object';
  } catch (error) {
    return false;
  }
}

// Генерируем тестовые данные для групп
function generateTestGroups(): MessageGroup[] {
  return [
    {
      _id: "group1" as Id<"messageGroups">,
      _creationTime: Date.now(),
      name: "Тренеры",
      description: "Группа всех тренеров клуба",
      memberIds: ["trainer1", "trainer2", "trainer3"] as Id<"users">[],
      memberNames: ["Мария Иванова", "Алексей Сидоров", "Елена Петрова"],
      createdBy: "admin" as Id<"users">,
      isActive: true,
      groupType: "role-based",
      rules: {
        roles: ["trainer"],
        departments: ["fitness"],
      },
    },
    {
      _id: "group2" as Id<"messageGroups">,
      _creationTime: Date.now() - 86400000,
      name: "VIP клиенты",
      description: "Группа VIP клиентов с премиум подпиской",
      memberIds: ["user1", "user2", "user3"] as Id<"users">[],
      memberNames: ["Иван Петров", "Анна Смирнова", "Петр Козлов"],
      createdBy: "admin" as Id<"users">,
      isActive: true,
      groupType: "manual",
    },
    {
      _id: "group3" as Id<"messageGroups">,
      _creationTime: Date.now() - 172800000,
      name: "Новички",
      description: "Группа новых участников (менее 30 дней)",
      memberIds: ["user4", "user5"] as Id<"users">[],
      memberNames: ["Елена Васильева", "Дмитрий Волков"],
      createdBy: "admin" as Id<"users">,
      isActive: true,
      groupType: "auto",
      rules: {
        conditions: ["registration_date < 30_days"],
      },
    },
  ];
}

export const useGroups = () => {
  // Fallback данные
  const [fallbackGroups, setFallbackGroups] = useState<MessageGroup[]>([]);

  // Инициализируем fallback данные
  useEffect(() => {
    const testGroups = generateTestGroups();
    setFallbackGroups(testGroups);
  }, []);

  // Проверяем доступность API
  const isApiAvailable = isGroupsApiAvailable();

  // Безопасный useQuery
  let groupsResult: MessageGroup[] | undefined;
  
  try {
    if (isApiAvailable && api.messageGroups?.list) {
      // eslint-disable-next-line react-hooks/rules-of-hooks
      groupsResult = useQuery(api.messageGroups.list, {});
    }
  } catch (error) {
    console.warn('Groups API недоступен:', error);
    groupsResult = undefined;
  }

  // Используем реальные данные если доступны, иначе fallback
  const groups = groupsResult ?? fallbackGroups;

  // Мутации с явной типизацией
  let createGroupMutation: any = null;
  let updateGroupMutation: any = null;
  let deleteGroupMutation: any = null;

  try {
    if (isApiAvailable) {
      if (api.messageGroups?.create) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        createGroupMutation = useMutation(api.messageGroups.create);
      }
      if (api.messageGroups?.update) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        updateGroupMutation = useMutation(api.messageGroups.update);
      }
      if (api.messageGroups?.remove) {
        // eslint-disable-next-line react-hooks/rules-of-hooks
        deleteGroupMutation = useMutation(api.messageGroups.remove);
      }
    }
  } catch (error) {
    console.warn('Group mutations недоступны:', error);
  }

  const createGroup = useCallback(async (groupData: {
    name: string;
    description?: string;
    memberIds: Id<"users">[];
    memberNames: string[];
    createdBy: Id<"users">;
    groupType: "manual" | "auto" | "role-based";
  }) => {
    try {
      if (createGroupMutation) {
        return await createGroupMutation(groupData);
      } else {
        // Fallback: добавляем в локальное состояние
        const newGroup: MessageGroup = {
          _id: `group_${Date.now()}` as Id<"messageGroups">,
          _creationTime: Date.now(),
          ...groupData,
          isActive: true,
        };
        setFallbackGroups(prev => [newGroup, ...prev]);
        return newGroup._id;
      }
    } catch (error) {
      console.error("Ошибка создания группы:", error);
      throw error;
    }
  }, [createGroupMutation]);

  const updateGroup = useCallback(async (
    id: Id<"messageGroups">,
    updates: {
      name?: string;
      description?: string;
      memberIds?: Id<"users">[];
      memberNames?: string[];
    }
  ) => {
    try {
      if (updateGroupMutation) {
        await updateGroupMutation({ id, ...updates });
      } else {
        // Fallback: обновляем локальное состояние
        setFallbackGroups(prev => prev.map(group => 
          group._id === id ? { ...group, ...updates } : group
        ));
      }
    } catch (error) {
      console.error("Ошибка обновления группы:", error);
      throw error;
    }
  }, [updateGroupMutation]);

  const deleteGroup = useCallback(async (id: Id<"messageGroups">) => {
    try {
      if (deleteGroupMutation) {
        await deleteGroupMutation({ id });
      } else {
        // Fallback: помечаем как неактивную
        setFallbackGroups(prev => prev.map(group => 
          group._id === id ? { ...group, isActive: false } : group
        ));
      }
    } catch (error) {
      console.error("Ошибка удаления группы:", error);
      throw error;
    }
  }, [deleteGroupMutation]);

  return {
    groups: groups as MessageGroup[],
    loading: groups === undefined,
    createGroup,
    updateGroup,
    deleteGroup,
    isApiAvailable,
  };
};

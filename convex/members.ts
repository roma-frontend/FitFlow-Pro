// convex/members.ts (исправленная версия)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("members").collect();
  },
});

export const getById = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateLastVisit = mutation({
  args: { 
    memberId: v.id("members"),
    timestamp: v.number()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      lastVisit: args.timestamp
    });
    return args.memberId;
  },
});

export const getByEmail = query({
  args: { email: v.string() },
  handler: async (ctx, args) => {
    console.log('Convex: ищем участника по email:', args.email);
    const member = await ctx.db.query("members")
      .filter((q) => q.eq(q.field("email"), args.email))
      .first();
    console.log('Convex: участник найден:', member ? 'да' : 'нет');
    return member;
  },
});

export const getByPhone = query({
  args: { phone: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("members")
      .filter((q) => q.eq(q.field("phone"), args.phone))
      .first();
  },
});

export const updateRole = mutation({
  args: { 
    memberId: v.id("members"),
    role: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      role: args.role
    });
    return args.memberId;
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    phone: v.string(),
    password: v.string(),
    role: v.optional(v.string()),
    membershipType: v.string(),
    membershipStart: v.number(),
    membershipExpiry: v.number(),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    status: v.string(),
    fitnessGoals: v.optional(v.array(v.string())),
    joinDate: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    const memberData = {
      ...args,
      role: args.role || "member",
      isActive: true,
      updatedAt: Date.now(),
    };
    
    return await ctx.db.insert("members", memberData);
  },
});

export const updateMembership = mutation({
  args: {
    memberId: v.id("members"),
    membership: v.object({
      type: v.string(),
      purchaseId: v.string(),
      startDate: v.number(),
      endDate: v.number(),
      sessionsRemaining: v.number(),
      status: v.string(),
    }),
  },
  handler: async (ctx, args) => {
    console.log('Convex: обновляем абонемент участника:', args.memberId);
    
    await ctx.db.patch(args.memberId, {
      membership: args.membership,
      updatedAt: Date.now(),
    });
    
    console.log('Convex: абонемент участника обновлен');
    return args.memberId;
  },
});

export const update = mutation({
  args: {
    memberId: v.id("members"),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    role: v.optional(v.string()),
    membershipType: v.optional(v.string()),
    emergencyContact: v.optional(v.string()),
    emergencyPhone: v.optional(v.string()),
    status: v.optional(v.string()),
    fitnessGoals: v.optional(v.array(v.string())),
    isActive: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { memberId, ...updateData } = args;
    
    const cleanUpdateData = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined)
    );
    
    if (Object.keys(cleanUpdateData).length > 0) {
      await ctx.db.patch(memberId, {
        ...cleanUpdateData,
        updatedAt: Date.now(),
      });
    }
    
    return memberId;
  },
});

export const deactivate = mutation({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      isActive: false,
      status: "inactive",
      updatedAt: Date.now(),
    });
    return args.memberId;
  },
});

export const activate = mutation({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.memberId, {
      isActive: true,
      status: "active",
      updatedAt: Date.now(),
    });
    return args.memberId;
  },
});

export const getActiveMembers = query({
  handler: async (ctx) => {
    return await ctx.db.query("members")
      .filter((q) => q.eq(q.field("isActive"), true))
      .collect();
  },
});

export const getMembersByStatus = query({
  args: { status: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("members")
      .filter((q) => q.eq(q.field("status"), args.status))
      .collect();
  },
});

export const searchMembers = query({
  args: { 
    searchTerm: v.string(),
    limit: v.optional(v.number())
  },
  handler: async (ctx, args) => {
    const allMembers = await ctx.db.query("members").collect();
    const searchTerm = args.searchTerm.toLowerCase();
    
    const filteredMembers = allMembers.filter(member => {
      const nameMatch = member.name?.toLowerCase().includes(searchTerm) || false;
      const emailMatch = member.email?.toLowerCase().includes(searchTerm) || false;
      const phoneMatch = member.phone?.includes(searchTerm) || false;
      
      return nameMatch || emailMatch || phoneMatch;
    });
    
    return args.limit ? filteredMembers.slice(0, args.limit) : filteredMembers;
  },
});

export const getMemberStats = query({
  handler: async (ctx) => {
    const allMembers = await ctx.db.query("members").collect();
    
    const stats = {
      total: allMembers.length,
      active: allMembers.filter(m => m.isActive && m.status === "active").length,
      inactive: allMembers.filter(m => !m.isActive || m.status === "inactive").length,
      byMembershipType: {} as Record<string, number>,
      byStatus: {} as Record<string, number>,
    };
    
    // Группируем по типу абонемента
    allMembers.forEach(member => {
      const membershipType = member.membershipType || "unknown";
      stats.byMembershipType[membershipType] = (stats.byMembershipType[membershipType] || 0) + 1;
      
      const status = member.status || "unknown";
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;
    });
    
    return stats;
  },
});

export const getExpiringMemberships = query({
  args: { daysAhead: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const daysAhead = args.daysAhead || 7;
    const checkDate = Date.now() + (daysAhead * 24 * 60 * 60 * 1000);
    
    const allMembers = await ctx.db.query("members").collect();
    
    return allMembers.filter(member => {
      // Проверяем новое поле membership
      if (member.membership && member.membership.endDate) {
        return member.membership.endDate <= checkDate && member.membership.status === "active";
      }
      
      // Fallback к старому полю membershipExpiry с проверкой на undefined
      if (member.membershipExpiry && member.status === "active") {
        return member.membershipExpiry <= checkDate;
      }
      
      return false;
    });
  },
});

// Дополнительные функции с безопасными проверками

export const getMembersByMembershipType = query({
  args: { membershipType: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("members")
      .filter((q) => q.eq(q.field("membershipType"), args.membershipType))
      .collect();
  },
});

export const getMembersWithExpiredMemberships = query({
  handler: async (ctx) => {
    const now = Date.now();
    const allMembers = await ctx.db.query("members").collect();
    
    return allMembers.filter(member => {
      // Проверяем новое поле membership
      if (member.membership && member.membership.endDate) {
        return member.membership.endDate < now;
      }
      
      // Fallback к старому полю membershipExpiry с проверкой на undefined
      if (member.membershipExpiry) {
        return member.membershipExpiry < now;
      }
      
      return false;
    });
  },
});

export const updateMembershipExpiry = mutation({
  args: {
    memberId: v.id("members"),
    newExpiryDate: v.number(),
  },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.memberId);
    
    if (!member) {
      throw new Error("Участник не найден");
    }
    
    // Обновляем и новое, и старое поле для совместимости
    const updateData: any = {
      membershipExpiry: args.newExpiryDate,
      updatedAt: Date.now(),
    };
    
    // Если есть объект membership, обновляем и его
    if (member.membership) {
      updateData.membership = {
        ...member.membership,
        endDate: args.newExpiryDate,
      };
    }
    
    await ctx.db.patch(args.memberId, updateData);
    return args.memberId;
  },
});

export const getMemberByIdWithSafeAccess = query({
  args: { id: v.id("members") },
  handler: async (ctx, args) => {
    const member = await ctx.db.get(args.id);
    
    if (!member) {
      return null;
    }
    
    // Возвращаем объект с безопасным доступом к полям
    return {
      ...member,
      safePhone: member.phone || "",
      safeEmail: member.email || "",
      safeMembershipExpiry: member.membershipExpiry || 0,
      hasActiveMembership: member.membership 
        ? member.membership.status === "active" && member.membership.endDate > Date.now()
        : (member.membershipExpiry || 0) > Date.now(),
    };
  },
});

// Функция для безопасного поиска по телефону
export const findMembersByPhonePattern = query({
  args: { phonePattern: v.string() },
  handler: async (ctx, args) => {
    const allMembers = await ctx.db.query("members").collect();
    
    return allMembers.filter(member => {
      if (!member.phone) return false;
      return member.phone.includes(args.phonePattern);
    });
  },
});

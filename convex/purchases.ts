// convex/purchases.ts
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    memberId: v.id("members"),
    memberEmail: v.string(),
    type: v.string(),
    title: v.string(),
    price: v.number(),
    currency: v.string(),
    status: v.string(),
    paymentMethod: v.string(),
    description: v.optional(v.string()),
    metadata: v.optional(v.any()),
    purchaseDate: v.number(),
    createdAt: v.number(),
  },
  handler: async (ctx, args) => {
    console.log('Convex: создаем покупку:', args);
    
    const purchaseId = await ctx.db.insert("purchases", {
      memberId: args.memberId,
      memberEmail: args.memberEmail,
      type: args.type,
      title: args.title,
      price: args.price,
      currency: args.currency,
      status: args.status,
      paymentMethod: args.paymentMethod,
      description: args.description || "",
      metadata: args.metadata || {},
      purchaseDate: args.purchaseDate,
      createdAt: args.createdAt,
    });
    
    console.log('Convex: покупка создана с ID:', purchaseId);
    return purchaseId;
  },
});

export const getByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    console.log('Convex: ищем покупки для участника:', args.memberId);
    
    const purchases = await ctx.db.query("purchases")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .order("desc")
      .collect();
    
    console.log('Convex: найдено покупок:', purchases.length);
    return purchases;
  },
});

export const getById = query({
  args: { id: v.id("purchases") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const updateStatus = mutation({
  args: {
    id: v.id("purchases"),
    status: v.string(),
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, {
      status: args.status,
    });
    return args.id;
  },
});

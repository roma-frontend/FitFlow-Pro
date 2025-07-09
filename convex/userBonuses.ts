import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserBonuses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("userBonuses")
      .filter((q) => q.eq(q.field("userId"), identity.subject))
      .order("desc")
      .collect();
  },
});

export const createUserBonus = mutation({
  args: {
    type: v.union(v.literal("discount"), v.literal("product"), v.literal("session"), v.literal("badge")),
    value: v.string(),
    description: v.string(),
    expiresAt: v.number(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db.insert("userBonuses", {
      userId: identity.subject,
      type: args.type,
      value: args.value,
      description: args.description,
      isUsed: false,
      expiresAt: args.expiresAt,
      createdAt: Date.now(),
    });
  },
});

export const useBonus = mutation({
  args: {
    bonusId: v.id("userBonuses"),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    const bonus = await ctx.db.get(args.bonusId);
    if (!bonus) {
      throw new Error("Bonus not found");
    }

    if (bonus.userId !== identity.subject) {
      throw new Error("Not authorized to use this bonus");
    }

    if (bonus.isUsed) {
      throw new Error("Bonus has already been used");
    }

    if (bonus.expiresAt < Date.now()) {
      throw new Error("Bonus has expired");
    }

    await ctx.db.patch(args.bonusId, {
      isUsed: true,
    });

    return bonus;
  },
});

export const getAvailableBonuses = query({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Not authenticated");
    }

    return await ctx.db
      .query("userBonuses")
      .filter((q) => 
        q.and(
          q.eq(q.field("userId"), identity.subject),
          q.eq(q.field("isUsed"), false),
          q.gt(q.field("expiresAt"), Date.now())
        )
      )
      .order("desc")
      .collect();
  },
});
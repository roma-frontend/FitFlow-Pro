import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getByMemberSince = query({
  args: { 
    memberId: v.string(),
    since: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("visits")
      .filter((q) => q.and(
        q.eq(q.field("memberId"), args.memberId),
        q.gte(q.field("timestamp"), args.since)
      ))
      .order("desc")
      .collect();
  },
});

export const getByDateRange = query({
  args: { 
    start: v.number(),
    end: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("visits")
      .filter((q) => q.and(
        q.gte(q.field("timestamp"), args.start),
        q.lte(q.field("timestamp"), args.end)
      ))
      .order("desc")
      .collect();
  },
});

export const getRecent = query({
  args: { limit: v.number() },
  handler: async (ctx, args) => {
    return await ctx.db.query("visits")
      .order("desc")
      .take(args.limit);
  },
});
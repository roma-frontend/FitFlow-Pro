// convex/programBookings.ts (новый файл)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const create = mutation({
  args: {
    memberId: v.id("members"),
    programId: v.string(),
    programTitle: v.string(),
    sessionIndex: v.number(),
    sessionType: v.string(),
    instructor: v.string(),
    startTime: v.number(),
    endTime: v.number(),
    duration: v.number(),
    price: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("programBookings", {
      ...args,
      status: "confirmed",
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const getByMember = query({
  args: { memberId: v.id("members") },
  handler: async (ctx, args) => {
    return await ctx.db.query("programBookings")
      .filter((q) => q.eq(q.field("memberId"), args.memberId))
      .order("desc")
      .collect();
  },
});

export const getByProgram = query({
  args: { programId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db.query("programBookings")
      .filter((q) => q.eq(q.field("programId"), args.programId))
      .order("desc")
      .collect();
  },
});

export const updateStatus = mutation({
  args: { 
    bookingId: v.id("programBookings"),
    status: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.bookingId, {
      status: args.status,
      updatedAt: Date.now(),
    });
    return args.bookingId;
  },
});

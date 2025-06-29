// convex/classes.ts (новый файл)
import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const getAll = query({
  handler: async (ctx) => {
    return await ctx.db.query("classes")
      .filter((q) => q.neq(q.field("status"), "cancelled"))
      .order("asc")
      .collect();
  },
});

export const getById = query({
  args: { id: v.id("classes") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

export const getUpcoming = query({
  handler: async (ctx) => {
    const now = Date.now();
    return await ctx.db.query("classes")
      .filter((q) => q.and(
        q.gte(q.field("startTime"), now),
        q.eq(q.field("status"), "scheduled")
      ))
      .order("asc")
      .collect();
  },
});

export const getByDateRange = query({
  args: { 
    start: v.number(),
    end: v.number()
  },
  handler: async (ctx, args) => {
    return await ctx.db.query("classes")
      .filter((q) => q.and(
        q.gte(q.field("startTime"), args.start),
        q.lte(q.field("startTime"), args.end),
        q.eq(q.field("status"), "scheduled")
      ))
      .order("asc")
      .collect();
  },
});

export const getByInstructor = query({
  args: { instructorId: v.id("trainers") },
  handler: async (ctx, args) => {
    return await ctx.db.query("classes")
      .filter((q) => q.eq(q.field("instructorId"), args.instructorId))
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    name: v.string(),
    description: v.optional(v.string()),
    instructorId: v.id("trainers"),
    startTime: v.number(),
    endTime: v.number(),
    location: v.string(),
    capacity: v.number(),
    difficulty: v.string(),
    equipment: v.optional(v.array(v.string())),
    price: v.number(),
    isRecurring: v.boolean(),
    recurringPattern: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("classes", {
      ...args,
      enrolled: [],
      waitlist: [],
      status: "scheduled",
      createdAt: Date.now(),
    });
    }
});

export const updateEnrollment = mutation({
  args: { 
    classId: v.id("classes"),
    enrolled: v.array(v.id("members")),
    waitlist: v.optional(v.array(v.id("members")))
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.classId, {
      enrolled: args.enrolled,
      waitlist: args.waitlist || [],
    });
    return args.classId;
  },
});

export const updateStatus = mutation({
  args: { 
    classId: v.id("classes"),
    status: v.string()
  },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.classId, {
      status: args.status,
    });
    return args.classId;
  },
});

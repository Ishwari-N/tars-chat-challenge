import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const store = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      throw new Error("Called storeUser without authenticated user");
    }

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (user !== null) {
      // If we've seen this user before, update their info
      await ctx.db.patch(user._id, {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        lastSeen: Date.now(),
      });
      return user._id;
    }

    // If it's a new user, create them
    return await ctx.db.insert("users", {
      name: args.name,
      email: args.email,
      imageUrl: args.imageUrl,
      clerkId: args.clerkId,
      lastSeen: Date.now(),
    });
  },
});

export const getMe = query({
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) {
      return null;
    }

    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();
  },
});

export const list = query({
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

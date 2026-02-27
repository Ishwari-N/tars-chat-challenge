import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const storeUser = mutation({
  args: {
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    clerkId: v.string(),
  },
  handler: async (ctx, args) => {
    console.log("Server-side Identity:", await ctx.auth.getUserIdentity());
    const identity = await ctx.auth.getUserIdentity();

    if (!identity) {
      console.log("Auth failed: No identity found");
      throw new Error("UNAUTHENTICATED: storeUser called without a valid Clerk session");
    }

    console.log("Identity subject (clerkId):", identity.subject);

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
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
    try {
      return await ctx.db.insert("users", {
        name: args.name,
        email: args.email,
        imageUrl: args.imageUrl,
        clerkId: identity.subject,
        lastSeen: Date.now(),
      });
    } catch (error) {
      throw new Error(`CRITICAL_INSERT_FAILURE: Failed to create user record in Convex: ${error}`);
    }
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
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return [];

    const users = await ctx.db.query("users").collect();
    return users.filter(u => u.clerkId !== identity.subject);
  },
});

export const updatePresence = mutation({
  args: {},
  handler: async (ctx) => {
    const identity = await ctx.auth.getUserIdentity();
    if (!identity) return;

    const user = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
      .unique();

    if (user) {
      await ctx.db.patch(user._id, {
        lastSeen: Date.now(),
      });
    }
  },
});

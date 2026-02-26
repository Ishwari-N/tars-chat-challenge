import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getOrCreateConversation = mutation({
    args: {
        userId: v.id("users"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            throw new Error("Not authenticated");
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) {
            throw new Error("User not found");
        }

        // Check if conversation already exists
        const existingConversation = await ctx.db
            .query("conversations")
            .filter((q) =>
                q.and(
                    q.or(
                        q.eq(q.field("participants"), [currentUser._id, args.userId]),
                        q.eq(q.field("participants"), [args.userId, currentUser._id])
                    )
                )
            )
            .unique();

        if (existingConversation) {
            return existingConversation._id;
        }

        // Otherwise create new one
        return await ctx.db.insert("conversations", {
            participants: [currentUser._id, args.userId],
        });
    },
});

export const list = query({
    handler: async (ctx) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) {
            return [];
        }

        const currentUser = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!currentUser) {
            return [];
        }

        // In a real app, you'd use a many-to-many table for participants to index this.
        // For this initialization, we fetch all and can filter in the handler or frontend.
        const allConversations = await ctx.db.query("conversations").collect();

        return allConversations.filter(conv =>
            conv.participants.includes(currentUser._id)
        );
    },
});

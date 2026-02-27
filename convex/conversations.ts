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

        // Check if conversation already exists (DM between these two users)
        const allConversations = await ctx.db.query("conversations").collect();
        const existingConversation = allConversations.find(
            (conv) =>
                !conv.isGroup &&
                conv.participants.length === 2 &&
                conv.participants.includes(currentUser._id) &&
                conv.participants.includes(args.userId)
        );

        if (existingConversation) {
            return existingConversation._id;
        }

        // Otherwise create new one
        const conversationId = await ctx.db.insert("conversations", {
            participants: [currentUser._id, args.userId],
            isGroup: false,
            typing: [],
            lastRead: {},
        });
        return conversationId;
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

export const setTyping = mutation({
    args: {
        conversationId: v.id("conversations"),
        isTyping: v.boolean(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        const typing = new Set(conversation.typing || []);
        if (args.isTyping) {
            typing.add(user._id);
        } else {
            typing.delete(user._id);
        }

        await ctx.db.patch(args.conversationId, {
            typing: Array.from(typing),
        });
    },
});

export const markRead = mutation({
    args: {
        conversationId: v.id("conversations"),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return;

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) return;

        const conversation = await ctx.db.get(args.conversationId);
        if (!conversation) return;

        const lastRead = { ...(conversation.lastRead || {}) };
        lastRead[user._id] = Date.now();

        await ctx.db.patch(args.conversationId, {
            lastRead,
        });
    },
});

export const createGroup = mutation({
    args: {
        name: v.string(),
        userIds: v.array(v.id("users")),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const me = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!me) throw new Error("User not found");

        // Ensure current user is in participants
        const participants = Array.from(new Set([...args.userIds, me._id]));

        return await ctx.db.insert("conversations", {
            name: args.name,
            participants,
            isGroup: true,
            typing: [],
            lastRead: {},
        });
    },
});

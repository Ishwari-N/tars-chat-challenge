import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getUnreadCount = query({
    args: {
        conversationId: v.id("conversations"),
        lastReadTimestamp: v.number(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return 0;

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return messages.filter(
            (m) => m._creationTime > args.lastReadTimestamp && !m.isDeleted
        ).length;
    },
});

export const list = query({
    args: { conversationId: v.id("conversations") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) return [];

        const messages = await ctx.db
            .query("messages")
            .withIndex("by_conversation", (q) => q.eq("conversationId", args.conversationId))
            .collect();

        return messages;
    },
});

export const send = mutation({
    args: {
        conversationId: v.id("conversations"),
        body: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const messageId = await ctx.db.insert("messages", {
            conversationId: args.conversationId,
            senderId: user._id,
            body: args.body,
            isDeleted: false,
            reactions: [],
        });

        // Update the conversation's last message preview
        await ctx.db.patch(args.conversationId, {
            lastMessage: args.body,
            lastMessageAt: Date.now(),
        });

        return messageId;
    },
});

export const deleteMessage = mutation({
    args: { messageId: v.id("messages") },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message || message.senderId !== user._id) {
            throw new Error("Unauthorized or message not found");
        }

        await ctx.db.patch(args.messageId, {
            isDeleted: true,
            // We keep the body but UI will hide it
        });
    },
});

export const toggleReaction = mutation({
    args: {
        messageId: v.id("messages"),
        emoji: v.string(),
    },
    handler: async (ctx, args) => {
        const identity = await ctx.auth.getUserIdentity();
        if (!identity) throw new Error("Not authenticated");

        const user = await ctx.db
            .query("users")
            .withIndex("by_clerkId", (q) => q.eq("clerkId", identity.subject))
            .unique();

        if (!user) throw new Error("User not found");

        const message = await ctx.db.get(args.messageId);
        if (!message) throw new Error("Message not found");

        const reactions = message.reactions || [];
        const reactionIndex = reactions.findIndex((r) => r.emoji === args.emoji);

        if (reactionIndex > -1) {
            const reaction = reactions[reactionIndex];
            const userIndex = reaction.users.indexOf(user._id);

            if (userIndex > -1) {
                // Remove user's reaction
                reaction.users.splice(userIndex, 1);
                if (reaction.users.length === 0) {
                    reactions.splice(reactionIndex, 1);
                }
            } else {
                // Add user to existing emoji reaction
                reaction.users.push(user._id);
            }
        } else {
            // Add new emoji reaction
            reactions.push({
                emoji: args.emoji,
                users: [user._id],
            });
        }

        await ctx.db.patch(args.messageId, { reactions });
    },
});

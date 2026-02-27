import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
    imageUrl: v.string(),
    lastSeen: v.number(),
  }).index("by_clerkId", ["clerkId"]),

  conversations: defineTable({
    participants: v.array(v.id("users")),
    isGroup: v.boolean(),
    name: v.optional(v.string()),
    lastMessage: v.optional(v.string()),
    lastMessageAt: v.optional(v.number()),
    typing: v.optional(v.array(v.id("users"))),
    lastRead: v.optional(v.any()), // Map of userId -> timestamp
  }),

  messages: defineTable({
    conversationId: v.id("conversations"),
    senderId: v.id("users"),
    body: v.string(),
    isDeleted: v.boolean(),
    reactions: v.optional(v.array(v.object({
      emoji: v.string(),
      users: v.array(v.id("users")),
    }))),
  }).index("by_conversation", ["conversationId"]),
});

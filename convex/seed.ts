import { mutation } from "./_generated/server";

// Demo avatar images from UI Avatars (no external images needed, uses initials)
const DEMO_USERS = [
    {
        name: "Alex Carter",
        email: "alex.carter@demo.tarschat.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=AlexCarter&backgroundColor=b6e3f4",
        clerkId: "demo_alex_carter_001",
    },
    {
        name: "Priya Sharma",
        email: "priya.sharma@demo.tarschat.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=PriyaSharma&backgroundColor=ffd5dc",
        clerkId: "demo_priya_sharma_002",
    },
    {
        name: "Marcus Johnson",
        email: "marcus.j@demo.tarschat.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=MarcusJohnson&backgroundColor=d1d4f9",
        clerkId: "demo_marcus_johnson_003",
    },
    {
        name: "Sofia Chen",
        email: "sofia.chen@demo.tarschat.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=SofiaChen&backgroundColor=c0aede",
        clerkId: "demo_sofia_chen_004",
    },
    {
        name: "Liam O'Brien",
        email: "liam.obrien@demo.tarschat.com",
        imageUrl: "https://api.dicebear.com/7.x/avataaars/svg?seed=LiamOBrien&backgroundColor=b6e3f4",
        clerkId: "demo_liam_obrien_005",
    },
];

export const seedDemoUsers = mutation({
    args: {},
    handler: async (ctx) => {
        let added = 0;
        for (const demoUser of DEMO_USERS) {
            // Check if this demo user already exists
            const existing = await ctx.db
                .query("users")
                .withIndex("by_clerkId", (q) => q.eq("clerkId", demoUser.clerkId))
                .unique();

            if (!existing) {
                await ctx.db.insert("users", {
                    ...demoUser,
                    lastSeen: Date.now() - Math.random() * 3600000, // Random: 0-60 min ago (some online, some not)
                });
                added++;
            }
        }

        return { added, total: DEMO_USERS.length };
    },
});

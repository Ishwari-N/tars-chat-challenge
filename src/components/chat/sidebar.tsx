"use client";

import { useState } from "react";
// useQuery imported below with useMutation
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Search, Users, UserPlus, Hash, Sparkles, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useMutation, useQuery } from "convex/react";

// Skeleton for loading state
const ConversationSkeleton = () => (
    <div className="flex items-center gap-4 p-4 rounded-[1.8rem] animate-pulse">
        <div className="w-12 h-12 rounded-2xl bg-white/[0.05] shrink-0" />
        <div className="flex-1 space-y-2">
            <div className="h-3 bg-white/[0.05] rounded-full w-3/4" />
            <div className="h-2 bg-white/[0.03] rounded-full w-1/2" />
        </div>
    </div>
);

// Conversation item with its own unread count hook
const ConversationItem = ({
    conv,
    me,
    users,
    isSelected,
    onSelect,
}: {
    conv: any;
    me: any;
    users: any[];
    isSelected: boolean;
    onSelect: () => void;
}) => {
    const lastRead = conv.lastRead?.[me?._id] || 0;
    const unreadCount = useQuery(
        api.messages.getUnreadCount,
        conv._id && me ? { conversationId: conv._id, lastReadTimestamp: lastRead } : "skip"
    ) ?? 0;

    const otherUser = users?.find((u) => conv.participants.includes(u._id) && u._id !== me?._id);
    const isOnline = !conv.isGroup && otherUser?.lastSeen && Date.now() - otherUser.lastSeen < 60000;

    return (
        <button
            onClick={onSelect}
            className={cn(
                "w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all duration-300 group relative border",
                isSelected
                    ? "bg-indigo-600 border-indigo-500/50 text-white shadow-[0_20px_40px_-10px_rgba(79,70,229,0.5)] scale-[1.02]"
                    : "hover:bg-white/[0.06] border-transparent text-slate-400 hover:text-white"
            )}
        >
            {/* Avatar */}
            <div className="relative shrink-0">
                {conv.isGroup ? (
                    <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                        <Users className="text-indigo-400 w-6 h-6" />
                    </div>
                ) : (
                    <img
                        src={otherUser?.imageUrl}
                        className="w-12 h-12 rounded-2xl object-cover shadow-2xl border border-white/10"
                        alt=""
                    />
                )}
                {!conv.isGroup && (
                    <div className={cn(
                        "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#020617] rounded-full shadow-lg",
                        isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-600"
                    )} />
                )}
            </div>

            {/* Text */}
            <div className="text-left min-w-0 flex-1">
                <p className={cn(
                    "font-display font-black truncate text-sm tracking-tight",
                    unreadCount > 0 && !isSelected ? "text-white" : ""
                )}>
                    {conv.isGroup ? conv.name : otherUser?.name}
                </p>
                <p className={cn(
                    "text-[10px] truncate font-bold uppercase tracking-widest mt-0.5",
                    unreadCount > 0 && !isSelected ? "opacity-80" : "opacity-50"
                )}>
                    {conv.lastMessage || (conv.isGroup ? `${conv.participants.length} members` : "New conversation")}
                </p>
            </div>

            {/* Numeric unread badge */}
            {unreadCount > 0 && !isSelected && (
                <div className="shrink-0 min-w-[22px] h-[22px] px-1.5 bg-indigo-500 rounded-full shadow-[0_0_15px_rgba(99,102,241,0.6)] flex items-center justify-center">
                    <span className="text-[10px] font-black text-white leading-none">
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                </div>
            )}
        </button>
    );
};

export const Sidebar = ({
    onSelectConversation,
    onSelectUser,
    selectedConversationId,
}: {
    onSelectConversation: (id: string) => void;
    onSelectUser: (id: string) => void;
    selectedConversationId?: string;
}) => {
    const { user: clerkUser } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const [isCreatingGroup, setIsCreatingGroup] = useState(false);
    const [groupName, setGroupName] = useState("");
    const [selectedGroupUsers, setSelectedGroupUsers] = useState<string[]>([]);

    const users = useQuery(api.users.list);
    const conversations = useQuery(api.conversations.list);
    const me = useQuery(api.users.getMe);
    const createGroup = useMutation(api.conversations.createGroup);
    const seedDemoUsers = useMutation(api.seed.seedDemoUsers);
    const [isSeeding, setIsSeeding] = useState(false);

    const handleSeed = async () => {
        setIsSeeding(true);
        try {
            await seedDemoUsers({});
        } catch (e) {
            console.error(e);
        } finally {
            setIsSeeding(false);
        }
    };

    const filteredUsers = users?.filter(
        (u) =>
            u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleCreateGroup = async () => {
        if (!groupName.trim() || selectedGroupUsers.length === 0) return;
        try {
            const id = await createGroup({
                name: groupName,
                userIds: selectedGroupUsers as any[],
            });
            onSelectConversation(id);
            setIsCreatingGroup(false);
            setGroupName("");
            setSelectedGroupUsers([]);
        } catch (error) {
            console.error(error);
        }
    };

    const isLoading = conversations === undefined;

    return (
        <aside className="w-full md:w-80 flex flex-col glass-panel h-screen relative z-20 border-r-0">
            {/* Header */}
            <div className="p-8 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <UserButton afterSignOutUrl="/" />
                    <div className="min-w-0">
                        <p className="text-sm font-display font-black truncate text-white tracking-tight">
                            {clerkUser?.fullName}
                        </p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse" />
                            <p className="text-[9px] text-emerald-400 font-black uppercase tracking-[0.2em]">Online</p>
                        </div>
                    </div>
                </div>
                <button
                    onClick={() => setIsCreatingGroup(!isCreatingGroup)}
                    className={cn(
                        "p-3 rounded-2xl transition-all",
                        isCreatingGroup
                            ? "bg-indigo-600 text-white"
                            : "glass-card text-slate-400 hover:text-white"
                    )}
                    title="Create Group Chat"
                >
                    <UserPlus size={20} />
                </button>
            </div>

            {/* Group creation panel */}
            {isCreatingGroup ? (
                <div className="p-6 flex flex-col gap-4 animate-in slide-in-from-top-4">
                    <div className="flex items-center gap-2 mb-1">
                        <Users size={14} className="text-indigo-400" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400">New Group</span>
                    </div>
                    <input
                        className="bg-white/5 border border-white/10 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-500/50 placeholder:text-slate-600"
                        placeholder="Group name..."
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                    />
                    <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-1">Select Members</div>
                    <ScrollArea className="h-44">
                        <div className="space-y-1">
                            {users?.map((u) => (
                                <label
                                    key={u._id}
                                    className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-lg cursor-pointer transition-all"
                                >
                                    <input
                                        type="checkbox"
                                        checked={selectedGroupUsers.includes(u._id)}
                                        onChange={(e) => {
                                            if (e.target.checked)
                                                setSelectedGroupUsers([...selectedGroupUsers, u._id]);
                                            else
                                                setSelectedGroupUsers(selectedGroupUsers.filter((id) => id !== u._id));
                                        }}
                                        className="w-4 h-4 rounded border-white/10 bg-white/5 accent-indigo-500"
                                    />
                                    <img src={u.imageUrl} alt="" className="w-7 h-7 rounded-xl object-cover" />
                                    <span className="text-sm text-slate-300">{u.name}</span>
                                </label>
                            ))}
                        </div>
                    </ScrollArea>
                    <div className="flex gap-2">
                        <button
                            onClick={() => {
                                setIsCreatingGroup(false);
                                setGroupName("");
                                setSelectedGroupUsers([]);
                            }}
                            className="flex-1 py-3 rounded-xl border border-white/10 text-slate-400 font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreateGroup}
                            disabled={!groupName.trim() || selectedGroupUsers.length === 0}
                            className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            Create ({selectedGroupUsers.length})
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* Search */}
                    <div className="p-6 pb-2">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                            <Input
                                className="pl-11 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-600 rounded-2xl focus:ring-indigo-500/20 focus:bg-white/[0.06]"
                                placeholder="Search people..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <ScrollArea className="flex-1 px-4">
                        <div className="pb-10 space-y-1 pt-2">
                            {searchTerm ? (
                                /* Search results */
                                filteredUsers === undefined ? (
                                    [1, 2, 3].map((i) => <ConversationSkeleton key={i} />)
                                ) : filteredUsers.length > 0 ? (
                                    filteredUsers.map((u) => {
                                        const online = Date.now() - u.lastSeen < 60000;
                                        return (
                                            <button
                                                key={u._id}
                                                onClick={() => onSelectUser(u._id)}
                                                className="w-full flex items-center gap-4 p-4 rounded-[1.8rem] transition-all hover:bg-white/5 text-slate-400 hover:text-white group border border-transparent"
                                            >
                                                <div className="relative shrink-0">
                                                    <img src={u.imageUrl} className="w-12 h-12 rounded-2xl object-cover" alt="" />
                                                    <div className={cn(
                                                        "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#020617] rounded-full",
                                                        online ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-600"
                                                    )} />
                                                </div>
                                                <div className="text-left min-w-0 flex-1">
                                                    <p className="font-display font-black truncate text-sm tracking-tight">{u.name}</p>
                                                    <p className="text-[10px] opacity-60 truncate font-bold uppercase tracking-widest mt-0.5">
                                                        {online ? "Online now" : "Click to message"}
                                                    </p>
                                                </div>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="py-20 text-center animate-in fade-in zoom-in-95 duration-700 flex flex-col items-center">
                                        <div className="w-16 h-16 bg-white/[0.02] border border-white/5 rounded-[2rem] flex items-center justify-center mx-auto mb-6">
                                            <Search className="text-slate-600 w-6 h-6" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-6">
                                            No users found for<br />&ldquo;{searchTerm}&rdquo;
                                        </p>
                                        {users !== undefined && users.length === 0 && (
                                            <button
                                                onClick={handleSeed}
                                                disabled={isSeeding}
                                                className="flex items-center gap-2 px-5 py-3 bg-indigo-600/20 border border-indigo-500/30 rounded-2xl text-[10px] font-black uppercase tracking-widest text-indigo-400 hover:bg-indigo-600/30 hover:text-indigo-300 transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {isSeeding ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                                                {isSeeding ? "Loading..." : "Load Demo Users"}
                                            </button>
                                        )}
                                    </div>
                                )
                            ) : /* Conversations (or skeleton) */
                                isLoading ? (
                                    [1, 2, 3, 4].map((i) => <ConversationSkeleton key={i} />)
                                ) : conversations.length > 0 ? (
                                    conversations
                                        .slice()
                                        .sort((a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0))
                                        .map((conv) => (
                                            <ConversationItem
                                                key={conv._id}
                                                conv={conv}
                                                me={me}
                                                users={users || []}
                                                isSelected={selectedConversationId === conv._id}
                                                onSelect={() => onSelectConversation(conv._id)}
                                            />
                                        ))
                                ) : (
                                    <div className="py-20 text-center animate-in fade-in zoom-in-95 duration-1000 flex flex-col items-center">
                                        <div className="w-20 h-20 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                            <Hash className="text-indigo-400/30 w-8 h-8" />
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600 leading-loose px-8 mb-6">
                                            No conversations yet.<br />Search for someone<br />to get started.
                                        </p>
                                        {/* Seed button — only shown when no other users exist */}
                                        {users !== undefined && users.length === 0 && (
                                            <button
                                                onClick={handleSeed}
                                                disabled={isSeeding}
                                                className="flex items-center gap-3 px-6 py-4 bg-indigo-600 text-white rounded-2xl text-[11px] font-black uppercase tracking-widest hover:bg-indigo-500 hover:scale-105 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 disabled:opacity-50"
                                            >
                                                {isSeeding ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
                                                {isSeeding ? "Seeding Demo Data..." : "Load 5 Demo Users"}
                                            </button>
                                        )}
                                    </div>
                                )}
                        </div>
                    </ScrollArea>
                </>
            )}
        </aside>
    );
};

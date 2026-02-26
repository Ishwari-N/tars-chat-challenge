"use client";

import { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { cn } from "@/lib/utils";
import { UserButton, useUser } from "@clerk/nextjs";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const Sidebar = ({ onSelectConversation, selectedConversationId }: {
    onSelectConversation: (id: string) => void,
    selectedConversationId?: string
}) => {
    const { user } = useUser();
    const [searchTerm, setSearchTerm] = useState("");
    const users = useQuery(api.users.list);

    const filteredUsers = users?.filter(u =>
        u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <aside className="w-full md:w-80 flex flex-col bg-slate-900/40 backdrop-blur-3xl border-r border-white/5 h-screen relative z-20">
            <div className="p-6 border-b border-white/5 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="relative group">
                        <div className="absolute -inset-1 bg-gradient-to-tr from-indigo-500 to-violet-500 rounded-2xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
                        <div className="relative">
                            <UserButton afterSignOutUrl="/" />
                        </div>
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold truncate text-white tracking-tight">{user?.fullName}</p>
                        <div className="flex items-center gap-1.5">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            <p className="text-[10px] text-emerald-400 font-black uppercase tracking-[0.2em]">Active</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-4">
                <div className="relative group">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
                    <Input
                        className="pl-10 h-12 bg-white/[0.03] border-white/10 text-white placeholder:text-slate-500 rounded-2xl focus:ring-indigo-500/20 focus:bg-white/[0.05] transition-all"
                        placeholder="Search system..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <ScrollArea className="flex-1 px-3">
                <div className="pb-6 space-y-2">
                    {filteredUsers?.map((u) => (
                        <button
                            key={u._id}
                            onClick={() => onSelectConversation(u._id)}
                            className={cn(
                                "w-full flex items-center gap-4 p-4 rounded-[1.5rem] transition-all duration-300 group relative overflow-hidden",
                                selectedConversationId === u._id
                                    ? "bg-indigo-600 text-white shadow-[0_20px_40px_rgba(79,70,229,0.3)] scale-[1.02]"
                                    : "hover:bg-white/[0.05] text-slate-400 hover:text-white"
                            )}
                        >
                            <div className="relative shrink-0">
                                <img src={u.imageUrl} className="w-12 h-12 rounded-2xl object-cover shadow-2xl" alt="" />
                                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#020617] rounded-full" />
                            </div>
                            <div className="text-left min-w-0 flex-1">
                                <p className="font-bold truncate text-sm tracking-tight">{u.name}</p>
                                <p className="text-[11px] opacity-60 truncate font-medium">Encrypted Link Active</p>
                            </div>
                            {selectedConversationId === u._id && (
                                <div className="absolute right-4 w-1.5 h-1.5 rounded-full bg-white animate-ping"></div>
                            )}
                        </button>
                    ))}
                </div>
            </ScrollArea>
        </aside>
    );
};



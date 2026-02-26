"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { SyncUser } from "@/components/auth/sync-user";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";

export default function DashboardPage() {
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const users = useQuery(api.users.list);
  const startConversation = useMutation(api.conversations.getOrCreateConversation);

  const selectedUser = users?.find(u => u._id === selectedUserId);

  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    // Initialize or get conversation in background
    try {
      await startConversation({ userId: id as any });
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden relative">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-dot-grid opacity-[0.03] pointer-events-none" />
      <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none animate-glow" />

      <SyncUser />

      {/* Responsive Layout */}
      <div className="flex flex-1 w-full relative z-10 backdrop-blur-3xl">
        {/* Sidebar */}
        <div className={selectedUserId ? "hidden md:block" : "block w-full md:w-auto"}>
          <Sidebar
            selectedConversationId={selectedUserId || undefined}
            onSelectConversation={handleSelectUser}
          />
        </div>

        {/* Chat Area */}
        <div className={selectedUserId ? "flex-1 flex" : "hidden md:flex flex-1"}>
          <ChatArea selectedUser={selectedUser} />
        </div>

        {/* Mobile Navigation */}
        {selectedUserId && (
          <button
            onClick={() => setSelectedUserId(null)}
            className="md:hidden absolute top-5 left-5 z-50 p-4 bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-white/10 text-white shadow-2xl active:scale-95 transition-all"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

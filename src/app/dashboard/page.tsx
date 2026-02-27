"use client";

import { useState } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Sidebar } from "@/components/chat/sidebar";
import { ChatArea } from "@/components/chat/chat-area";
import { useEffect } from "react";

export default function DashboardPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);

  const users = useQuery(api.users.list);
  const conversations = useQuery(api.conversations.list);
  const startConversation = useMutation(api.conversations.getOrCreateConversation);
  const updatePresence = useMutation(api.users.updatePresence);
  const me = useQuery(api.users.getMe);

  const activeConversation = conversations?.find(c => c._id === selectedConversationId);

  // If no conversation selected but a user is, try to find the conversation
  useEffect(() => {
    if (selectedUserId && !selectedConversationId && conversations) {
      const conv = conversations.find(c => !c.isGroup && c.participants.includes(selectedUserId as any));
      if (conv) setSelectedConversationId(conv._id);
    }
  }, [selectedUserId, selectedConversationId, conversations]);

  // Presence logic: Update every 45 seconds
  useEffect(() => {
    updatePresence();
    const interval = setInterval(() => updatePresence(), 45000);
    return () => clearInterval(interval);
  }, [updatePresence]);

  const handleSelectUser = async (id: string) => {
    setSelectedUserId(id);
    try {
      const convId = await startConversation({ userId: id as any });
      setSelectedConversationId(convId);
    } catch (error) {
      console.error("Failed to start conversation:", error);
    }
  };

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    const conv = conversations?.find(c => c._id === id);
    if (conv && !conv.isGroup) {
      const otherId = conv.participants.find(p => p !== me?._id);
      setSelectedUserId(otherId as string);
    } else {
      setSelectedUserId(null); // It's a group
    }
  };

  return (
    <div className="flex h-screen bg-[#020617] overflow-hidden relative font-sans">
      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-[0.05] pointer-events-none" />
      <div className="absolute inset-0 bg-dot-grid opacity-[0.02] pointer-events-none" />

      {/* Dynamic Light Leaks */}
      <div className="absolute top-[-15%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[140px] pointer-events-none animate-glow" />
      <div className="absolute bottom-[10%] right-[-5%] w-[600px] h-[600px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none animate-glow [animation-delay:2s]" />
      <div className="absolute top-[40%] left-[20%] w-[400px] h-[400px] bg-indigo-400/5 rounded-full blur-[100px] pointer-events-none animate-float" />

      {/* Responsive Layout */}
      <div className="flex flex-1 w-full relative z-10">
        {/* Sidebar — full width on mobile when no conv selected, fixed width on desktop */}
        <div className={`
          ${selectedConversationId ? "hidden md:flex" : "flex w-full md:w-80"}
          flex-col shrink-0
        `}>
          <Sidebar
            selectedConversationId={selectedConversationId || undefined}
            onSelectConversation={handleSelectConversation}
            onSelectUser={handleSelectUser}
          />
        </div>

        {/* Chat Area — hidden on mobile until conv selected, always visible on desktop */}
        <div className={`
          ${selectedConversationId ? "flex" : "hidden md:flex"}
          flex-1
        `}>
          <ChatArea
            conversationId={selectedConversationId || undefined}
          />
        </div>


        {/* Mobile Navigation */}
        {selectedConversationId && (
          <button
            onClick={() => {
              setSelectedConversationId(null);
              setSelectedUserId(null);
            }}
            className="md:hidden absolute top-8 left-8 z-50 p-4 glass-card rounded-2xl text-white shadow-2xl active:scale-95 transition-all group"
          >
            <svg className="group-hover:-translate-x-1 transition-transform" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><path d="m15 18-6-6 6-6" /></svg>
          </button>
        )}
      </div>
    </div>
  );
}

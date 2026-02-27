"use client";

import { Send, Smile, Sparkles, ArrowDown, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatTimestamp } from "@/lib/utils";
import { Trash2, Users } from "lucide-react";

// Skeleton component for loading messages
const MessageSkeleton = ({ fromMe }: { fromMe: boolean }) => (
    <div className={cn("max-w-[60%] flex flex-col gap-2 animate-pulse", fromMe ? "self-end items-end" : "self-start items-start")}>
        <div className={cn("h-10 rounded-[2rem] bg-white/[0.04]", fromMe ? "w-48 rounded-tr-none" : "w-56 rounded-tl-none")} />
        <div className="h-2 w-16 bg-white/[0.02] rounded-full" />
    </div>
);

export const ChatArea = ({ conversationId }: { conversationId?: string }) => {
    const { user: clerkUser } = useUser();
    const [message, setMessage] = useState("");
    const [isAtBottom, setIsAtBottom] = useState(true);
    const [showNewMessagesBtn, setShowNewMessagesBtn] = useState(false);
    const [sendError, setSendError] = useState<string | null>(null);
    const [pendingMessage, setPendingMessage] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);

    const activeConversation = useQuery(api.conversations.list)?.find(c => c._id === conversationId);
    const messages = useQuery(api.messages.list, conversationId ? { conversationId: conversationId as any } : "skip");
    const users = useQuery(api.users.list);
    const meAsUser = useQuery(api.users.getMe);

    const sendMessage = useMutation(api.messages.send);
    const setTyping = useMutation(api.conversations.setTyping);
    const markRead = useMutation(api.conversations.markRead);
    const toggleReaction = useMutation(api.messages.toggleReaction);
    const deleteMessage = useMutation(api.messages.deleteMessage);

    const scrollRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

    // Derived values
    const otherUser = !activeConversation?.isGroup
        ? users?.find(u => activeConversation?.participants.includes(u._id) && u._id !== meAsUser?._id)
        : null;

    const isOnline = otherUser?.lastSeen && (Date.now() - otherUser.lastSeen < 60000);
    const typingUsers = users?.filter(u => activeConversation?.typing?.includes(u._id) && u._id !== meAsUser?._id);

    // Auto-scroll logic: scroll to bottom on new messages if we're already at the bottom
    useEffect(() => {
        if (isAtBottom && scrollRef.current) {
            scrollRef.current.scrollIntoView({ behavior: "smooth" });
            setShowNewMessagesBtn(false);
        } else if (messages && messages.length > 0 && !isAtBottom) {
            setShowNewMessagesBtn(true);
        }
    }, [messages, isAtBottom]);

    // Mark as read when conversation opens or new messages arrive
    useEffect(() => {
        if (conversationId) {
            markRead({ conversationId: conversationId as any });
        }
    }, [conversationId, messages, markRead]);

    // Clear error & pending when conversation changes
    useEffect(() => {
        setSendError(null);
        setPendingMessage(null);
        setMessage("");
    }, [conversationId]);

    const handleScroll = (e: any) => {
        const { scrollTop, scrollHeight, clientHeight } = e.target;
        const atBottom = scrollHeight - scrollTop - clientHeight < 100;
        setIsAtBottom(atBottom);
        if (atBottom) setShowNewMessagesBtn(false);
    };

    const handleMessageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);
        setSendError(null);

        if (conversationId) {
            setTyping({ conversationId: conversationId as any, isTyping: true });

            if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                setTyping({ conversationId: conversationId as any, isTyping: false });
            }, 2000);
        }
    };

    const doSend = async (body: string) => {
        if (!conversationId) return;
        setIsSending(true);
        setSendError(null);
        if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
        setTyping({ conversationId: conversationId as any, isTyping: false });

        try {
            await sendMessage({
                conversationId: conversationId as any,
                body,
            });
            setPendingMessage(null);
            setIsSending(false);
        } catch (error) {
            console.error("Failed to send message:", error);
            setSendError("Message failed to send.");
            setPendingMessage(body);
            setIsSending(false);
        }
    };

    const handleSend = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!message.trim() || !conversationId) return;
        const body = message.trim();
        setMessage("");
        await doSend(body);
    };

    const handleRetry = async () => {
        if (!pendingMessage) return;
        await doSend(pendingMessage);
    };

    // Empty conversation (no conversation selected)
    if (!activeConversation) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-transparent relative overflow-hidden">
                <div className="absolute inset-0 bg-dot-grid opacity-10"></div>
                <div className="w-32 h-32 bg-indigo-500/10 rounded-[3.5rem] flex items-center justify-center mb-12 border border-indigo-500/20 animate-in zoom-in spin-in-12 duration-1000 shadow-[0_0_80px_rgba(79,70,229,0.15)] relative z-10">
                    <Sparkles size={64} className="text-indigo-400/50 animate-pulse" />
                </div>
                <h2 className="text-5xl font-display font-black text-white mb-6 tracking-tighter italic relative z-10 text-glow">TARS CHAT</h2>
                <div className="h-1.5 w-16 bg-indigo-500 mb-10 rounded-full shadow-[0_0_20px_#6366f1] relative z-10"></div>
                <p className="text-slate-400 max-w-sm font-black uppercase tracking-[0.4em] text-[10px] leading-relaxed relative z-10 opacity-70">
                    Select a conversation<br />or search for a user<br />to start messaging.
                </p>
            </div>
        );
    }

    const displayName = activeConversation.isGroup ? activeConversation.name : otherUser?.name;
    const isMessagesLoading = messages === undefined;

    return (
        <div className="flex-1 flex flex-col h-screen bg-transparent relative z-10">
            {/* Header */}
            <header className="p-7 border-b border-white/5 flex items-center justify-between backdrop-blur-3xl bg-white/[0.02] shrink-0">
                <div className="flex items-center gap-6">
                    <div className="relative shrink-0">
                        {activeConversation.isGroup ? (
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                                <Users className="text-indigo-400 w-6 h-6" />
                            </div>
                        ) : (
                            <>
                                <div className={cn(
                                    "absolute -inset-1 rounded-2xl blur-md opacity-25",
                                    isOnline ? "bg-emerald-500" : "bg-slate-700"
                                )}></div>
                                <img src={otherUser?.imageUrl} className="relative w-12 h-12 rounded-2xl object-cover border border-white/10 shadow-2xl" alt="" />
                                <div className={cn(
                                    "absolute -bottom-1 -right-1 w-3.5 h-3.5 border-2 border-[#020617] rounded-full",
                                    isOnline ? "bg-emerald-500 shadow-[0_0_8px_#10b981]" : "bg-slate-600"
                                )} />
                            </>
                        )}
                    </div>
                    <div>
                        <h2 className="font-display font-black text-white text-lg tracking-tight">{displayName}</h2>
                        <p className={cn(
                            "text-[9px] uppercase font-black tracking-[0.3em] flex items-center gap-2 mt-0.5",
                            activeConversation.isGroup ? "text-indigo-400" : (isOnline ? "text-emerald-400" : "text-slate-500")
                        )}>
                            {isOnline && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981] animate-pulse"></span>}
                            {activeConversation.isGroup
                                ? `${activeConversation.participants.length} members`
                                : (isOnline ? "Online now" : "Offline")}
                        </p>
                    </div>
                </div>
            </header>

            {/* Messages Area */}
            <ScrollArea
                className="flex-1 p-8 md:p-10 relative"
                onScroll={handleScroll}
            >
                <div className="flex flex-col gap-8">
                    {isMessagesLoading ? (
                        // Loading skeletons
                        <>
                            <MessageSkeleton fromMe={false} />
                            <MessageSkeleton fromMe={true} />
                            <MessageSkeleton fromMe={false} />
                            <MessageSkeleton fromMe={true} />
                        </>
                    ) : messages.length === 0 ? (
                        // Empty state — no messages yet
                        <div className="flex flex-col items-center justify-center py-24 text-center animate-in fade-in zoom-in-95 duration-700">
                            <div className="w-20 h-20 bg-indigo-500/5 border border-indigo-500/10 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                                <Smile className="text-indigo-400/40 w-9 h-9" />
                            </div>
                            <p className="text-white font-display font-black text-lg tracking-tight mb-2">
                                Say hello to {displayName}!
                            </p>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-600">
                                This is the start of your conversation.
                            </p>
                        </div>
                    ) : (
                        messages.map((msg) => {
                            const fromMe = msg.senderId === meAsUser?._id;
                            const sender = users?.find(u => u._id === msg.senderId);

                            return (
                                <div
                                    key={msg._id}
                                    className={cn(
                                        "max-w-[75%] flex flex-col gap-2 animate-slide-up group/msg",
                                        fromMe ? "self-end items-end" : "self-start items-start"
                                    )}
                                >
                                    {/* Sender name for group chats */}
                                    {!fromMe && activeConversation.isGroup && (
                                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 px-4">
                                            {sender?.name}
                                        </span>
                                    )}

                                    <div className="flex items-center gap-2 group">
                                        {/* Delete button (hover, only own messages) */}
                                        {fromMe && !msg.isDeleted && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="opacity-0 group-hover:opacity-100 h-8 w-8 text-rose-500 hover:bg-rose-500/10 rounded-xl transition-all"
                                                onClick={() => deleteMessage({ messageId: msg._id })}
                                            >
                                                <Trash2 size={14} />
                                            </Button>
                                        )}

                                        {/* Message bubble */}
                                        <div className={cn(
                                            "px-6 py-4 rounded-[2.2rem] text-[15px] font-medium transition-all relative border",
                                            fromMe
                                                ? "bg-indigo-600 border-indigo-500/50 text-white shadow-[0_15px_30px_-5px_rgba(79,70,229,0.35)] rounded-tr-none"
                                                : "bg-white/[0.04] border-white/5 text-slate-100 backdrop-blur-xl rounded-tl-none shadow-lg",
                                            msg.isDeleted && "bg-white/[0.02] border-white/5 text-slate-500 italic px-6 py-3"
                                        )}>
                                            {msg.isDeleted ? "This message was deleted" : msg.body}

                                            {/* Reactions display */}
                                            {msg.reactions && msg.reactions.length > 0 && (
                                                <div className={cn(
                                                    "absolute -bottom-5 flex gap-1",
                                                    fromMe ? "right-4" : "left-4"
                                                )}>
                                                    {msg.reactions.map((r) => (
                                                        <button
                                                            key={r.emoji}
                                                            onClick={() => toggleReaction({ messageId: msg._id, emoji: r.emoji })}
                                                            className={cn(
                                                                "px-2 py-0.5 rounded-full text-[11px] border flex items-center gap-1 transition-all hover:scale-110 active:scale-95 backdrop-blur-xl",
                                                                r.users.includes(meAsUser?._id as any)
                                                                    ? "bg-indigo-500/20 border-indigo-500/50 text-indigo-300"
                                                                    : "bg-slate-900/80 border-white/10 text-slate-300"
                                                            )}
                                                        >
                                                            <span>{r.emoji}</span>
                                                            <span className="font-bold text-[10px]">{r.users.length}</span>
                                                        </button>
                                                    ))}
                                                </div>
                                            )}

                                            {/* Quick reaction picker on hover */}
                                            {!msg.isDeleted && (
                                                <div className={cn(
                                                    "absolute -top-10 scale-0 group-hover/msg:scale-100 transition-all duration-300 flex gap-1.5 p-1.5 glass-panel rounded-2xl shadow-2xl z-20",
                                                    fromMe ? "right-0 origin-bottom-right" : "left-0 origin-bottom-left"
                                                )}>
                                                    {["👍", "❤️", "😂", "😮", "😢"].map(emoji => (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => toggleReaction({ messageId: msg._id, emoji })}
                                                            className="w-8 h-8 flex items-center justify-center hover:bg-white/10 rounded-xl text-lg transition-colors"
                                                        >
                                                            {emoji}
                                                        </button>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Timestamp */}
                                    <div className="flex items-center gap-2 px-3 opacity-40">
                                        <span className="text-[9px] uppercase font-black tracking-[0.2em] text-slate-500">
                                            {fromMe ? "You" : sender?.name?.split(" ")[0]}
                                        </span>
                                        <span className="text-[9px] text-slate-500">·</span>
                                        <span className="text-[10px] text-slate-400 font-bold">
                                            {formatTimestamp(msg._creationTime)}
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                    <div ref={scrollRef} />
                </div>

                {/* ↓ New messages button (shown when scrolled up & new messages arrive) */}
                {showNewMessagesBtn && (
                    <button
                        onClick={() => {
                            scrollRef.current?.scrollIntoView({ behavior: "smooth" });
                            setIsAtBottom(true);
                            setShowNewMessagesBtn(false);
                        }}
                        className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-[0_20px_40px_rgba(0,0,0,0.5)] flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] border border-indigo-400/30 animate-in fade-in slide-in-from-bottom-4 transition-all active:scale-95 group"
                    >
                        <ArrowDown className="w-4 h-4 group-hover:translate-y-0.5 transition-transform" />
                        New Messages
                    </button>
                )}
            </ScrollArea>

            {/* Footer: Typing indicator + Error banner + Input */}
            <footer className="shrink-0 p-6 md:p-10 bg-white/[0.01] border-t border-white/5 backdrop-blur-3xl relative">
                {/* Typing indicator */}
                {typingUsers && typingUsers.length > 0 && (
                    <div className="absolute -top-12 left-12 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-2">
                        <div className="flex gap-1.5 items-center bg-slate-900/80 border border-white/10 px-3 py-2 rounded-full backdrop-blur-xl">
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.15s]"></span>
                            <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.3s]"></span>
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400/80 ml-1">
                                {typingUsers.length === 1
                                    ? `${typingUsers[0].name} is typing...`
                                    : `${typingUsers.length} people are typing...`}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error state with retry */}
                {sendError && (
                    <div className="mb-4 flex items-center gap-3 px-5 py-3 bg-rose-500/10 border border-rose-500/30 rounded-2xl animate-in fade-in slide-in-from-top-2">
                        <AlertCircle size={16} className="text-rose-400 shrink-0" />
                        <span className="text-rose-300 text-sm font-bold flex-1">{sendError}</span>
                        <button
                            onClick={handleRetry}
                            disabled={isSending}
                            className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-rose-400 hover:text-rose-300 transition-colors disabled:opacity-50"
                        >
                            <RefreshCw size={12} className={isSending ? "animate-spin" : ""} />
                            Retry
                        </button>
                        <button
                            onClick={() => { setSendError(null); setPendingMessage(null); }}
                            className="text-rose-500 hover:text-rose-400 transition-colors text-lg leading-none"
                        >
                            ×
                        </button>
                    </div>
                )}

                <form onSubmit={handleSend} className="max-w-6xl mx-auto flex items-center gap-4">
                    <Input
                        value={message}
                        onChange={handleMessageChange}
                        className="flex-1 bg-white/[0.03] border-white/10 text-white h-14 md:h-16 px-8 rounded-[2.2rem] focus:ring-indigo-500/20 text-base md:text-lg placeholder:text-slate-600 transition-all focus:bg-white/[0.05]"
                        placeholder={`Message ${displayName}...`}
                        disabled={isSending}
                    />
                    <Button
                        type="submit"
                        disabled={!message.trim() || !conversationId || isSending}
                        className="bg-indigo-600 hover:bg-indigo-500 h-14 md:h-16 w-16 md:w-20 rounded-[2.2rem] text-white shadow-[0_20px_50px_-10px_rgba(79,70,229,0.5)] transition-all hover:scale-105 active:scale-95 group disabled:opacity-30 disabled:scale-100 disabled:shadow-none"
                    >
                        <Send size={24} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Button>
                </form>
            </footer>
        </div>
    );
};

"use client";

import { Send, Smile, Paperclip, MoreVertical, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

export const ChatArea = ({ selectedUser }: { selectedUser: any }) => {
    if (!selectedUser) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center bg-transparent relative">
                <div className="w-32 h-32 bg-indigo-500/10 rounded-[3rem] flex items-center justify-center mb-10 border border-indigo-500/20 animate-in zoom-in duration-700 shadow-[0_0_50px_rgba(79,70,229,0.1)]">
                    <Smile size={64} className="text-indigo-400/50" />
                </div>
                <h2 className="text-4xl font-black text-white mb-4 tracking-tighter italic">TARS SYSTEM</h2>
                <div className="h-1 w-12 bg-indigo-500 mb-8 rounded-full"></div>
                <p className="text-slate-400 max-w-sm font-bold uppercase tracking-[0.3em] text-[10px]">Select secondary node to initiate uplink.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-screen bg-transparent relative z-10">
            <header className="p-6 border-b border-white/5 flex items-center justify-between bg-white/[0.02] backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="relative shrink-0">
                        <div className="absolute -inset-1 bg-emerald-500 rounded-2xl blur opacity-20"></div>
                        <img src={selectedUser.imageUrl} className="relative w-12 h-12 rounded-2xl object-cover border border-white/10" alt="" />
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 border-4 border-[#020617] rounded-full" />
                    </div>
                    <div>
                        <h2 className="font-black text-white text-base tracking-tight">{selectedUser.name}</h2>
                        <p className="text-[10px] text-emerald-400 uppercase font-black tracking-[0.3em] flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></span>
                            Secure Connection
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="text-slate-400 rounded-2xl hover:bg-white/5 h-12 w-12 transition-all">
                        <MoreVertical size={22} />
                    </Button>
                </div>
            </header>

            <ScrollArea className="flex-1 p-8">
                <div className="flex flex-col items-center justify-center min-h-[500px] opacity-20">
                    <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center mb-6 border border-white/5 scale-90">
                        <Sparkles size={40} className="text-slate-400" />
                    </div>
                    <p className="text-[11px] font-black uppercase tracking-[0.5em] text-slate-500">Node initialized. Waiting for packets.</p>
                </div>
            </ScrollArea>

            <footer className="p-8 bg-white/[0.02] border-t border-white/5 backdrop-blur-3xl">
                <div className="max-w-5xl mx-auto flex items-center gap-4">
                    <div className="flex items-center gap-1 bg-white/[0.03] p-1.5 rounded-[2rem] border border-white/10 shadow-inner">
                        <Button variant="ghost" size="icon" className="text-slate-400 hover:text-white rounded-[1.5rem] h-14 w-14 hover:bg-white/5 transition-all">
                            <Paperclip size={24} />
                        </Button>
                    </div>
                    <Input
                        className="flex-1 bg-white/[0.03] border-white/10 text-white h-16 px-8 rounded-[2rem] focus:ring-indigo-500/30 text-lg placeholder:text-slate-600 shadow-inner"
                        placeholder={`Message ${selectedUser.name}...`}
                    />
                    <Button className="bg-indigo-600 hover:bg-indigo-500 h-16 w-16 md:w-20 rounded-[2rem] text-white shadow-[0_20px_40px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 group">
                        <Send size={28} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                    </Button>
                </div>
            </footer>
        </div>
    );
};



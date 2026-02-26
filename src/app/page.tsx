"use client";

import { SignInButton } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Hash, ArrowRight, MessageCircle, Sparkles } from "lucide-react";

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    // If authenticated, push to dashboard
  }, []);

  return (
    <main className="h-screen w-full flex flex-col items-center justify-center bg-[#020617] text-white relative overflow-hidden">

      {/* Premium Background Elements */}
      <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-indigo-600/20 rounded-full blur-[160px] animate-glow" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[800px] h-[800px] bg-violet-600/20 rounded-full blur-[160px] animate-glow delay-1000" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-4xl">
        <AuthLoading>
          <div className="flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-slate-900 rounded-[2.5rem] flex items-center justify-center border border-white/5 shadow-2xl animate-spin-slow">
              <Hash className="text-indigo-400 w-10 h-10" />
            </div>
            <p className="text-slate-400 font-black tracking-[0.4em] uppercase text-[10px]">Initializing System...</p>
          </div>
        </AuthLoading>

        <Unauthenticated>
          <div className="animate-in fade-in slide-in-from-bottom-10 duration-1000">
            <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-10 backdrop-blur-md">
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-300">Available for Tars 2026</span>
            </div>

            <h1 className="text-8xl md:text-[11rem] font-black tracking-tighter text-white mb-8 italic leading-none select-none">
              TARS<span className="text-indigo-500">.</span>
            </h1>

            <p className="text-slate-400 text-xl md:text-2xl mb-16 leading-relaxed font-medium max-w-2xl mx-auto">
              The next generation of real-time communication. <br className="hidden md:block" /> Engineered for speed, designed for elegance.
            </p>

            <SignInButton mode="modal">
              <button className="group relative flex items-center gap-6 bg-white text-black px-14 py-7 rounded-[2rem] font-black text-2xl transition-all hover:scale-105 active:scale-95 shadow-[0_0_60px_rgba(255,255,255,0.1)]">
                Launch App
                <ArrowRight className="w-7 h-7 group-hover:translate-x-3 transition-transform duration-300" />
              </button>
            </SignInButton>
          </div>
        </Unauthenticated>

        <Authenticated>
          <div className="flex flex-col items-center gap-8 animate-pulse text-indigo-400">
            <MessageCircle className="w-20 h-20" />
            <p className="text-xl font-bold tracking-widest uppercase">Encrypted Connection Established</p>
            <button
              onClick={() => router.push("/dashboard")}
              className="text-slate-500 underline text-sm tracking-widest"
            >
              Loading Dashboard...
            </button>
          </div>
        </Authenticated>
      </div>

      <div className="absolute bottom-12 flex items-center gap-8 opacity-20 font-black text-[11px] uppercase tracking-[0.6em]">
        <span>Next.js</span>
        <div className="h-4 w-[1px] bg-white/20" />
        <span>Convex</span>
        <div className="h-4 w-[1px] bg-white/20" />
        <span>Clerk</span>
      </div>
    </main>
  );
}
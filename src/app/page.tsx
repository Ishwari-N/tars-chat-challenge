"use client";

import { SignInButton, SignedOut, SignedIn } from "@clerk/nextjs";
import { Authenticated, Unauthenticated, AuthLoading } from "convex/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useEffect } from "react";
import { Hash, ArrowRight, MessageCircle, Sparkles, Zap, Shield, Globe } from "lucide-react";

const RedirectToDashboard = () => {
  const router = useRouter();
  useEffect(() => {
    const timer = setTimeout(() => {
      router.push("/dashboard");
    }, 1000);
    return () => clearTimeout(timer);
  }, [router]);
  return null;
};

const Navbar = () => {
  const router = useRouter();

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] px-8 py-5 border-b border-white/[0.05] bg-[#020617]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center border border-indigo-500/20">
            <Hash className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="font-display font-black tracking-tighter text-xl italic select-none">
            TARS<span className="text-indigo-500">CHAT</span>
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Unauthenticated>
            <SignedOut>
              <Link href="/sign-in">
                <button className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-white transition-colors px-4 py-2">
                  Sign In
                </button>
              </Link>
              <Link href="/sign-up">
                <button className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(99,102,241,0.4)]">
                  Get Started Free
                </button>
              </Link>
            </SignedOut>
          </Unauthenticated>
          <Authenticated>
            <button
              onClick={() => router.push("/dashboard")}
              className="px-6 py-2.5 rounded-full bg-indigo-600 text-white text-[11px] font-black uppercase tracking-[0.2em] hover:bg-indigo-500 transition-all hover:scale-105 active:scale-95 shadow-[0_8px_20px_rgba(99,102,241,0.4)]"
            >
              Open Dashboard →
            </button>
          </Authenticated>
        </div>
      </div>
    </nav>
  );
};

const FeatureCard = ({ icon: Icon, title, desc }: { icon: any, title: string, desc: string }) => (
  <div className="flex flex-col gap-3 p-6 rounded-3xl bg-white/[0.03] border border-white/[0.07] hover:bg-white/[0.05] transition-all group">
    <div className="w-10 h-10 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center group-hover:bg-indigo-500/20 transition-colors">
      <Icon className="w-5 h-5 text-indigo-400" />
    </div>
    <p className="font-display font-black text-white text-sm tracking-tight">{title}</p>
    <p className="text-slate-500 text-[11px] font-medium leading-relaxed">{desc}</p>
  </div>
);

export default function LandingPage() {
  const router = useRouter();

  useEffect(() => {
    if (typeof window !== "undefined") {
      router.prefetch("/dashboard");
    }
  }, [router]);

  return (
    <main className="min-h-screen w-full flex flex-col bg-[#020617] text-white">
      <Navbar />

      {/* Hero Section */}
      <div className="relative flex flex-col items-center justify-center text-center px-6 pt-40 pb-24 flex-1">
        {/* Background glows */}
        <div className="absolute inset-0 bg-grid opacity-20 pointer-events-none" />
        <div className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] bg-indigo-600/15 rounded-full blur-[150px] animate-glow pointer-events-none" />
        <div className="absolute bottom-[0%] right-[-10%] w-[600px] h-[600px] bg-violet-600/15 rounded-full blur-[140px] animate-glow pointer-events-none" />

        {/* Auth Loading */}
        <AuthLoading>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center border border-white/5 animate-pulse">
              <Hash className="text-indigo-400 w-8 h-8" />
            </div>
            <p className="text-slate-500 font-black tracking-[0.4em] uppercase text-[10px]">Loading...</p>
          </div>
        </AuthLoading>

        <Unauthenticated>
          <div className="relative z-10 flex flex-col items-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-500/10 border border-indigo-500/20 mb-8">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_6px_#10b981]" />
              <span className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-300">Live · Real-time Chat</span>
            </div>

            {/* Headline */}
            <h1 className="text-6xl md:text-8xl font-display font-black tracking-tighter text-white mb-6 italic leading-[0.95]">
              Real-time<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Messaging</span><br />
              for Teams.
            </h1>

            <p className="text-slate-400 text-lg md:text-xl mb-12 leading-relaxed font-medium max-w-xl mx-auto">
              Instant messages, group chats, reactions, and presence — all in one beautifully designed app.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-20">
              <SignedOut>
                <Link href="/sign-up">
                  <button className="
                    group relative flex items-center justify-center gap-3 
                    bg-indigo-600 text-white px-10 py-5 rounded-2xl 
                    font-black text-lg tracking-tight
                    hover:bg-indigo-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(99,102,241,0.5)]
                    active:scale-95 
                    transition-all duration-200
                    shadow-[0_10px_40px_rgba(99,102,241,0.35)]
                    overflow-hidden
                  ">
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                    Start Chatting Free
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </button>
                </Link>

                <Link href="/sign-in">
                  <button className="
                    flex items-center justify-center gap-3
                    border border-white/15 text-white px-10 py-5 rounded-2xl
                    font-black text-lg tracking-tight
                    hover:bg-white/[0.07] hover:border-white/25 hover:scale-105
                    active:scale-95 
                    transition-all duration-200
                    backdrop-blur-sm
                  ">
                    Sign In
                  </button>
                </Link>
              </SignedOut>

              <SignedIn>
                <button
                  onClick={() => router.push("/dashboard")}
                  className="
                    group relative flex items-center justify-center gap-3 
                    bg-indigo-600 text-white px-10 py-5 rounded-2xl 
                    font-black text-lg tracking-tight
                    hover:bg-indigo-500 hover:scale-105 hover:shadow-[0_20px_60px_rgba(99,102,241,0.5)]
                    active:scale-95 
                    transition-all duration-200
                    shadow-[0_10px_40px_rgba(99,102,241,0.35)]
                    overflow-hidden
                  "
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/10 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700" />
                  Open Dashboard
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </SignedIn>
            </div>

            {/* Feature cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-3xl text-left">
              <FeatureCard icon={Zap} title="Real-time Messages" desc="Messages appear instantly for all participants via Convex live subscriptions." />
              <FeatureCard icon={Shield} title="Secure Auth" desc="Sign in with email or social login via Clerk. Every request is authenticated." />
              <FeatureCard icon={Globe} title="Group Chats" desc="Create group conversations with multiple members and manage them easily." />
            </div>
          </div>
        </Unauthenticated>

        <Authenticated>
          <div className="relative z-10 flex flex-col items-center gap-6">
            <div className="w-20 h-20 bg-indigo-500/10 rounded-3xl flex items-center justify-center border border-indigo-500/20 animate-pulse">
              <MessageCircle className="w-10 h-10 text-indigo-400" />
            </div>
            <p className="text-white font-black tracking-[0.3em] uppercase text-sm">Taking you to your dashboard...</p>
          </div>
          <RedirectToDashboard />
        </Authenticated>
      </div>

      {/* Footer */}
      <div className="relative z-10 flex items-center justify-center gap-6 py-8 border-t border-white/[0.04] opacity-40">
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">TARS Chat · 2026</span>
        <div className="h-3 w-[1px] bg-white/10" />
        <span className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-600">Built with Next.js + Convex</span>
      </div>
    </main>
  );
}
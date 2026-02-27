import { SignIn } from "@clerk/nextjs";
import { Hash } from "lucide-react";

export default function SignInPage() {
    return (
        <div className="min-h-screen w-full flex flex-col items-center justify-center bg-[#020617] relative overflow-hidden">
            {/* Background Glows */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-violet-600/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center gap-8 w-full max-w-md px-4">
                {/* Logo */}
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 bg-indigo-500/10 rounded-2xl flex items-center justify-center border border-indigo-500/20">
                        <Hash className="w-6 h-6 text-indigo-400" />
                    </div>
                    <span className="font-display font-black tracking-tighter text-2xl italic">
                        TARS<span className="text-indigo-500">CHAT</span>
                    </span>
                </div>

                <SignIn
                    appearance={{
                        elements: {
                            formButtonPrimary: "bg-indigo-600 hover:bg-indigo-500 text-sm font-black uppercase tracking-widest transition-all",
                            card: "bg-slate-900/50 backdrop-blur-xl border border-white/10 shadow-2xl",
                            headerTitle: "text-white font-display font-black",
                            headerSubtitle: "text-slate-400 font-medium",
                            socialButtonsBlockButton: "bg-white/5 border-white/10 hover:bg-white/10 transition-all",
                            socialButtonsBlockButtonText: "text-white font-semibold",
                            dividerLine: "bg-white/10",
                            dividerText: "text-slate-500 text-xs font-bold uppercase tracking-widest",
                            formFieldLabel: "text-slate-400 font-bold text-[10px] uppercase tracking-widest",
                            formFieldInput: "bg-white/5 border-white/10 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:ring-0 transition-all",
                            footerActionLink: "text-indigo-400 hover:text-indigo-300 font-bold",
                            identityPreviewText: "text-white",
                            identityPreviewEditButtonIcon: "text-indigo-400"
                        }
                    }}
                />
            </div>
        </div>
    );
}

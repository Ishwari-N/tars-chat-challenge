"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { useUser } from "@clerk/nextjs";

export const UserSync = () => {
    const { user, isLoaded } = useUser();
    const { isAuthenticated } = useConvexAuth();
    const storeUser = useMutation(api.users.storeUser);
    const [status, setStatus] = useState<"idle" | "syncing" | "success" | "error">("idle");

    useEffect(() => {
        if (!isLoaded || !isAuthenticated || !user) return;

        const sync = async () => {
            console.log("Frontend: Sending user to Convex...", user.id);
            setStatus("syncing");
            try {
                await storeUser({
                    name: user.fullName || user.username || "Anonymous",
                    email: user.emailAddresses[0]?.emailAddress || "",
                    imageUrl: user.imageUrl,
                    clerkId: user.id,
                });
                console.log("Frontend: Sync Successful");
                setStatus("success");
            } catch (error) {
                console.error("Frontend: Sync Failed", error);
                setStatus("error");
            }
        };

        sync();
    }, [user, isLoaded, isAuthenticated, storeUser]);

    return (
        <div className="fixed bottom-4 right-4 z-[9999] px-4 py-2 rounded-xl bg-slate-900/80 backdrop-blur-xl border border-white/10 shadow-2xl pointer-events-none">
            <div className="flex items-center gap-3">
                <div className={`w-2 h-2 rounded-full animate-pulse ${status === "success" ? "bg-emerald-500 shadow-[0_0_10px_#10b981]" :
                    status === "error" ? "bg-rose-500 shadow-[0_0_10px_#f43f5e]" :
                        status === "syncing" ? "bg-indigo-500 shadow-[0_0_10px_#6366f1]" :
                            "bg-slate-600"
                    }`} />
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/70">
                    Sync Status: <span className={
                        status === "success" ? "text-emerald-400" :
                            status === "error" ? "text-rose-400" :
                                status === "syncing" ? "text-indigo-400" :
                                    "text-slate-400"
                    }>{status}</span>
                </span>
            </div>
        </div>
    );
};

"use client";

import { ClerkProvider, useAuth } from "@clerk/nextjs";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient, Authenticated } from "convex/react";
import { ReactNode, useEffect, useState } from "react";
import { SyncUser } from "../auth/sync-user";

// Use the variable from your .env.local
const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!);

export function ConvexClientProvider({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <ClerkProvider
      publishableKey={process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY}
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      appearance={{
        variables: {
          colorPrimary: "#6366f1", // indigo-500
          colorBackground: "#020617", // slate-950
          colorText: "#f8fafc", // slate-50
          colorInputBackground: "#1e293b", // slate-800
          colorInputText: "#f8fafc", // slate-50
        },
      }}
    >
      <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
        <Authenticated>
          <SyncUser />
        </Authenticated>
        {children}
      </ConvexProviderWithClerk>
    </ClerkProvider>
  );
}
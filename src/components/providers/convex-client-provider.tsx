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
        layout: {
          socialButtonsVariant: "auto",
        },
        variables: {
          colorPrimary: "#6366f1", // indigo-500
          colorBackground: "#020617", // slate-950
          colorText: "#f8fafc", // slate-50
          colorTextOnPrimaryBackground: "#ffffff",
          colorInputBackground: "#1e293b", // slate-800
          colorInputText: "#f8fafc", // slate-50
          colorShimmer: "rgba(255,255,255,0.1)",
        },
        elements: {
          providerIcon__google: { filter: "invert(1) grayscale(100%) brightness(200%)" },
          socialButtonsBlockButton: {
            color: "#f8fafc",
            backgroundColor: "rgba(255,255,255,0.03)",
            borderColor: "rgba(255,255,255,0.1)",
            "&:hover": {
              backgroundColor: "rgba(255,255,255,0.06)",
            },
          },
          socialButtonsBlockButtonText: {
            color: "#f8fafc",
          },
          userButtonPopoverCard: {
            backgroundColor: "#020617",
            border: "1px solid rgba(255,255,255,0.1)",
          },
          userPreviewSecondaryIdentifier: {
            color: "#94a3b8", // slate-400
          },
          userButtonPopoverActionButtonText: {
            color: "#f8fafc",
          },
          userButtonPopoverActionButtonIcon: {
            color: "#94a3b8",
          },
        }
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
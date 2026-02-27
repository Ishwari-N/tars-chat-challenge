"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export const SyncUser = () => {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.storeUser);

  useEffect(() => {
    if (user && isAuthenticated) {
      console.log("Syncing user to Convex:", {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress
      });

      storeUser({
        name: user.fullName || user.username || "User",
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        clerkId: user.id,
      })
        .then(() => console.log("User successfully synced to Convex"))
        .catch((err) => console.error("Error syncing user to Convex:", err));
    } else {
      console.log("SyncUser waiting:", { hasUser: !!user, isAuthenticated });
    }
  }, [user, isAuthenticated, storeUser]);

  return null; // This component doesn't render anything
};
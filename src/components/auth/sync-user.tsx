import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect } from "react";
import { useUser } from "@clerk/nextjs";

export const SyncUser = () => {
  const { user } = useUser();
  const { isAuthenticated } = useConvexAuth();
  const storeUser = useMutation(api.users.store);

  useEffect(() => {
    if (user && isAuthenticated) {
      // This sends the Clerk user data to your Convex database
      storeUser({
        name: user.fullName || user.username || "User",
        email: user.emailAddresses[0].emailAddress,
        imageUrl: user.imageUrl,
        clerkId: user.id,
      });
    }
  }, [user, isAuthenticated, storeUser]);

  return null; // This component doesn't render anything
};
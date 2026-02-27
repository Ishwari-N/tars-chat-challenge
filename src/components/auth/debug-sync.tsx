"use client";

import { useMutation, useConvexAuth } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useEffect, useState } from "react";
import { useUser, useAuth } from "@clerk/nextjs";

export const DebugSync = () => {
    const { user, isLoaded: userLoaded } = useUser();
    const { isLoading: convexAuthLoading, isAuthenticated } = useConvexAuth();
    const { getToken, isLoaded: authLoaded } = useAuth();
    const storeUser = useMutation(api.users.storeUser);

    useEffect(() => {
        const checkAuth = async () => {
            console.log("--- DEBUG AUTH ---");
            console.log("Clerk User Loaded:", userLoaded);
            console.log("Clerk Auth Loaded:", authLoaded);
            console.log("Convex Auth Loading:", convexAuthLoading);
            console.log("Convex Is Authenticated:", isAuthenticated);

            if (authLoaded) {
                try {
                    const token = await getToken({ template: "convex" });
                    console.log("Convex Token (JWT):", token ? "EXISTS" : "NULL");
                    if (token) {
                        console.log("JWT Preview:", token.substring(0, 20) + "...");
                    }
                } catch (e) {
                    console.error("Failed to get Convex token from Clerk:", e);
                }
            }

            if (userLoaded && isAuthenticated && user) {
                console.log("Triggering storeUser mutation for:", user.id);
                try {
                    await storeUser({
                        name: user.fullName || user.username || "Anonymous",
                        email: user.emailAddresses[0]?.emailAddress || "",
                        imageUrl: user.imageUrl,
                        clerkId: user.id,
                    });
                    console.log("Mutation Response: SUCCESS");
                } catch (error) {
                    console.error("Mutation Response: ERROR", error);
                }
            }
            console.log("-------------------");
        };

        checkAuth();
    }, [user, userLoaded, authLoaded, convexAuthLoading, isAuthenticated, storeUser, getToken]);

    return null;
};

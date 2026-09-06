"use client";

import * as React from "react";
import { useAuth } from "@clerk/nextjs";
import { createBrowserOwnerClient, type KeruxClient, type TokenProvider } from "@/lib/api/client";

type OwnerApiContextValue = {
  client: KeruxClient;
  getToken: TokenProvider;
  authReady: boolean;
  isSignedIn: boolean;
  clerkConfigured: boolean;
};

const localTokenProvider: TokenProvider = async () => null;
const OwnerApiContext = React.createContext<OwnerApiContextValue | null>(null);

function ClerkOwnerApiProvider({ children }: { children: React.ReactNode }) {
  const { getToken, isLoaded, isSignedIn } = useAuth();
  const client = React.useMemo(() => createBrowserOwnerClient(getToken), [getToken]);
  const value = React.useMemo<OwnerApiContextValue>(() => ({
    client,
    getToken,
    authReady: isLoaded,
    isSignedIn: Boolean(isSignedIn),
    clerkConfigured: true,
  }), [client, getToken, isLoaded, isSignedIn]);

  return <OwnerApiContext.Provider value={value}>{children}</OwnerApiContext.Provider>;
}

function LocalOwnerApiProvider({ children }: { children: React.ReactNode }) {
  const client = React.useMemo(() => createBrowserOwnerClient(localTokenProvider), []);
  const value = React.useMemo<OwnerApiContextValue>(() => ({
    client,
    getToken: localTokenProvider,
    authReady: true,
    isSignedIn: true,
    clerkConfigured: false,
  }), [client]);

  return <OwnerApiContext.Provider value={value}>{children}</OwnerApiContext.Provider>;
}

export function OwnerApiProvider({ children }: { children: React.ReactNode }) {
  const clerkConfigured = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  return clerkConfigured
    ? <ClerkOwnerApiProvider>{children}</ClerkOwnerApiProvider>
    : <LocalOwnerApiProvider>{children}</LocalOwnerApiProvider>;
}

export function useOwnerApi() {
  const context = React.useContext(OwnerApiContext);
  if (!context) throw new Error("useOwnerApi must be used inside OwnerApiProvider");
  return context;
}

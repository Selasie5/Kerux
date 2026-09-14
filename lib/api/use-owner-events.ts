"use client";

import * as React from "react";
import type { Payment, OwnerEventType } from "@/lib/api/types";
import { useOwnerApi } from "@/lib/api/provider";

const eventTypes: OwnerEventType[] = [
  "payment",
  "agent.created",
  "agent.funded",
  "agent.frozen",
  "agent.unfrozen",
  "agent.rules_updated",
  "chat.connected",
  "chat.disconnected",
];

type OwnerEvent = {
  type: OwnerEventType;
  data: Payment | Record<string, unknown>;
};

export function useOwnerEvents(onEvent: (event: OwnerEvent) => void, onReady: () => void) {
  const { client, authReady, isSignedIn } = useOwnerApi();
  const eventHandler = React.useEffectEvent(onEvent);
  const readyHandler = React.useEffectEvent(onReady);
  const [connected, setConnected] = React.useState(false);

  React.useEffect(() => {
    if (!authReady || !isSignedIn) return;

    let closed = false;
    let source: EventSource | null = null;
    let refreshTimer: ReturnType<typeof setTimeout> | null = null;

    async function connect() {
      const token = await client.token();
      if (closed) return;
      source = new EventSource(client.eventsUrl(token));
      source.addEventListener("ready", () => {
        setConnected(true);
        readyHandler();
      });
      for (const type of eventTypes) {
        source.addEventListener(type, (message) => {
          try {
            eventHandler({ type, data: JSON.parse((message as MessageEvent<string>).data) });
          } catch {
            // A malformed convenience event is ignored; the refetch remains authoritative.
          }
        });
      }
      source.onerror = () => setConnected(false);

      // Clerk session tokens are short-lived. Recreate the stream with a fresh token
      // instead of allowing EventSource to reconnect forever with an expired URL.
      refreshTimer = setTimeout(() => {
        source?.close();
        setConnected(false);
        void connect();
      }, 50_000);
    }

    void connect();
    return () => {
      closed = true;
      source?.close();
      if (refreshTimer) clearTimeout(refreshTimer);
      setConnected(false);
    };
  }, [authReady, client, isSignedIn]);

  return connected;
}

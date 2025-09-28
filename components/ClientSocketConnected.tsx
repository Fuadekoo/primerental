"use client";

import React from "react";
import { RefreshCcw, CheckCheck } from "lucide-react";
import { customerConnected } from "@/actions/common/socketChecker";
import { useData } from "@/hooks/useData";
import useGuestSession from "@/hooks/useGuestSession";

/**
 * Checks and displays the client socket connection status.
 * Allows manual refresh of the connection state.
 */
export default function ClientSocketConnected() {
  const guestId = useGuestSession();
  const [connected, isLoading, refresh] = useData(
    customerConnected,
    () => {},
    guestId || ""
  );

  const handleRefresh = () => {
    refresh();
    // Optionally, you can also reload the page:
    // window.location.reload();
  };

  if (isLoading) {
    return (
      <button type="button" disabled>
        <RefreshCcw className="animate-spin" />
      </button>
    );
  }

  if (connected) {
    return <CheckCheck className="text-green-500" />;
  }

  return (
    <button type="button" onClick={handleRefresh}>
      <RefreshCcw className="text-gray-500 hover:text-blue-500" />
    </button>
  );
}

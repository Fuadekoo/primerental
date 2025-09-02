"use client";

import { useEffect } from "react";
import { useSocket } from "@/components/SocketProvider";
import useGuestSession from "@/hooks/useGuestSession";

/**
 * Registers the guest's socket connection on the client.
 * Emits 'customer_connection' with the guestId when connected.
 */
function GuestSocketRegistrar() {
  const socket = useSocket();
  const guestId = useGuestSession();

  useEffect(() => {
    if (socket && guestId) {
      console.log(`Registering guest socket: ${guestId}`);
      socket.emit("customer_connection", { guestId });
    }
  }, [socket, guestId]);

  return null;
}

export default GuestSocketRegistrar;

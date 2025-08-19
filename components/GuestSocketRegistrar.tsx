"use client";

import { useEffect } from "react";
import { useSocket } from "./SocketProvider";
import useGuestSession from "@/hooks/useGuestSession";

/**
 * A client component that runs on guest-facing pages.
 * It finds the guest's unique ID and registers their socket
 * connection with the server for real-time communication.
 */
const GuestSocketRegistrar = () => {
  const socket = useSocket();
  const guestId = useGuestSession();

  useEffect(() => {
    // Ensure we have both a socket connection and a guestId before registering.
    if (socket && guestId) {
      console.log(`Attempting to register socket for guest: ${guestId}`);
      // Emit an event to the server to associate this socket with the guestId.
      socket.emit("register_guest_socket", { guestId });
    }
  }, [socket, guestId]);

  // This component does not render anything to the UI.
  return null;
};

export default GuestSocketRegistrar;

"use client";

import { createContext, useContext, useEffect, useMemo } from "react";
import io, { Socket } from "socket.io-client";
import toast, { Toaster } from "react-hot-toast";
// import { addToast } from "@heroui/toast";

export const SocketContext = createContext<{ socket: typeof Socket | null }>({
  socket: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context.socket;
};

// This single provider handles connections for both Admins and Customers.
export function SocketProvider({
  children,
  userId,
  guestId,
}: {
  children: React.ReactNode;
  userId?: string; // Optional: for admin/waiter
  guestId?: string; // Optional: for customer
}) {
  // useMemo creates the socket instance only ONCE, preventing reconnections on re-renders.
  const socket = useMemo(() => {
    // Only connect if we have an identifier (userId or tableId)
    if (!userId && !guestId) return null;

    const socketUrl =
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";
    if (!socketUrl) {
      console.error("NEXT_PUBLIC_SOCKET_URL environment variable is not set");
      return null; // or you can throw an error
      // throw new Error("NEXT_PUBLIC_SOCKET_URL environment variable is not set");
    }
    return io(socketUrl, {
      // Send authentication details if they exist
      auth: {
        id: userId,
        guestId: guestId,
      },
      reconnection: true,
      reconnectionAttempts: 5,
    });
  }, [userId, guestId]);

  useEffect(() => {
    if (!socket) return;
    // joint the table room
    if (guestId) {
      socket.emit("join_room", `table_${guestId}`);
      console.log(`Socket ${socket.id} joined room table_${guestId}`);
    }

    // --- Define all event handlers ---
    const onConnect = () => {
      console.log("Socket connected persistently with ID:", socket.id);
      // If it's a customer, register the table
      if (guestId) {
        socket.emit("register_table_socket", { guestId });
      }
    };

    const onDisconnect = (reason: string) => {
      console.log("Socket disconnected. Reason:", reason);
      if (reason === "io server disconnect") {
        // Attempt to reconnect
        socket.connect();
      }
    };

    // Handler for new order notifications (for Admin)
    interface TableInfo {
      name?: string;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }

    interface OrderNotification {
      orderCode?: string;
      table?: TableInfo;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      [key: string]: any;
    }

    const onNewOrderNotification = (order: OrderNotification) => {
      console.log("New order notification received:", order);
      if (userId) {
        // Only for admin
        const audio = new Audio("/sound/notice.wav");
        audio.play().catch(() => {});
        toast.success(
          `New Order #${order.orderCode?.slice(-5)} from Table ${
            order.table?.name
          }`,
          { duration: 8000, position: "top-center", icon: "🔔" }
        );
      }
    };

    // Handler for order status updates (for Customer)
    // const onOrderStatusUpdate = (order: any) => {
    //   console.log("Order status update received:", order);
    //   if (order.status === "confirmed") {
    //     const audio = new Audio("/sound/notice.wav");
    //     audio
    //       .play()
    //       .catch((error) => console.error("Audio playback failed:", error));
    //     toast.success(
    //       `Your order fuad and mahi #${order.orderCode.slice(
    //         -5
    //       )} has been confirmed.`,
    //       { duration: 8000, position: "top-center", icon: "✅" }
    //     );
    //   }
    // You can add more status checks (e.g., rejected) if needed
    // };
    // --- Customer: Order Status Update ---

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onOrderStatusUpdate = (order: any) => {
      console.log("Order status update received:", order);
      if (guestId && order.status === "confirmed") {
        // Only for customer
        const audio = new Audio("/sound/notice.wav");
        audio.play().catch(() => {});
        toast.success(
          `Your order #${order.orderCode.slice(-5)} has been confirmed.`,
          { duration: 8000, position: "top-center", icon: "✅" }
        );
      }
    };

    // --- Attach event listeners ---
    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    // Attach only relevant listeners
    if (userId) socket.on("new_order_notification", onNewOrderNotification);
    if (guestId) socket.on("order_status_update", onOrderStatusUpdate);

    // --- Cleanup on unmount (when user logs out or closes tab) ---
    return () => {
      //   console.log("Cleaning up persistent socket connection.");
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      if (userId) socket.off("new_order_notification", onNewOrderNotification);
      if (guestId) socket.off("order_status_update", onOrderStatusUpdate);
      //   socket.off('all')
      socket.disconnect();
    };
  }, [socket, guestId, userId]);

  return (
    <SocketContext.Provider value={{ socket }}>
      {/* Render both Toaster types to support both libraries */}
      <Toaster />
      {children}
    </SocketContext.Provider>
  );
}

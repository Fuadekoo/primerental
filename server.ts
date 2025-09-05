// --- Main Server Setup ---
import { createServer } from "http";
import express from "express";
import cors from "cors";
import next from "next";
import { Server, Socket } from "socket.io";
import prisma from "./lib/db";

// --- Constants for Socket Events ---
const Events = {
  // customer to server
  CUSTOMER_CONNECTION: " customer_connection",
  CHAT_TO_ADMIN: "chat_to_admin",

  // admin to customer
  ADMIN_CONNECTION: "admin_connection",
  CHAT_TO_CUSTOMER: "chat_to_customer",

  // Error Events
  GENERAL_ERROR: "socket_error",
  ORDER_ERROR: "order_error",
};

async function handleUserConnection(socket: Socket) {
  if (!socket.data.id) return;
  try {
    const user = await prisma.user.update({
      where: { id: socket.data.id },
      data: { socket: socket.id },
    });

    // --- Join the admin room if the user is an admin ---
    if (user && user.role === "ADMIN") {
      socket.join("admin_room");
      console.log(`Admin user ${user.id} joined 'admin_room'`);
    }
  } catch (error) {
    console.error(
      `Failed to process connection for user ${socket.data.id}:`,
      error
    );
  }
}

async function handleCustomerConnection(socket: Socket, guestId: string) {
  // Add a log to confirm function execution
  console.log(
    `[SOCKET] handleCustomerConnection called for guestId: ${guestId}, socketId: ${socket.id}`
  );
  if (!guestId) return;
  try {
    let existingGuest = await prisma.guest.findUnique({
      where: { guestId },
    });

    if (!existingGuest) {
      existingGuest = await prisma.guest.create({
        data: { guestId, socket: socket.id },
      });
      console.log(
        `[SOCKET] Registered new guest ${guestId} with socket ${socket.id}`
      );
    } else {
      await prisma.guest.update({
        where: { guestId },
        data: { socket: socket.id },
      });
      console.log(`[SOCKET] Updated socket for existing guest ${guestId}`);
    }

    const roomName = `customer_${guestId}`;
    socket.join(roomName);
    socket.emit("join_room", roomName);
    console.log(`[SOCKET] Socket ${socket.id} joined room ${roomName}`);
  } catch (error) {
    console.error(`[SOCKET] Error during customer socket registration:`, error);
    socket.emit(Events.GENERAL_ERROR, {
      message: "Failed to register customer.",
    });
  }
}

async function handleChatToAdmin(
  socket: Socket,
  { toUserId, msg }: { toUserId: string; msg: string },
  io: Server
) {
  try {
    const fromGuestId = socket.data.guestId;
    console.log("guestid>>>>", fromGuestId);
    console.log("toUserId>>>>", toUserId);
    // Find guest and user
    const guest = await prisma.guest.findUnique({
      where: { guestId: fromGuestId },
      select: { id: true, guestId: true, socket: true },
    });
    const user = await prisma.user.findUnique({
      where: { id: toUserId, role: "ADMIN" },
      select: { id: true, socket: true, role: true },
    });

    if (guest && user) {
      // Save chat message (fromGuest to toUser)
      const chat = await prisma.chat.create({
        data: {
          fromGuestId: guest.id,
          toUserId: user.id,
          msg,
        },
      });

      // Emit to admin if online
      if (user.socket) {
        io.to(user.socket).emit("chat_to_admin", {
          id: chat.id,
          fromGuestId: fromGuestId,
          toUserId: chat.toUserId,
          msg: chat.msg,
          createdAt: chat.createdAt,
          self: false,
        });
      }
      // Emit to sender (guest)
      if (guest.socket) {
        io.to(guest.socket).emit("chat_to_customer", {
          id: chat.id,
          fromGuestId: chat.fromGuestId,
          toUserId: chat.toUserId,
          msg: chat.msg,
          createdAt: chat.createdAt,
          self: true,
        });
      }
    }
  } catch (error) {
    console.error(`Error sending chat to admin:`, error);
  }
}

async function handleChatToCustomer(
  socket: Socket,
  {
    fromUserId,
    toGuestId,
    msg,
  }: { fromUserId: string; toGuestId: string; msg: string },
  io: Server
) {
  try {
    console.log("fromUserId>>>> in admin", fromUserId);
    console.log("toGuestId>>>> in admin", toGuestId);
    // Find user and guest
    const user = await prisma.user.findUnique({
      where: { id: fromUserId, role: "ADMIN" },
      select: { id: true, socket: true, role: true },
    });
    const guest = await prisma.guest.findUnique({
      where: { guestId: toGuestId },
      select: { id: true, socket: true },
    });

    if (user && guest) {
      // Save chat message (fromUser to toGuest)
      const chat = await prisma.chat.create({
        data: {
          fromUserId: user.id,
          toGuestId: guest.id,
          msg,
        },
      });

      // Emit to guest if online
      if (guest.socket) {
        io.to(guest.socket).emit("chat_to_customer", {
          id: chat.id,
          fromUserId: chat.fromUserId,
          toGuestId: chat.toGuestId,
          msg: chat.msg,
          createdAt: chat.createdAt,
          self: false,
        });
      }
      // Emit to sender (admin)
      if (user.socket) {
        io.to(user.socket).emit("chat_to_admin", {
          id: chat.id,
          fromUserId: chat.fromUserId,
          toGuestId: chat.toGuestId,
          msg: chat.msg,
          createdAt: chat.createdAt,
          self: true,
        });
      }
    }
  } catch (error) {
    console.error(`Error sending chat to customer:`, error);
  }
}

async function handleDisconnect(socket: Socket) {
  console.log("Socket disconnected:", socket.id);
  try {
    // Set guest socket to null on disconnect instead of deleting
    await prisma.guest.updateMany({
      where: { socket: socket.id },
      data: { socket: null },
    });
    console.log(
      `Set socket to null for disconnected guest socket ${socket.id}`
    );

    // Also set user socket to null on disconnect
    await prisma.user.updateMany({
      where: { socket: socket.id },
      data: { socket: null },
    });
    console.log(`Set socket to null for disconnected user socket ${socket.id}`);
  } catch (error) {
    console.error(`Error de-registering socket ${socket.id}:`, error);
  }
}

process.loadEnvFile?.(".env");
const hostname = process.env.HOST || "localhost",
  port = parseInt(process.env.PORT || "3000", 10),
  dev = process.env.NODE_ENV !== "production",
  app = next({ dev, hostname, port, turbo: true });

app
  .prepare()
  .then(async () => {
    const expressApp = express();
    expressApp.use(express.json({ limit: "50mb" }));
    expressApp.use(express.urlencoded({ extended: true, limit: "50mb" }));
    expressApp.use(
      cors({
        origin: "*",
        methods: "GET,POST,PUT,DELETE",
        allowedHeaders: "Content-Type,Authorization",
      })
    );

    const handler = app.getRequestHandler();
    expressApp.use((req, res) => handler(req, res));

    const httpServer = createServer(expressApp);
    const io = new Server(httpServer, {
      cors: {
        origin: ["*"],
        methods: ["GET", "POST", "PUT", "DELETE"],
        credentials: true,
      },
      pingTimeout: 60000,
    });

    io.use(async (socket, next) => {
      // For logged-in users (admins)
      socket.data.id = socket.handshake.auth.id;

      // For guest users
      const guestId = socket.handshake.query.guestId as string | undefined;
      if (guestId) {
        socket.data.guestId = guestId;
      }
      next();
    });

    io.on("connection", async (socket) => {
      console.log("Socket connected:", socket.id);

      // --- Handle user connection immediately if userId is present ---
      if (socket.data.id) {
        await handleUserConnection(socket);
      }

      // --- Handle guest connection immediately if guestId is present ---
      if (socket.data.guestId) {
        console.log(
          `[SOCKET] Guest connection detected for guestId: ${socket.data.guestId}, socketId: ${socket.id}`
        );
        await handleCustomerConnection(socket, socket.data.guestId);
      }

      // This event is now redundant if the client sends guestId on connection, but we can keep it as a fallback.
      socket.on(Events.CUSTOMER_CONNECTION, async ({ guestId }) => {
        console.log(
          `[SOCKET] CUSTOMER_CONNECTION event received for guestId: ${guestId}, socketId: ${socket.id}`
        );
        await handleCustomerConnection(socket, guestId);
      });

      // This event is also likely not needed if the user connection is handled above.
      socket.on(Events.ADMIN_CONNECTION, async () => {
        await handleUserConnection(socket);
      });

      // Chat between guest and admin
      socket.on(
        Events.CHAT_TO_ADMIN,
        async ({
          toUserId,
          msg,
        }: {
          fromGuestId: string;
          toUserId: string;
          msg: string;
        }) => {
          await handleChatToAdmin(socket, { toUserId, msg }, io);
        }
      );

      // Chat between admin and guest
      socket.on(
        Events.CHAT_TO_CUSTOMER,
        async ({
          fromUserId,
          toGuestId,
          msg,
        }: {
          fromUserId: string;
          toGuestId: string;
          msg: string;
        }) => {
          await handleChatToCustomer(
            socket,
            { fromUserId, toGuestId, msg },
            io
          );
        }
      );

      socket.on("disconnect", () => {
        console.log("Socket disconnected:", socket.id);
        handleDisconnect(socket);
      });
      socket.on("error", (err) => console.log("Socket error:", err.message));
    });

    httpServer.listen(port, hostname, () => {
      console.log(
        `> Server listening at http://${hostname}:${port} as ${
          dev ? "development" : "production"
        }`
      );
    });

    httpServer.on("error", (err) => {
      console.error("Server error:", err);
      process.exit(1);
    });
  })
  .catch((err) => {
    console.error("Error during server setup:", err);
    process.exit(1);
  });

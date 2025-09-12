"use server";
import NotFound from "@/app/not-found";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

export const getLoginUserId = async () => {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return { id: session.user.id };
};

export async function getAdminChat(guestId: string | undefined) {
  try {
    console.log("guestidat messaege>>>>>>>", guestId);
    const mydata = await getLoginUserId();
    const adminId = mydata?.id;

    if (!guestId || !adminId) {
      return []; // Not logged in or no guest specified
    }

    const guestData = await prisma.guest.findUnique({
      where: { guestId },
      select: { id: true },
    });

    if (!guestData) {
      return []; // Guest not found in the database
    }

    const chat = await prisma.chat.findMany({
      where: {
        OR: [
          // Messages from guest to me (admin)
          { fromGuestId: guestData.id, toUserId: adminId },
          // Messages from me (admin) to guest
          { fromUserId: adminId, toGuestId: guestData.id },
        ],
      },
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        msg: true,
        fromUserId: true,
        fromGuestId: true,
        toUserId: true,
        toGuestId: true,
        createdAt: true,
        updatedAt: true,
        isRead: true,
      },
    });
    // when my adminId is found in fromuserid then add a self and true
    const chats = chat.map((c) => ({
      ...c,
      self: c.fromUserId === adminId,
    }));

    // console.log("Admin chats:", chats);
    return chats;
  } catch (error) {
    console.error("Error in getAdminChat:", error);
    return []; // Return empty array on any error
  }
}

export async function getGuestChat(guestId: string) {
  // gate the admin from the user table
  const adminId = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });

  const guestDataId = await prisma.guest.findUnique({
    where: { guestId },
    select: { id: true },
  });
  if (!adminId) {
    return []; // Admin not found
  }
  const chat = await prisma.chat.findMany({
    where: {
      OR: [
        // Messages from guest to admin
        { fromGuestId: guestDataId?.id, toUserId: adminId.id },
        // Messages from admin to guest
        { fromUserId: adminId.id, toGuestId: guestDataId?.id },
      ],
    },
    orderBy: { createdAt: "asc" },
    select: {
      id: true,
      msg: true,
      fromUserId: true,
      fromGuestId: true,
      toUserId: true,
      toGuestId: true,
      createdAt: true,
      updatedAt: true,
      isRead: true,
    },
  });
  // when my guestId is found in fromGuestId then add a self and true
  const chats = chat.map((c) => ({
    ...c,
    self: c.fromGuestId === guestId,
  }));
  return chats;
}

export async function getAdmin() {
  const adminId = await prisma.user.findFirst({
    where: { role: "ADMIN" },
    select: { id: true },
  });
  if (!adminId) {
    return null; // Admin not found
  }
  return adminId.id;
}

export async function getGuestList() {
  const guests = await prisma.guest.findMany({
    select: { id: true, guestId: true, socket: true },
    orderBy: { updatedAt: "asc" },
  });
  return guests;
}

export async function readGuestMessages(guestId: string) {
  try {
    const guestData = await prisma.guest.findUnique({
      where: { guestId },
      select: { id: true, guestId: true },
    });

    if (!guestData) {
      console.error("Guest not found for reading messages");
      return;
    }

    // Mark messages sent TO the guest as read
    await prisma.chat.updateMany({
      where: {
        toGuestId: guestData.id,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    console.error("Error in readGuestMessages:", error);
  }
}

export async function readAdminMessages(guestId: string) {
  try {
    const mydata = await getLoginUserId();
    const adminId = mydata?.id;

    if (!adminId) {
      console.error("Admin not logged in for reading messages");
      return;
    }

    const guestData = await prisma.guest.findUnique({
      where: { guestId },
      select: { id: true, guestId: true },
    });

    if (!guestData) {
      console.error("Guest not found for reading messages");
      return;
    }

    // Mark messages sent TO the admin FROM this guest as read
    await prisma.chat.updateMany({
      where: {
        fromGuestId: guestData.id,
        toUserId: adminId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });
  } catch (error) {
    console.error("Error in readAdminMessages:", error);
  }
}

export async function countUnreadMessagesForGuest(guestId: string) {
  try {
    const guestData = await prisma.guest.findUnique({
      where: { guestId },
      select: { id: true, guestId: true },
    });

    if (!guestData) {
      console.error("Guest not found for counting unread messages");
      return 0;
    }

    const unreadCount = await prisma.chat.count({
      where: {
        toGuestId: guestData.id,
        isRead: false,
      },
    });

    return unreadCount;
  } catch (error) {
    console.error("Error in countUnreadMessages:", error);
    return 0;
  }
}

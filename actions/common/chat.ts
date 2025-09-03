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

export async function getAdminChat(guestId: string) {
  const mydata = await getLoginUserId();
  const adminId = mydata?.id;
  const guestDataId = await prisma.guest.findUnique({
    where: { guestId },
    select: { id: true },
  });
  if (!adminId) {
    return []; // Not logged in
  }
  const chat = await prisma.chat.findMany({
    where: {
      OR: [
        // Messages from other party (user or guest) to me (admin)

        { fromGuestId: guestDataId?.id, toUserId: adminId },
        // Messages from me (admin) to other party (user or guest)
        { fromUserId: adminId, toGuestId: guestDataId?.id },
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
    },
  });
  // when my adminId is found in fromuserid then add a self and true
  const chats = chat.map((c) => ({
    ...c,
    self: c.fromUserId === adminId,
  }));
  return chats;
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

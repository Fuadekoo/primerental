"use server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/db";

/**
 * Checks if a client (guest) is connected to a table socket.
 * @param guestId - Guest ID
 * @returns {Promise<{status: boolean}>}
 */
export async function customerConnected(guestId: string) {
  const connected = await prisma.guest.findFirst({
    where: { id: guestId },
    select: { socket: true },
  });
  return connected ? { status: true } : { status: false };
}

/**
 * Checks if the current session user is an admin and connected.
 * @returns {Promise<{status: boolean}>}
 */
export async function adminConnected() {
  const session = await auth();
  if (!session?.user) {
    return { status: false };
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { role: true },
  });

  if (user?.role !== "ADMIN") {
    return { status: false };
  }

  const connected = await prisma.user.findFirst({
    where: { id: session.user.id },
    select: { socket: true },
  });

  return connected ? { status: true } : { status: false };
}

"use server";
import { auth } from "@/lib/auth";
import { signIn, signOut } from "../../lib/auth";
import { z } from "zod";
import { loginSchema } from "@/lib/zodSchema";
import { redirect } from "next/navigation";
import prisma from "@/lib/db";
export async function authenticate(
  data?: z.infer<typeof loginSchema> | undefined
): Promise<{ message: string } | undefined> {
  if (!data) return { message: "No data provided" };
  let result;
  try {
    result = await signIn("credentials", { ...data, redirect: false });
    if (result && result.error) {
      // console.log("sign in failed", result.error);
      return { message: `error: ${result.error}` };
    }
    return { message: "Login successful" };
  } catch {
    return { message: "Invalid email or password" };
  }
  // console.log("sign in successfully");

  // return { message: "Login successful" };
}

export async function logout() {
  try {
    await signOut({ redirect: false });
    redirect("/en/login");
    return { message: "Logout successful", status: true };
  } catch (error) {
    console.error("Logout failed:", error);
    return { message: "Logout failed", status: false };
  }
}
export async function checkAuthentication() {
  const session = await signIn("credentials", { redirect: false });
  if (!session || !session.user) {
    redirect("/en/login");
  }
  return session;
}

export async function isAuthenticated() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return false;
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return false;
  }
  return true;
}

export async function loginData() {
  const session = await auth();
  if (!session || !session.user || !session.user.id) {
    return "Unauthorized";
  }
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return "User not found";
  }
  return user;
}


export async function guestAuth(guestId: string) {
  if (!guestId) {
    return { message: "No guest ID provided", status: false };
  }
  const guest = await prisma.guest.findUnique({ where: { id: guestId } });
  if (!guest) {
    return { message: "Guest not found", status: false };
  }
  return { message: "Guest authenticated", status: true, guest };
}
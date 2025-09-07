"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import bcrypt from "bcryptjs";
import { passwordChangeSchema, updateUserSchema } from "@/lib/zodSchema";
import { z } from "zod";

export async function changePassword(
  formData: z.infer<typeof passwordChangeSchema>
) {
  const user = await auth();
  //   find the user based on the session id
  const dbUser = await prisma.user.findUnique({
    where: { id: user?.user?.id },
  });
  if (!dbUser) throw new Error("User not found");
  if (!user) throw new Error("Unauthorized");

  const { oldPassword, newPassword, confirmNewPassword } = formData;
  //check the old password is correct
  const isPasswordValid = await bcrypt.compare(oldPassword, dbUser.password);

  if (!isPasswordValid) {
    throw new Error("Old password is incorrect");
  }

  //   change to hashing the password before storing
  const hashedPassword = await bcrypt.hash(newPassword, 10);

  // Proceed with password change logic
  await prisma.user.update({
    where: { id: user.user?.id },
    data: { password: hashedPassword },
  });

  return { success: true, message: "Password changed successfully" };
}

export async function getProfile() {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.user?.id },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      role: true,
      createdAt: true,
    },
  });
  return dbUser;
}

export async function updateProfile(
  formData: z.infer<typeof updateUserSchema>
) {
  const user = await auth();
  if (!user) throw new Error("Unauthorized");
  const dbUser = await prisma.user.findUnique({
    where: { id: user.user?.id },
  });
  if (!dbUser) throw new Error("User not found");

  // Update user profile
  await prisma.user.update({
    where: { id: user.user?.id },
    data: {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    },
  });

  return { success: true, message: "Profile updated successfully" };
}

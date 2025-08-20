"use server";
import prisma from "@/lib/db";
import z from "zod";
import { propertyRegisterSchema } from "@/lib/zodSchema";

export async function propertyRegister(
  data: z.infer<typeof propertyRegisterSchema>
) {
  try {
    await prisma.propertyRegistration.create({
      data,
    });
    return { message: "Property request submitted successfully" };
  } catch (error) {
    return { message: "Error submitting property request" };
  }
}

"use server";
import prisma from "@/lib/db";
import z from "zod";
import { propertyRegisterSchema } from "@/lib/zodSchema";

export async function propertyRegister(
  data: z.infer<typeof propertyRegisterSchema>
) {
  // Validate input
  const parsed = propertyRegisterSchema.safeParse(data);
  console.log("Parsed data: fuad>>>>>");
  if (!parsed.success) {
    return {
      success: false,
      message: "Invalid property data",
      error: parsed.error,
    };
  }
  try {
    await prisma.propertyRegistration.create({
      data: parsed.data,
    });
    console.log("Property creation done>>>>:");
    return {
      success: true,
      message: "Property request submitted successfully",
      error: null,
    };
  } catch (error) {
    console.error("Error submitting property request:", error);
    return {
      success: false,
      message: "Error submitting property request",
      error,
    };
  }
}

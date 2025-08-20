"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { propertyRequestSchema } from "@/lib/zodSchema";

export async function propertyRequest(data: z.infer<typeof propertyRequestSchema>) {
  try {
    await prisma.propertyRequest.create({
      data: {
        ...data,
        firstName: data.fullName.split(" ")[0] || "",
        lastName: data.fullName.split(" ").slice(1).join(" ") || "",
        offerType: data.requestType,
        bedrooms: data.bedroom,
        bathrooms: data.bathroom,
      },
    });
    return { message: "Property request submitted successfully" };
  } catch (error) {
    return { message: "Error submitting property request" };
  }
}

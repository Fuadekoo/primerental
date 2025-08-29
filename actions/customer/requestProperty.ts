"use server";
import prisma from "@/lib/db";
import { z } from "zod";
import { propertyRequestSchema } from "@/lib/zodSchema";

export async function propertyRequest(
  data: z.infer<typeof propertyRequestSchema>
) {
  try {
    await prisma.propertyRequest.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        offerType: data.offerType,
        propertyType: data.propertyType,
        maxPrice: data.maxPrice,
        bedrooms: data.bedrooms,
        bathrooms: data.bathrooms,
        minimumSize: data.minimumSize,
        message: data.message,
        isVisited: data.isVisited,
      },
    });
    return { message: "Property request submitted successfully" };
  } catch (error) {
    return { message: "Error submitting property request" };
  }
}

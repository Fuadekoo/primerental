"use server";
import prisma from "@/lib/db";

export async function getPropertyTypes() {
  try {
    const propertyTypes = await prisma.propertyType.findMany();
    console.log("Fetched property types:", propertyTypes);
    return propertyTypes;
  } catch (error) {
    console.error("Error fetching property types:", error);
    return [];
  }
}

"use server";
import prisma from "@/lib/db";

export async function getProperty(id: string) {
  try {
    const property = await prisma.property.findUnique({
      where: { id },
      include: { propertyType: { select: { name: true } } },
    });
    return property;
  } catch (error) {
    console.error("Error fetching property:", error);
    return null;
  }
}

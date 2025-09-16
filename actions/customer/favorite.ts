"use server";
import prisma from "@/lib/db";

export async function allFavorite(propertyIds: string[], search?: string) {
  try {
    const houseItems = await prisma.property.findMany({
      include: { propertyType: true },
      where: {
        isAvailable: true,
        id: {
          in: propertyIds,
        },
        title: {
          contains: search,
          // mode: "insensitive",
        },
      },
    });
    console.log("Fetched favorite properties:", houseItems);
    return houseItems;
  } catch (error) {
    console.error("Error fetching all house items:", error);
    return [];
  }
}

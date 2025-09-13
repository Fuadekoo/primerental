"use server";
import prisma from "@/lib/db";

export async function filterProperties({
  propertyType,
  offerType,
  minPrice,
  maxPrice,
  bedroom,
  bathroom,
}: {
  propertyType?: string;
  offerType?: string;
  minPrice?: number;
  maxPrice?: number;
  bedroom?: number;
  bathroom?: number;
}) {
  try {
    console.log("Filtering with:", {
      propertyType,
      offerType,
      minPrice,
      maxPrice,
      bedroom,
      bathroom,
    });
    const properties = await prisma.property.findMany({
      where: {
        ...(propertyType && { propertyType: { is: { name: propertyType } } }),
        ...(offerType && { offerType: offerType }), // offerType is an enum: "rent" or "sell"
        ...(minPrice && { price: { gte: minPrice } }),
        ...(maxPrice && { price: { lte: maxPrice } }),
        ...(bedroom && { bedroom: { gte: bedroom } }),
        ...(bathroom && { bathroom: { gte: bathroom } }),
      },
    });
    console.log("Filtered properties:", properties);
    return properties;
  } catch (error) {
    console.error("Error filtering properties:", error);
    throw new Error("Failed to filter properties");
  }
}

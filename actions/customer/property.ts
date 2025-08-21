"use server";
import prisma from "@/lib/db";

interface Item {
  property_type: string;
  offer_type: string;
  minPrice: number;
  maxPrice: number;
  bedroom: number;
  bathroom: number;
}

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

export async function filterProperty(filters: Partial<Item>) {
  try {
    const where: any = {};
    if (filters.property_type) {
      where.propertyType = { name: filters.property_type };
    }
    if (filters.offer_type) {
      where.offer_type = filters.offer_type as any; // Cast to enum type if needed
    }
    if (filters.minPrice !== undefined || filters.maxPrice !== undefined) {
      where.price = {};
      if (filters.minPrice !== undefined) {
        where.price.gte = filters.minPrice;
      }
      if (filters.maxPrice !== undefined) {
        where.price.lte = filters.maxPrice;
      }
    }
    if (filters.bedroom !== undefined) {
      where.bedroom = filters.bedroom;
    }
    if (filters.bathroom !== undefined) {
      where.bathroom = filters.bathroom;
    }

    const properties = await prisma.property.findMany({
      where,
      include: { propertyType: { select: { name: true } } },
    });
    return properties;
  } catch (error) {
    console.error("Error filtering properties:", error);
    return [];
  }
}

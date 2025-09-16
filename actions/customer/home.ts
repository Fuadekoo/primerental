"use server";
import prisma from "@/lib/db";

export async function getPromotion() {
  try {
    const promotion = await prisma.promotion.findMany();
    return promotion;
  } catch (error) {
    console.error("Error fetching promotions:", error);
    return [];
  }
}

export async function categoryListHouse() {
  try {
    const categories = await prisma.propertyType.findMany();
    return categories;
  } catch (error) {
    console.error("Error fetching property categories:", error);
    return [];
  }
}

export async function specialOffers() {
  try {
    const offers = await prisma.property.findMany({
      where: { discount: { gt: 0 }, isAvailable: true },
      include: { propertyType: true },
      // take: 4,
    });
    // Map over the offers to calculate the new price after discount
    const offersWithDiscountedPrice = offers.map((offer) => {
      const discountAmount = offer.price * (offer.discount / 100);
      const finalPrice = offer.price - discountAmount;
      const oldPrice = offer.price; // Keep the original price for reference

      return {
        ...offer,
        oldPrice, // Keep the original price
        discount: offer.discount, // Keep the discount percentage
        price: finalPrice, // Return the final price after applying the discount
      };
    });
    return offersWithDiscountedPrice;
  } catch (error) {
    console.error("Error fetching special offers:", error);
    return [];
  }
}

export async function allHouse(search?: string) {
  try {
    const houseItems = await prisma.property.findMany({
      include: { propertyType: true },
      where: {
        isAvailable: true,
        title: {
          contains: search,
          // mode: "insensitive",
        },
      },
      orderBy: { createdAt: "desc" },
    });
    return houseItems;
  } catch (error) {
    console.error("Error fetching all house items:", error);
    return [];
  }
}

// list all product per catagory
export async function listPropertyByCategory(categoryId: string) {
  try {
    const properties = await prisma.property.findMany({
      where: { propertyTypeId: categoryId, isAvailable: true },
      include: { propertyType: true },
      orderBy: { createdAt: "desc" },
    });
    return properties;
  } catch (error) {
    console.error("Error fetching properties by category:", error);
    return [];
  }
}

export async function getCategoryName(categoryId: string) {
  try {
    const category = await prisma.propertyType.findUnique({
      where: { id: categoryId },
    });
    return category?.name;
  } catch (error) {
    console.error("Error fetching category data:", error);
    return null;
  }
}

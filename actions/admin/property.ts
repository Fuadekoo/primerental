"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/zodSchema";
import { z } from "zod";
// import bcrypt from "bcryptjs";
// import path from "path";
// import fs from "fs/promises";
// import { randomUUID } from "crypto";

export async function getProperty(
  search?: string,
  page?: number,
  pageSize?: number
) {
  // Set default pagination values
  page = page && page > 0 ? page : 1;
  pageSize = pageSize && pageSize > 0 ? pageSize : 50;

  // Reset pagination if a search term is provided
  if (search) {
    pageSize = 10;
    page = 1;
  }

  // Build the where clause for filtering
  const where = search
    ? {
        title: {
          contains: search,
        },
        isDraft: false,
      }
    : {
        isDraft: false,
      };

  try {
    // Get the total count of records matching the filter
    const totalRows = await prisma.property.count({ where });

    // Fetch the paginated data
    const propertyTypes = await prisma.property.findMany({
      where,
      select: {
        id: true,
        title: true,
        offer_type: true,
        location: true,
        bedroom: true,
        kitchen: true,
        parking: true,
        quantity: true,
        squareMeter: true,
        youtubeLink: true,
        price: true,
        discount: true,
        currency: true,
        images: true,
        isAvailable: true,
        description: true,
        createdAt: true,
        propertyType: { select: { name: true } },
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalRows / pageSize);

    // Format the data for the client
    const data = propertyTypes.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
    }));

    return {
      data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: pageSize,
        totalRecords: totalRows,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };
  } catch (error) {
    console.error("Failed to get home types:", error);
    return {
      error: "Failed to retrieve data.",
      data: [],
      pagination: {
        currentPage: 1,
        totalPages: 0,
        itemsPerPage: pageSize,
        totalRecords: 0,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    };
  }
}

export async function createProperty(data: z.infer<typeof propertySchema>) {
  try {
    await prisma.property.create({
      data: {
        title: data.title,
        description: data.description,
        offer_type: data.offerType,
        location: data.location,
        quantity: data.quantity,
        price: data.price,
        discount: data.discount,
        currency: data.currency,
        youtubeLink: data.youtubeLink,
        bedroom: data.bedroom,
        kitchen: data.kitchen,
        parking: data.parking,
        squareMeter: data.squareMeter,
        images: data.images,
        propertyType: {
          connect: { id: data.propertyTypeId },
        },
      },
    });
    return { message: "Property type created successfully." };
  } catch (error) {
    return { message: `error` };
  }
}

export async function updateProperty(
  id: string,
  data: z.infer<typeof propertySchema>
) {
  try {
    await prisma.property.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        offer_type: data.offerType,
        location: data.location,
        quantity: data.quantity,
        price: data.price,
        discount: data.discount,
        currency: data.currency,
        youtubeLink: data.youtubeLink,
        bedroom: data.bedroom,
        kitchen: data.kitchen,
        parking: data.parking,
        squareMeter: data.squareMeter,
        images: data.images,
        propertyType: {
          connect: { id: data.propertyTypeId },
        },
      },
    });
    return { message: "Property type updated successfully." };
  } catch (error) {
    return { message: `error` };
  }
}

export async function deleteProperty(id: string) {
  try {
    await prisma.property.delete({
      where: { id },
    });
    return { message: "Property deleted successfully." };
  } catch (error) {
    return { message: `error` };
  }
}

export async function changeAvailabilityProperty(
  propertyId: string,
  status: boolean
) {
  try {
    const property = await prisma.property.findUnique({
      where: { id: propertyId },
    });
    if (!property) {
      return { message: "Property not found." };
    }

    await prisma.property.update({
      where: { id: propertyId },
      data: { isAvailable: status },
    });
    console.log("Property availability updated successfully.>>>>to", status);
    return { message: "Property availability updated successfully." };
  } catch (error) {
    return { message: `error` };
  }
}

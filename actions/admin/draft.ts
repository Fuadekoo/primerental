"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/zodSchema";
import { z } from "zod";

export async function getDraftProperty(
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
      }
    : {};

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
      isAvailable: false,
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

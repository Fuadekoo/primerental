"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import z from "zod";
import { propertyRequestSchema } from "@/lib/zodSchema";

export async function requestDashboard() {
  try {
    const total = await prisma.propertyRequest.count();
    const visited = await prisma.propertyRequest.count({
      where: { isVisited: true },
    });
    const notVisited = await prisma.propertyRequest.count({
      where: { isVisited: false },
    });
    return {
      success: true,
      data: {
        total,
        visited,
        notVisited,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get stats:", error);
    return {
      success: false,
      error: "Failed to get stats.",
      data: { total: 0, visited: 0, notVisited: 0 },
    };
  }
}

export async function getRequestProperties(
  search: string = "",
  page: number = 1,
  pageSize: number = 10
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
        phone: {
          contains: search,
        },
      }
    : {};

  try {
    const totalRows = await prisma.propertyRequest.count({ where });
    const totalPages = Math.ceil(totalRows / pageSize);

    const data = await prisma.propertyRequest.findMany({
      where,
      skip: (page - 1) * pageSize,
      take: pageSize,
      orderBy: { createdAt: "desc" },
    });

    return {
      success: true,
      data,
      pagination: {
        currentPage: page,
        totalPages: totalPages,
        itemsPerPage: pageSize,
        totalRecords: totalRows,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
      error: null,
    };
  } catch (error) {
    console.error("Failed to get request properties:", error);
    return {
      success: false,
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

export async function getRequestProperty(id: string) {
  try {
    const property = await prisma.propertyRequest.findUnique({
      where: { id },
    });
    if (!property) {
      return { success: false, error: "Property not found.", data: null };
    }
    return { success: true, data: property, error: null };
  } catch (error) {
    console.error("Failed to get property:", error);
    return { success: false, error: "Failed to get property.", data: null };
  }
}

export async function createRequestProperty(
  data: z.infer<typeof propertyRequestSchema>
) {
  try {
    const parsed = propertyRequestSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid property request data",
        data: null,
      };
    }
    const property = await prisma.propertyRequest.create({
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        offerType: parsed.data.offerType,
        propertyType: parsed.data.propertyType,
        maxPrice: parsed.data.maxPrice,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        minimumSize: parsed.data.minimumSize,
        message: parsed.data.message,
        isVisited: parsed.data.isVisited,
      },
    });
    return { success: true, data: property, error: null };
  } catch (error) {
    console.error("Failed to create property:", error);
    return { success: false, error: "Failed to create property.", data: null };
  }
}

export async function updateRequestProperty(
  id: string,
  data: z.infer<typeof propertyRequestSchema>
) {
  try {
    const parsed = propertyRequestSchema.safeParse(data);
    if (!parsed.success) {
      return {
        success: false,
        error: "Invalid property request data",
        data: null,
      };
    }
    const property = await prisma.propertyRequest.update({
      where: { id },
      data: {
        firstName: parsed.data.firstName,
        lastName: parsed.data.lastName,
        email: parsed.data.email,
        phone: parsed.data.phone,
        offerType: parsed.data.offerType,
        propertyType: parsed.data.propertyType,
        maxPrice: parsed.data.maxPrice,
        bedrooms: parsed.data.bedrooms,
        bathrooms: parsed.data.bathrooms,
        minimumSize: parsed.data.minimumSize,
        message: parsed.data.message,
        isVisited: parsed.data.isVisited,
      },
    });
    return { success: true, data: property, error: null };
  } catch (error) {
    console.error("Failed to update property:", error);
    return { success: false, error: "Failed to update property.", data: null };
  }
}

export async function deleteRequestProperty(id: string) {
  try {
    await prisma.propertyRequest.delete({
      where: { id },
    });
    return {
      success: true,
      message: "Property deleted successfully.",
      error: null,
    };
  } catch (error) {
    console.error("Failed to delete property:", error);
    return {
      success: false,
      error: "Failed to delete property.",
      message: null,
    };
  }
}

export async function markPropertyAsVisited(id: string) {
  try {
    await prisma.propertyRequest.update({
      where: { id },
      data: { isVisited: true },
    });
    return {
      success: true,
      message: "Property marked as visited.",
      error: null,
    };
  } catch (error) {
    console.error("Failed to mark property as visited:", error);
    return {
      success: false,
      error: "Failed to mark property as visited.",
      message: null,
    };
  }
}

export async function markRequestAsVisited(id: string) {
  try {
    await prisma.propertyRequest.update({
      where: { id },
      data: { isVisited: true },
    });
    return {
      success: true,
      message: "Property request marked as visited.",
      error: null,
    };
  } catch (error) {
    console.error("Failed to mark property request as visited:", error);
    return {
      success: false,
      error: "Failed to mark property request as visited.",
      message: null,
    };
  }
}

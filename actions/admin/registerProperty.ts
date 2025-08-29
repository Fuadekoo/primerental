"use server";
import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import z from "zod";
import { propertyRegisterSchema } from "@/lib/zodSchema";

export async function registerDashboard(){
  try {
    const total = await prisma.propertyRegistration.count();
    const visited = await prisma.propertyRegistration.count({
      where: { isVisited: true },
    });
    const notVisited = await prisma.propertyRegistration.count({
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

export async function getRegisteredProperties(
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
        fullname: {
          contains: search,
        },
      }
    : {};

  try {
    // Get the total count of records matching the filter
    const totalRows = await prisma.propertyRegistration.count({ where });

    // Fetch the paginated data
    const properties = await prisma.propertyRegistration.findMany({
      where,
      select: {
        id: true,
        fullname: true,
        phone: true,
        type: true,
        propertyType: true,
        location: true,
        realLocation: true,
        description: true,
        isVisit: true,
        isVisited: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });

    const totalPages = Math.ceil(totalRows / pageSize);

    // Format the data for the client
    const data = properties.map((item) => ({
      ...item,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    }));

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
    console.error("Failed to get registered properties:", error);
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

export async function registerProperty(
  data: z.infer<typeof propertyRegisterSchema>
) {
  try {
    // Validate input data
    const parsed = propertyRegisterSchema.safeParse(data);
    if (!parsed.success) {
      return { success: false, error: "Invalid property data", data: null };
    }
    const property = await prisma.propertyRegistration.create({
      data: parsed.data,
    });
    return { success: true, data: property, error: null };
  } catch (error) {
    console.error("Failed to register property:", error);
    return {
      success: false,
      error: "Failed to register property.",
      data: null,
    };
  }
}

export async function getRegisteredProperty(id: string) {
  try {
    const property = await prisma.propertyRegistration.findUnique({
      where: { id },
      select: {
        id: true,
        fullname: true,
        phone: true,
        type: true,
        propertyType: true,
        location: true,
        realLocation: true,
        description: true,
        isVisit: true,
        isVisited: true,
        createdAt: true,
        updatedAt: true,
      },
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

export async function deleteRegisteredProperty(id: string) {
  try {
    const property = await prisma.propertyRegistration.delete({
      where: { id },
    });
    return { success: true, data: property, error: null };
  } catch (error) {
    console.error("Failed to delete property:", error);
    return { success: false, error: "Failed to delete property.", data: null };
  }
}

export async function markPropertyAsVisited(id: string) {
  try {
    const property = await prisma.propertyRegistration.update({
      where: { id },
      data: { isVisited: true },
    });
    return { success: true, data: property, error: null };
  } catch (error) {
    console.error("Failed to mark property as visited:", error);
    return {
      success: false,
      error: "Failed to mark property as visited.",
      data: null,
    };
  }
}

export async function getRegisteredPropertiesStats() {
  try {
    const total = await prisma.propertyRegistration.count();
    const visited = await prisma.propertyRegistration.count({
      where: { isVisited: true },
    });
    const notVisited = await prisma.propertyRegistration.count({
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
    return {
      success: false,
      error: "Failed to get stats.",
      data: { total: 0, visited: 0, notVisited: 0 },
    };
  }
}

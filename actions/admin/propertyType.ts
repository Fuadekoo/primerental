"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { propertyTypeSchema } from "@/lib/zodSchema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

export async function getPropertyType(
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
        name: {
          contains: search,
        },
      }
    : {};

  try {
    // Get the total count of records matching the filter
    const totalRows = await prisma.propertyType.count({ where });

    // Fetch the paginated data
    const propertyTypes = await prisma.propertyType.findMany({
      where,
      select: {
        id: true,
        name: true,
        photo: true,
        description: true,
        createdAt: true,
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

export async function createPropertyType(
  data: z.infer<typeof propertyTypeSchema>
) {
  try {
    // Assume data.photo is a base64 string or a Buffer
    // Generate unique filename
    const ext = ".jpg"; // or parse from data.photo if you have mime info
    const uniqueName = `${randomUUID()}${ext}`;
    const filePath = path.join(process.cwd(), "filedata", uniqueName);

    // Save file
    let buffer: Buffer;
    if (typeof data.photo === "string" && data.photo.startsWith("data:")) {
      // base64 data URL
      const base64 = data.photo.split(",")[1];
      buffer = Buffer.from(base64, "base64");
    } else if (typeof data.photo === "string") {
      buffer = Buffer.from(data.photo, "base64");
    } else {
      buffer = data.photo;
    }
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, buffer);

    await prisma.propertyType.create({
      data: {
        name: data.name,
        description: data.description,
        photo: uniqueName,
      },
    });
    return { success: "Property type created successfully." };
  } catch (error) {
    console.error("Failed to create property type:", error);
    return { error: "Database error: Failed to create property type." };
  }
}

export async function updatePropertyType(
  id: string,
  data: z.infer<typeof propertyTypeSchema>
) {
  try {
    await prisma.propertyType.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        photo: data.photo,
      },
    });
    return { success: "Property type updated successfully." };
  } catch (error) {
    console.error("Failed to update property type:", error);
    return { error: "Database error: Failed to update property type." };
  }
}

export async function deletePropertyType(id: string) {
  try {
    await prisma.propertyType.delete({
      where: { id },
    });
    return { success: "Property type deleted successfully." };
  } catch (error) {
    console.error("Failed to delete property type:", error);
    return { error: "Database error: Failed to delete property type." };
  }
}

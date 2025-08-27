"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { propertySchema } from "@/lib/zodSchema";
import { z } from "zod";
import bcrypt from "bcryptjs";
import path from "path";
import fs from "fs/promises";
import { randomUUID } from "crypto";

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
    // This will hold the public URLs of the saved images.
    const imageUrls: string[] = [];

    if (Array.isArray(data.images)) {
      for (const image of data.images) {
        // Generate a unique filename for each image.
        const ext = ".jpg"; // or parse from data.photo if you have mime info
        const uniqueName = `${randomUUID()}${ext}`;
        const filePath = path.join(process.cwd(), "filedata", uniqueName);

        // Ensure the upload directory exists.
        await fs.mkdir(path.dirname(filePath), { recursive: true });

        // Decode the base64 string into a buffer.
        let buffer: Buffer;
        if (typeof image === "string" && image.startsWith("data:")) {
          const base64 = image.split(",")[1];
          buffer = Buffer.from(base64, "base64");
        } else if (typeof image === "string") {
          // Handle raw base64 string without data URI prefix.
          buffer = Buffer.from(image, "base64");
        } else {
          // If it's already a buffer.
          buffer = image;
        }

        // Write the file to the public directory.
        await fs.writeFile(filePath, buffer);
      }
    }

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
        images: imageUrls,
        propertyType: {
          connect: { id: data.propertyTypeId },
        },
      },
    });
    return { success: "Property type created successfully." };
  } catch (error) {
    console.error("Failed to create property type:", error);
    return { error: "Database error: Failed to create property type." };
  }
}

export async function updateProperty(
  id: string,
  data: z.infer<typeof propertySchema>
) {
  try {
    const imageUrls: string[] = [];

    if (Array.isArray(data.images)) {
      for (const image of data.images) {
        // Generate a unique filename for each image.
        const ext = ".jpg"; // You can parse the extension from the mime type if available.
        const uniqueName = `${randomUUID()}${ext}`;
        const uploadDir = path.join(process.cwd(), "public", "uploads");
        const filePath = path.join(uploadDir, uniqueName);

        // Ensure the upload directory exists.
        await fs.mkdir(uploadDir, { recursive: true });

        // Decode the base64 string into a buffer.
        let buffer: Buffer;
        if (typeof image === "string" && image.startsWith("data:")) {
          const base64 = image.split(",")[1];
          buffer = Buffer.from(base64, "base64");
        } else if (typeof image === "string") {
          // Handle raw base64 string without data URI prefix.
          buffer = Buffer.from(image, "base64");
        } else {
          // If it's already a buffer.
          buffer = image;
        }

        // Write the file to the public directory.
        await fs.writeFile(filePath, buffer);

        // Add the public URL to the array.
        imageUrls.push(`/uploads/${uniqueName}`);
      }
    }

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
        images: imageUrls,
        propertyType: {
          connect: { id: data.propertyTypeId },
        },
      },
    });
    return { success: "Property type updated successfully." };
  } catch (error) {
    console.error("Failed to update property type:", error);
    return { error: "Database error: Failed to update property type." };
  }
}

export async function deleteProperty(id: string) {
  try {
    await prisma.property.delete({
      where: { id },
    });
    return { success: "Property deleted successfully." };
  } catch (error) {
    console.error("Failed to delete property:", error);
    return { error: "Database error: Failed to delete property." };
  }
}

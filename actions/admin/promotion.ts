"use server";

import prisma from "@/lib/db";
import { auth } from "@/lib/auth";
import { z } from "zod";
import { promotionSchema } from "@/lib/zodSchema";
import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import formidable from "formidable";

export async function getPromotions(
  search?: string,
  page: number = 1,
  pageSize: number = 10
) {
  const where = search
    ? {
        OR: [
          { title: { contains: search, mode: "insensitive" as const } },
          { description: { contains: search, mode: "insensitive" as const } },
        ],
      }
    : {};

  const total = await prisma.promotion.count({ where });
  const data = await prisma.promotion.findMany({
    where,
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * pageSize,
    take: pageSize,
  });

  return {
    data,
    meta: {
      total,
      page,
      pageSize,
      pageCount: Math.ceil(total / pageSize),
    },
  };
}

export async function createPromotion(data: z.infer<typeof promotionSchema>) {
  // Expecting data: { title, description?, image, isActive? }
  const created = await prisma.promotion.create({
    data: {
      title: (data as any).title,
      description: (data as any).description ?? null,
      image: (data as any).image,
      isActive: (data as any).isActive ?? true,
    },
  });
  return created;
}

export async function updatePromotion(data: z.infer<typeof promotionSchema>) {
  // Expecting data to include id
  const id = (data as any).id as string;
  if (!id) throw new Error("promotion id is required");

  const updated = await prisma.promotion.update({
    where: { id },
    data: {
      title: (data as any).title,
      description: (data as any).description ?? null,
      image: (data as any).image,
      isActive: (data as any).isActive,
    },
  });
  return updated;
}

export async function changeStatusPromotion(
  promotionId: string,
  status: boolean
) {
  try {
    await prisma.promotion.update({
      where: { id: promotionId },
      data: { isActive: status },
    });
    return { success: true, message: "status updated successfully" };
  } catch (error) {
    return { success: false, message: "failed to update status" };
  }
}

export async function deletePromotion(promotionId: string) {
  try {
    await prisma.promotion.delete({
      where: { id: promotionId },
    });
    return { success: true, message: "promotion delete successfully" };
  } catch (error) {
    return { success: false, message: "failed to delete promotion" };
  }
}

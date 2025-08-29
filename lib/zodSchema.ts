import { Bath } from "lucide-react";
import { off } from "process";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(9, "email number is too short"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginType = z.infer<typeof loginSchema>;

export const propertyRequestSchema = z.object({
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  email: z.string().email(),
  phone: z.string().min(1),
  offerType: z.string().min(1),
  propertyType: z.string().min(1),
  maxPrice: z.number(),
  bedrooms: z.number().int(),
  bathrooms: z.number().int(),
  minimumSize: z.number().int(),
  message: z.string().optional(),
  isVisited: z.boolean().optional(),
});
export type PropertyRequestType = z.infer<typeof propertyRequestSchema>;

export const propertyRegisterSchema = z.object({
  fullname: z.string().min(1),
  phone: z.number().int(),
  type: z.string().min(1),
  propertyType: z.string().min(1),
  location: z.string().min(1),
  realLocation: z.string().min(1),
  description: z.string().min(1),
  isVisit: z.boolean().optional(),
  isVisited: z.boolean().optional(),
});
export type PropertyRegisterType = z.infer<typeof propertyRegisterSchema>;

export const propertyTypeSchema = z.object({
  name: z.string().min(2).max(100),
  photo: z.string(),
  description: z.string().min(2).max(500).optional(),
});
export type PropertyType = z.infer<typeof propertyTypeSchema>;

export const propertySchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  offerType: z.enum(["RENT", "SALE"]),
  propertyTypeId: z.string(),
  location: z.string().min(2).max(100),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  currency: z.string().min(1).max(10),
  images: z.array(z.string()),
  youtubeLink: z.string().url().optional(),
  kitchen: z.coerce.number().min(0),
  bedroom: z.coerce.number().min(0),
  squareMeter: z.coerce.number().min(0),
  parking: z.coerce.number().min(0),
});
export type Property = z.infer<typeof propertySchema>;

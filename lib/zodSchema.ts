import { Bath } from "lucide-react";
import { off } from "process";
import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(9, "email number is too short"),
  password: z.string().min(8, "Password must be at least 8 characters long"),
});
export type LoginType = z.infer<typeof loginSchema>;

export const propertyRequestSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  requestType: z.enum(["rent", "buy"]),
  propertyType: z.string().min(2).max(100),
  bedroom: z.number().min(0),
  bathroom: z.number().min(0),
  maxPrice: z.number().min(0),
  minimumSize: z.number().min(0),
  message: z.string().min(2).max(500),
});
export type PropertyRequestType = z.infer<typeof propertyRequestSchema>;

export const propertyRegisterSchema = z.object({
  fullName: z.string().min(2).max(100),
  email: z.string().email(),
  phone: z.string().min(10).max(15),
  registerType: z.enum(["rent", "buy"]),
  propertyType: z.string().min(2).max(100),
  price: z.number().min(0),
  location: z.string().min(2).max(100),
  realLocation: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
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
  propertyTypeId: z.string().uuid(),
  location: z.string().min(2).max(100),
  quantity: z.coerce.number().min(0),
  price: z.coerce.number().min(0),
  discount: z.coerce.number().min(0),
  currency: z.string().min(1).max(10),
  images: z.array(z.string().min(2).max(500)),
  youtubeLink: z.string().url().optional(),
  kitchen: z.coerce.number().min(0),
  bedroom: z.coerce.number().min(0),
  squareMeter: z.coerce.number().min(0),
  parking: z.coerce.number().min(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Property = z.infer<typeof propertySchema>;

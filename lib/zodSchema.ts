import { Bath } from "lucide-react";
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
  photo: z.string().min(2).max(500),
  description: z.string().min(2).max(500).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type PropertyType = z.infer<typeof propertyTypeSchema>;

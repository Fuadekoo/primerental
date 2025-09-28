import { z } from "zod";

// Helper function to validate YouTube URLs
const isValidYouTubeUrl = (url: string): boolean => {
  try {
    const urlObj = new URL(url);
    return (
      urlObj.hostname === "www.youtube.com" ||
      urlObj.hostname === "youtube.com" ||
      urlObj.hostname === "youtu.be" ||
      urlObj.hostname === "m.youtube.com"
    );
  } catch {
    return false;
  }
};

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
  youtubeLink: z
    .string()
    .optional()
    .transform((val) => {
      if (!val || val.trim() === "") return undefined;
      return val;
    })
    .refine(
      (val) => {
        if (!val) return true; // Allow undefined/empty
        return isValidYouTubeUrl(val);
      },
      {
        message:
          "Please enter a valid YouTube URL (youtube.com, youtu.be, etc.)",
      }
    ),
  kitchen: z.coerce.number().min(0),
  bedroom: z.coerce.number().min(0),
  squareMeter: z.coerce.number().min(0),
  parking: z.coerce.number().min(0),
});
export type Property = z.infer<typeof propertySchema>;

export const passwordChangeSchema = z.object({
  oldPassword: z.string().min(8, "Password must be at least 8 characters long"),
  newPassword: z.string().min(8, "Password must be at least 8 characters long"),
  confirmNewPassword: z
    .string()
    .min(8, "Password must be at least 8 characters long"),
});
export type passwordChange = z.infer<typeof passwordChangeSchema>;

export const updateUserSchema = z.object({
  name: z.string().min(1),
  phone: z.string().min(1),
  email: z.string().email(),
});
export type updateUserType = z.infer<typeof updateUserSchema>;

export const filterSchema = z.object({
  propertyType: z.string().optional(),
  offerType: z.enum(["RENT", "SALE"]).optional(),
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  bedroom: z.number().min(0).optional(),
  bathroom: z.number().min(0).optional(),
});
export type FilterType = z.infer<typeof filterSchema>;

export const promotionSchema = z.object({
  title: z.string().min(2).max(100),
  description: z.string().min(2).max(500),
  image: z.any(),
});

export type PromotionType = z.infer<typeof promotionSchema>;

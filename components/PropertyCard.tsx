"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  MapPin,
  BedDouble,
  Bath,
  Maximize,
  ArrowRight,
  Sparkles,
  Star,
} from "lucide-react";

interface PropertyCardProps {
  id: string;
  title: string;
  location: string;
  price: number;
  currency?: string;
  imageUrl: string;
  bedrooms: number;
  bathrooms?: number; // Optional as it might not be in all data
  area: number;
  isFurnished?: boolean;
  isFeatured?: boolean;
  lang: string;
  t?: {
    perMonth?: string;
    viewDetails?: string;
    beds?: string;
    baths?: string;
    area?: string;
  };
}

export default function PropertyCard({
  id,
  title,
  location,
  price,
  currency = "ETB",
  imageUrl,
  bedrooms,
  bathrooms = 0,
  area,
  isFurnished = false,
  isFeatured = false,
  lang,
  t = {
    perMonth: "per month",
    viewDetails: "View Details",
  },
}: PropertyCardProps) {
  return (
    <div className="group relative flex flex-col w-full bg-white dark:bg-neutral-900 rounded-[20px] shadow-sm border border-slate-200 dark:border-neutral-800 overflow-hidden hover:shadow-xl hover:border-primary-500/50 transition-all duration-300">
      {/* Image Section */}
      <div className="relative h-64 w-full overflow-hidden">
        <Image
          src={imageUrl}
          alt={title}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient Overlay at bottom for location readability */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/70 to-transparent" />

        {/* Top Badges */}
        <div className="absolute top-4 left-4 flex gap-2">
          {isFurnished && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#A020F0] text-white text-xs font-bold rounded-full shadow-lg">
              <Sparkles size={12} fill="currentColor" />
              Furnished
            </span>
          )}
        </div>

        <div className="absolute top-4 right-4">
          {isFeatured && (
            <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FFC107] text-black text-xs font-bold rounded-full shadow-lg">
              <Star size={12} fill="currentColor" />
              Featured
            </span>
          )}
        </div>

        {/* Location Badge (Bottom Left Overlay) */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1 text-white/90">
          <MapPin size={16} />
          <span className="text-sm font-semibold tracking-wide drop-shadow-sm">
            {location}
          </span>
        </div>
      </div>

      {/* Content Section */}
      <div className="flex flex-col flex-1 p-5">
        {/* Title & Subtitle */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 line-clamp-1 mb-1 group-hover:text-primary-600 transition-colors">
            {title}
          </h3>
          {/* Placeholder for Amharic or Subtitle if available */}
          {/* <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">
            ዘመናዊ አፓርታማ
          </p> */}
        </div>

        {/* Price Section */}
        <div className="mb-4">
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-[#A020F0]">
              {price.toLocaleString()} {currency}
            </span>
            <span className="text-sm text-slate-500 dark:text-slate-400 font-medium">
              {t.perMonth}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-slate-100 dark:bg-neutral-800 mb-4" />

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <BedDouble size={20} strokeWidth={1.5} />
            <span className="font-semibold">{bedrooms}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Bath size={20} strokeWidth={1.5} />
            <span className="font-semibold">{bathrooms}</span>
          </div>
          <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
            <Maximize size={20} strokeWidth={1.5} />
            <span className="font-semibold">{area}m²</span>
          </div>
        </div>

        {/* View Details Button */}
        <Link
          href={`/${lang}/property/${id}`}
          className="mt-auto w-full group/btn flex items-center justify-center gap-2 py-3 rounded-2xl bg-slate-50 dark:bg-neutral-800 text-slate-700 dark:text-slate-200 font-bold text-sm border border-slate-200 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-700 transition-all active:scale-[0.98]"
        >
          {t.viewDetails}
          <ArrowRight
            size={16}
            className="group-hover/btn:translate-x-1 transition-transform"
          />
        </Link>
      </div>
    </div>
  );
}

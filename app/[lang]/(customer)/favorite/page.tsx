"use client";
import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import Link from "next/link";
import Image from "next/image";
import { allFavorite } from "@/actions/customer/favorite";
import { useFavoriteStore } from "@/hooks/useFavoriteStore";
import { addToast } from "@heroui/toast";
import { useParams } from "next/navigation";
import {
  MapPin,
  BedDouble,
  Ruler,
  Car,
  Building2,
  Search,
  Heart,
  X,
} from "lucide-react";

// --- i18n Translations ---
const translations = {
  en: {
    pageTitle: "My Favorites",
    pageDescription: "The properties you've saved, all in one place.",
    searchPlaceholder: "Search in your favorites...",
    emptyStateTitle: "No Favorites Yet",
    emptyStateMessage: "Start exploring and save properties you love.",
    findPropertiesButton: "Find Properties",
    removedToast: "Removed from favorites.",
    removeAriaLabel: "Remove from favorites",
    bedsUnit: "Beds",
    parkingUnit: "Parking",
    priceUnit: "ETB",
  },
  am: {
    pageTitle: "የእኔ ተወዳጆች",
    pageDescription: "ያስቀመጧቸው ንብረቶች፣ ሁሉም በአንድ ቦታ።",
    searchPlaceholder: "በተወዳጆችዎ ውስጥ ይፈልጉ...",
    emptyStateTitle: "እስካሁን ምንም ተወዳጆች የሉም",
    emptyStateMessage: "ማሰስ ይጀምሩ እና የሚወዷቸውን ንብረቶች ያስቀምጡ።",
    findPropertiesButton: "ንብረቶችን ያግኙ",
    removedToast: "ከተወዳጆች ተወግዷል።",
    removeAriaLabel: "ከተወዳጆች አስወግድ",
    bedsUnit: "መኝታዎች",
    parkingUnit: "ፓርኪንግ",
    priceUnit: "ብር",
  },
} as const;

// --- Helper Components ---

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-neutral-800 rounded-lg ${className}`}
  />
);

const EmptyState = ({
  t,
  lang,
}: {
  t: (typeof translations)["en" | "am"];
  lang: string;
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white/80 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 rounded-lg shadow-sm">
    <Heart className="h-16 w-16 text-slate-300 dark:text-slate-600 mb-4" />
    <h3 className="text-xl font-semibold text-slate-900 dark:text-slate-100">
      {t.emptyStateTitle}
    </h3>
    <p className="text-slate-600 dark:text-slate-400 mt-2">
      {t.emptyStateMessage}
    </p>
    <Link
      href={`/${lang}/home`}
      className="mt-4 px-4 py-2 bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 text-white rounded-lg font-semibold transition-colors"
    >
      {t.findPropertiesButton}
    </Link>
  </div>
);

// --- Main Page Component ---

function Page() {
  const params = useParams();
  const lang = ((params?.lang as string) || "en") as "en" | "am";
  const t = translations[lang];

  const [search, setSearch] = useState("");
  const { favorites, toggleFavorite } = useFavoriteStore();

  // Pass the array of favorite IDs from the Zustand store to the action
  const [allFavoriteData, isLoadingAllFavorite, refreshFavorites] = useData(
    allFavorite,
    () => {},
    favorites,
    search
  );

  const handleRemoveFavorite = (e: React.MouseEvent, id: string) => {
    e.preventDefault(); // Prevent navigating to the property page
    e.stopPropagation();
    toggleFavorite(id);
    addToast({ description: t.removedToast });
  };

  const hasFavorites = favorites.length > 0;

  // Show loading state while data is loading
  if (isLoadingAllFavorite) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-blue-500 border-t-transparent"></div>
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Loading favorites...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* --- Header --- */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
            {t.pageTitle}
          </h1>
          <p className="mt-1 text-slate-600 dark:text-slate-400">
            {t.pageDescription}
          </p>
        </div>

        {/* --- Search Bar (only show if there are favorites) --- */}
        {hasFavorites && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-lg border border-slate-200 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900/70 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 py-2.5 pl-10 pr-4 shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
            />
          </div>
        )}

        {/* --- List of Favorite Properties --- */}
        <div className="space-y-4">
          {isLoadingAllFavorite && hasFavorites ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg bg-white/80 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 p-3 shadow-sm"
              >
                <SkeletonLoader className="h-32 w-28 flex-shrink-0 rounded-md" />
                <div className="flex-grow space-y-2 py-1">
                  <SkeletonLoader className="h-5 w-3/4" />
                  <SkeletonLoader className="h-4 w-1/2" />
                  <SkeletonLoader className="h-4 w-full" />
                  <SkeletonLoader className="h-4 w-2/3" />
                  <div className="flex justify-between pt-2">
                    <SkeletonLoader className="h-4 w-1/4" />
                    <SkeletonLoader className="h-6 w-1/3" />
                  </div>
                </div>
              </div>
            ))
          ) : allFavoriteData && allFavoriteData.length > 0 ? (
            allFavoriteData.map((item) => (
              <Link
                href={`/${lang}/property/${item.id}`}
                key={item.id}
                className="group relative block rounded-lg p-3 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white/80 dark:bg-neutral-900 shadow-sm border border-slate-200/70 dark:border-neutral-800"
              >
                <button
                  onClick={(e) => handleRemoveFavorite(e, item.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 dark:bg-neutral-800 rounded-full text-slate-600 dark:text-slate-300 hover:text-red-500 hover:bg-white dark:hover:bg-neutral-700 transition-all opacity-0 group-hover:opacity-100"
                  aria-label={t.removeAriaLabel}
                >
                  <X size={16} />
                </button>
                <div className="flex flex-col sm:flex-row gap-4">
                  <Image
                    src={`/api/filedata/${item.images[0]}`}
                    alt={item.title}
                    width={160}
                    height={160}
                    className="h-40 w-full sm:h-32 sm:w-40 flex-shrink-0 rounded-md object-cover"
                  />
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-bold text-slate-900 dark:text-slate-100 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-slate-600 dark:text-slate-400 mt-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span>{item.location}</span>
                    </div>

                    <div className="hidden sm:grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-slate-600 dark:text-slate-400 mt-2">
                      <span className="flex items-center gap-1.5">
                        <BedDouble size={14} /> {item.bedroom} {t.bedsUnit}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Ruler size={14} /> {item.squareMeter} m²
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Car size={14} /> {item.parking} {t.parkingUnit}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <Building2 size={14} /> {item.propertyType.name}
                      </span>
                    </div>

                    <div className="flex items-end justify-between mt-auto pt-2">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold px-2 py-0.5 rounded-full capitalize bg-primary-500/10 text-primary-700 dark:bg-primary-400/10 dark:text-primary-300">
                          {item.offer_type.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-primary-600 dark:text-primary-400">
                        {item.price.toLocaleString()} {t.priceUnit}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <EmptyState t={t} lang={lang} />
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;

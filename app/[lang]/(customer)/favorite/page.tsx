"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
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
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const EmptyState = ({
  t,
  lang,
}: {
  t: (typeof translations)["en" | "am"];
  lang: string;
}) => (
  <div className="flex flex-col items-center justify-center text-center py-16 px-4 bg-white rounded-lg shadow-sm">
    <Heart className="h-16 w-16 text-gray-300 mb-4" />
    <h3 className="text-xl font-semibold text-gray-800">{t.emptyStateTitle}</h3>
    <p className="text-gray-500 mt-2">{t.emptyStateMessage}</p>
    <Link
      href={`/${lang}/home`}
      className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
    >
      {t.findPropertiesButton}
    </Link>
  </div>
);

// --- Main Page Component ---

function Page() {
  const params = useParams();
  const lang = (params.lang || "en") as "en" | "am";
  const t = translations[lang];

  const [search, setSearch] = useState("");
  const { favorites, toggleFavorite } = useFavoriteStore();

  // Pass the array of favorite IDs from the Zustand store to the action
  const [allFavoriteData, , isLoadingAllFavorite] = useAction(
    allFavorite,
    [true, () => {}],
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

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* --- Header --- */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
          <p className="mt-1 text-gray-600">{t.pageDescription}</p>
        </div>

        {/* --- Search Bar (only show if there are favorites) --- */}
        {hasFavorites && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {/* --- List of Favorite Properties --- */}
        <div className="space-y-4">
          {isLoadingAllFavorite && hasFavorites ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-lg bg-white p-3 shadow-sm"
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
            allFavoriteData.map((item: any) => (
              <Link
                href={`/${lang}/property/${item.id}`}
                key={item.id}
                className="group relative block rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
              >
                <button
                  onClick={(e) => handleRemoveFavorite(e, item.id)}
                  className="absolute top-2 right-2 z-10 p-1.5 bg-white/80 rounded-full text-gray-600 hover:text-red-500 hover:bg-white transition-all opacity-0 group-hover:opacity-100"
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
                    <h3 className="font-bold text-gray-800 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span>{item.location}</span>
                    </div>

                    <div className="hidden sm:grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 mt-2">
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
                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                          {item.offer_type.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
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

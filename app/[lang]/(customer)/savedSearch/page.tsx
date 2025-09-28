"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, Save, ArrowRight } from "lucide-react";
import { useSavedSearch } from "@/hooks/useSavedSearch";
import FilteredComponent, { FilterInput } from "@/components/filteredComponent";
import { useData } from "@/hooks/useData";
import { categoryListHouse } from "@/actions/customer/home";
import { useParams } from "next/navigation";

// Simple i18n copy
const translations = {
  en: {
    pageTitle: "Saved Searches",
    pageDescription: "Quickly re-run your favorite filters.",
    clearAll: "Clear all",
    noSearches:
      "No saved searches yet. Save a search from the results page using the Save icon",
    any: "Any",
    anyType: "Any type",
    bedroomsUnit: "bd",
    bathroomsUnit: "ba",
    viewResults: "Click to view results for this search.",
    openResults: "Open results",
    removeSearch: "Remove saved search",
    remove: "Remove",
    close: "Close",
    filteredResults: "Filtered Results",
    priceUnit: "ETB",
  },
  am: {
    pageTitle: "የተቀመጡ ፍለጋዎች",
    pageDescription: "የሚወዷቸውን ማጣሪያዎች በፍጥነት እንደገና ያሂዱ።",
    clearAll: "ሁሉንም አጽዳ",
    noSearches:
      "እስካሁን የተቀመጡ ፍለጋዎች የሉም። ከውጤቶች ገጽ ላይ ያለውን አስቀምጥ አዶ በመጠቀም ፍለጋ ያስቀምጡ",
    any: "ማንኛውም",
    anyType: "ማንኛውም ዓይነት",
    bedroomsUnit: "መኝታ",
    bathroomsUnit: "መታጠቢያ",
    viewResults: "የዚህን ፍለጋ ውጤቶች ለማየት ጠቅ ያድርጉ።",
    openResults: "ውጤቶችን ክፈት",
    removeSearch: "የተቀመጠ ፍለጋን አስወግድ",
    remove: "አስወግድ",
    close: "ዝጋ",
    filteredResults: "የተጣሩ ውጤቶች",
    priceUnit: "ብር",
  },
} as const;

// Refined Pill with light/dark surfaces
const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-slate-100 dark:bg-neutral-800/80 border border-slate-200 dark:border-neutral-700 px-2 py-0.5 text-xs font-medium text-slate-700 dark:text-slate-300">
    {children}
  </span>
);

function Page() {
  const params = useParams();
  const lang = ((params && params.lang) || "en") as "en" | "am";
  const t = translations[lang];

  // Saved searches from persisted zustand store
  const searches = useSavedSearch((s) => s.searches);
  const removeAt = useSavedSearch((s) => s.removeAt);
  const clear = useSavedSearch((s) => s.clear);

  // Optional: load category names to resolve property_type IDs
  const [categoryData] = useData(categoryListHouse, () => {});
  const typeNameById = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(categoryData)) {
      for (const c of categoryData as { id: string; name: string }[]) {
        if (c?.id) map.set(String(c.id), c?.name || String(c.id));
      }
    }
    return map;
  }, [categoryData]);

  // Modal state to show Filtered results
  const [showFiltered, setShowFiltered] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState<FilterInput | null>(
    null
  );

  // Prevent background scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = showFiltered ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showFiltered]);

  const openSearch = (filters: FilterInput) => {
    setSelectedFilters(filters);
    setShowFiltered(true);
  };

  const closeOverlay = () => {
    setShowFiltered(false);
  };

  const fmtPrice = (n?: number) =>
    typeof n === "number" ? `${n.toLocaleString()} ${t.priceUnit}` : t.any;

  const fmtCount = (n?: number, unit?: string) =>
    typeof n === "number" ? `${n} ${unit}` : t.any;

  const resolveType = (id?: string) =>
    id ? typeNameById.get(String(id)) || id : t.anyType;

  return (
    <div className="h-full w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100">
              {t.pageTitle}
            </h1>
            <p className="mt-1 text-slate-600 dark:text-slate-400">
              {t.pageDescription}
            </p>
          </div>
          {searches.length > 0 && (
            <button
              onClick={() => clear()}
              className="text-sm font-medium inline-flex items-center gap-2 text-red-600 hover:text-red-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40 rounded-md px-2 py-1"
              aria-label={t.clearAll}
              title={t.clearAll}
            >
              <Trash2 className="h-4 w-4" />
              {t.clearAll}
            </button>
          )}
        </div>

        {/* List of saved searches */}
        <div className="space-y-3">
          {searches.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-300 dark:border-neutral-700 bg-white/80 dark:bg-neutral-900 p-8 text-center text-slate-600 dark:text-slate-400">
              {t.noSearches}{" "}
              <Save className="inline h-4 w-4 align-text-bottom" />.
            </div>
          ) : (
            searches.map((s, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg p-4 transition shadow-sm hover:shadow-md bg-white/80 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeAt(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 dark:bg-neutral-800 text-slate-600 dark:text-slate-300 hover:text-red-600 hover:bg-white dark:hover:bg-neutral-700 transition opacity-0 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400/40"
                  aria-label={t.removeSearch}
                  title={t.remove}
                >
                  <Trash2 className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  {/* Summary */}
                  <div>
                    <div className="flex flex-wrap gap-2">
                      <Pill>{(s.offer_type || t.any).toString()}</Pill>
                      <Pill>{resolveType(s.property_type)}</Pill>
                      <Pill>
                        {fmtPrice(s.minPrice)} - {fmtPrice(s.maxPrice)}
                      </Pill>
                      <Pill>{fmtCount(s.bedroom, t.bedroomsUnit)}</Pill>
                      <Pill>{fmtCount(s.bathroom, t.bathroomsUnit)}</Pill>
                    </div>
                    <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                      {t.viewResults}
                    </p>
                  </div>

                  {/* Open button */}
                  <button
                    onClick={() => openSearch(s)}
                    className="inline-flex items-center gap-2 self-start rounded-md border px-3 py-2 text-sm font-medium transition
                               border-slate-300 dark:border-neutral-700
                               bg-white/90 dark:bg-neutral-900
                               text-slate-700 dark:text-slate-200
                               hover:bg-slate-50 dark:hover:bg-neutral-800
                               focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
                    aria-label={t.openResults}
                  >
                    {t.openResults}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Full-page modal showing FilteredComponent */}
      {showFiltered && selectedFilters && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-neutral-950 flex flex-col">
          <div className="sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-slate-200 dark:border-neutral-800 p-3 flex items-center justify-between">
            <button
              onClick={closeOverlay}
              className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
            >
              <X className="h-4 w-4" />
              {t.close}
            </button>
            <h2 className="text-lg font-bold">{t.filteredResults}</h2>
            <div className="w-16" />
          </div>
          <div className="flex-1 overflow-y-auto">
            <FilteredComponent
              filters={selectedFilters}
              title={t.filteredResults}
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default Page;

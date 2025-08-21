"use client";

import React, { useEffect, useMemo, useState } from "react";
import { X, Trash2, Save, ArrowRight } from "lucide-react";
import { useSavedSearch } from "@/hooks/useSavedSearch";
import FilteredComponent, { FilterInput } from "@/components/filteredComponent";
import useAction from "@/hooks/useActions";
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

const Pill = ({ children }: { children: React.ReactNode }) => (
  <span className="inline-flex items-center rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-700">
    {children}
  </span>
);

function Page() {
  const params = useParams();
  const lang = (params.lang || "en") as "en" | "am";
  const t = translations[lang];

  // Saved searches from persisted zustand store
  const searches = useSavedSearch((s) => s.searches);
  const removeAt = useSavedSearch((s) => s.removeAt);
  const clear = useSavedSearch((s) => s.clear);

  // Optional: load category names to resolve property_type IDs
  const [categoryData] = useAction(categoryListHouse, [true, () => {}]);
  const typeNameById = useMemo(() => {
    const map = new Map<string, string>();
    if (Array.isArray(categoryData)) {
      for (const c of categoryData as any[]) {
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
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{t.pageTitle}</h1>
            <p className="mt-1 text-gray-600">{t.pageDescription}</p>
          </div>
          {searches.length > 0 && (
            <button
              onClick={() => clear()}
              className="text-sm font-medium text-red-600 hover:text-red-700 inline-flex items-center gap-2"
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
            <div className="rounded-lg border border-dashed bg-white p-8 text-center text-gray-600">
              {t.noSearches}{" "}
              <Save className="inline h-4 w-4 align-text-bottom" />.
            </div>
          ) : (
            searches.map((s, idx) => (
              <div
                key={idx}
                className="group relative rounded-lg bg-white p-4 shadow-sm ring-1 ring-gray-200 hover:shadow-md transition"
              >
                {/* Remove button */}
                <button
                  onClick={() => removeAt(idx)}
                  className="absolute top-2 right-2 p-1 rounded-full bg-white/80 text-gray-600 hover:text-red-600 hover:bg-white transition opacity-0 group-hover:opacity-100"
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
                    <p className="mt-1 text-sm text-gray-500">
                      {t.viewResults}
                    </p>
                  </div>

                  {/* Open button */}
                  <button
                    onClick={() => openSearch(s)}
                    className="inline-flex items-center gap-2 self-start rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
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
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between">
            <button
              onClick={closeOverlay}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-2"
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

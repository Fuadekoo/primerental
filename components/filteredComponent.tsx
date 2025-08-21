"use client";
import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Search,
  MapPin,
  BedDouble,
  Ruler,
  Car,
  Building2,
  // ...existing code...
  // Removed BookmarkPlus; we will use Save + Check
  Save,
  Check,
} from "lucide-react";
import useAction from "@/hooks/useActions";
import { filterProperty } from "@/actions/customer/property";
import { useSavedSearch } from "@/hooks/useSavedSearch";

// Shape of the filters you pass into this component
export interface FilterInput {
  property_type?: string;
  offer_type?: string;
  minPrice?: number;
  maxPrice?: number;
  bedroom?: number;
  bathroom?: number;
  // add more filters if needed (e.g., location, parking, etc.)
}

// ...existing code...

interface FilteredComponentProps {
  filters: FilterInput;
  title?: string; // optional heading
}

function FilteredComponent({
  filters,
  title = "Filtered Properties",
}: FilteredComponentProps) {
  const [results, , isLoading] = useAction(
    filterProperty,
    [true, () => {}],
    filters
  );

  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);
  // ...existing code...

  // useSavedSearch store
  const saveSearch = useSavedSearch((s) => s.save);
  const exists = useSavedSearch((s) => s.exists);

  useEffect(() => {
    setSaved(exists(filters));
  }, [filters, exists]);

  const hasResults = Array.isArray(results) && results.length > 0;

  const filteredResults = useMemo(() => {
    if (!hasResults) return [];
    const q = search.trim().toLowerCase();
    if (!q) return results!;
    return results!.filter((item) =>
      [item.title, item.location, item.propertyType?.name, item.offer_type]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q))
    );
  }, [results, hasResults, search]);

  const handleSaveSearch = () => {
    // Save via zustand store (persisted with name: "savedsearch")
    saveSearch(filters);
    setSaved(true);
  };

  return (
    <div className="bg-gray-50 min-h-screen p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900">{title}</h1>
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={saved}
              aria-pressed={saved}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-60"
              aria-label="Save search"
              title={saved ? "Saved to My Searches" : "Save this search"}
            >
              {saved ? (
                <>
                  <Check className="h-4 w-4 text-green-600" />
                  Saved
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  Save search
                </>
              )}
            </button>
          </div>
          <p className="mt-1 text-gray-600">Results based on your filters.</p>
        </div>

        {/* Search Bar (only show if there are results) */}
        {hasResults && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in results..."
              className="w-full rounded-lg border border-gray-300 bg-white py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
        )}

        {/* List */}
        <div className="space-y-4">
          {/* ...existing code for skeletons, results, empty states... */}
        </div>
      </div>
    </div>
  );
}

export default FilteredComponent;

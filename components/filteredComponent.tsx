"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";

import { Search, Save, Check } from "lucide-react";
import useAction from "@/hooks/useActions";
import { filterProperties } from "@/actions/customer/filter";
import { useSavedSearch } from "@/hooks/useSavedSearch";
import { Button, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { filterSchema } from "@/lib/zodSchema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

// Shape of the filters you pass into this component
export interface FilterInput {
  // preferred (matches backend/actions and current usage in page.tsx)
  property_type?: string | null;
  offer_type?: string | null;
  minPrice?: number | null;
  maxPrice?: number | null;
  bedroom?: number | null;
  bathroom?: number | null;
  // optional camelCase aliases for flexibility
}

interface FilteredComponentProps {
  filters: FilterInput;
  title?: string; // optional heading
}

function FilteredComponent({
  filters,
  title = "Filtered Properties",
}: FilteredComponentProps) {
  // Normalize incoming props and hold applied filters in state
  const normalize = (f: FilterInput) => ({
    property_type: f.property_type ?? null,
    offer_type: f.offer_type ?? null,
    minPrice: f.minPrice ?? null,
    maxPrice: f.maxPrice ?? null,
    bedroom: f.bedroom ?? null,
    bathroom: f.bathroom ?? null,
  });
  const [applied, setApplied] = useState<FilterInput>(normalize(filters));

  // Keep applied in sync if parent props change
  useEffect(() => {
    setApplied(normalize(filters));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters?.property_type,
    filters?.offer_type,
    filters?.minPrice,
    filters?.maxPrice,
    filters?.bedroom,
    filters?.bathroom,
  ]);

  // Build the request to send: only include selected fields (no null/undefined)
  const request = useMemo(() => {
    const obj = {
      property_type: applied.property_type ?? undefined,
      offer_type: applied.offer_type ?? undefined,
      minPrice: applied.minPrice ?? undefined,
      maxPrice: applied.maxPrice ?? undefined,
      bedroom: applied.bedroom ?? undefined,
      bathroom: applied.bathroom ?? undefined,
    } as Record<string, unknown>;
    return Object.fromEntries(
      Object.entries(obj).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      )
    );
  }, [applied]);

  const [results, , isLoading] = useAction(
    filterProperties,
    [true, () => {}],
    request
  );
  const [search, setSearch] = useState("");
  const [saved, setSaved] = useState(false);

  // useSavedSearch store
  const saveSearch = useSavedSearch((s) => s.save);
  const exists = useSavedSearch((s) => s.exists);

  useEffect(() => {
    const normalized = {
      property_type: applied.property_type || undefined,
      offer_type: applied.offer_type || undefined,
      minPrice: applied.minPrice ?? undefined,
      maxPrice: applied.maxPrice ?? undefined,
      bedroom: applied.bedroom ?? undefined,
      bathroom: applied.bathroom ?? undefined,
    } as const;
    setSaved(exists(normalized));
  }, [applied, exists]);

  const list = Array.isArray(results) ? results : [];
  const filtered = list.filter((item) => {
    const q = search.trim().toLowerCase();
    if (!q) return true;
    const title = String(item?.title || "").toLowerCase();
    const location = String(item?.location || "").toLowerCase();
    return title.includes(q) || location.includes(q);
  });
  const hasResults = filtered.length > 0;

  const formatImageUrl = (url: string | null | undefined): string => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/api/filedata/${encodeURIComponent(url)}`;
  };

  const {
    handleSubmit,
    register,
    reset,
    // setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof filterSchema>>({
    resolver: zodResolver(filterSchema),
    mode: "onChange",
    defaultValues: {
      propertyType: applied.property_type ?? undefined,
      offerType:
        applied.offer_type === "RENT" || applied.offer_type === "SALE"
          ? applied.offer_type
          : undefined,
      minPrice: applied.minPrice ?? undefined,
      maxPrice: applied.maxPrice ?? undefined,
      bedroom: applied.bedroom ?? undefined,
      bathroom: applied.bathroom ?? undefined,
    },
  });

  const onApply = handleSubmit((data) => {
    const next: FilterInput = {
      property_type: data.propertyType || undefined,
      offer_type: data.offerType || undefined,
      minPrice: data.minPrice ?? undefined,
      maxPrice: data.maxPrice ?? undefined,
      bedroom: data.bedroom ?? undefined,
      bathroom: data.bathroom ?? undefined,
    };
    // Clean undefined/empty
    const cleaned = Object.fromEntries(
      Object.entries(next).filter(
        ([, v]) => v !== undefined && v !== null && v !== ""
      )
    ) as FilterInput;
    setApplied(cleaned);
  });

  const handleSaveSearch = () => {
    const normalized = {
      property_type: filters.property_type || undefined,
      offer_type: filters.offer_type || undefined,
      minPrice: filters.minPrice ?? undefined,
      maxPrice: filters.maxPrice ?? undefined,
      bedroom: filters.bedroom ?? undefined,
      bathroom: filters.bathroom ?? undefined,
    } as const;
    saveSearch(normalized);
    setSaved(true);
  };

  const router = useRouter();

  return (
    <div className="h-full bg-gray-50 dark:bg-slate-950 p-4 sm:p-6 lg:p-8 transition-colors">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between gap-3">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-slate-100">
              {title}
            </h1>
            <button
              type="button"
              onClick={handleSaveSearch}
              disabled={saved}
              aria-pressed={saved}
              className="inline-flex items-center gap-2 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 px-3 py-2 text-sm font-medium text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-60"
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
          <p className="mt-1 text-gray-600 dark:text-slate-400">
            Results based on your filters.
          </p>
        </div>

        {/* Search Bar (only show if there are results) */}
        {hasResults && (
          <div className="relative mb-6">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search in results..."
              className="w-full rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 py-2.5 pl-10 pr-4 shadow-sm focus:border-blue-500 focus:ring-blue-500 dark:focus:border-blue-400 dark:text-slate-100"
            />
          </div>
        )}

        {/* Filter Form */}
        <form
          onSubmit={onApply}
          className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-3 bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
        >
          <input
            placeholder="Property type"
            className="rounded border p-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            {...register("propertyType")}
          />
          <select
            className="rounded border p-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            {...register("offerType")}
          >
            <option value="">Any offer</option>
            <option value="SALE">Sale</option>
            <option value="RENT">Rent</option>
          </select>
          <input
            type="number"
            placeholder="Min price"
            className="rounded border p-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            {...register("minPrice", { valueAsNumber: true })}
          />
          <input
            type="number"
            placeholder="Max price"
            className="rounded border p-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            {...register("maxPrice", { valueAsNumber: true })}
          />
          <input
            type="number"
            placeholder="Bedrooms"
            className="rounded border p-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            {...register("bedroom", { valueAsNumber: true })}
          />
          <input
            type="number"
            placeholder="Bathrooms"
            className="rounded border p-2 bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-900 dark:text-slate-100"
            {...register("bathroom", { valueAsNumber: true })}
          />
          <div className="sm:col-span-2 flex justify-end gap-2">
            <button
              type="button"
              className="px-3 py-2 rounded border bg-white dark:bg-slate-800 border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-200"
              onClick={() => {
                reset();
                setApplied(normalize(filters));
              }}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-3 py-2 rounded bg-blue-600 text-white dark:bg-blue-700"
            >
              Apply
            </button>
          </div>
        </form>

        {/* List */}
        <div className="space-y-4">
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-lg bg-white dark:bg-slate-900 p-3 shadow-sm"
                >
                  <div className="h-24 w-28 bg-gray-200 dark:bg-slate-800 rounded-md animate-pulse" />
                  <div className="flex-grow space-y-2">
                    <div className="h-5 w-3/4 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-1/2 bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                    <div className="h-4 w-full bg-gray-200 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : hasResults ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filtered.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-lg bg-white dark:bg-slate-900 p-3 shadow-sm border border-slate-200/70 dark:border-slate-700 cursor-pointer hover:ring-2 hover:ring-blue-400/60 transition"
                  onClick={() => item.id && router.push(`/property/${item.id}`)}
                  tabIndex={0}
                  role="button"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      item.id && router.push(`/property/${item.id}`);
                    }
                  }}
                >
                  <div className="h-24 w-28 flex-shrink-0 rounded-md overflow-hidden bg-gray-100 dark:bg-slate-800">
                    <Image
                      src={formatImageUrl(item?.images?.[0])}
                      alt={item.title || "Property image"}
                      width={112}
                      height={96}
                      className="object-cover h-24 w-28"
                    />
                  </div>
                  <div className="flex flex-col flex-grow">
                    <h3 className="font-bold text-gray-800 truncate">
                      {item.title || "Untitled"}
                    </h3>
                    <div className="text-sm text-gray-500 mt-1">
                      {item.location || "Unknown location"}
                    </div>
                    <div className="text-sm text-gray-600 mt-2">
                      {(item.currency || "$") +
                        " " +
                        (Number(item.price)
                          ? Number(item.price).toLocaleString()
                          : "-")}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-gray-500">
              No properties match your filters.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FilteredComponent;

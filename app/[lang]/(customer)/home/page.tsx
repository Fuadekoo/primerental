"use client";
import Footer from "@/components/Footer";
import React, { useState, useEffect } from "react";
import { Input } from "@heroui/react";
import {
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Search,
  MapPin,
  BedDouble,
  Ruler,
  Car,
  Building2,
  X,
} from "lucide-react";
// import { addToast } from "@heroui/toast";
import useAction from "@/hooks/useActions";
import {
  getPromotion,
  allHouse,
  categoryListHouse,
  specialOffers,
} from "@/actions/customer/home";
// import { filterProperties } from "@/actions/customer/filter";
import Link from "next/link";
import ProductPerCategoryId from "@/components/productper-catagoryid";
import FilteredComponent, { FilterInput } from "@/components/filteredComponent";
import FilterProperty, { FilterValues } from "@/components/filterProperty";
import Image from "next/image";
import { useParams } from "next/navigation";
// import { filterSchema } from "@/lib/zodSchema";

// i18n strings
const translations = {
  en: {
    filtersTitle: "Filters",
    propertyType: "Property Type",
    offerType: "Offer Type",
    forSale: "For Sale",
    forRent: "For Rent",
    priceRange: "Price Range",
    minPrice: "Min Price",
    maxPrice: "Max Price",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    reset: "Reset",
    applyFilters: "Apply Filters",
    close: "Close",
    filteredResults: "Filtered Results",
    searchPlaceholder: "Search for properties...",
    featuredProperty: "Featured Property",
    specialOffers: "Special Offers",
    viewAll: "View All",
    exploreByType: "Explore by Type",
    listOfProperties: "List of Properties",
    seeAll: "See All >",
    beds: "መኝታ",
    m2: "ሜ²",
    parking: "ፓርኪንግ",
    noPromotions: "No promotions available right now.",
    noSpecial: "No special offers available right now.",
    noProperties: "No properties found.",
  },
  am: {
    filtersTitle: "ማጣሪያዎች",
    propertyType: "የንብረት አይነት",
    offerType: "የአቅርቦት አይነት",
    forSale: "ሽያጭ",
    forRent: "ኪራይ",
    priceRange: "የዋጋ መጠን",
    minPrice: "አነስተኛ ዋጋ",
    maxPrice: "ከፍተኛ ዋጋ",
    bedrooms: "መኝታ ቤቶች",
    bathrooms: "መታጠቢያዎች",
    reset: "እንደነበር መመለስ",
    applyFilters: "ማጣሪያ መፈጸም",
    close: "ዝጋ",
    filteredResults: "የተጣሩ ውጤቶች",
    searchPlaceholder: "ንብረቶችን ይፈልጉ...",
    featuredProperty: "ተለይቶ የቀረበ ንብረት",
    specialOffers: "ልዩ ቅናሾች",
    viewAll: "ሁሉንም ተመልከት",
    exploreByType: "በአይነት ይመለከቱ",
    listOfProperties: "የንብረቶች ዝርዝር",
    seeAll: "ሁሉንም እይ >",
    beds: "መኝታ",
    m2: "ሜ²",
    parking: "ፓርኪንግ",
    noPromotions: "በአሁኑ ጊዜ ማስታወቂያ የለም።",
    noSpecial: "በአሁኑ ጊዜ ልዩ ቅናሽ የለም።",
    noProperties: "ንብረት አልተገኘም።",
  },
} as const;

// type TDict = (typeof translations)[keyof typeof translations];

// --- Reusable Components ---

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-neutral-800 rounded-lg ${className}`}
  />
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10 text-gray-500 dark:text-gray-400">
    {message}
  </div>
);

// --- Main Page Component ---

function Page() {
  // lang + t
  const params = useParams();
  const currentLang = Array.isArray(params?.lang)
    ? (params.lang[0] as string)
    : (params?.lang as string) || "en";
  const t = translations[currentLang as "en" | "am"] || translations.en;

  const [search, setSearch] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );

  // Modal to show filtered results
  const [showFiltered, setShowFiltered] = useState(false);
  const [appliedFilters, setAppliedFilters] = useState<FilterInput | null>(
    null
  );

  // Data
  const [promotionData, , isLoadingPromotion] = useAction(getPromotion, [
    true,
    () => {},
  ]);
  const [categoryData, , isLoadingCategory] = useAction(categoryListHouse, [
    true,
    () => {},
  ]);
  const [specialOfferData, , isLoadingSpecialOffers] = useAction(
    specialOffers,
    [true, () => {}]
  );
  const [allHouseData, , isLoadingAllHouse] = useAction(
    allHouse,
    [true, () => {}],
    search
  );

  const [activeIndex, setActiveIndex] = useState(0);

  // Disable body scroll when results modal is open
  useEffect(() => {
    document.body.style.overflow = showFiltered ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showFiltered]);

  // Carousel auto-scroll effect
  React.useEffect(() => {
    if (!promotionData || promotionData.length === 0) return;
    const timer = setInterval(() => {
      setActiveIndex((prev) =>
        prev === promotionData.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(timer);
  }, [promotionData]);

  const nextSlide = () => {
    if (!promotionData) return;
    setActiveIndex((prev) =>
      prev === promotionData.length - 1 ? 0 : prev + 1
    );
  };

  const prevSlide = () => {
    if (!promotionData) return;
    setActiveIndex((prev) =>
      prev === 0 ? promotionData.length - 1 : prev - 1
    );
  };

  if (selectedCategoryId) {
    return (
      <ProductPerCategoryId
        categoryId={selectedCategoryId}
        onBack={() => setSelectedCategoryId(null)}
      />
    );
  }

  return (
    <div className="h-full w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <div className="container mx-auto max-w-7xl p-2 sm:p-4">
        {/* --- Search --- */}
        <div className="relative mb-4">
          <Input
            type="text"
            variant="faded"
            color="primary"
            placeholder={t.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-12 py-2 rounded-lg shadow border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-white/[0.03] backdrop-blur"
          />
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <Search
              className="h-5 w-5 text-primary-500 dark:text-primary-400"
              aria-hidden="true"
            />
          </span>
          <button
            type="button"
            onClick={() => setIsFilterOpen(true)}
            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-50 dark:hover:bg-white/10 transition"
            tabIndex={-1}
          >
            <SlidersHorizontal
              className="h-5 w-5 text-primary-500 dark:text-primary-400"
              aria-hidden="true"
            />
          </button>
        </div>

        {/* --- Promotions Carousel --- */}
        <h1 className="font-semibold text-lg">{t.featuredProperty}</h1>
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-950/30 dark:to-primary-900/20 shadow-lg mb-6 h-60 border border-slate-200/70 dark:border-neutral-800">
          {isLoadingPromotion ? (
            <SkeletonLoader className=" h-full" />
          ) : promotionData && promotionData.length > 0 ? (
            <>
              <div
                className="flex transition-transform duration-500 ease-in-out h-full"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {promotionData.map((item) => (
                  <div
                    key={item.id}
                    className="flex-shrink-0 h-full relative w-full"
                  >
                    <Image
                      src={`/api/filedata/${item.image}`}
                      alt={item.title ?? "Promotion"}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 600px"
                    />
                    <div className="absolute inset-0 bg-black/30" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold">{item.title}</h3>
                      <p className="text-sm">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
              <button
                onClick={prevSlide}
                className="absolute top-1/2 left-2 -translate-y-1/2 bg-white/70 dark:bg-neutral-900/60 hover:bg-white/90 dark:hover:bg-neutral-800 rounded-full p-2 z-10 border border-slate-200 dark:border-neutral-700 shadow-sm"
              >
                <ChevronLeft className="h-6 w-6 text-slate-800 dark:text-slate-200" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute top-1/2 right-2 -translate-y-1/2 bg-white/70 dark:bg-neutral-900/60 hover:bg-white/90 dark:hover:bg-neutral-800 rounded-full p-2 z-10 border border-slate-200 dark:border-neutral-700 shadow-sm"
              >
                <ChevronRight className="h-6 w-6 text-slate-800 dark:text-slate-200" />
              </button>
            </>
          ) : (
            <EmptyState message={t.noPromotions} />
          )}
        </div>

        {/* --- Special Offers Section --- */}
        <div className="mb-6 ">
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-xl font-bold">{t.specialOffers}</h2>
            <Link
              href={`/${currentLang}/offers`}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2  [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {isLoadingSpecialOffers
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-64 h-80">
                    <SkeletonLoader className="h-full w-full" />
                  </div>
                ))
              : specialOfferData?.map((item) => (
                  <Link
                    href={`/${currentLang}/property/${item.id}`}
                    key={item.id}
                    className="flex-shrink-0 w-64 h-80 group relative block overflow-hidden rounded-xl shadow-md border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900"
                  >
                    <Image
                      src={`/api/filedata/${item.images[0]}`}
                      alt={item.title}
                      width={256}
                      height={320}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
                    <div className="absolute top-0 left-0 p-3">
                      <div className="rounded-lg bg-white/90 dark:bg-neutral-900/80 p-2 backdrop-blur-sm border border-slate-200/70 dark:border-neutral-800">
                        <h3 className="font-bold text-gray-800 dark:text-slate-100 text-sm">
                          {item.title}
                        </h3>
                        <p className="text-xs text-red-600 dark:text-red-300 font-semibold">
                          {item.discount}% OFF
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
          </div>
          {specialOfferData?.length === 0 && !isLoadingSpecialOffers && (
            <EmptyState message={t.noSpecial} />
          )}
        </div>

        {/* --- Categories Section --- */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2 px-1">
            <h2 className="text-xl font-bold">{t.exploreByType}</h2>
            <Link
              href={`/${currentLang}/categories`}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t.viewAll}
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
            {isLoadingCategory
              ? Array.from({ length: 5 }).map((_, i) => (
                  <div
                    key={i}
                    className="flex-shrink-0 flex flex-col items-center w-24 gap-2"
                  >
                    <SkeletonLoader className="w-20 h-20 rounded-full" />
                    <SkeletonLoader className="w-16 h-4" />
                  </div>
                ))
              : categoryData?.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    className="flex-shrink-0 flex flex-col items-center w-24 gap-2 text-center cursor-pointer"
                  >
                    <Image
                      src={
                        cat.photo
                          ? `/api/filedata/${cat.photo}`
                          : "/default.png"
                      }
                      alt={cat.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-full shadow-md ring-1 ring-slate-200 dark:ring-neutral-800"
                    />
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {cat.name}
                    </span>
                  </div>
                ))}
          </div>
        </div>

        {/* --- List of Properties Section --- */}
        <div>
          <div className="flex items-center justify-between px-1 mb-3">
            <h2 className="text-xl font-bold">{t.listOfProperties}</h2>
            <Link
              href={`/${currentLang}/properties`}
              className="text-sm font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300"
            >
              {t.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoadingAllHouse ? (
              Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex gap-4 rounded-lg bg-white p-3 shadow-sm"
                >
                  <SkeletonLoader className="h-32 w-28 flex-shrink-0 rounded-md" />
                  <div className="flex-grow space-y-2">
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
            ) : allHouseData && allHouseData.length > 0 ? (
              allHouseData.map((item) => (
                <Link
                  href={`/${currentLang}/property/${item.id}`}
                  key={item.id}
                  className="block rounded-lg p-3 transition-all hover:shadow-lg hover:-translate-y-0.5 bg-white/80 dark:bg-neutral-900 shadow-sm border border-slate-200/70 dark:border-neutral-800"
                >
                  <div className="flex gap-4">
                    <Image
                      src={`/api/filedata/${item.images[0]}`}
                      alt={item.title}
                      width={112}
                      height={128}
                      className="h-32 w-28 flex-shrink-0 rounded-md object-cover"
                    />
                    <div className="flex flex-col flex-grow">
                      <h3 className="font-bold text-gray-800 dark:text-slate-100 truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                        <MapPin size={14} className="flex-shrink-0" />
                        <span>{item.location}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 dark:text-gray-400 mt-2">
                        <span className="flex items-center gap-1.5">
                          <BedDouble size={14} /> {item.bedroom} {t.beds}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Ruler size={14} /> {item.squareMeter} {t.m2}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Car size={14} /> {item.parking} {t.parking}
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
                          ${item.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))
            ) : (
              <EmptyState message={t.noProperties} />
            )}
          </div>
        </div>

        {/* Footer remains */}
        <div className="bottom-0 left-0 w-full z-50">
          <Footer />
        </div>

        {/* Use shared FilterProperty component */}
        <FilterProperty
          isOpen={isFilterOpen}
          onClose={() => setIsFilterOpen(false)}
          categories={(categoryData || []).map((c) => ({
            id: c.id,
            name: c.name,
          }))}
          onApply={(applied: FilterValues) => {
            const toNum = (v?: string) =>
              v && v.trim() !== ""
                ? Number(v.replace(/[^\d]/g, ""))
                : undefined;
            const parseCount = (v?: string) =>
              v ? Number(String(v).replace("+", "")) : undefined;

            const mapped: FilterInput = {
              property_type: applied.propertyType || undefined,
              offer_type: applied.offerType || undefined,
              minPrice: toNum(applied.minPrice),
              maxPrice: toNum(applied.maxPrice),
              bedroom: parseCount(applied.bedrooms),
              bathroom: parseCount(applied.bathrooms),
            };

            setAppliedFilters(mapped);
            setIsFilterOpen(false);
            setShowFiltered(true);
          }}
          title={t.filtersTitle}
        />

        {/* Full-page modal with filtered results */}
        {showFiltered && appliedFilters && (
          <div className="fixed inset-0 z-[60] bg-white dark:bg-neutral-950 flex flex-col">
            <div className="sticky top-0 bg-white/90 dark:bg-neutral-950/90 backdrop-blur border-b border-slate-200 dark:border-neutral-800 p-3 flex items-center justify-between">
              <button
                onClick={() => setShowFiltered(false)}
                className="px-3 py-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-neutral-800 flex items-center gap-2"
              >
                <X size={16} />
                <span>{t.close}</span>
              </button>
              <h2 className="text-lg font-bold">{t.filteredResults}</h2>
              <div className="w-16" />
            </div>
            <div className="flex-1 overflow-y-auto">
              <FilteredComponent
                filters={appliedFilters}
                title={t.filteredResults}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default Page;

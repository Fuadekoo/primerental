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
import useAction from "@/hooks/useActions";
import {
  getPromotion,
  allHouse,
  categoryListHouse,
  specialOffers,
} from "@/actions/customer/home";
import Link from "next/link";
import ProductPerCategoryId from "@/components/productper-catagoryid";
import FilteredComponent, { FilterInput } from "@/components/filteredComponent";
import Image from "next/image";
import { useParams } from "next/navigation";

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
    beds: "Beds",
    m2: "m²",
    parking: "Parking",
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

type TDict = (typeof translations)[keyof typeof translations];

// --- Reusable Components ---

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10 text-gray-500">{message}</div>
);

// --- Filter Dialog Component ---

type FilterDialogProps = {
  isOpen: boolean;
  onClose: () => void;
  categories: Array<{ id: string; name: string }>;
  onApply: (filters: {
    propertyType: string;
    offerType: string;
    minPrice: string;
    maxPrice: string;
    bedrooms: string;
    bathrooms: string;
  }) => void;
  t: TDict;
};

const FilterDialog = ({
  isOpen,
  onClose,
  categories,
  onApply,
  t,
}: FilterDialogProps) => {
  const [filters, setFilters] = useState({
    propertyType: "",
    offerType: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
  });

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleApply = () => {
    onApply(filters);
    onClose();
  };

  const handleReset = () => {
    setFilters({
      propertyType: "",
      offerType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
    });
  };

  type FilterKey =
    | "propertyType"
    | "offerType"
    | "minPrice"
    | "maxPrice"
    | "bedrooms"
    | "bathrooms";

  interface FilterButtonProps {
    value: string;
    label: string;
    stateKey: FilterKey;
  }

  const FilterButton: React.FC<FilterButtonProps> = ({
    value,
    label,
    stateKey,
  }) => (
    <button
      onClick={() =>
        setFilters((prev) => ({
          ...prev,
          [stateKey]: prev[stateKey] === value ? "" : value,
        }))
      }
      className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
        (filters as any)[stateKey] === value
          ? "bg-blue-600 text-white border-blue-600"
          : "bg-gray-100 text-gray-700 border-gray-200"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end">
      <div className="bg-white w-full max-h-[90dvh] rounded-t-2xl p-4 flex flex-col">
        <div className="flex items-center justify-between mb-4 pb-2 border-b">
          <h2 className="text-xl font-bold">{t.filtersTitle}</h2>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
          >
            <X className="h-6 w-6 text-gray-600" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pb-20">
          {/* Property Type */}
          <div>
            <h3 className="font-semibold mb-2">{t.propertyType}</h3>
            <div className="flex flex-wrap gap-2">
              {categories.map((cat: any) => (
                <FilterButton
                  key={cat.id}
                  value={String(cat.id)}
                  label={cat.name}
                  stateKey="propertyType"
                />
              ))}
            </div>
          </div>

          {/* Offer Type */}
          <div>
            <h3 className="font-semibold mb-2">{t.offerType}</h3>
            <div className="flex flex-wrap gap-2">
              <FilterButton
                value="SALE"
                label={t.forSale}
                stateKey="offerType"
              />
              <FilterButton
                value="RENT"
                label={t.forRent}
                stateKey="offerType"
              />
            </div>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-2">{t.priceRange}</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder={t.minPrice}
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder={t.maxPrice}
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <h3 className="font-semibold mb-2">{t.bedrooms}</h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, "5+"].map((num) => (
                <FilterButton
                  key={String(num)}
                  value={String(num)}
                  label={String(num)}
                  stateKey="bedrooms"
                />
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <h3 className="font-semibold mb-2">{t.bathrooms}</h3>
            <div className="flex flex-wrap gap-2">
              {[1, 2, 3, 4, "5+"].map((num) => (
                <FilterButton
                  key={String(num)}
                  value={String(num)}
                  label={String(num)}
                  stateKey="bathrooms"
                />
              ))}
            </div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 w-full bg-white p-4 border-t flex gap-4">
          <button
            onClick={handleReset}
            className="w-full py-3 rounded-lg border border-gray-300 font-semibold"
          >
            {t.reset}
          </button>
          <button
            onClick={handleApply}
            className="w-full py-3 rounded-lg bg-blue-600 text-white font-semibold"
          >
            {t.applyFilters}
          </button>
        </div>
      </div>
    </div>
  );
};

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
    <div className=" w-dvw bg-gray-50 p-2">
      <div className="relative mb-4">
        <Input
          type="text"
          variant="faded"
          color="primary"
          placeholder={t.searchPlaceholder}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-12 py-2 rounded-lg text-primary-800 shadow focus:ring-2 focus:ring-primary-300 transition"
        />
        <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
          <Search className="h-5 w-5 text-primary-500" aria-hidden="true" />
        </span>
        <button
          type="button"
          onClick={() => setIsFilterOpen(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-100 transition"
          tabIndex={-1}
        >
          <SlidersHorizontal
            className="h-5 w-5 text-primary-500"
            aria-hidden="true"
          />
        </button>
      </div>

      {/* --- Promotions Carousel --- */}
      <h1>{t.featuredProperty}</h1>
      <div className="relative overflow-hidden rounded-2xl bg-yellow-50 shadow-lg mb-6 h-60">
        {isLoadingPromotion ? (
          <SkeletonLoader className=" h-full" />
        ) : promotionData && promotionData.length > 0 ? (
          <>
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {promotionData.map((item: any) => (
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
              className="absolute top-1/2 left-2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 z-10"
            >
              <ChevronLeft className="h-6 w-6 text-gray-800" />
            </button>
            <button
              onClick={nextSlide}
              className="absolute top-1/2 right-2 transform -translate-y-1/2 bg-white/60 hover:bg-white/90 rounded-full p-2 z-10"
            >
              <ChevronRight className="h-6 w-6 text-gray-800" />
            </button>
          </>
        ) : (
          <EmptyState message={t.noPromotions} />
        )}
      </div>

      {/* --- Special Offers Section --- */}
      <div className="mb-6">
        <div className="flex items-center justify-between px-1 mb-3">
          <h2 className="text-xl font-bold text-gray-800">{t.specialOffers}</h2>
          <Link
            href={`/${currentLang}/offers`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            {t.viewAll}
          </Link>
        </div>
        <div className="columns-2 gap-4 space-y-4">
          {isLoadingSpecialOffers
            ? Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className={`break-inside-avoid-column ${
                    i % 2 === 0 ? "h-56" : "h-48"
                  }`}
                >
                  <SkeletonLoader className="h-full w-full" />
                </div>
              ))
            : specialOfferData?.map((item: any) => (
                <Link
                  href={`/${currentLang}/property/${item.id}`}
                  key={item.id}
                  className="group relative block overflow-hidden rounded-xl shadow-md break-inside-avoid-column"
                >
                  <Image
                    src={`/api/filedata/${item.images[0]}`}
                    alt={item.title}
                    width={200}
                    height={250}
                    className="h-auto w-full object-cover transition-transform duration-300 group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <div className="absolute top-0 left-0 p-3">
                    <div className="rounded-lg bg-white/90 p-2 backdrop-blur-sm">
                      <h3 className="font-bold text-gray-800 text-sm">
                        {item.title}
                      </h3>
                      <p className="text-xs text-red-600 font-semibold">
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
          <h2 className="text-xl font-bold text-gray-800">{t.exploreByType}</h2>
          <Link
            href={`/${currentLang}/categories`}
            className="text-sm font-semibold text-primary-600"
          >
            {t.viewAll}
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2">
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
            : categoryData?.map((cat: any) => (
                <div
                  key={cat.id}
                  onClick={() => setSelectedCategoryId(cat.id)}
                  className="flex-shrink-0 flex flex-col items-center w-24 gap-2 text-center cursor-pointer"
                >
                  <Image
                    src={
                      cat.photo ? `/api/filedata/${cat.photo}` : "/default.png"
                    }
                    alt={cat.name}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-full shadow-md"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {cat.name}
                  </span>
                </div>
              ))}
        </div>
      </div>

      {/* --- List of Properties Section --- */}
      <div>
        <div className="flex items-center justify-between px-1 mb-3">
          <h2 className="text-xl font-bold text-gray-800">
            {t.listOfProperties}
          </h2>
          <Link
            href={`/${currentLang}/properties`}
            className="text-sm font-semibold text-blue-600 hover:text-blue-800"
          >
            {t.seeAll}
          </Link>
        </div>
        <div className="space-y-4">
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
                className="block rounded-lg bg-white p-3 shadow-sm transition-all hover:shadow-lg hover:-translate-y-0.5"
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
                    <h3 className="font-bold text-gray-800 truncate">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">
                      <MapPin size={14} className="flex-shrink-0" />
                      <span>{item.location}</span>
                    </div>

                    <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-sm text-gray-600 mt-2">
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
                        <span className="text-xs font-semibold bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full capitalize">
                          {item.offer_type.toLowerCase()}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-blue-600">
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

      <div className="bottom-0 left-0 w-full z-50">
        <Footer />
      </div>

      <FilterDialog
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
        categories={categoryData || []}
        onApply={(applied) => {
          // map dialog values to FilterInput
          const toNum = (v?: string) =>
            v && v.trim() !== "" ? Number(v.replace(/[^\d]/g, "")) : undefined;
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
        t={t}
      />

      {/* Full-page modal with filtered results */}
      {showFiltered && appliedFilters && (
        <div className="fixed inset-0 z-[60] bg-white flex flex-col">
          <div className="sticky top-0 bg-white border-b p-3 flex items-center justify-between">
            <button
              onClick={() => setShowFiltered(false)}
              className="px-3 py-1.5 rounded-lg hover:bg-gray-100 flex items-center gap-2"
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
  );
}

export default Page;

"use client";
import Footer from "@/components/Footer";
import React, { useState } from "react";
import { Input } from "@heroui/react";
import {
  ChevronLeft,
  ChevronRight,
  Minus,
  Plus,
  PlusCircle,
  Search,
} from "lucide-react";
import useAction from "@/hooks/useActions";
import {
  getPromotion,
  allHouse,
  categoryListHouse,
  specialOffers,
} from "@/actions/customer/home";
import Link from "next/link";
// import MiniCart from "@/components/mini-cart";
// import { useCart, CartItem } from "@/hooks/useCart";
import ProductPerCategoryId from "@/components/productper-catagoryid";
import Image from "next/image";

// --- Reusable Components for Loading/Empty States ---

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const EmptyState = ({ message }: { message: string }) => (
  <div className="text-center py-10 text-gray-500">{message}</div>
);

function Page() {
  const [search, setSearch] = useState("");
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    null
  );
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

  // If a category is selected, render the product list for that category.
  if (selectedCategoryId) {
    return (
      <ProductPerCategoryId
        categoryId={selectedCategoryId}
        onBack={() => setSelectedCategoryId(null)} // This function allows the user to go back
      />
    );
  }

  // Otherwise, render the main home page.
  return (
    <div className="w-dvw bg-gray-50 p-2">
      <div className="relative mb-4">
        <Input
          type="text"
          variant="faded"
          color="primary"
          placeholder="Search for food..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pr-12 pl-4 py-2 rounded-lg text-primary-800 shadow focus:ring-2 focus:ring-primary-300 transition"
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-primary-100 transition"
          tabIndex={-1}
        >
          <Search className="h-5 w-5 text-primary-500" aria-hidden="true" />
        </button>
      </div>
      {/* --- Promotions Carousel --- */}
      <div className="relative overflow-hidden rounded-2xl bg-yellow-50 shadow-lg mb-6 h-60">
        {isLoadingPromotion ? (
          <SkeletonLoader className=" h-full" />
        ) : promotionData && promotionData.length > 0 ? (
          <>
            <div
              className="flex transition-transform duration-500 ease-in-out h-full"
              style={{ transform: `translateX(-${activeIndex * 100}%)` }}
            >
              {promotionData.map((item) => (
                <div key={item.id} className="flex-shrink-0 h-full relative">
                  <Image
                    src={`/api/filedata/${item.image}`}
                    alt={item.title ?? "Promotion"}
                    width={600}
                    height={240}
                    className="object-cover h-full w-full rounded-t-xl"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
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
          <EmptyState message="No promotions available right now." />
        )}
      </div>
      {/* --- Categories Section --- */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 px-1">
          <h2 className="text-xl font-bold text-gray-800">Categories</h2>
          <Link
            href="/categories"
            className="text-sm font-semibold text-primary-600"
          >
            View All
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
            : categoryData?.map((cat) => (
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
                    loading="lazy"
                  />
                  <span className="text-sm font-medium text-gray-700">
                    {cat.name}
                  </span>
                </div>
              ))}
        </div>
      </div>
      {/* --- Special Offers Section --- */}
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">
          Special Offers
        </h2>
        <div className="flex gap-4 overflow-x-auto pb-2">
          {isLoadingSpecialOffers
            ? Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex-shrink-0 w-64">
                  <SkeletonLoader className="h-48 rounded-xl" />
                </div>
              ))
            : specialOfferData?.map((item) => (
                <div
                  key={item.id}
                  className="relative flex-shrink-0 w-64 bg-white rounded-xl shadow-md overflow-hidden flex flex-col"
                >
                  <Image
                    src={`/api/filedata/${item.images}`}
                    alt={item.title}
                    width={256}
                    height={128}
                    className=" h-32 object-cover"
                    style={{ objectFit: "cover" }}
                    loading="lazy"
                  />
                  <div className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                    {item.discount}% OFF
                  </div>
                  <div className="p-3 flex-grow flex flex-col justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-800 truncate">
                        {item.title}
                      </h3>
                      <div className="flex items-baseline gap-2 mt-1">
                        <p className="text-lg font-bold text-primary-600">
                          ${item.price.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-500 line-through">
                          ${item.oldPrice.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    {/* <AddToCartButton item={item} /> */}
                  </div>
                </div>
              ))}
        </div>
      </div>
      {/* --- All Food Section --- */}
      <div>
        <h2 className="text-xl font-bold text-gray-800 mb-2 px-1">All Food</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {isLoadingAllHouse ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md p-2">
                <SkeletonLoader className="h-32 rounded-lg mb-2" />
                <SkeletonLoader className="w-3/4 h-5 mb-1" />
                <SkeletonLoader className="w-1/2 h-4" />
              </div>
            ))
          ) : allHouseData && allHouseData.length > 0 ? (
            allHouseData.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-xl shadow-md flex flex-col"
              >
                <Image
                  src={`/api/filedata/${item.images}`}
                  alt={item.title}
                  width={400}
                  height={128}
                  className="w-full h-32 object-cover rounded-t-xl"
                  style={{ objectFit: "cover" }}
                  loading="lazy"
                />
                <div className="p-3 flex-grow flex flex-col justify-between">
                  <div>
                    <h3 className="font-semibold text-gray-800 truncate">
                      {item.title}
                    </h3>
                    <p className="text-lg font-bold text-primary-600">
                      ${item.price.toFixed(2)}
                    </p>
                  </div>
                  {/* <AddToCartButton item={item} /> */}
                </div>
              </div>
            ))
          ) : (
            <EmptyState message="No food found." />
          )}
        </div>
      </div>

      {/* <MiniCart /> */}
      <div className="bottom-0 left-0 w-full z-50">
        <Footer />
      </div>
    </div>
  );
}

export default Page;

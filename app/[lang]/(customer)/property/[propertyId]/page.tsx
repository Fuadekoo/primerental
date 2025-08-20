"use client";
import React, { useState, useRef, useEffect } from "react";
import useAction from "@/hooks/useActions";
import { getProperty } from "@/actions/customer/property";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import wa from "@/public/wa.png";
import insta from "@/public/insta.png";
import tg from "@/public/tg.png";
import {
  ArrowLeft,
  Heart,
  Share2,
  Printer,
  MapPin,
  BedDouble,
  Bath,
  Ruler,
  Car,
  Building2,
  Mail,
  Phone,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div className={`animate-pulse bg-gray-200 rounded-lg ${className}`} />
);

const DetailRow = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between items-center py-3 border-b border-gray-100">
    <span className="text-sm text-gray-500">{label}</span>
    <span className="font-semibold text-gray-800">{value}</span>
  </div>
);

// --- Media Scroller Component ---
type MediaScrollerProps = {
  images: string[];
  youtubeLink?: string | undefined;
};

const MediaScroller: React.FC<MediaScrollerProps> = ({
  images,
  youtubeLink,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const getYouTubeEmbedUrl = (url: string) => {
    if (!url) return null;
    const videoIdMatch =
      url.match(/(?:v=|\/embed\/|\/)([\w-]{11})(?:\?|&|$)/) ||
      url.match(/(?:youtu\.be\/)([\w-]{11})/);
    return videoIdMatch
      ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
      : null;
  };

  const embedUrl = getYouTubeEmbedUrl(youtubeLink || "");
  const mediaItems = [...images, ...(embedUrl ? [embedUrl] : [])];

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.offsetWidth;
      container.scrollBy({
        left: direction === "right" ? scrollAmount : -scrollAmount,
        behavior: "smooth",
      });
    }
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = parseInt(
              entry.target.getAttribute("data-index") || "0",
              10
            );
            setActiveIndex(index);
          }
        });
      },
      { root: container, threshold: 0.5 }
    );

    Array.from(container.children).forEach((child) => observer.observe(child));
    return () => observer.disconnect();
  }, [mediaItems.length]);

  return (
    <div className="relative w-full h-60 bg-black">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-full"
      >
        {images.map((img, index) => (
          <div
            key={index}
            data-index={index}
            className="w-full h-full flex-shrink-0 snap-center relative"
          >
            <Image
              src={`/api/filedata/${img}`}
              alt={`Property image ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        {embedUrl && (
          <div
            data-index={images.length}
            className="w-full h-full flex-shrink-0 snap-center object-cover"
          >
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title="YouTube video player"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
              allowFullScreen
            ></iframe>
          </div>
        )}
      </div>

      {mediaItems.length > 1 && (
        <>
          <button
            onClick={() => handleScroll("left")}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 shadow-md hover:bg-white transition"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 rounded-full p-1.5 shadow-md hover:bg-white transition"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
            {mediaItems.map((_, index) => (
              <div
                key={index}
                className={`h-2 w-2 rounded-full transition-all ${
                  index === activeIndex ? "bg-white scale-125" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

function Page() {
  const router = useRouter();
  const { propertyId } = useParams<{ propertyId: string }>();
  const [isExpanded, setIsExpanded] = useState(false);

  const [propertyData, , isLoading] = useAction(
    getProperty,
    [true, () => {}],
    propertyId
  );

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <SkeletonLoader className="h-60 w-full" />
        <SkeletonLoader className="h-8 w-3/4" />
        <SkeletonLoader className="h-5 w-1/2" />
        <div className="space-y-2 pt-4">
          <SkeletonLoader className="h-10 w-full" />
          <SkeletonLoader className="h-10 w-full" />
          <SkeletonLoader className="h-10 w-full" />
        </div>
      </div>
    );
  }

  if (!propertyData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h2 className="text-2xl font-bold mb-4">Property Not Found</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg"
        >
          Go Back
        </button>
      </div>
    );
  }

  const {
    images,
    title,
    location,
    offer_type,
    discount,
    price,
    currency,
    createdAt,
    id,
    description,
    bedroom,
    kitchen,
    squareMeter,
    parking,
    propertyType,
    youtubeLink,
  } = propertyData;

  return (
    <div className="bg-gray-50 min-h-screen pb-40">
      {/* --- Image and Header --- */}
      <div className="relative">
        <MediaScroller images={images} youtubeLink={youtubeLink ?? undefined} />
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <button
            onClick={() => router.back()}
            className="bg-white/80 rounded-full p-2 shadow-md pointer-events-auto"
          >
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <button className="bg-white/80 rounded-full p-2 shadow-md">
              <Heart className="h-5 w-5 text-gray-800" />
            </button>
            <button className="bg-white/80 rounded-full p-2 shadow-md">
              <Share2 className="h-5 w-5 text-gray-800" />
            </button>
            <button className="bg-white/80 rounded-full p-2 shadow-md">
              <Printer className="h-5 w-5 text-gray-800" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Primary Info --- */}
      <div className="p-4 bg-white rounded-b-xl shadow-sm">
        <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
        <p className="text-gray-500 flex items-center gap-1.5 mt-1">
          <MapPin size={14} /> {location}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm font-semibold bg-blue-100 text-blue-800 px-3 py-1 rounded-full capitalize">
            For {offer_type.toLowerCase()}
          </span>
          {discount > 0 && (
            <span className="text-sm font-semibold bg-red-100 text-red-800 px-3 py-1 rounded-full">
              Hot Offer
            </span>
          )}
        </div>
        <p className="text-3xl font-extrabold text-blue-600 mt-4">
          {currency} {price.toLocaleString()}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* --- Details Section --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-2">Details</h2>
          <DetailRow
            label="Created Date"
            value={new Date(createdAt).toLocaleDateString("en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          />
          <DetailRow label="Property ID" value={id.substring(0, 8)} />
          <DetailRow
            label="Price"
            value={`${currency} ${price.toLocaleString()}`}
          />
        </div>

        {/* --- Amenities Section --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <h2 className="text-xl font-bold mb-3">Amenities</h2>
          <div className="grid grid-cols-2 gap-4 text-gray-700">
            <span className="flex items-center gap-2">
              <BedDouble size={20} /> {bedroom} Bedrooms
            </span>
            <span className="flex items-center gap-2">
              <Bath size={20} /> {kitchen} Bathrooms
            </span>
            <span className="flex items-center gap-2">
              <Ruler size={20} /> {squareMeter} m²
            </span>
            <span className="flex items-center gap-2">
              <Car size={20} /> {parking} Parking
            </span>
            <span className="flex items-center gap-2 col-span-2">
              <Building2 size={20} /> {propertyType.name}
            </span>
          </div>
        </div>

        {/* --- Description Section --- */}
        <div className="bg-white p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">Description</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-blue-600"
            >
              {isExpanded ? "Read Less" : "Read More"}
            </button>
          </div>
          <p
            className={`text-gray-600 transition-all duration-300 ${
              isExpanded ? "max-h-full" : "max-h-20 overflow-hidden"
            }`}
          >
            {description}
          </p>
        </div>
        <div className=" bottom-0 left-0 w-full bg-white/90 border-t border-gray-200 p-3 backdrop-blur-sm">
          <div className="flex justify-between items-center gap-3">
            <Link
              href="https://wa.me/qr/XFZIVZ2X5SKWF1"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg font-semibold"
            >
              <Image src={wa} alt="WhatsApp" width={20} height={20} />
            </Link>
            <Link
              href="https://www.instagram.com/prime_rental1/profilecard/?igsh=bXEzZTNuZnY1dmdy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-pink-500 text-white rounded-lg font-semibold"
            >
              <Image src={insta} alt="Instagram" width={20} height={20} />
            </Link>
            <Link
              href="https://t.me/Rental_house"
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-400 text-white rounded-lg font-semibold"
            >
              <Image src={tg} alt="Telegram" width={20} height={20} />
            </Link>
            <Link
              href="tel:+251933571691"
              className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-400 text-white rounded-lg font-semibold"
            >
              <Phone size={20} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;

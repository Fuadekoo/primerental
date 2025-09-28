"use client";
import React, { useState, useRef, useEffect } from "react";
import { useData } from "@/hooks/useData";
import { useFavoriteStore } from "@/hooks/useFavoriteStore";
import { getProperty } from "@/actions/customer/property";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { addToast } from "@heroui/toast";
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
  Phone,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// i18n strings
const translations = {
  en: {
    propertyNotFound: "Property Not Found",
    goBack: "Go Back",
    addedToFavorites: "Added to favorites!",
    removedFromFavorites: "Removed from favorites.",
    linkCopied: "Link copied to clipboard!",
    copyFailed: "Could not copy link.",
    forSale: "For Sale",
    forRent: "For Rent",
    hotOffer: "Hot Offer",
    detailsTitle: "Details",
    createdDate: "Created Date",
    propertyId: "Property ID",
    price: "Price",
    amenities: "Amenities",
    bedrooms: "Bedrooms",
    bathrooms: "Bathrooms",
    m2: "m²",
    parking: "Parking",
    description: "Description",
    readMore: "Read More",
    readLess: "Read Less",
    propertyImage: "Property image",
    youtubeTitle: "YouTube video player",
  },
  am: {
    propertyNotFound: "ንብረት አልተገኘም",
    goBack: "ተመለስ",
    addedToFavorites: "ወደ የምወዳቸው ተጨምሯል!",
    removedFromFavorites: "ከየምወዳቸው ተወግዷል።",
    linkCopied: "አገናኙ ተቀድቷል!",
    copyFailed: "አገናኙ ማቅጠር አልተሳካም።",
    forSale: "ሽያጭ",
    forRent: "ኪራይ",
    hotOffer: "ልዩ ቅናሽ",
    detailsTitle: "ዝርዝሮች",
    createdDate: "የተፈጠረበት ቀን",
    propertyId: "የንብረት መለያ",
    price: "ዋጋ",
    amenities: "መሳሪያዎች",
    bedrooms: "መኝታ ክፍሎች",
    bathrooms: "መታጠቢያዎች",
    m2: "ሜ²",
    parking: "ፓርኪንግ",
    description: "መግለጫ",
    readMore: "ተጨማሪ ያንብቡ",
    readLess: "ያነሰ አንብብ",
    propertyImage: "የንብረት ምስል",
    youtubeTitle: "ዩቲዩብ ቪዲዮ አጫዋች",
  },
} as const;

type TDict = (typeof translations)[keyof typeof translations];

const SkeletonLoader = ({ className }: { className?: string }) => (
  <div
    className={`animate-pulse bg-gray-200 dark:bg-neutral-800 rounded-lg ${className}`}
  />
);

// --- Popup Modal for Images ---
type ImageModalProps = {
  open: boolean;
  onClose: () => void;
  images: string[];
  youtubeLink?: string;
  initialIndex: number;
  t: TDict;
};

const ImageModal: React.FC<ImageModalProps> = ({
  open,
  onClose,
  images,
  youtubeLink,
  initialIndex,
  t,
}) => {
  const [current, setCurrent] = useState(initialIndex);

  const embedUrl = (() => {
    if (!youtubeLink) return null;
    const videoIdMatch =
      youtubeLink.match(/(?:v=|\/embed\/|\/)([\w-]{11})(?:\?|&|$)/) ||
      youtubeLink.match(/(?:youtu\.be\/)([\w-]{11})/);
    return videoIdMatch
      ? `https://www.youtube.com/embed/${videoIdMatch[1]}`
      : null;
  })();

  const mediaItems = [...images, ...(embedUrl ? [embedUrl] : [])];

  useEffect(() => {
    setCurrent(initialIndex);
  }, [initialIndex, open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight")
        setCurrent((c) => (c + 1) % mediaItems.length);
      if (e.key === "ArrowLeft")
        setCurrent((c) => (c - 1 + mediaItems.length) % mediaItems.length);
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [open, mediaItems.length, onClose]);

  if (!open) return null;

  return (
    <>
      {/* Blurred background overlay */}
      <div className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm"></div>
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="relative w-[90vw] max-w-2xl h-dvh flex items-center justify-center bg-black rounded-lg overflow-hidden">
          {/* Close button inside the modal, top-right */}
          <button
            className="absolute top-4 right-4 z-10 bg-white/80 dark:bg-neutral-900/80 rounded-full p-2 shadow"
            onClick={onClose}
            aria-label="Close"
          >
            <ChevronRight className="rotate-180 h-6 w-6 text-black dark:text-white" />
          </button>
          {/* Previous button */}
          <button
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/60 dark:bg-neutral-900/60 rounded-full p-2"
            onClick={() =>
              setCurrent((c) => (c - 1 + mediaItems.length) % mediaItems.length)
            }
            aria-label="Previous"
          >
            <ChevronLeft className="h-7 w-7 text-black dark:text-white" />
          </button>
          {/* Image or video */}
          {current < images.length ? (
            <Image
              src={`/api/filedata/${images[current]}`}
              alt={`${t.propertyImage} ${current + 1}`}
              fill
              className="object-contain"
              priority
            />
          ) : embedUrl ? (
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={t.youtubeTitle}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope;"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          ) : null}
          {/* Next button */}
          <button
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/60 dark:bg-neutral-900/60 rounded-full p-2"
            onClick={() => setCurrent((c) => (c + 1) % mediaItems.length)}
            aria-label="Next"
          >
            <ChevronRight className="h-7 w-7 text-black dark:text-white" />
          </button>
          {/* Dots */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {mediaItems.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 w-2 rounded-full ${
                  idx === current ? "bg-white" : "bg-white/40"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </>
  );
};

// --- Media Scroller Component ---
type MediaScrollerProps = {
  images: string[];
  youtubeLink?: string | undefined;
  t: TDict;
};

const MediaScroller: React.FC<MediaScrollerProps> = ({
  images,
  youtubeLink,
  t,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  // Add modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalIndex, setModalIndex] = useState(0);

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
    <div className="relative w-full h-60 sm:h-72 md:h-80 lg:h-[28rem] xl:h-[32rem] bg-black">
      <div
        ref={scrollContainerRef}
        className="flex overflow-x-auto snap-x snap-mandatory scroll-smooth h-full [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        {images.map((img, index) => (
          <div
            key={index}
            data-index={index}
            className="w-full h-full flex-shrink-0 snap-center relative cursor-pointer"
            onClick={() => {
              setModalIndex(index);
              setModalOpen(true);
            }}
          >
            <Image
              src={`/api/filedata/${img}`}
              alt={`${t.propertyImage} ${index + 1}`}
              fill
              className="object-cover"
              priority={index === 0}
            />
          </div>
        ))}
        {embedUrl && (
          <div
            data-index={images.length}
            className="w-full h-full flex-shrink-0 snap-center object-cover cursor-pointer"
            onClick={() => {
              setModalIndex(images.length);
              setModalOpen(true);
            }}
          >
            <iframe
              width="100%"
              height="100%"
              src={embedUrl}
              title={t.youtubeTitle}
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
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-neutral-900/60 rounded-full p-1.5 shadow-md hover:bg-white/90 dark:hover:bg-neutral-800 transition border border-slate-200 dark:border-neutral-700"
          >
            <ChevronLeft className="h-6 w-6 text-slate-800 dark:text-slate-200" />
          </button>
          <button
            onClick={() => handleScroll("right")}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/70 dark:bg-neutral-900/60 rounded-full p-1.5 shadow-md hover:bg-white/90 dark:hover:bg-neutral-800 transition border border-slate-200 dark:border-neutral-700"
          >
            <ChevronRight className="h-6 w-6 text-slate-800 dark:text-slate-200" />
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
      <ImageModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        images={images}
        youtubeLink={youtubeLink}
        initialIndex={modalIndex}
        t={t}
      />
    </div>
  );
};

function Page() {
  const router = useRouter();
  const params = useParams();

  const { propertyId = "", lang: currentLang = "en" } = params as {
    propertyId?: string;
    lang?: string;
  };

  // const propertyIdStr = Array.isArray(propertyId) ? propertyId[0] : propertyId;
  // const currentLangStr = Array.isArray(currentLang)
  //   ? currentLang[0]
  //   : currentLang;
  const t = translations[currentLang as "en" | "am"] || translations.en;
  const locale = currentLang === "am" ? "am-ET" : "en-US";

  const [isExpanded, setIsExpanded] = useState(false);

  const { toggleFavorite, isFavorite } = useFavoriteStore();
  const isFav = isFavorite(propertyId);

  const [propertyData, isLoading] = useData(getProperty, () => {}, propertyId);

  const handleToggleFavorite = () => {
    toggleFavorite(propertyId);
    if (!isFav) {
      addToast({ description: t.addedToFavorites });
    } else {
      addToast({ description: t.removedFromFavorites });
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      addToast({ description: t.linkCopied });
    } catch (err) {
      console.error("Failed to copy link: ", err);
      addToast({ description: t.copyFailed });
    }
  };

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
        <h2 className="text-2xl font-bold mb-4">{t.propertyNotFound}</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white"
        >
          {t.goBack}
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
    <div className="h-full pb-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* --- Image and Header --- */}
      <div className="relative">
        <MediaScroller
          images={images}
          youtubeLink={youtubeLink ?? undefined}
          t={t}
        />
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 bg-gradient-to-b from-black/50 to-transparent pointer-events-none">
          <button
            onClick={() => router.back()}
            className="bg-white/80 dark:bg-neutral-900/70 rounded-full p-2 shadow-md pointer-events-auto border border-slate-200 dark:border-neutral-800"
          >
            <ArrowLeft className="h-5 w-5 text-slate-800 dark:text-slate-200" />
          </button>
          <div className="flex gap-2 pointer-events-auto">
            <button
              className="bg-white/80 dark:bg-neutral-900/70 rounded-full p-2 shadow-md border border-slate-200 dark:border-neutral-800"
              onClick={handleToggleFavorite}
            >
              <Heart
                className={`h-5 w-5 transition-colors ${
                  isFav ? "text-red-500" : "text-slate-800 dark:text-slate-200"
                }`}
                fill={isFav ? "currentColor" : "none"}
              />
            </button>
            <button
              className="bg-white/80 dark:bg-neutral-900/70 rounded-full p-2 shadow-md border border-slate-200 dark:border-neutral-800"
              onClick={handleShare}
            >
              <Share2 className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            </button>
            <button className="bg-white/80 dark:bg-neutral-900/70 rounded-full p-2 shadow-md border border-slate-200 dark:border-neutral-800">
              <Printer className="h-5 w-5 text-slate-800 dark:text-slate-200" />
            </button>
          </div>
        </div>
      </div>

      {/* --- Primary Info --- */}
      <div className="p-4 bg-white/80 dark:bg-neutral-900 rounded-b-xl shadow-sm border border-slate-200/70 dark:border-neutral-800">
        <h1 className="text-2xl font-bold">{title}</h1>
        <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1.5 mt-1">
          <MapPin size={14} /> {location}
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="text-sm font-semibold px-3 py-1 rounded-full capitalize bg-primary-500/10 text-primary-700 dark:bg-primary-400/10 dark:text-primary-300">
            {offer_type === "RENT" ? t.forRent : t.forSale}
          </span>
          {discount > 0 && (
            <span className="text-sm font-semibold bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300 px-3 py-1 rounded-full">
              {t.hotOffer}
            </span>
          )}
        </div>
        <p className="text-3xl font-extrabold text-primary-600 dark:text-primary-400 mt-4">
          {currency} {price.toLocaleString()}
        </p>
      </div>

      <div className="p-4 space-y-6">
        {/* --- Details Section --- */}
        <div className="bg-white/80 dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-slate-200/70 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-2">{t.detailsTitle}</h2>
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t.createdDate}
              </span>
              <span className="font-semibold">
                {new Date(createdAt).toLocaleDateString(locale, {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t.propertyId}
              </span>
              <span className="font-semibold">{id.substring(0, 8)}</span>
            </div>
            <div className="flex justify-between items-center py-3">
              <span className="text-sm text-slate-600 dark:text-slate-400">
                {t.price}
              </span>
              <span className="font-semibold">
                {currency} {price.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* --- Amenities Section --- */}
        <div className="bg-white/80 dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-slate-200/70 dark:border-neutral-800">
          <h2 className="text-xl font-bold mb-3">{t.amenities}</h2>
          <div className="grid grid-cols-2 gap-4 text-slate-800 dark:text-slate-200">
            <span className="flex items-center gap-2">
              <BedDouble size={20} /> {bedroom} {t.bedrooms}
            </span>
            <span className="flex items-center gap-2">
              <Bath size={20} /> {kitchen} {t.bathrooms}
            </span>
            <span className="flex items-center gap-2">
              <Ruler size={20} /> {squareMeter} {t.m2}
            </span>
            <span className="flex items-center gap-2">
              <Car size={20} /> {parking} {t.parking}
            </span>
            <span className="flex items-center gap-2 col-span-2">
              <Building2 size={20} /> {propertyType.name}
            </span>
          </div>
        </div>

        {/* --- Description Section --- */}
        <div className="bg-white/80 dark:bg-neutral-900 p-4 rounded-xl shadow-sm border border-slate-200/70 dark:border-neutral-800">
          <div className="flex justify-between items-center mb-2">
            <h2 className="text-xl font-bold">{t.description}</h2>
            <button
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-sm font-semibold text-primary-600 dark:text-primary-400"
            >
              {isExpanded ? t.readLess : t.readMore}
            </button>
          </div>
          <p
            className={`text-slate-700 dark:text-slate-300 transition-all duration-300 ${
              isExpanded ? "max-h-full" : "max-h-20 overflow-hidden"
            }`}
          >
            {description}
          </p>
        </div>

        {/* --- Contact Shortcuts --- */}
        <div className="bottom-0 left-0 w-full bg-white/90 dark:bg-neutral-900/90 border-t border-slate-200 dark:border-neutral-800 p-3 backdrop-blur-sm">
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

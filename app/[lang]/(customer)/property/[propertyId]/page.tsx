"use client";
import React, { useState, useRef, useEffect } from "react";
import { useData } from "@/hooks/useData";
import { useFavoriteStore } from "@/hooks/useFavoriteStore";
import { getProperty } from "@/actions/customer/property";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { toast } from "sonner";
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

  const [propertyData, isLoading, refresh] = useData(
    getProperty,
    () => {},
    propertyId
  );

  const handleToggleFavorite = () => {
    toggleFavorite(propertyId);
    if (!isFav) {
      addToast({ description: t.addedToFavorites });
    } else {
      toast.info(t.removedFromFavorites);
    }
  };

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      toast.success(t.linkCopied);
    } catch (err) {
      console.error("Failed to copy link: ", err);
      toast.error(t.copyFailed);
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
    bathroom,
    kitchen,
    squareMeter,
    parking,
    propertyType,
    youtubeLink,
  } = propertyData;

  const amenitiesList = [
    { icon: <BedDouble size={20} />, label: t.bedrooms, value: bedroom },
    { icon: <Bath size={20} />, label: t.bathrooms, value: bathroom },
    { icon: <Ruler size={20} />, label: t.m2, value: squareMeter },
    { icon: <Car size={20} />, label: t.parking, value: parking },
    { icon: <Building2 size={20} />, label: "Type", value: propertyType.name },
  ];

  return (
    <div className="h-full pb-8 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* --- Desktop Layout Grid --- */}
      <div className="max-w-[1400px] mx-auto hidden lg:grid grid-cols-[1fr_380px] gap-8 p-6">
        {/* Left Column: Media & Details */}
        <div className="space-y-6">
          {/* Main Gallery Section */}
          <div className="bg-white dark:bg-neutral-900 rounded-2xl overflow-hidden border border-slate-200 dark:border-neutral-800 shadow-sm">
            <div className="relative h-[500px] w-full group">
              <Image
                src={`/api/filedata/${images[0]}`}
                alt={title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
                priority
              />
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-4 py-1.5 bg-green-600 text-white text-sm font-bold rounded-full shadow-lg">
                  Photos
                </span>
                {youtubeLink && (
                  <span className="px-4 py-1.5 bg-white text-black text-sm font-bold rounded-full shadow-lg flex items-center gap-1">
                    3D Tour
                  </span>
                )}
              </div>
            </div>
            {/* Thumbnails Row */}
            <div className="grid grid-cols-4 gap-2 p-2 bg-white dark:bg-neutral-900">
              {images.slice(1, 5).map((img, idx) => (
                <div
                  key={idx}
                  className="relative h-28 rounded-xl overflow-hidden cursor-pointer hover:opacity-90 transition"
                >
                  <Image
                    src={`/api/filedata/${img}`}
                    alt="thumbnail"
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* About Property */}
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-xl font-bold mb-4 border-b pb-2 border-slate-100 dark:border-neutral-800">
              {t.description}
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {description}
            </p>
          </div>

          {/* Features Grid */}
          <div className="bg-white dark:bg-neutral-900 p-8 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm">
            <h2 className="text-xl font-bold mb-6 border-b pb-2 border-slate-100 dark:border-neutral-800">
              {t.amenities}
            </h2>
            <div className="grid grid-cols-3 gap-6">
              {amenitiesList.map((item, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-4 rounded-xl bg-slate-50 dark:bg-neutral-800/50"
                >
                  <div className="text-green-600 dark:text-green-500">
                    {item.icon}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-slate-900 dark:text-white">
                      {item.value}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {item.label}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Sidebar */}
        <div className="space-y-6">
          {/* Price & Title Card */}
          <div className="bg-white dark:bg-neutral-900 p-6 rounded-2xl border border-slate-200 dark:border-neutral-800 shadow-sm sticky top-24">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
              {title}
            </h1>
            <p className="text-slate-500 text-sm mb-6 flex items-center gap-1">
              <MapPin size={14} /> {location}
            </p>

            <div className="flex flex-wrap gap-2 mb-6">
              <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                {offer_type}
              </span>
              {propertyType && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-lg uppercase tracking-wider">
                  {propertyType.name}
                </span>
              )}
            </div>

            <div className="bg-slate-50 dark:bg-neutral-800 rounded-xl p-5 mb-6 border border-slate-100 dark:border-neutral-700 relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 rounded-full -mr-10 -mt-10 group-hover:bg-green-500/10 transition-colors"></div>
              <p className="text-xs text-slate-500 uppercase font-bold mb-1">
                Total Price
              </p>
              <p className="text-3xl font-extrabold text-slate-900 dark:text-white relative z-10">
                {price.toLocaleString()}{" "}
                <span className="text-lg text-slate-500 font-medium">
                  {currency}
                </span>
              </p>
              <p className="text-xs text-slate-400 mt-1 relative z-10">
                {(price / squareMeter).toFixed(0)} {currency} per m²
              </p>
            </div>

            {/* Agent / Marketing Section */}
            <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-100 dark:border-blue-900/30 flex items-center gap-4">
              <div className="w-12 h-12 bg-white dark:bg-neutral-800 rounded-full flex items-center justify-center shadow-sm p-1">
                <Image
                  src="/logo_with_bg.png"
                  width={40}
                  height={40}
                  alt="Prime"
                  className="rounded-full"
                />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">
                  Prime Rental
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Verified Listing Partner
                </p>
              </div>
            </div>

            {/* Access Buttons */}
            <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1">
              Contact for Booking
            </p>
            <div className="grid grid-cols-4 gap-2">
              <Link
                href="https://wa.me/qr/XFZIVZ2X5SKWF1"
                className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 hover:bg-green-50 dark:bg-neutral-800 dark:hover:bg-green-900/20 rounded-xl border border-slate-200 dark:border-neutral-700 transition hover:scale-105"
                title="WhatsApp"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-green-500">
                  <Image src={wa} alt="WhatsApp" width={20} height={20} />
                </div>
              </Link>
              <Link
                href="https://www.instagram.com/prime_rental1/profilecard/?igsh=bXEzZTNuZnY1dmdy"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 hover:bg-pink-50 dark:bg-neutral-800 dark:hover:bg-pink-900/20 rounded-xl border border-slate-200 dark:border-neutral-700 transition hover:scale-105"
                title="Instagram"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-pink-500">
                  <Image src={insta} alt="Instagram" width={20} height={20} />
                </div>
              </Link>
              <Link
                href="https://t.me/Rental_house"
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 hover:bg-blue-50 dark:bg-neutral-800 dark:hover:bg-blue-900/20 rounded-xl border border-slate-200 dark:border-neutral-700 transition hover:scale-105"
                title="Telegram"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-blue-500">
                  <Image src={tg} alt="Telegram" width={20} height={20} />
                </div>
              </Link>
              <Link
                href="tel:+251933571691"
                className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 hover:bg-indigo-50 dark:bg-neutral-800 dark:hover:bg-indigo-900/20 rounded-xl border border-slate-200 dark:border-neutral-700 transition hover:scale-105"
                title="Call"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-indigo-500">
                  <Phone size={18} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* --- Mobile Layout (Original) --- */}
      <div className="lg:hidden relative">
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

      {/* --- Mobile Primary Info --- */}
      <div className="lg:hidden p-4 bg-white/80 dark:bg-neutral-900 rounded-b-xl shadow-sm border border-slate-200/70 dark:border-neutral-800">
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

      <div className="lg:hidden p-4 space-y-6">
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
              <Bath size={20} /> {bathroom} {t.bathrooms}
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
        <div className="bottom-0 left-0 w-full bg-white/95 dark:bg-neutral-900/95 border-t border-slate-200 dark:border-neutral-800 p-4 backdrop-blur-md rounded-t-2xl shadow-[0_-5px_20px_-5px_rgba(0,0,0,0.1)]">
          <p className="text-xs font-bold text-slate-400 uppercase mb-3 px-1 text-center tracking-widest">
            Contact for Booking
          </p>
          <div className="grid grid-cols-4 gap-3">
            <Link
              href="https://wa.me/qr/XFZIVZ2X5SKWF1"
              className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 active:scale-95 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 transition"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-green-500">
                <Image src={wa} alt="WhatsApp" width={22} height={22} />
              </div>
            </Link>
            <Link
              href="https://www.instagram.com/prime_rental1/profilecard/?igsh=bXEzZTNuZnY1dmdy"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 active:scale-95 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 transition"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-pink-500">
                <Image src={insta} alt="Instagram" width={22} height={22} />
              </div>
            </Link>
            <Link
              href="https://t.me/Rental_house"
              target="_blank"
              rel="noopener noreferrer"
              className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 active:scale-95 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 transition"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-blue-500">
                <Image src={tg} alt="Telegram" width={22} height={22} />
              </div>
            </Link>
            <Link
              href="tel:+251933571691"
              className="flex flex-col items-center justify-center gap-1 py-3 bg-slate-50 active:scale-95 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700 transition"
            >
              <div className="w-8 h-8 flex items-center justify-center bg-white dark:bg-neutral-700 rounded-full shadow-sm text-indigo-500">
                <Phone size={18} />
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Page;

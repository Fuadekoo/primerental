"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
import { getProperty } from "@/actions/customer/property";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
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
  } = propertyData;

  return (
    <div className="bg-gray-50 min-h-screen pb-24">
      {/* --- Image and Header --- */}
      <div className="relative">
        <Image
          src={`/api/filedata/${images[0]}`}
          alt={title}
          width={500}
          height={300}
          className="w-full h-60 object-cover"
          priority
        />
        <div className="absolute top-0 left-0 right-0 flex justify-between items-center p-3 bg-gradient-to-b from-black/50 to-transparent">
          <button
            onClick={() => router.back()}
            className="bg-white/80 rounded-full p-2 shadow-md"
          >
            <ArrowLeft className="h-5 w-5 text-gray-800" />
          </button>
          <div className="flex gap-2">
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
      </div>

      {/* --- Fixed Action Footer --- */}
      <div className="fixed bottom-0 left-0 w-full bg-white/90 border-t border-gray-200 p-3 backdrop-blur-sm">
        <div className="flex justify-between items-center gap-3">
          <a
            href="mailto:info@primerental.com"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-blue-500 text-white rounded-lg font-semibold"
          >
            <Mail size={18} /> Email
          </a>
          <a
            href="tel:+123456789"
            className="flex-1 flex items-center justify-center gap-2 py-3 bg-green-500 text-white rounded-lg font-semibold"
          >
            <Phone size={18} /> Call
          </a>
          <button className="flex-1 flex items-center justify-center gap-2 py-3 bg-orange-500 text-white rounded-lg font-semibold">
            <MessageSquare size={18} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}

export default Page;

"use client";
import React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import { getPropertyTypes } from "@/actions/customer/propertyType";
import { propertyRequest } from "@/actions/customer/requestProperty";
import { propertyRequestSchema } from "@/lib/zodSchema";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useRouter, useParams } from "next/navigation";
import { Send, KeyRound, Handshake, Loader2 } from "lucide-react";
import requestBg from "@/public/cover.jpg";
import Loading from "@/components/loading";

// Simple i18n copy
const translations = {
  en: {
    pageTitle: "Property Request",
    pageDescription: "Let us know what you're looking for",
    successMessage: "Your property request has been submitted successfully!",
    contactInfoTitle: "Your Contact Information",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+251 91 123 4567",
    propertyDetailsTitle: "Property Details",
    requestTypeLabel: "I want to...",
    requestTypeRent: "Rent",
    requestTypeBuy: "Buy",
    propertyTypeLabel: "Property Type",
    loadingTypes: "Loading types...",
    maxPriceLabel: "Maximum Price (ETB)",
    maxPricePlaceholder: "e.g., 500,000",
    bedroomsLabel: "Bedrooms",
    bedroomsPlaceholder: "3",
    bathroomsLabel: "Bathrooms",
    bathroomsPlaceholder: "2",
    minSizeLabel: "Minimum Size (sq. m.)",
    minSizePlaceholder: "e.g., 120",
    additionalInfoLabel: "Additional Information",
    additionalInfoPlaceholder: "Tell us about any other requirements...",
    submitting: "Submitting...",
    submitButton: "Submit Request",
  },
  am: {
    pageTitle: "የንብረት ጥያቄ",
    pageDescription: "የሚፈልጉትን ይንገሩን",
    successMessage: "የንብረት ጥያቄዎ በተሳካ ሁኔታ ገብቷል!",
    contactInfoTitle: "የእርስዎ የእውቂያ መረጃ",
    fullNameLabel: "ሙሉ ስም",
    fullNamePlaceholder: "ሙሉ ስም",
    emailLabel: "የኢሜል አድራሻ",
    emailPlaceholder: "you@example.com",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "+251 91 123 4567",
    propertyDetailsTitle: "የንብረት ዝርዝሮች",
    requestTypeLabel: "እኔ የምፈልገው...",
    requestTypeRent: "መከራየት",
    requestTypeBuy: "መግዛት",
    propertyTypeLabel: "የንብረት ዓይነት",
    loadingTypes: "ዓይነቶች እየተጫኑ ነው...",
    maxPriceLabel: "ከፍተኛ ዋጋ (በብር)",
    maxPricePlaceholder: "ለምሳሌ, 500,000",
    bedroomsLabel: "መኝታ ክፍሎች",
    bedroomsPlaceholder: "3",
    bathroomsLabel: "መታጠቢያ ቤቶች",
    bathroomsPlaceholder: "2",
    minSizeLabel: "ዝቅተኛ ስፋት (በካሬ ሜትር)",
    minSizePlaceholder: "ለምሳሌ, 120",
    additionalInfoLabel: "ተጨማሪ መረጃ",
    additionalInfoPlaceholder: "ስለሌሎች መስፈርቶች ይንገሩን...",
    submitting: "በማስገባት ላይ...",
    submitButton: "ጥያቄ አስገባ",
  },
} as const;

type RequestFormValues = z.infer<typeof propertyRequestSchema>;

function PropertyRequestPage() {
  const router = useRouter();
  const params = useParams();
  const lang = ((params?.lang as string) || "en") as "en" | "am";
  const t = translations[lang];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(propertyRequestSchema),
    defaultValues: {
      offerType: "rent",
      bedrooms: 1,
      bathrooms: 1,
    },
  });

  // Handle propertyTypes result structure
  const [propertyTypesResult, isLoadingTypes, refreshTypes] = useData(
    getPropertyTypes,
    () => {}
  );
  const propertyTypes = propertyTypesResult;

  const [action, loading] = useMutation(propertyRequest, () => {
    toast.success(t.successMessage);
    router.push(`/${lang}/home`);
  });

  const onSubmit = (data: RequestFormValues) => {
    action(data);
  };

  return (
    <div className="h-full w-full overflow-x-hidden bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {loading && <Loading />}
      {/* --- Header --- */}
      <div className="relative h-48 w-full overflow-hidden">
        <Image
          src={requestBg}
          alt={t.pageTitle}
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-3xl sm:text-4xl font-bold">{t.pageTitle}</h1>
          <p className="mt-2 text-base sm:text-lg opacity-90">
            {t.pageDescription}
          </p>
        </div>
      </div>

      {/* --- Form --- */}
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-y-6 gap-x-6 rounded-2xl bg-white/80 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 p-6 shadow-lg sm:grid-cols-2 sm:p-8"
        >
          <div className="col-span-1 sm:col-span-2">
            <h2 className="text-xl font-semibold">{t.contactInfoTitle}</h2>
          </div>

          {/* First Name */}
          <div>
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              First Name
            </label>
            <Input
              id="firstName"
              placeholder="First Name"
              {...register("firstName")}
            />
            {errors.firstName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.firstName.message}
              </p>
            )}
          </div>

          {/* Last Name */}
          <div>
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              Last Name
            </label>
            <Input
              id="lastName"
              placeholder="Last Name"
              {...register("lastName")}
            />
            {errors.lastName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.lastName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.emailLabel}
            </label>
            <Input
              id="email"
              type="email"
              placeholder={t.emailPlaceholder}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-sm text-red-600 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.phoneLabel}
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder={t.phonePlaceholder}
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 pt-2 sm:pt-4">
            <h2 className="text-xl font-semibold">{t.propertyDetailsTitle}</h2>
          </div>

          {/* Offer Type */}
          <Controller
            name="offerType"
            control={control}
            render={({ field }) => (
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.requestTypeLabel}
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => field.onChange("rent")}
                    className={`flex items-center justify-center gap-3 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      field.value === "rent"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                        : "border-slate-300 dark:border-neutral-700"
                    }`}
                  >
                    <KeyRound
                      className={`h-6 w-6 ${
                        field.value === "rent"
                          ? "text-primary-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="font-semibold">{t.requestTypeRent}</span>
                  </div>
                  <div
                    onClick={() => field.onChange("buy")}
                    className={`flex items-center justify-center gap-3 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      field.value === "buy"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                        : "border-slate-300 dark:border-neutral-700"
                    }`}
                  >
                    <Handshake
                      className={`h-6 w-6 ${
                        field.value === "buy"
                          ? "text-primary-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="font-semibold">{t.requestTypeBuy}</span>
                  </div>
                </div>
                {errors.offerType && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.offerType.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Property Type */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              {t.propertyTypeLabel}
            </label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {isLoadingTypes ? (
                    <p className="text-sm text-gray-500">{t.loadingTypes}</p>
                  ) : Array.isArray(propertyTypes) &&
                    propertyTypes.length > 0 ? (
                    propertyTypes.map((type) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => field.onChange(type.id)}
                        className={`rounded-lg px-4 py-2 border-2 cursor-pointer transition-all text-sm font-medium ${
                          field.value === type.id
                            ? "border-primary-500 bg-primary-50 text-primary-700 dark:bg-primary-500/10 dark:text-primary-300"
                            : "border-slate-300 bg-white hover:bg-slate-50 dark:border-neutral-700 dark:bg-neutral-900 dark:hover:bg-neutral-800"
                        }`}
                      >
                        {type.name}
                      </button>
                    ))
                  ) : (
                    <p className="text-sm text-red-500">
                      No property types available.
                    </p>
                  )}
                </div>
              )}
            />
            {errors.propertyType && (
              <p className="text-sm text-red-600 mt-1">
                {errors.propertyType.message}
              </p>
            )}
          </div>

          {/* Max Price */}
          <div>
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.maxPriceLabel}
            </label>
            <Input
              id="maxPrice"
              type="number"
              placeholder={t.maxPricePlaceholder}
              {...register("maxPrice", { valueAsNumber: true })}
            />
            {errors.maxPrice && (
              <p className="text-sm text-red-600 mt-1">
                {errors.maxPrice.message}
              </p>
            )}
          </div>

          {/* Bedrooms */}
          <div>
            <label
              htmlFor="bedrooms"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.bedroomsLabel}
            </label>
            <Input
              id="bedrooms"
              type="number"
              placeholder={t.bedroomsPlaceholder}
              min="0"
              {...register("bedrooms", { valueAsNumber: true })}
            />
            {errors.bedrooms && (
              <p className="text-sm text-red-600 mt-1">
                {errors.bedrooms.message}
              </p>
            )}
          </div>

          {/* Bathrooms */}
          <div>
            <label
              htmlFor="bathrooms"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.bathroomsLabel}
            </label>
            <Input
              id="bathrooms"
              type="number"
              placeholder={t.bathroomsPlaceholder}
              min="0"
              {...register("bathrooms", { valueAsNumber: true })}
            />
            {errors.bathrooms && (
              <p className="text-sm text-red-600 mt-1">
                {errors.bathrooms.message}
              </p>
            )}
          </div>

          {/* Minimum Size */}
          <div>
            <label
              htmlFor="minSize"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.minSizeLabel}
            </label>
            <Input
              id="minSize"
              type="number"
              placeholder={t.minSizePlaceholder}
              {...register("minimumSize", { valueAsNumber: true })}
            />
            {errors.minimumSize && (
              <p className="text-sm text-red-600 mt-1">
                {errors.minimumSize.message}
              </p>
            )}
          </div>

          {/* Message */}
          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="message"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.additionalInfoLabel}
            </label>
            <Textarea
              id="message"
              placeholder={t.additionalInfoPlaceholder}
              {...register("message")}
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-red-600 mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              size="lg"
              disabled={loading}
              className="w-full sm:w-auto"
            >
              {loading ? (
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              ) : (
                <Send className="h-5 w-5 mr-2" />
              )}
              {loading ? t.submitting : t.submitButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyRequestPage;

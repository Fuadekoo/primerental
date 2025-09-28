"use client";
import React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import { getPropertyTypes } from "@/actions/customer/propertyType";
import { propertyRegister } from "@/actions/customer/registerProperty";
import { propertyRegisterSchema } from "@/lib/zodSchema";
import { Input, Button, Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter, useParams } from "next/navigation";
import { KeyRound, Building, Send } from "lucide-react";
import requestBg from "@/public/cover.jpg";
import Loading from "@/components/loading";

// Simple i18n copy
const translations = {
  en: {
    pageTitle: "Register Your Property",
    pageDescription:
      "Provide your details and we'll help you find the perfect property.",
    successMessage: "Property request submitted successfully!",
    contactInfoTitle: "Your Contact Information",
    fullNameLabel: "Full Name",
    fullNamePlaceholder: "John Doe",
    emailLabel: "Email Address",
    emailPlaceholder: "you@example.com",
    phoneLabel: "Phone Number",
    phonePlaceholder: "+251 91 123 4567",
    propertyDetailsTitle: "Property Details",
    registerTypeLabel: "I want to...",
    registerTypeRent: "Rent",
    registerTypeBuy: "Buy",
    propertyTypeLabel: "Property Type",
    loadingTypes: "Loading types...",
    locationLabel: "General Location",
    locationPlaceholder: "e.g., Addis Ababa, Bole",
    realLocationLabel: "Specific Address / Real Location",
    realLocationPlaceholder: "e.g., Edna Mall, 2nd Floor",
    descriptionLabel: "Description",
    descriptionPlaceholder: "Describe your ideal property...",
    submitting: "Submitting...",
    submitButton: "Submit Request",
  },
  am: {
    pageTitle: "ንብረትዎን ያስመዝግቡ",
    pageDescription: "ዝርዝሮችዎን ያቅርቡ እና ትክክለኛውን ንብረት እንዲያገኙ እናግዝዎታለን።",
    successMessage: "የንብረት ጥያቄ በተሳካ ሁኔታ ገብቷል!",
    contactInfoTitle: "የእርስዎ የእውቂያ መረጃ",
    fullNameLabel: "ሙሉ ስም",
    fullNamePlaceholder: "ሙሉ ስም",
    emailLabel: "የኢሜል አድራሻ",
    emailPlaceholder: "you@example.com",
    phoneLabel: "ስልክ ቁጥር",
    phonePlaceholder: "+251 91 123 4567",
    propertyDetailsTitle: "የንብረት ዝርዝሮች",
    registerTypeLabel: "እኔ የምፈልገው...",
    registerTypeRent: "መከራየት",
    registerTypeBuy: "መግዛት",
    propertyTypeLabel: "የንብረት ዓይነት",
    loadingTypes: "ዓይነቶች እየተጫኑ ነው...",
    locationLabel: "አጠቃላይ አካባቢ",
    locationPlaceholder: "ምሳሌ: አዲስ አበባ, ቦሌ",
    realLocationLabel: "ትክክለኛ አድራሻ / እውነተኛ አካባቢ",
    realLocationPlaceholder: "ምሳሌ: ኤድና ሞል, 2ኛ ፎቅ",
    descriptionLabel: "መግለጫ",
    descriptionPlaceholder: "የሚፈልጉትን ንብረት ይግለጹ...",
    submitting: "በማስገባት ላይ...",
    submitButton: "ጥያቄ አስገባ",
  },
} as const;

type RegisterFormValues = z.infer<typeof propertyRegisterSchema>;

function PropertyRegisterPage() {
  const router = useRouter();
  const params = useParams();
  const lang = ((params?.lang as string) || "en") as "en" | "am";
  const t = translations[lang];

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(propertyRegisterSchema),
    defaultValues: {
      isVisit: false,
      isVisited: false,
    },
  });

  const [propertyTypesResult, isLoadingTypes, refreshTypes] = useData(
    getPropertyTypes,
    () => {}
  );

  // If your getPropertyTypes returns { data: [...] }, use propertyTypesResult?.data
  const propertyTypes = propertyTypesResult;

  const [action, loading] = useMutation(propertyRegister, () => {
    addToast({
      description: t.successMessage,
    });
    router.push(`/${lang}/home`);
  });

  const onSubmit = (data: RegisterFormValues) => {
    // No mapping needed, just pass data directly
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
          className="grid grid-cols-1 gap-y-8 gap-x-6 rounded-2xl bg-white/80 dark:bg-neutral-900 border border-slate-200/70 dark:border-neutral-800 p-6 shadow-lg sm:grid-cols-2 sm:p-8"
        >
          {/* --- Contact Information --- */}
          <div className="col-span-1 sm:col-span-2">
            <h2 className="text-xl font-semibold">{t.contactInfoTitle}</h2>
          </div>

          <div>
            <label
              htmlFor="fullname"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.fullNameLabel}
            </label>
            <Input
              id="fullname"
              placeholder={t.fullNamePlaceholder}
              {...register("fullname")}
            />
            {errors.fullname && (
              <p className="text-sm text-red-600 mt-1">
                {errors.fullname.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.phoneLabel}
            </label>
            <Input
              id="phone"
              type="number"
              placeholder={t.phonePlaceholder}
              {...register("phone", { valueAsNumber: true })}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* --- Property Details --- */}
          <div className="col-span-1 sm:col-span-2 pt-2 sm:pt-4">
            <h2 className="text-xl font-semibold">{t.propertyDetailsTitle}</h2>
          </div>

          {/* --- Offer Type --- */}
          <Controller
            name="type"
            control={control}
            render={({ field }) => (
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                  {t.registerTypeLabel}
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
                    <span className="font-semibold">{t.registerTypeRent}</span>
                  </div>
                  <div
                    onClick={() => field.onChange("buy")}
                    className={`flex items-center justify-center gap-3 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      field.value === "buy"
                        ? "border-primary-500 bg-primary-50 dark:bg-primary-500/10"
                        : "border-slate-300 dark:border-neutral-700"
                    }`}
                  >
                    <Building
                      className={`h-6 w-6 ${
                        field.value === "buy"
                          ? "text-primary-600"
                          : "text-gray-500 dark:text-gray-400"
                      }`}
                    />
                    <span className="font-semibold">{t.registerTypeBuy}</span>
                  </div>
                </div>
              </div>
            )}
          />

          {/* --- Property Type --- */}
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

          {/* --- Location & Real Location --- */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.locationLabel}
            </label>
            <Input
              id="location"
              placeholder={t.locationPlaceholder}
              {...register("location")}
            />
            {errors.location && (
              <p className="text-sm text-red-600 mt-1">
                {errors.location.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="realLocation"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.realLocationLabel}
            </label>
            <Input
              id="realLocation"
              placeholder={t.realLocationPlaceholder}
              {...register("realLocation")}
            />
            {errors.realLocation && (
              <p className="text-sm text-red-600 mt-1">
                {errors.realLocation.message}
              </p>
            )}
          </div>

          {/* --- Description --- */}
          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
            >
              {t.descriptionLabel}
            </label>
            <Textarea
              id="description"
              placeholder={t.descriptionPlaceholder}
              {...register("description")}
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          {/* --- Hidden optional booleans for schema --- */}
          <input type="hidden" {...register("isVisit")} />
          <input type="hidden" {...register("isVisited")} />

          {/* --- Submission --- */}
          <div className="col-span-1 sm:col-span-2 flex justify-end pt-4">
            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full sm:w-auto"
              disabled={loading}
            >
              <Send className="h-5 w-5 mr-2" />
              {loading ? t.submitting : t.submitButton}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyRegisterPage;

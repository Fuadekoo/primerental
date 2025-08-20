"use client";
import React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAction from "@/hooks/useActions";
import { getPropertyTypes } from "@/actions/customer/propertyType";
import { propertyRequest } from "@/actions/customer/requestProperty";
import { propertyRequestSchema } from "@/lib/zodSchema";
import { Input, Button, Textarea, Select } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  Building2,
  CircleDollarSign,
  BedDouble,
  Bath,
  Ruler,
  MessageSquare,
  Send,
  KeyRound,
  Handshake,
  Minus,
  Plus,
} from "lucide-react";
import requestBg from "@/public/cover.jpg";
import Loading from "@/components/loading";

type RequestFormValues = z.infer<typeof propertyRequestSchema>;

function PropertyRequestPage() {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<RequestFormValues>({
    resolver: zodResolver(propertyRequestSchema),
    defaultValues: {
      requestType: "rent",
      bedroom: 1,
      bathroom: 1,
    },
  });

  const [propertyTypes, , isLoadingTypes] = useAction(getPropertyTypes, [
    true,
    () => {},
  ]);

  const [action, , loading] = useAction(propertyRequest, [, () => {}]);

  const onSubmit = (data: RequestFormValues) => {
    action(data);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {loading && <Loading />}
      {/* --- Header --- */}
      <div className="relative h-48 w-full">
        <Image
          src={requestBg}
          alt="Modern buildings"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-4xl font-bold">Property Request</h1>
          <p className="mt-2 text-lg">Let us know what you're looking for</p>
        </div>
      </div>

      {/* --- Form --- */}
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-y-6 gap-x-6 rounded-2xl bg-white p-6 shadow-lg sm:grid-cols-2 sm:p-8"
        >
          <div className="col-span-1 sm:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Contact Information
            </h2>
          </div>

          {/* Full Name */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Full Name
            </label>
            <Input
              id="fullName"
              placeholder="John Doe"
              {...register("fullName")}
            />
            {errors.fullName && (
              <p className="text-sm text-red-600 mt-1">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email Address
            </label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Phone Number
            </label>
            <Input
              id="phone"
              type="tel"
              placeholder="+1 (555) 000-0000"
              {...register("phone")}
            />
            {errors.phone && (
              <p className="text-sm text-red-600 mt-1">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 pt-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Property Details
            </h2>
          </div>

          {/* Request Type */}
          <Controller
            name="requestType"
            control={control}
            render={({ field }) => (
              <div className="col-span-1 sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  I want to...
                </label>
                <div className="grid grid-cols-2 gap-4">
                  <div
                    onClick={() => field.onChange("rent")}
                    className={`flex items-center justify-center gap-3 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      field.value === "rent"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <KeyRound
                      className={`h-6 w-6 ${
                        field.value === "rent"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-semibold">Rent</span>
                  </div>
                  <div
                    onClick={() => field.onChange("buy")}
                    className={`flex items-center justify-center gap-3 rounded-lg p-4 border-2 cursor-pointer transition-all ${
                      field.value === "buy"
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-300"
                    }`}
                  >
                    <Handshake
                      className={`h-6 w-6 ${
                        field.value === "buy"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-semibold">Buy</span>
                  </div>
                </div>
                {errors.requestType && (
                  <p className="text-sm text-red-600 mt-1">
                    {errors.requestType.message}
                  </p>
                )}
              </div>
            )}
          />

          {/* Property Type */}
          <div className="col-span-1 sm:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Property Type
            </label>
            <Controller
              name="propertyType"
              control={control}
              render={({ field }) => (
                <div className="flex flex-wrap gap-3">
                  {isLoadingTypes ? (
                    <p className="text-sm text-gray-500">Loading types...</p>
                  ) : (
                    propertyTypes?.map((type: any) => (
                      <button
                        type="button"
                        key={type.id}
                        onClick={() => field.onChange(type.id)}
                        className={`rounded-lg px-4 py-2 border-2 cursor-pointer transition-all text-sm font-medium ${
                          field.value === type.id
                            ? "border-blue-500 bg-blue-50 text-blue-600"
                            : "border-gray-300 bg-white hover:bg-gray-50"
                        }`}
                      >
                        {type.name}
                      </button>
                    ))
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
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <label
              htmlFor="maxPrice"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Maximum Price
            </label>
            <Input
              id="maxPrice"
              type="number"
              placeholder="e.g., 500,000"
              {...register("maxPrice")}
            />
            {errors.maxPrice && (
              <p className="text-sm text-red-600 mt-1">
                {errors.maxPrice.message}
              </p>
            )}
          </div>

          {/* Bedrooms and Bathrooms */}
          <div className="col-span-1 sm:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
            {/* Bedrooms */}
            <div>
              <label
                htmlFor="bedrooms"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bedrooms
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onPress={() =>
                    setValue(
                      "bedroom",
                      Math.max(0, Number(watch("bedroom") || 0) - 1)
                    )
                  }
                  className="p-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative flex-grow">
                  <BedDouble className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="bedrooms"
                    type="number"
                    placeholder="3"
                    min="0"
                    {...register("bedroom", { valueAsNumber: true })}
                    className="pl-10 text-center"
                  />
                </div>
                <Button
                  type="button"
                  color="success"
                  variant="shadow"
                  onPress={() =>
                    setValue("bedroom", Number(watch("bedroom") || 0) + 1)
                  }
                  className="p-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.bedroom && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bedroom.message}
                </p>
              )}
            </div>

            {/* Bathrooms */}
            <div>
              <label
                htmlFor="bathrooms"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Bathrooms
              </label>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  onPress={() =>
                    setValue(
                      "bathroom",
                      Math.max(0, Number(watch("bathroom") || 0) - 1)
                    )
                  }
                  className="p-2"
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <div className="relative flex-grow">
                  <Bath className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="bathrooms"
                    type="number"
                    placeholder="2"
                    min="0"
                    {...register("bathroom", { valueAsNumber: true })}
                    className="pl-10 text-center"
                  />
                </div>
                <Button
                  type="button"
                  variant="solid"
                  onPress={() =>
                    setValue("bathroom", Number(watch("bathroom") || 0) + 1)
                  }
                  className="p-2"
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              {errors.bathroom && (
                <p className="text-sm text-red-600 mt-1">
                  {errors.bathroom.message}
                </p>
              )}
            </div>
          </div>

          {/* Minimum Size */}
          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="minSize"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Minimum Size (sq. ft.)
            </label>
            <Input
              id="minSize"
              type="number"
              placeholder="1,200"
              {...register("minimumSize")}
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Additional Information
            </label>
            <Textarea
              id="message"
              placeholder="Tell us about any other requirements..."
              {...register("message")}
              rows={4}
            />
            {errors.message && (
              <p className="text-sm text-red-600 mt-1">
                {errors.message.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2 flex justify-end">
            <Button
              type="submit"
              color="primary"
              size="lg"
              // loading={loading}
              className="w-full sm:w-auto"
            >
              <Send className="h-5 w-5" />
              Submit Request
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyRequestPage;

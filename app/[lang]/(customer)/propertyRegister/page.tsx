"use client";
import React from "react";
import Image from "next/image";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import useAction from "@/hooks/useActions";
import { getPropertyTypes } from "@/actions/customer/propertyType";
import { propertyRegister } from "@/actions/customer/registerProperty";
import { propertyRegisterSchema } from "@/lib/zodSchema"; // Make sure this schema matches the new structure
import { Input, Button, Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { useRouter, useParams } from "next/navigation";
import {
  User,
  Mail,
  Phone,
  MapPin,
  CircleDollarSign,
  KeyRound,
  Building,
  Send,
} from "lucide-react";
import requestBg from "@/public/cover.jpg";
import Loading from "@/components/loading";

// This should be your new schema from /lib/zodSchema.ts
// const propertyRegisterSchema = z.object({
//   fullName: z.string().min(2).max(100),
//   email: z.string().email(),
//   phone: z.string().min(10).max(15),
//   offer_type: z.enum(["rent", "buy"]),
//   propertyTypeId: z.string().min(1, "Please select a property type"),
//   price: z.coerce.number().min(0),
//   location: z.string().min(2).max(100),
//   realLocation: z.string().min(2).max(100),
//   description: z.string().min(2).max(500),
// });

type RegisterFormValues = z.infer<typeof propertyRegisterSchema>;

function PropertyRegisterPage() {
  const router = useRouter();
  const params = useParams(); // Get the current URL params
  const lang = params.lang;

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(propertyRegisterSchema),
    defaultValues: {
      // offer_type: "rent",
    },
  });

  const [propertyTypes, , isLoadingTypes] = useAction(getPropertyTypes, [
    true,
    () => {},
  ]);

  const [action, , loading] = useAction(propertyRegister, [
    ,
    (res) => {
      addToast({
        // type: "success",
        description: "Property request submitted successfully!",
      });
      router.push(`/${lang}/home`); // Redirect after success
    },
  ]);

  const onSubmit = (data: RegisterFormValues) => {
    action(data);
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      {loading && <Loading />}
      {/* --- Header --- */}
      <div className="relative h-48 w-full">
        <Image
          src={requestBg}
          alt="Register your property"
          layout="fill"
          objectFit="cover"
          className="brightness-50"
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-white text-center p-4">
          <h1 className="text-4xl font-bold">Register Your Property</h1>
          <p className="mt-2 text-lg">
            Provide your details and we'll help you find the perfect property.
          </p>
        </div>
      </div>

      {/* --- Form --- */}
      <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 gap-y-8 gap-x-6 rounded-2xl bg-white p-6 shadow-lg sm:grid-cols-2 sm:p-8"
        >
          {/* --- Contact Information --- */}
          <div className="col-span-1 sm:col-span-2">
            <h2 className="text-xl font-semibold text-gray-800">
              Your Contact Information
            </h2>
          </div>

          <div>
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

          <div className="col-span-1 sm:col-span-2">
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

          {/* --- Property Details --- */}
          <div className="col-span-1 sm:col-span-2 pt-4">
            <h2 className="text-xl font-semibold text-gray-800">
              Property Details
            </h2>
          </div>

          {/* --- Offer Type --- */}
          <Controller
            name="registerType"
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
                    <Building
                      className={`h-6 w-6 ${
                        field.value === "buy"
                          ? "text-blue-600"
                          : "text-gray-500"
                      }`}
                    />
                    <span className="font-semibold">Buy</span>
                  </div>
                </div>
              </div>
            )}
          />

          {/* --- Property Type --- */}
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

          {/* --- Location & Price --- */}
          <div>
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              General Location
            </label>
            <Input
              id="location"
              placeholder="e.g., Addis Ababa, Bole"
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
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Specific Address / Real Location
            </label>
            <Input
              id="realLocation"
              placeholder="e.g., Edna Mall, 2nd Floor"
              {...register("realLocation")}
            />
            {errors.realLocation && (
              <p className="text-sm text-red-600 mt-1">
                {errors.realLocation.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="price"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Price (ETB)
            </label>
            <Input
              id="price"
              type="number"
              placeholder="50,000"
              {...register("price")}
            />
            {errors.price && (
              <p className="text-sm text-red-600 mt-1">
                {errors.price.message}
              </p>
            )}
          </div>

          <div className="col-span-1 sm:col-span-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Description
            </label>
            <Textarea
              id="description"
              placeholder="Describe your ideal property..."
              {...register("description")}
              rows={5}
            />
            {errors.description && (
              <p className="text-sm text-red-600 mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

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
              {loading ? "Submitting..." : "Submit Request"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default PropertyRegisterPage;

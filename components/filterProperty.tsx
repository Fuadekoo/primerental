"use client";
import React, { useEffect } from "react";
import { Button, Input, ButtonGroup } from "@heroui/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { X } from "lucide-react";

export type FilterValues = {
  propertyType: string;
  offerType: string;
  minPrice: string;
  maxPrice: string;
  bedrooms: string;
  bathrooms: string;
};

export type FilterPropertyProps = {
  isOpen: boolean;
  onClose: () => void;
  categories?: Array<{ id: string; name: string }>;
  onApply: (filters: FilterValues) => void;
  title?: string;
};

type FormValues = {
  propertyType?: string;
  offerType?: string;
  minPrice?: string;
  maxPrice?: string;
  bedrooms?: string;
  bathrooms?: string;
};

const schema = z.object({
  propertyType: z.string().optional().default(""),
  offerType: z.string().optional().default(""),
  minPrice: z.string().optional().default(""),
  maxPrice: z.string().optional().default(""),
  bedrooms: z.string().optional().default(""),
  bathrooms: z.string().optional().default(""),
});

export default function FilterProperty({
  isOpen,
  onClose,
  categories = [],
  onApply,
  title = "Filters",
}: FilterPropertyProps) {
  const {
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    mode: "onChange",
    defaultValues: {
      propertyType: "",
      offerType: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
    },
  });

  const values = watch();

  useEffect(() => {
    document.body.style.overflow = isOpen ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const pick = (key: keyof FormValues, val: string) => {
    setValue(key, (values[key] ?? "") === val ? "" : val, {
      shouldValidate: true,
      shouldDirty: true,
    });
  };

  const onReset = () => {
    reset();
  };

  const onSubmit = handleSubmit((data) => {
    onApply({
      propertyType: data.propertyType || "",
      offerType: data.offerType || "",
      minPrice: data.minPrice || "",
      maxPrice: data.maxPrice || "",
      bedrooms: data.bedrooms || "",
      bathrooms: data.bathrooms || "",
    });
    onClose();
  });

  const bedOptions = ["1", "2", "3", "4", "5+"];
  const bathOptions = ["1", "2", "3", "4", "5+"];

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-end sm:items-center sm:justify-center">
      <form
        onSubmit={onSubmit}
        className="bg-white dark:bg-neutral-950 w-full sm:max-w-lg max-h-[92dvh] sm:rounded-2xl p-4 sm:p-5 flex flex-col border-t sm:border border-slate-200 dark:border-neutral-800"
      >
        <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-200 dark:border-neutral-800">
          <h2 className="text-xl font-bold">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-white/10"
          >
            <X className="h-6 w-6 text-gray-600 dark:text-gray-300" />
          </button>
        </div>

        <div className="overflow-y-auto space-y-6 pb-20">
          {/* Property Type */}
          <div>
            <h3 className="font-semibold mb-2">Property Type</h3>
            <div className="flex flex-wrap gap-2">
              {(categories.length > 0
                ? categories.map((c) => ({
                    value: String(c.id),
                    label: c.name,
                  }))
                : ["Apartment", "Villa", "House", "Condo"].map((n, i) => ({
                    value: n.toLowerCase(),
                    label: n,
                  }))
              ).map((opt) => (
                <Button
                  key={opt.value}
                  size="sm"
                  variant={values.propertyType === opt.value ? "solid" : "flat"}
                  color="primary"
                  onPress={() => pick("propertyType", opt.value)}
                >
                  {opt.label}
                </Button>
              ))}
            </div>
          </div>

          {/* Offer Type */}
          <div>
            <h3 className="font-semibold mb-2">Offer Type</h3>
            <ButtonGroup radius="lg" variant="flat" className="gap-2">
              <Button
                color={values.offerType === "SALE" ? "primary" : "default"}
                onPress={() => pick("offerType", "SALE")}
              >
                For Sale
              </Button>
              <Button
                color={values.offerType === "RENT" ? "primary" : "default"}
                onPress={() => pick("offerType", "RENT")}
              >
                For Rent
              </Button>
            </ButtonGroup>
          </div>

          {/* Price Range */}
          <div>
            <h3 className="font-semibold mb-2">Price Range</h3>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                placeholder="Min Price"
                value={values.minPrice ?? ""}
                onChange={(e) =>
                  setValue("minPrice", e.target.value, { shouldValidate: true })
                }
              />
              <span className="text-gray-400">-</span>
              <Input
                type="number"
                placeholder="Max Price"
                value={values.maxPrice ?? ""}
                onChange={(e) =>
                  setValue("maxPrice", e.target.value, { shouldValidate: true })
                }
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div>
            <h3 className="font-semibold mb-2">Bedrooms</h3>
            <div className="flex flex-wrap gap-2">
              {bedOptions.map((b) => (
                <Button
                  key={b}
                  size="sm"
                  variant={values.bedrooms === b ? "solid" : "flat"}
                  color="primary"
                  onPress={() => pick("bedrooms", b)}
                >
                  {b}
                </Button>
              ))}
            </div>
          </div>

          {/* Bathrooms */}
          <div>
            <h3 className="font-semibold mb-2">Bathrooms</h3>
            <div className="flex flex-wrap gap-2">
              {bathOptions.map((b) => (
                <Button
                  key={b}
                  size="sm"
                  variant={values.bathrooms === b ? "solid" : "flat"}
                  color="primary"
                  onPress={() => pick("bathrooms", b)}
                >
                  {b}
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="fixed left-0 right-0 bottom-0 sm:static bg-white/90 dark:bg-neutral-950/90 border-t border-slate-200 dark:border-neutral-800 p-4 flex gap-4">
          <Button
            type="button"
            onPress={onReset}
            variant="bordered"
            className="flex-1"
            disabled={isSubmitting}
          >
            Reset
          </Button>
          <Button
            type="submit"
            color="primary"
            className="flex-1"
            isLoading={isSubmitting}
          >
            Apply Filters
          </Button>
        </div>
      </form>
    </div>
  );
}

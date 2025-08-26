"use client";
import React, { useState, useEffect } from "react";
import useAction from "@/hooks/useActions";
import {
  createProperty,
  deleteProperty,
  getProperty, // Corrected: was getProperty
  updateProperty,
} from "@/actions/admin/property";
import { getPropertyType } from "@/actions/admin/propertyType";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, List, Grid, ImageOff } from "lucide-react";
import CustomAlert from "@/components/custom-alert";
import Select from "react-select";
import { propertySchema } from "@/lib/zodSchema";
import Image from "next/image";

// Type definitions
interface PropertyItem {
  id: string;
  [key: string]: any; // Allow other properties
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: PropertyItem) => React.ReactNode;
}

interface PropertyTypeOption {
  value: string;
  label: string;
}

// Helper to format image URLs
const formatImageUrl = (url: string | null | undefined): string | null => {
  if (!url) return null;
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/${url}`;
};

// New PropertyCard Component
const PropertyCard = ({
  item,
  onEdit,
  onDelete,
  isDeleting,
}: {
  item: PropertyItem;
  onEdit: (item: PropertyItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) => {
  const imageUrl = formatImageUrl(item.images?.[0]);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-transform hover:scale-105">
      <div className="relative h-48 w-full">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={item.title}
            layout="fill"
            objectFit="cover"
            className="bg-gray-200"
          />
        ) : (
          <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
            <ImageOff className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <span
          className={`absolute top-2 right-2 px-2 py-1 text-xs font-semibold text-white rounded ${
            item.offerType === "SALE" ? "bg-green-500" : "bg-blue-500"
          }`}
        >
          {item.offerType}
        </span>
      </div>
      <div className="p-4">
        <h3 className="text-lg font-bold truncate">{item.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
          {item.location}
        </p>
        <p className="text-lg font-semibold text-blue-600 dark:text-blue-400 mt-2">
          {item.price} {item.currency}
        </p>
        <div className="flex items-center justify-end gap-2 mt-4">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => onEdit(item)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => onDelete(item.id)}
            isLoading={isDeleting}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
};

function PropertyPage() {
  const [viewMode, setViewMode] = useState<"table" | "card">("table");
  const [showModal, setShowModal] = useState(false);
  const [editProperty, setEditProperty] = useState<PropertyItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [propertyTypes, setPropertyTypes] = useState<PropertyTypeOption[]>([]);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof propertySchema>>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
  });

  const [propertiesData, refreshProperties, isLoadingData] = useAction(
    getProperty, // Corrected: was getProperty
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [propertyTypeResponse, , isLoadingPropertyTypes] = useAction(
    getPropertyType,
    [true, () => {}]
  );

  useEffect(() => {
    if (propertyTypeResponse?.data) {
      const options = propertyTypeResponse.data.map((pt: any) => ({
        value: pt.id,
        label: pt.name,
      }));
      setPropertyTypes(options);
    }
  }, [propertyTypeResponse]);

  const handleActionCompletion = (
    response: any,
    successMessage: string,
    errorMessage: string
  ) => {
    if (response?.success) {
      addToast({ title: "Success", description: successMessage });
      refreshProperties();
      if (showModal) {
        setShowModal(false);
        reset();
        setEditProperty(null);
      }
    } else {
      addToast({
        title: "Error",
        description: response?.error || errorMessage,
        // type: "error",
      });
    }
  };

  const [, executeDelete, isLoadingDelete] = useAction(deleteProperty, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Property deleted successfully.",
        "Failed to delete property."
      ),
  ]);

  const [, executeCreate, isLoadingCreate] = useAction(createProperty, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Property created successfully.",
        "Failed to create property."
      ),
  ]);

  const [, executeUpdate, isLoadingUpdate] = useAction(updateProperty, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Property updated successfully.",
        "Failed to update property."
      ),
  ]);

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    setPendingDeleteId(deleteId);
    try {
      await executeDelete(deleteId);
    } finally {
      setDeleteId(null);
      setPendingDeleteId(null);
    }
  };

  const handleEdit = (item: PropertyItem) => {
    setEditProperty(item);
    setValue("title", item.title);
    setValue("description", item.description);
    setValue("offerType", item.offerType);
    setValue("propertyTypeId", item.propertyTypeId);
    setValue("location", item.location);
    setValue("quantity", item.quantity);
    setValue("price", item.price);
    setValue("discount", item.discount);
    setValue("currency", item.currency);
    setValue("youtubeLink", item.youtubeLink || "");
    setValue("kitchen", item.kitchen);
    setValue("bedroom", item.bedroom);
    setValue("squareMeter", item.squareMeter);
    setValue("parking", item.parking);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditProperty(null);
    reset();
    setShowModal(true);
  };

  const onSubmit = async (data: z.infer<typeof propertySchema>) => {
    const formData = new FormData();

    Object.entries(data).forEach(([key, value]) => {
      if (key === "images" && Array.isArray(value)) {
        for (let i = 0; i < value.length; i++) {
          formData.append("images", value[i]);
        }
      } else if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (editProperty) {
      await executeUpdate(editProperty.id, formData);
    } else {
      await executeCreate(formData);
    }
  };

  const rows = (propertiesData?.data || []).map((item: PropertyItem) => ({
    ...item,
    key: item.id,
  }));

  const columns: ColumnDef[] = [
    {
      key: "images",
      label: "Image",
      renderCell: (item) => {
        const imageUrl = formatImageUrl(item.images?.[0]);
        return (
          <div className="w-16 h-10 relative rounded overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.title}
                layout="fill"
                objectFit="cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center">
                <ImageOff className="w-5 h-5 text-gray-400" />
              </div>
            )}
          </div>
        );
      },
    },
    { key: "title", label: "Title" },
    { key: "offerType", label: "Offer" },
    {
      key: "price",
      label: "Price",
      renderCell: (item) => `${item.price} ${item.currency}`,
    },
    { key: "location", label: "Location" },
    { key: "quantity", label: "Quantity" },
    {
      key: "actions",
      label: "Actions",
      renderCell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => handleEdit(item)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            color="danger"
            variant="flat"
            onPress={() => handleDelete(item.id)}
            isLoading={pendingDeleteId === item.id && isLoadingDelete}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const disableSubmit = isLoadingCreate || isLoadingUpdate || isSubmitting;

  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Properties</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 bg-gray-100 dark:bg-gray-700 p-1 rounded-lg">
            <Button
              variant={viewMode === "table" ? "solid" : "ghost"}
              color="primary"
              size="sm"
              onPress={() => setViewMode("table")}
            >
              <List className="h-5 w-5" />
            </Button>
            <Button
              variant={viewMode === "card" ? "solid" : "ghost"}
              color="primary"
              size="sm"
              onPress={() => setViewMode("card")}
            >
              <Grid className="h-5 w-5" />
            </Button>
          </div>
          <Button color="primary" onPress={handleAdd}>
            <Plus size={20} className="mr-2" />
            Add Property
          </Button>
        </div>
      </header>

      {viewMode === "table" ? (
        <CustomTable
          columns={columns}
          rows={rows}
          totalRows={propertiesData?.pagination?.totalRecords || 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchValue={search}
          onSearch={setSearch}
          isLoading={isLoadingData}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {isLoadingData &&
            Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md h-80 animate-pulse"
              />
            ))}
          {!isLoadingData &&
            rows.map((item) => (
              <PropertyCard
                key={item.id}
                item={item}
                onEdit={handleEdit}
                onDelete={handleDelete}
                isDeleting={pendingDeleteId === item.id && isLoadingDelete}
              />
            ))}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editProperty ? "Edit Property" : "Add Property"}
            </h2>
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              {/* Form fields */}
              <InputField
                label="Title"
                name="title"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Description"
                name="description"
                register={register}
                errors={errors}
                disabled={disableSubmit}
                isTextArea
              />
              <SelectField
                label="Offer Type"
                name="offerType"
                control={control}
                options={[
                  { value: "RENT", label: "RENT" },
                  { value: "SALE", label: "SALE" },
                ]}
                errors={errors}
                disabled={disableSubmit}
              />
              <SelectField
                label="Property Type"
                name="propertyTypeId"
                control={control}
                options={propertyTypes}
                errors={errors}
                disabled={disableSubmit || isLoadingPropertyTypes}
                isLoading={isLoadingPropertyTypes}
              />
              <InputField
                label="Location"
                name="location"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Quantity"
                name="quantity"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Price"
                name="price"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Discount"
                name="discount"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Currency"
                name="currency"
                register={register}
                errors={errors}
                disabled={disableSubmit}
                placeholder="e.g., USD"
              />
              <InputField
                label="YouTube Link"
                name="youtubeLink"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Kitchens"
                name="kitchen"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Bedrooms"
                name="bedroom"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Square Meters"
                name="squareMeter"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Parking Spots"
                name="parking"
                type="number"
                register={register}
                errors={errors}
                disabled={disableSubmit}
              />
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">
                  Images {editProperty && "(Leave blank to keep existing)"}
                </label>
                <Controller
                  name="images"
                  control={control}
                  render={({ field: { onChange, onBlur, name, ref } }) => (
                    <input
                      type="file"
                      multiple
                      onBlur={onBlur}
                      name={name}
                      ref={ref}
                      onChange={(e) => {
                        onChange(
                          e.target.files ? Array.from(e.target.files) : []
                        );
                      }}
                      className="w-full p-2 border border-gray-300 rounded-md"
                      disabled={disableSubmit}
                    />
                  )}
                />
                {errors.images && (
                  <span className="text-red-500 text-xs">
                    {errors.images.message as string}
                  </span>
                )}
              </div>

              <div className="md:col-span-2 flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => setShowModal(false)}
                  disabled={disableSubmit}
                >
                  Cancel
                </Button>
                <Button
                  color="primary"
                  type="submit"
                  isLoading={disableSubmit}
                  disabled={disableSubmit}
                >
                  {disableSubmit ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : editProperty ? (
                    "Update"
                  ) : (
                    "Create"
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <CustomAlert
              color="danger"
              title="Delete Property?"
              description="Are you sure you want to delete this property? This action cannot be undone."
              confirmText="Delete"
              cancelText="Cancel"
              onConfirm={handleConfirmDelete}
              onCancel={() => setDeleteId(null)}
              isConfirmLoading={pendingDeleteId === deleteId && isLoadingDelete}
            />
          </div>
        </div>
      )}
    </div>
  );
}

// Helper components for form fields to reduce repetition
const InputField = ({
  label,
  name,
  type = "text",
  register,
  errors,
  disabled,
  placeholder,
  isTextArea = false,
}: any) => (
  <div>
    <label htmlFor={name} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    {isTextArea ? (
      <textarea
        id={name}
        {...register(name)}
        disabled={disabled}
        placeholder={placeholder}
        rows={3}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <input
        id={name}
        type={type}
        {...register(name)}
        disabled={disabled}
        placeholder={placeholder}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
    )}
    {errors[name] && (
      <span className="text-red-500 text-xs">{errors[name].message}</span>
    )}
  </div>
);

const SelectField = ({
  label,
  name,
  control,
  options,
  errors,
  disabled,
  isLoading,
}: any) => (
  <div>
    <label className="block mb-1 text-sm font-medium">{label}</label>
    <Controller
      name={name}
      control={control}
      render={({ field }) => (
        <Select
          {...field}
          options={options}
          isDisabled={disabled}
          isLoading={isLoading}
          value={options.find((c: any) => c.value === field.value) || null}
          onChange={(val: any) => field.onChange(val ? val.value : null)}
          styles={{
            control: (base) => ({
              ...base,
              minHeight: "42px",
              borderColor: errors[name] ? "#ef4444" : base.borderColor,
            }),
          }}
        />
      )}
    />
    {errors[name] && (
      <span className="text-red-500 text-xs">{errors[name].message}</span>
    )}
  </div>
);

export default PropertyPage;

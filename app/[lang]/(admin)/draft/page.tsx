"use client";
import React, { useState, useEffect } from "react";
import useAction from "@/hooks/useActions";
import {
  createProperty,
  deleteProperty,
  updateProperty,
} from "@/actions/admin/property";
import { getDraftProperty, publishDraftProperty } from "@/actions/admin/draft";
import { getPropertyType } from "@/actions/admin/propertyType";
import CustomTable from "@/components/custom-table";
import { Button, Form, Input, Textarea } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, List, Grid, ImageOff, X } from "lucide-react";
import CustomAlert from "@/components/custom-alert";
import Select from "react-select";
import { propertySchema } from "@/lib/zodSchema";
import Image from "next/image";

// Type definitions
interface PropertyItem {
  id: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: any;
}
// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface ColumnDef<T = Record<string, string>> {
  key: string;
  label: string;
  renderCell?: (item: T) => React.ReactNode;
}

interface PropertyTypeOption {
  value: string;
  label: string;
}

interface UploadProgress {
  file: File;
  progress: number;
  uuid: string;
  serverFilename?: string;
}

const CHUNK_SIZE = 512 * 1024; // 512KB

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/api/filedata/${encodeURIComponent(url)}`;
};

// PropertyCard Component
const PropertyCard = ({
  item,
  onEdit,
  onDelete,
  isDeleting,
  onToggleStatus,
  isTogglingStatus,
  onPublish,
  isPublishing,
}: {
  item: PropertyItem;
  onEdit: (item: PropertyItem) => void;
  onDelete: (id: string) => void;
  isDeleting: boolean;
  onToggleStatus: (id: string, status: boolean) => void;
  isTogglingStatus: boolean;
  onPublish: (id: string) => void;
  isPublishing: boolean;
}) => {
  const imageUrl = formatImageUrl(item.images?.[0]);
  const isActive = !!item.isAvailable; // Use isAvailable from backend

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
            loading="lazy"
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
            color="success"
            variant="flat"
            onPress={() => onPublish(item.id)}
            isLoading={isPublishing}
          >
            Post
          </Button>
          <Button
            size="sm"
            variant="flat"
            color={isActive ? "success" : "warning"}
            onPress={() => onToggleStatus(item.id, !isActive)}
            isLoading={isTogglingStatus}
          >
            {isActive ? "Active" : "Inactive"}
          </Button>
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
  const [uploadProgresses, setUploadProgresses] = useState<UploadProgress[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);

  type PropertyFormType = {
    title: string;
    description: string;
    offerType: "RENT" | "SALE";
    propertyTypeId: string;
    location: string;
    quantity: number;
    price: number;
    discount: number;
    currency: string;
    images: string[];
    kitchen: number;
    bedroom: number;
    squareMeter: number;
    parking: number;
    youtubeLink?: string;
  };

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    control,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<PropertyFormType>({
    resolver: zodResolver(propertySchema),
    mode: "onChange",
  });

  const [propertiesData, refreshProperties, isLoadingData] = useAction(
    getDraftProperty,
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
      const options = propertyTypeResponse.data.map((pt) => ({
        value: pt.id,
        label: pt.name,
      }));
      setPropertyTypes(options);
    }
  }, [propertyTypeResponse]);

  const toastSuccess = (description: string, title = "Success") =>
    addToast({
      title,
      description,
      color: "secondary",
      variant: "flat",
    });

  const toastError = (description: string, title = "Error") =>
    addToast({
      title,
      description,
      color: "primary",
      variant: "flat",
    });

  const handleActionCompletion = (
    response: { error?: string; message?: string } | null | undefined,
    successMessage: string,
    onSuccess?: () => void
  ) => {
    if (response && !response.error) {
      toastSuccess(response?.message || successMessage);
      onSuccess?.();
      setShowModal(false);
    } else {
      toastError(
        response?.error || response?.message || "An unexpected error occurred."
      );
    }
  };

  const [, executeDelete, isLoadingDelete] = useAction(deleteProperty, [
    ,
    (res) => handleActionCompletion(res, res?.message, refreshProperties),
  ]);

  const [, executeCreate, isLoadingCreate] = useAction(createProperty, [
    ,
    (res) => handleActionCompletion(res, res?.message, refreshProperties),
  ]);

  const [, executeChangeAvailability, isLoadingChangeAvailability] = useAction(
    publishDraftProperty,
    [, (res) => handleActionCompletion(res, res?.message, refreshProperties)]
  );

  const [, executeUpdate, isLoadingUpdate] = useAction(updateProperty, [
    ,
    (res) => handleActionCompletion(res, res?.message, refreshProperties),
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
    setValue("youtubeLink", item.youtubeLink || undefined);
    setValue("kitchen", item.kitchen);
    setValue("bedroom", item.bedroom);
    setValue("squareMeter", item.squareMeter);
    setValue("parking", item.parking);
    setValue("images", item.images || []);
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditProperty(null);
    reset();
    setUploadProgresses([]);
    setShowModal(true);
  };

  const uploadFile = async (file: File, uuid: string): Promise<string> => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const uuidName = uuid || getTimestampUUID(ext);

    const chunkSize = CHUNK_SIZE;
    const total = Math.ceil(file.size / chunkSize);
    let finalReturnedName: string | null = null;

    for (let i = 0; i < total; i++) {
      const start = i * chunkSize;
      const end = Math.min(file.size, start + chunkSize);
      const chunk = file.slice(start, end);

      const formData = new FormData();
      formData.append("chunk", chunk);
      formData.append("filename", uuidName);
      formData.append("chunkIndex", i.toString());
      formData.append("totalChunks", total.toString());

      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        throw new Error("Upload failed");
      }

      const json = await res.json();
      if (json?.filename) finalReturnedName = json.filename;

      // Update progress for this file
      setUploadProgresses((prev) =>
        prev.map((item) =>
          item.uuid === uuid
            ? { ...item, progress: Math.round(((i + 1) / total) * 100) }
            : item
        )
      );
    }

    if (!finalReturnedName) {
      throw new Error("Upload failed: no filename returned");
    }

    return finalReturnedName;
  };

  const handleImagesChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    if (files.length === 0) return;

    setIsUploading(true);

    // Add files to progress tracking
    const newUploads = files.map((file) => ({
      file,
      progress: 0,
      uuid: getTimestampUUID(file.name.split(".").pop() || "jpg"),
    }));

    setUploadProgresses((prev) => [...prev, ...newUploads]);

    const uploadedImages: string[] = [];

    try {
      for (const upload of newUploads) {
        try {
          const serverFilename = await uploadFile(upload.file, upload.uuid);
          uploadedImages.push(serverFilename);

          // Mark as completed
          setUploadProgresses((prev) =>
            prev.map((item) =>
              item.uuid === upload.uuid
                ? { ...item, serverFilename, progress: 100 }
                : item
            )
          );
        } catch (error) {
          console.error("Failed to upload file:", upload.file.name, error);
          // Remove failed upload from progress tracking
          setUploadProgresses((prev) =>
            prev.filter((item) => item.uuid !== upload.uuid)
          );
        }
      }

      // Update form with all uploaded images
      const currentImages = watch("images") || [];
      setValue("images", [...currentImages, ...uploadedImages], {
        shouldValidate: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = (index: number) => {
    const currentImages = watch("images") || [];
    const newImages = [...currentImages];
    newImages.splice(index, 1);
    setValue("images", newImages, { shouldValidate: true });
  };

  const removeUploadingFile = (uuid: string) => {
    setUploadProgresses((prev) => prev.filter((item) => item.uuid !== uuid));
  };

  const onSubmit = async (data: z.infer<typeof propertySchema>) => {
    if (editProperty?.id) {
      executeUpdate(editProperty.id, data);
    } else {
      executeCreate(data);
    }
  };

  const rows = (propertiesData?.data || []).map((item: PropertyItem) => ({
    ...item,
    key: item.id,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Record<string, string>>[] = [
    {
      key: "images",
      label: "Image",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderCell: (item: Record<string, any>) => {
        const imageUrl = formatImageUrl(item.images?.[0]);
        return (
          <div className="w-16 h-10 relative rounded overflow-hidden">
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={item.title}
                layout="fill"
                objectFit="cover"
                loading="lazy"
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
      renderCell: (item: Record<string, string>) =>
        `${item.price} ${item.currency}`,
    },
    { key: "location", label: "Location" },
    { key: "quantity", label: "Quantity" },
    {
      key: "status",
      label: "Status",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      renderCell: (item: Record<string, any>) => {
        const isActive = !!item.isAvailable; // Use isAvailable from backend
        return (
          <Button
            size="sm"
            variant="flat"
            color={isActive ? "success" : "warning"}
            onPress={() => handleToggleStatus(item.id, !isActive)}
            isLoading={
              pendingToggleId === item.id && isLoadingChangeAvailability
            }
          >
            {isActive ? "Active" : "Inactive"}
          </Button>
        );
      },
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (item: Record<string, string>) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="success"
            variant="flat"
            onPress={() => handlePublish(item.id)}
            isLoading={
              pendingPublishId === item.id && isLoadingChangeAvailability
            }
          >
            Post
          </Button>
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => handleEdit(item as PropertyItem)}
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

  // State for toggling property status
  const [pendingToggleId, setPendingToggleId] = useState<string | null>(null);

  // Handler for toggling property status (active/inactive)
  const handleToggleStatus = async (id: string, nextActive: boolean) => {
    setPendingToggleId(id);
    try {
      await executeChangeAvailability(id); // pass true for active, false for inactive
      refreshProperties();
    } finally {
      setPendingToggleId(null);
    }
  };

  // Add state for publishing
  const [pendingPublishId, setPendingPublishId] = useState<string | null>(null);

  // Handler for publishing draft property
  const handlePublish = async (id: string) => {
    setPendingPublishId(id);
    try {
      await executeChangeAvailability(id);
      refreshProperties();
    } finally {
      setPendingPublishId(null);
    }
  };

  const disableSubmit =
    isLoadingCreate || isLoadingUpdate || isSubmitting || isUploading;
  const currentImages = watch("images") || [];

  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">Manage Properties</h1>
        <h1>this is a Draft page</h1>
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
                onToggleStatus={handleToggleStatus}
                isTogglingStatus={
                  pendingToggleId === item.id && isLoadingChangeAvailability
                }
                onPublish={handlePublish}
                isPublishing={
                  pendingPublishId === item.id && isLoadingChangeAvailability
                }
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
            <Form
              onSubmit={handleSubmit(onSubmit)}
              className="grid grid-cols-1 md:grid-cols-2 gap-4"
            >
              <InputField
                label="Title"
                {...register("title")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Description"
                {...register("description")}
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
                {...register("location")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Quantity"
                type="number"
                {...register("quantity")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Price"
                type="number"
                {...register("price")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Discount"
                type="number"
                {...register("discount")}
                errors={errors}
                disabled={disableSubmit}
              />
              <SelectField
                label="Currency"
                name="currency"
                control={control}
                options={[
                  { value: "USD", label: "USD" },
                  { value: "BIRR", label: "BIRR" },
                ]}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="YouTube Link"
                {...register("youtubeLink")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Kitchens"
                type="number"
                {...register("kitchen")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Bedrooms"
                type="number"
                {...register("bedroom")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Square Meters"
                type="number"
                {...register("squareMeter")}
                errors={errors}
                disabled={disableSubmit}
              />
              <InputField
                label="Parking Spots"
                type="number"
                {...register("parking")}
                errors={errors}
                disabled={disableSubmit}
              />

              {/* Image Upload Section */}
              <div className="md:col-span-2">
                <label className="block mb-1 text-sm font-medium">Images</label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImagesChange}
                  className="w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                  disabled={isUploading || disableSubmit}
                />

                {/* Upload Progress */}
                {uploadProgresses.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {uploadProgresses.map((upload, index) => (
                      <div
                        key={upload.uuid}
                        className="flex items-center gap-2"
                      >
                        <div className="flex-1">
                          <div className="flex justify-between text-xs mb-1">
                            <span>{upload.file.name}</span>
                            <span>{upload.progress}%</span>
                          </div>
                          <progress
                            value={upload.progress}
                            max={100}
                            className="w-full h-2"
                          />
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onPress={() => removeUploadingFile(upload.uuid)}
                          disabled={upload.progress === 100}
                        >
                          <X size={16} />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Image Previews */}
                {currentImages.length > 0 && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Uploaded Images:
                    </h4>
                    <div className="grid grid-cols-3 gap-2">
                      {currentImages.map((image, index) => (
                        <div key={index} className="relative group">
                          <Image
                            src={formatImageUrl(image)}
                            alt={`Preview ${index + 1}`}
                            width={100}
                            height={100}
                            className="w-full h-24 object-cover rounded border"
                          />
                          <Button
                            size="sm"
                            color="danger"
                            className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                            onPress={() => removeImage(index)}
                          >
                            <X size={14} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

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
            </Form>
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

// Helper components for form fields
const InputField = ({
  label,
  errors,
  disabled,
  placeholder,
  isTextArea = false,
  ...props
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => (
  <div>
    <label htmlFor={props.name} className="block mb-1 text-sm font-medium">
      {label}
    </label>
    {isTextArea ? (
      <Textarea
        {...props}
        disabled={disabled}
        placeholder={placeholder}
        minRows={3}
        error={!!errors?.[props.name]}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
    ) : (
      <Input
        {...props}
        disabled={disabled}
        placeholder={placeholder}
        error={!!errors?.[props.name]}
        className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
      />
    )}
    {errors?.[props.name] && (
      <span className="text-red-500 text-xs">{errors[props.name].message}</span>
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
}: // eslint-disable-next-line @typescript-eslint/no-explicit-any
any) => (
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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          value={options.find((c: any) => c.value === field.value) || null}
          onChange={(val) => field.onChange(val ? val.value : null)}
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

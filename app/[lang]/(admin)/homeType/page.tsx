"use client";
import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import {
  createPropertyType,
  deletePropertyType,
  getPropertyType,
  updatePropertyType,
} from "@/actions/admin/propertyType";
import CustomTable from "@/components/custom-table";
import { Button, Input } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, X } from "lucide-react";
import CustomAlert from "@/components/custom-alert";
import { propertyTypeSchema } from "@/lib/zodSchema";
import Image from "next/image";

const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  if (url.startsWith("http") || url.startsWith("/")) return url;
  return `/api/filedata/${encodeURIComponent(url)}`;
};

// Type definitions
interface HomeTypeItem {
  id: string;
  photo: string | null;
  key?: string | number;
  name: string;
  description?: string;
  createdAt?: string;
}

interface ColumnDef<T = Record<string, string>> {
  key: string;
  label: string;
  renderCell?: (item: T) => React.ReactNode;
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

function HomeTypePage() {
  const [showModal, setShowModal] = useState(false);
  const [editHomeType, setEditHomeType] = useState<HomeTypeItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);
  const [uploadProgresses, setUploadProgresses] = useState<UploadProgress[]>(
    []
  );
  const [isUploading, setIsUploading] = useState(false);

  // Update the schema to use single photo instead of array
  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof propertyTypeSchema>>({
    resolver: zodResolver(propertyTypeSchema),
    mode: "onChange",
    defaultValues: {
      photo: "",
    },
  });

  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const handleActionCompletion = (
    response: unknown,
    successMessage: string,
    errorMessage: string
  ) => {
    if (response) {
      addToast({ title: "Success", description: successMessage });
      refreshPropertyTypes();
      if (showModal) {
        setShowModal(false);
        resetForm();
      }
    } else {
      addToast({
        title: "Error",
        description: errorMessage,
      });
    }
  };

  const [propertyTypeData, isLoadingData, refreshPropertyTypes] = useData(
    getPropertyType,
    () => {},
    search,
    page,
    pageSize
  );

  const [executeDelete, isLoadingDelete] = useMutation(deletePropertyType, (res) =>
    handleActionCompletion(
      res,
      "Home type deleted successfully.",
      "Failed to delete home type."
    )
  );

  const [executeCreate, isLoadingCreate] = useMutation(createPropertyType, (res) =>
    handleActionCompletion(
      res,
      "Home type created successfully.",
      "Failed to create home type."
    )
  );

  const [executeUpdate, isLoadingUpdate] = useMutation(updatePropertyType, (res) =>
    handleActionCompletion(
      res,
      "Home type updated successfully.",
      "Failed to update home type."
    )
  );

  const handleDelete = (id: string) => {
    setDeleteId(id);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      setPendingDeleteId(deleteId);
      await executeDelete(deleteId);
      setDeleteId(null);
    } finally {
      setPendingDeleteId(null);
    }
  };

  const handleEdit = (item: HomeTypeItem) => {
    setEditHomeType(item);
    setValue("name", item.name);
    setValue("description", item.description || "");
    setValue("photo", item.photo || "");
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditHomeType(null);
    reset();
    setUploadProgresses([]);
    setShowModal(true);
  };

  const resetForm = () => {
    reset();
    setEditHomeType(null);
    setUploadProgresses([]);
  };

  const uploadFile = async (file: File): Promise<string> => {
    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const uuidName = getTimestampUUID(ext);

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
          item.uuid === uuidName
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

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);

    // Clear any existing uploads and add new file
    const newUpload = {
      file: files[0],
      progress: 0,
      uuid: getTimestampUUID(files[0].name.split(".").pop() || "jpg"),
    };

    setUploadProgresses([newUpload]);

    try {
      const serverFilename = await uploadFile(newUpload.file);

      // Mark as completed
      setUploadProgresses((prev) =>
        prev.map((item) =>
          item.uuid === newUpload.uuid
            ? { ...item, serverFilename, progress: 100 }
            : item
        )
      );

      // Update form with uploaded photo
      setValue("photo", serverFilename, { shouldValidate: true });
    } catch (error) {
      console.error("Failed to upload file:", newUpload.file.name, error);
      // Remove failed upload from progress tracking
      setUploadProgresses([]);
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = () => {
    setValue("photo", "", { shouldValidate: true });
    setUploadProgresses([]);
  };

  const onSubmit = async (data: z.infer<typeof propertyTypeSchema>) => {
    const payload = {
      name: data.name,
      photo: data.photo,
      createdAt: editHomeType?.createdAt
        ? new Date(editHomeType.createdAt)
        : new Date(),
      updatedAt: new Date(),
      description: data.description || undefined,
    };

    if (editHomeType?.id) {
      executeUpdate(editHomeType.id, payload);
    } else {
      executeCreate(payload);
    }
  };

  const rows = (propertyTypeData?.data || []).map((item) => ({
    ...item,
    key: item.id,
  }));
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const columns: ColumnDef<Record<string, any>>[] = [
    {
      key: "autoId",
      label: "#",
      renderCell: (item) => {
        const index = rows.findIndex((r) => r.id === item.id);
        return (page - 1) * pageSize + index + 1;
      },
    },
    { key: "name", label: "Name" },
    {
      key: "photo",
      label: "Photo",
      renderCell: (item) => (
        <div className="flex gap-1">
          {item.photo ? (
            <Image
              src={formatImageUrl(item.photo)}
              alt={item.name}
              width={60}
              height={40}
              className="rounded object-cover"
            />
          ) : (
            <span className="text-gray-500 dark:text-slate-300">No photo</span>
          )}
        </div>
      ),
    },
    { key: "description", label: "Description" },
    {
      key: "createdAt",
      label: "Created At",
      renderCell: (item) =>
        item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "",
    },
    {
      key: "actions",
      label: "Actions",
      renderCell: (item) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            color="primary"
            variant="flat"
            onPress={() => handleEdit(item as HomeTypeItem)}
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

  const disableSubmit =
    isLoadingCreate || isLoadingUpdate || isSubmitting || isUploading;
  const currentPhoto = watch("photo");

  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Manage Home Types
        </h1>
        <Button color="primary" onPress={handleAdd}>
          <Plus size={20} className="mr-2" />
          Add Home Type
        </Button>
      </header>

      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={propertyTypeData?.pagination?.totalRecords || 0}
        page={page}
        pageSize={pageSize}
        onPageChange={setPage}
        onPageSizeChange={setPageSize}
        searchValue={search}
        onSearch={setSearch}
        isLoading={isLoadingData}
      />
      {showModal && (
        <div className="fixed inset-0 backdrop-blur-sm bg-black/60 flex justify-center items-center p-4 z-50">
          <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-lg shadow-xl border border-slate-200/70 dark:border-neutral-800 bg-white/90 dark:bg-neutral-900 text-slate-900 dark:text-white p-6">
            <h2 className="text-xl font-semibold mb-4">
              {editHomeType ? "Edit Home Type" : "Add Home Type"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                {/* Name */}
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="e.g., Apartment, Villa"
                    {...register("name")}
                    disabled={disableSubmit}
                  />
                  {errors.name && (
                    <span className="text-red-500 text-xs">
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="A short description of the home type"
                    {...register("description")}
                    rows={3}
                    disabled={disableSubmit}
                  />
                </div>

                {/* Photo Upload */}
                <div>
                  <label
                    htmlFor="photo"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Photo
                  </label>
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    disabled={isUploading || disableSubmit}
                    className="
                      w-full text-sm
                      file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100
                      dark:file:bg-primary-500/10 dark:file:text-primary-300 dark:hover:file:bg-primary-500/20
                    "
                  />

                  {/* Upload Progress */}
                  {uploadProgresses.length > 0 && (
                    <div className="mt-4 space-y-2">
                      {uploadProgresses.map((upload) => (
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
                            onPress={() => removePhoto()}
                            disabled={upload.progress === 100}
                          >
                            <X size={16} />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}

                  {errors.photo && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.photo.message as string}
                    </p>
                  )}
                </div>

                {/* Preview of uploaded photo */}
                {currentPhoto && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">
                      Uploaded Photo:
                    </h4>
                    <div className="relative group">
                      <Image
                        src={formatImageUrl(currentPhoto)}
                        alt="Preview"
                        width={200}
                        height={150}
                        className="w-full h-40 object-cover rounded border"
                      />
                      <Button
                        size="sm"
                        color="danger"
                        className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onPress={() => removePhoto()}
                      >
                        <X size={14} />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Current photo (edit mode) */}
                {editHomeType && editHomeType.photo && (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Current Photo:</h4>
                    <Image
                      src={formatImageUrl(editHomeType.photo)}
                      alt="Current"
                      width={200}
                      height={150}
                      className="w-full h-40 object-cover rounded"
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onPress={() => setShowModal(false)}
                  disabled={disableSubmit}
                  className="dark:text-white dark:hover:bg-primary-500/10"
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
                  ) : editHomeType ? (
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

      {/* Delete modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <CustomAlert
              color="danger"
              title="Delete Home Type?"
              description="Are you sure you want to delete this home type? This action cannot be undone."
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

export default HomeTypePage;

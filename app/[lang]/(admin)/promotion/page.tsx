"use client";
import React, { useState } from "react";
import { useData } from "@/hooks/useData";
import useMutation from "@/hooks/useMutation";
import {
  createPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion,
  changeStatusPromotion,
} from "@/actions/admin/promotion";
import CustomTable from "@/components/custom-table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2, Edit, Eye, EyeOff } from "lucide-react";
import CustomAlert from "@/components/custom-alert";
import Image from "next/image";

// Schema for validation
const promotionSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  image: z.string().min(1, "Image is required"),
});

// Type definitions
interface PromotionItem {
  id: string;
  image: string;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
}

interface ColumnDef<T = Record<string, string>> {
  key: string;
  label: string;
  renderCell?: (item: T) => React.ReactNode;
}

const CHUNK_SIZE = 512 * 1024; // 512KB

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

function Page() {
  const [showModal, setShowModal] = useState(false);
  const [editPromotion, setEditPromotion] = useState<PromotionItem | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Upload state
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [uuidFilename, setUuidFilename] = useState<string | null>(null);
  const [serverFilename, setServerFilename] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof promotionSchema>>({
    resolver: zodResolver(promotionSchema),
    mode: "onChange",
    defaultValues: {
      title: "",
      description: "",
      image: "",
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
      toast.success(successMessage);
      refreshPromotions();
      if (showModal) {
        setShowModal(false);
        resetForm();
      }
    } else {
      toast.error(errorMessage);
    }
  };

  const [promotionData, isLoadingData, refreshPromotions] = useData(
    getPromotions,
    () => {},
    search,
    page,
    pageSize
  );

  const [executeDelete, isLoadingDelete] = useMutation(deletePromotion, (res) =>
    handleActionCompletion(
      res,
      "Promotion deleted successfully.",
      "Failed to delete promotion."
    )
  );

  const [executeCreate, isLoadingCreate] = useMutation(createPromotion, (res) =>
    handleActionCompletion(
      res,
      "Promotion created successfully.",
      "Failed to create promotion."
    )
  );

  const [executeUpdate, isLoadingUpdate] = useMutation(updatePromotion, (res) =>
    handleActionCompletion(
      res,
      "Promotion updated successfully.",
      "Failed to update promotion."
    )
  );

  const [executeChangeStatus] = useMutation(changeStatusPromotion, (res) => {
    if (res) {
      toast.success("Promotion status updated successfully.");
      refreshPromotions();
    } else {
      toast.error("Failed to update promotion status.");
    }
  });

  const resetForm = () => {
    reset();
    setEditPromotion(null);
    setUuidFilename(null);
    setServerFilename(null);
    setUploadProgress(0);
    setIsUploading(false);
    setCurrentChunk(0);
    setTotalChunks(0);
  };

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

  const handleEdit = (item: PromotionItem) => {
    setEditPromotion(item);
    setValue("title", item.title);
    setValue("description", item.description || "");
    setValue("image", item.image);
    setServerFilename(item.image);
    setShowModal(true);
  };

  const handleAdd = () => {
    resetForm();
    setShowModal(true);
  };

  const handleToggleActive = async (item: PromotionItem) => {
    await executeChangeStatus(item.id, !item.isActive);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setValue("image", "", { shouldValidate: false });
    setServerFilename(null);

    const ext = (file.name.split(".").pop() || "jpg").toLowerCase();
    const uuidName = getTimestampUUID(ext);
    setUuidFilename(uuidName);

    setIsUploading(true);
    const chunkSize = CHUNK_SIZE;
    const total = Math.ceil(file.size / chunkSize);
    setTotalChunks(total);

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
        toast.error("Upload failed. Try again.", {
          description: "Upload Error",
        });
        setIsUploading(false);
        return;
      }

      const json = await res.json();
      if (json?.filename) finalReturnedName = json.filename as string;

      setUploadProgress(Math.round(((i + 1) / total) * 100));
      setCurrentChunk(i + 1);
    }

    setIsUploading(false);
    setCurrentChunk(0);
    setTotalChunks(0);

    if (finalReturnedName) {
      setServerFilename(finalReturnedName);
      setValue("image", finalReturnedName, { shouldValidate: true });
    }
  };

  type PromotionUpdatePayload = {
    id: string;
    title: string;
    description: string;
    image: string;
    isActive: boolean;
  };

  const onSubmit = async (data: z.infer<typeof promotionSchema>) => {
    const payload = {
      title: data.title,
      description: data.description || "",
      image: data.image,
      isActive: editPromotion?.isActive ?? true,
    };

    if (editPromotion?.id) {
      const updatePayload: PromotionUpdatePayload = {
        id: editPromotion.id,
        ...payload,
      };
      executeUpdate(updatePayload);
    } else {
      executeCreate(payload);
    }
  };

  const formatImageUrl = (url: string | null | undefined): string => {
    if (!url) return "/placeholder.png";
    if (url.startsWith("http") || url.startsWith("/")) return url;
    return `/api/filedata/${encodeURIComponent(url)}`;
  };

  const rows = (promotionData?.data || []).map((item) => ({
    ...item,
    description: item.description ?? undefined,
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
    { key: "title", label: "Title" },
    {
      key: "image",
      label: "Image",
      renderCell: (item) =>
        item.image ? (
          <Image
            src={formatImageUrl(item.image)}
            alt={item.title}
            width={80}
            height={60}
            className="rounded object-cover"
          />
        ) : (
          <span className="text-gray-500 dark:text-slate-300">No image</span>
        ),
    },
    { key: "description", label: "Description" },
    {
      key: "isActive",
      label: "Status",
      renderCell: (item) => (
        <span className={item.isActive ? "text-green-600" : "text-red-600"}>
          {item.isActive ? "Active" : "Inactive"}
        </span>
      ),
    },
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
            variant="secondary"
            onClick={() => handleEdit(item as PromotionItem)}
          >
            <Edit size={16} />
          </Button>
          <Button
            size="sm"
            variant={item.isActive ? "ghost" : "default"}
            onClick={() => handleToggleActive(item as PromotionItem)}
          >
            {item.isActive ? <EyeOff size={16} /> : <Eye size={16} />}
          </Button>
          <Button
            size="sm"
            variant="destructive"
            onClick={() => handleDelete(item.id)}
            disabled={pendingDeleteId === item.id && isLoadingDelete}
          >
            <Trash2 size={16} />
          </Button>
        </div>
      ),
    },
  ];

  const disableSubmit = isLoadingCreate || isLoadingUpdate || isSubmitting;
  const imageValue = watch("image");

  return (
    <div className="p-4 md:p-6">
      <header className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Manage Promotions
        </h1>
        <Button onClick={handleAdd}>
          <Plus size={20} className="mr-2" />
          Add Promotion
        </Button>
      </header>

      <CustomTable
        columns={columns}
        rows={rows}
        totalRows={promotionData?.meta?.total || 0}
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
              {editPromotion ? "Edit Promotion" : "Add Promotion"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                {/* Title */}
                <div>
                  <label
                    htmlFor="title"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Title
                  </label>
                  <input
                    id="title"
                    className="w-full p-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/30 outline-none"
                    placeholder="Promotion title"
                    {...register("title")}
                    disabled={disableSubmit}
                  />
                  {errors.title && (
                    <span className="text-red-500 text-xs">
                      {errors.title.message}
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
                    placeholder="Short description"
                    rows={3}
                    {...register("description")}
                    disabled={disableSubmit}
                  />
                </div>

                {/* Image Upload */}
                <div>
                  <label
                    htmlFor="image"
                    className="block mb-1 text-sm font-medium text-slate-700 dark:text-slate-200"
                  >
                    Image
                  </label>
                  <Input
                    type="file"
                    accept="image/*,video/*"
                    onChange={handleFileChange}
                    disabled={isUploading || disableSubmit}
                    className="
                      w-full text-sm
                      file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold
                      file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100
                      dark:file:bg-primary-500/10 dark:file:text-primary-300 dark:hover:file:bg-primary-500/20
                    "
                  />

                  {uuidFilename && (
                    <div className="text-sm text-slate-600 dark:text-slate-300 mt-1">
                      <strong>Upload filename:</strong> {uuidFilename}
                    </div>
                  )}

                  {isUploading && (
                    <div className="text-sm mt-2">
                      <p>
                        Uploading: {uploadProgress}% ({currentChunk}/
                        {totalChunks} chunks)
                      </p>
                      <progress
                        value={uploadProgress}
                        max={100}
                        className="w-full h-2"
                      />
                    </div>
                  )}

                  {serverFilename && !isUploading && (
                    <div className="text-sm text-green-600 mt-1">
                      Stored as: {serverFilename}
                    </div>
                  )}

                  {errors.image && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.image.message as string}
                    </p>
                  )}
                </div>

                {/* Preview */}
                {(imageValue || (editPromotion && editPromotion.image)) && (
                  <div className="mt-2 border border-slate-200 dark:border-neutral-800 rounded-md p-2 bg-white/70 dark:bg-neutral-900">
                    <span className="text-xs text-slate-500 dark:text-slate-400 block text-center mb-1">
                      Preview
                    </span>
                    <Image
                      src={formatImageUrl(
                        (imageValue || editPromotion?.image) ?? ""
                      )}
                      alt="Promotion preview"
                      className="max-h-40 rounded mx-auto"
                      width={240}
                      height={160}
                      style={{ objectFit: "contain" }}
                    />
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 mt-6">
                <Button
                  variant="ghost"
                  type="button"
                  onClick={() => setShowModal(false)}
                  disabled={disableSubmit || isUploading}
                  className="dark:text-white dark:hover:bg-primary-500/10"
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={disableSubmit || isUploading}>
                  {disableSubmit || isUploading ? (
                    <Loader2 className="h-5 w-5 animate-spin" />
                  ) : editPromotion ? (
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

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-sm">
            <CustomAlert
              color="danger"
              title="Delete Promotion?"
              description="Are you sure you want to delete this promotion? This action cannot be undone."
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

export default Page;

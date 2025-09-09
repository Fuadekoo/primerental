"use client";
import React, { useEffect, useState } from "react";
import CustomTable from "@/components/custom-table";
import CustomAlert from "@/components/custom-alert";
import useAction from "@/hooks/useActions";
import {
  createPromotion,
  getPromotions,
  updatePromotion,
  deletePromotion,
  changeStatusPromotion,
} from "@/actions/admin/promotion";

const CHUNK_SIZE = 512 * 1024; // 512KB

function getTimestampUUID(ext: string) {
  return `${Date.now()}-${Math.floor(Math.random() * 100000)}.${ext}`;
}

function Page() {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [currentChunk, setCurrentChunk] = useState(0);
  const [totalChunks, setTotalChunks] = useState(0);
  const [uuidFilename, setUuidFilename] = useState<string | null>(null);
  const [serverFilename, setServerFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Editing state
  const [editing, setEditing] = useState<any | null>(null);

  // List via server action (with simple paging defaults)
  const [promotionData, refreshPromotions, isLoadingPromotions] = useAction(
    getPromotions,
    [true, () => {}],
    "",
    1,
    50
  );

  const [, doCreate, isCreating] = useAction(createPromotion, [
    ,
    () => {
      refreshPromotions();
    },
  ]);
  const [, doUpdate, isUpdating] = useAction(updatePromotion, [
    ,
    () => {
      refreshPromotions();
    },
  ]);
  const [, doDelete, isDeleting] = useAction(deletePromotion, [
    ,
    () => {
      refreshPromotions();
    },
  ]);
  const [, doChangeStatus] = useAction(changeStatusPromotion, [
    ,
    () => {
      refreshPromotions();
    },
  ]);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setUuidFilename(null);
    setServerFilename(null);
    setEditing(null);
    setError(null);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setError(null);
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
        setError("Upload failed. Try again.");
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

    if (finalReturnedName) setServerFilename(finalReturnedName);
  };

  const handleSave = async () => {
    setError(null);
    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    // For new create, an upload is required
    if (!editing && !serverFilename) {
      setError("Please upload an image first");
      return;
    }

    if (editing) {
      await doUpdate({
        id: editing.id,
        title,
        description,
        image: serverFilename ?? editing.image,
      } as any);
    } else {
      await doCreate({
        title,
        description,
        image: serverFilename!,
      } as any);
    }

    resetForm();
  };

  const handleEdit = (p: any) => {
    setEditing(p);
    setTitle(p.title || "");
    setDescription(p.description || "");
    setServerFilename(p.image || null);
    setUuidFilename(null);
  };

  const handleRemove = async (id: string) => {
    await doDelete(id);
  };

  const handleToggleActive = async (p: any) => {
    await doChangeStatus(p.id, !p.isActive);
  };

  const isSaving = isCreating || isUpdating;

  return (
    <div className="max-w-3xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">
        {editing ? "Edit Promotion" : "Create Promotion"}
      </h1>

      <div className="grid gap-4 bg-white dark:bg-neutral-900 p-4 rounded-lg border border-slate-200 dark:border-neutral-800">
        <label className="grid gap-1">
          <span className="text-sm font-medium">Title</span>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="rounded-md border px-3 py-2 bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700"
            placeholder="Promotion title"
          />
        </label>
        <label className="grid gap-1">
          <span className="text-sm font-medium">Description (optional)</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="rounded-md border px-3 py-2 bg-white dark:bg-neutral-900 border-slate-300 dark:border-neutral-700"
            placeholder="Short description"
            rows={3}
          />
        </label>

        <div className="grid gap-2">
          <span className="text-sm font-medium">Image</span>
          <input
            type="file"
            accept="image/*,video/*"
            onChange={handleFileChange}
            disabled={isUploading}
          />
          {uuidFilename && (
            <div className="text-sm text-slate-600 dark:text-slate-300">
              <strong>Upload filename:</strong> {uuidFilename}
            </div>
          )}
          {isUploading && (
            <div className="text-sm">
              <p>
                Uploading: {uploadProgress}% ({currentChunk}/{totalChunks}{" "}
                chunks)
              </p>
              <progress value={uploadProgress} max={100} />
            </div>
          )}
          {serverFilename && (
            <div className="text-sm text-green-600">
              Stored as: {serverFilename}
            </div>
          )}
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={isUploading || isSaving}
            className="px-4 py-2 rounded-md bg-primary-600 text-white disabled:opacity-60"
          >
            {isSaving
              ? "Saving..."
              : editing
              ? "Update Promotion"
              : "Create Promotion"}
          </button>
          {editing && (
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-md border"
            >
              Cancel
            </button>
          )}
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-3">Existing Promotions</h2>
        <div className="grid gap-3">
          {isLoadingPromotions ? (
            <p className="text-sm text-slate-500">Loading...</p>
          ) : promotionData?.data?.length ? (
            promotionData.data.map((p: any) => (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-md border p-3 bg-white dark:bg-neutral-900 border-slate-200 dark:border-neutral-800"
              >
                <img
                  src={`/api/filedata/${p.image}`}
                  alt={p.title}
                  className="w-14 h-14 object-cover rounded"
                />
                <div className="flex-1">
                  <div className="font-medium">{p.title}</div>
                  <div className="text-xs text-slate-500">
                    {p.description || "No description"}
                  </div>
                  <label className="flex items-center gap-2 text-xs mt-1">
                    <input
                      type="checkbox"
                      checked={!!p.isActive}
                      onChange={() => handleToggleActive(p)}
                    />
                    <span>{p.isActive ? "Active" : "Inactive"}</span>
                  </label>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    className="px-2 py-1 rounded border"
                    onClick={() => handleEdit(p)}
                  >
                    Edit
                  </button>
                  <button
                    className="px-2 py-1 rounded border text-red-600"
                    onClick={() => handleRemove(p.id)}
                    disabled={isDeleting}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-slate-500">No promotions yet</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default Page;

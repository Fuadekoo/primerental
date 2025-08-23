"use client";
import React, { useState } from "react";
import useAction from "@/hooks/useActions";
import {
  createPropertyType,
  deletePropertyType,
  getPropertyType,
  updatePropertyType,
} from "@/actions/admin/propertyType";
import CustomTable from "@/components/custom-table";
import { Button } from "@heroui/react";
import { addToast } from "@heroui/toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Plus, Trash2 } from "lucide-react";
import CustomAlert from "@/components/custom-alert";

// Zod schema for form validation
const homeTypeSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters."),
  description: z.string().optional(),
});

// Type definitions
interface HomeTypeItem {
  id: string;
  photo: string;
  key?: string | number;
  name: string;
  description?: string;
  createdAt?: string;
}

interface ColumnDef {
  key: string;
  label: string;
  renderCell?: (item: Record<string, any>) => React.ReactNode;
}

function HomeTypePage() {
  const [showModal, setShowModal] = useState(false);
  const [editHomeType, setEditHomeType] = useState<HomeTypeItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  const {
    handleSubmit,
    register,
    reset,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof homeTypeSchema>>({
    resolver: zodResolver(homeTypeSchema),
    mode: "onChange",
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
        reset();
        setEditHomeType(null);
      }
    } else {
      addToast({
        title: "Error",
        description: errorMessage,
        // type: "error",
      });
    }
  };

  const [propertyTypeData, refreshPropertyTypes, isLoadingData] = useAction(
    getPropertyType,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [, executeDelete, isLoadingDelete] = useAction(deletePropertyType, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Home type deleted successfully.",
        "Failed to delete home type."
      ),
  ]);

  const [, executeCreate, isLoadingCreate] = useAction(createPropertyType, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Home type created successfully.",
        "Failed to create home type."
      ),
  ]);

  const [, executeUpdate, isLoadingUpdate] = useAction(updatePropertyType, [
    ,
    (res) =>
      handleActionCompletion(
        res,
        "Home type updated successfully.",
        "Failed to update home type."
      ),
  ]);

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
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditHomeType(null);
    reset();
    setShowModal(true);
  };

  const onSubmit = async (data: z.infer<typeof homeTypeSchema>) => {
    const formData = new FormData();
    formData.append("name", data.name);
    if (data.description) {
      formData.append("description", data.description);
    }

    if (editHomeType) {
      await executeUpdate(editHomeType.id, formData);
    } else {
      await executeCreate(formData);
    }
  };

  const rows = (propertyTypeData?.data || []).map((item) => ({
    ...item,
    key: item.id,
  }));

  const columns: ColumnDef[] = [
    {
      key: "autoId",
      label: "#",
      renderCell: (item) => {
        const index = rows.findIndex((r) => r.id === item.id);
        return (page - 1) * pageSize + index + 1;
      },
    },
    { key: "name", label: "Name" },
    { key: "photo", label: "photo" },
    { key: "description", label: "Description" },
    {
      key: "createdAt",
      label: "Created At",
      renderCell: (item) => new Date(item.createdAt).toLocaleDateString(),
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
        <h1 className="text-2xl font-bold">Manage Home Types</h1>
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
        <div className="fixed inset-0 backdrop-blur-sm bg-black bg-opacity-50 flex justify-center items-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-semibold mb-4">
              {editHomeType ? "Edit Home Type" : "Add Home Type"}
            </h2>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="flex flex-col gap-4">
                <div>
                  <label
                    htmlFor="name"
                    className="block mb-1 text-sm font-medium"
                  >
                    Name
                  </label>
                  <input
                    id="name"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
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
                <div>
                  <label
                    htmlFor="description"
                    className="block mb-1 text-sm font-medium"
                  >
                    Description (Optional)
                  </label>
                  <textarea
                    id="description"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
                    placeholder="A short description of the home type"
                    {...register("description")}
                    rows={3}
                    disabled={disableSubmit}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
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

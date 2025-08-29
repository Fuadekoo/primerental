"use client";
import React, { useEffect, useState } from "react";
import CustomAlert from "@/components/custom-alert";
import CustomTable from "@/components/custom-table";
import {
  getRequestProperties,
  markPropertyAsVisited,
  deleteRequestProperty,
  requestDashboard,
} from "@/actions/admin/requestProperty";
import useAction from "@/hooks/useActions";
import { Eye, EyeOff, ListChecks } from "lucide-react";

function RequestPropertyPage() {
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  const [propertiesData, refresh, isLoading] = useAction(
    getRequestProperties,
    [true, () => {}],
    search,
    page,
    pageSize
  );

  const [dashboardData, refreshDashboard, isLoadingDashboard] = useAction(
    requestDashboard,
    [true, () => {}]
  );

  useEffect(() => {
    refresh();
  }, [search, page, pageSize, refresh]);

  // --- Analysis Card Logic using dashboardData ---
  const stats = dashboardData?.data || { total: 0, visited: 0, notVisited: 0 };

  const handleMarkVisited = async (id: string) => {
    const res = await markPropertyAsVisited(id);
    if (res?.success) {
      setAlert({ message: "Marked as visited!", type: "success" });
      refresh();
    } else {
      setAlert({ message: "Failed to mark as visited.", type: "error" });
    }
    setTimeout(() => setAlert(null), 2000);
  };

  const handleDelete = async (id: string) => {
    const res = await deleteRequestProperty(id);
    if (res?.success) {
      setAlert({ message: "Deleted successfully!", type: "success" });
      refresh();
    } else {
      setAlert({ message: "Failed to delete.", type: "error" });
    }
    setTimeout(() => setAlert(null), 2000);
  };

  const columns = [
    { key: "firstName", label: "First Name" },
    { key: "lastName", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "offerType", label: "Offer Type" },
    { key: "propertyType", label: "Property Type" },
    { key: "maxPrice", label: "Max Price" },
    { key: "bedrooms", label: "Bedrooms" },
    { key: "bathrooms", label: "Bathrooms" },
    { key: "minimumSize", label: "Min Size" },
    {
      key: "isVisited",
      label: "Visited",
      renderCell: (row: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.isVisited
              ? "bg-green-100 text-green-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {row.isVisited ? "Visited" : "Not Visited"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      renderCell: (row: any) => (
        <div className="flex gap-2">
          {!row.isVisited && (
            <button
              className="px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
              onClick={() => handleMarkVisited(row.id)}
            >
              Mark as Visited
            </button>
          )}
          <button
            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded transition"
            onClick={() => handleDelete(row.id)}
          >
            Delete
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-blue-700">
        Property Requests
      </h1>
      {/* --- Analysis Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center bg-blue-50 border border-blue-200 rounded-lg p-4 shadow">
          <ListChecks className="h-8 w-8 text-blue-600 mr-3" />
          <div>
            <div className="text-lg font-bold text-blue-700">
              {isLoadingDashboard ? "..." : stats.total}
            </div>
            <div className="text-sm text-blue-600">Total Requests</div>
          </div>
        </div>
        <div className="flex items-center bg-green-50 border border-green-200 rounded-lg p-4 shadow">
          <Eye className="h-8 w-8 text-green-600 mr-3" />
          <div>
            <div className="text-lg font-bold text-green-700">
              {isLoadingDashboard ? "..." : stats.visited}
            </div>
            <div className="text-sm text-green-600">Visited Requests</div>
          </div>
        </div>
        <div className="flex items-center bg-yellow-50 border border-yellow-200 rounded-lg p-4 shadow">
          <EyeOff className="h-8 w-8 text-yellow-600 mr-3" />
          <div>
            <div className="text-lg font-bold text-yellow-700">
              {isLoadingDashboard ? "..." : stats.notVisited}
            </div>
            <div className="text-sm text-yellow-600">Not Visited Requests</div>
          </div>
        </div>
      </div>
      {/* --- Alert --- */}
      {alert && (
        <CustomAlert
          type={alert.type}
          message={alert.message}
          className="mb-4"
        />
      )}
      {/* --- Table --- */}
      <div className="overflow-x-auto">
        <CustomTable
          columns={columns}
          rows={propertiesData?.data || []}
          totalRows={propertiesData?.pagination?.totalRecords || 0}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={setPageSize}
          searchValue={search}
          onSearch={setSearch}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
}

export default RequestPropertyPage;

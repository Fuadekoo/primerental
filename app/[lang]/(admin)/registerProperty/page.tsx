"use client";
import React, { useEffect, useState } from "react";
import CustomAlert from "@/components/custom-alert";
import CustomTable from "@/components/custom-table";
import {
  markPropertyAsVisited,
  getRegisteredProperties,
  registerDashboard,
} from "@/actions/admin/registerProperty";
import useAction from "@/hooks/useActions";
import { Eye, EyeOff, ListChecks } from "lucide-react";

function RegisterPropertyPage() {
  const [alert, setAlert] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState("");

  // useAction returns [data, refresh, isLoading]
  const [propertiesData, refresh, isLoadingDatas] = useAction(
    getRegisteredProperties,
    [true, () => {}],
    search,
    page,
    pageSize
  );
  const [dashboardData, refreshDashboard, isLoadingDashboard] = useAction(
    registerDashboard,
    [true, () => {}]
  );

  useEffect(() => {
    refresh();
  }, [search, page, pageSize, refresh]);

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

  // --- Analysis Card Logic using dashboardData ---
  const stats = dashboardData?.data || { total: 0, visited: 0, notVisited: 0 };

  const columns = [
    { key: "fullname", label: "Full Name" },
    { key: "phone", label: "Phone" },
    { key: "type", label: "Type" },
    { key: "propertyType", label: "Property Type" },
    { key: "location", label: "Location" },
    { key: "realLocation", label: "Real Location" },
    { key: "description", label: "Description" },
    {
      key: "isVisit",
      label: "Is Visit",
      renderCell: (row: any) => (
        <span
          className={`px-2 py-1 rounded text-xs font-bold ${
            row.isVisit
              ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
              : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300"
          }`}
        >
          {row.isVisit ? "Visited" : "Not Visited"}
        </span>
      ),
    },
    {
      key: "action",
      label: "Action",
      renderCell: (row: any) =>
        !row.isVisit && (
          <button
            className="px-4 py-1 rounded text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-400 transition"
            onClick={() => handleMarkVisited(row.id)}
          >
            Mark as Visited
          </button>
        ),
    },
  ];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-8 text-slate-900 dark:text-slate-100">
        Registered Properties
      </h1>

      {/* --- Analysis Cards --- */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="flex items-center rounded-xl p-4 border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900 shadow-sm">
          <ListChecks className="h-8 w-8 text-primary-600 dark:text-primary-400 mr-3" />
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isLoadingDashboard ? "..." : stats.total}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Total Properties
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-xl p-4 border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900 shadow-sm">
          <Eye className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isLoadingDashboard ? "..." : stats.visited}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Visited Properties
            </div>
          </div>
        </div>
        <div className="flex items-center rounded-xl p-4 border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900 shadow-sm">
          <EyeOff className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
          <div>
            <div className="text-lg font-bold text-slate-900 dark:text-slate-100">
              {isLoadingDashboard ? "..." : stats.notVisited}
            </div>
            <div className="text-sm text-slate-600 dark:text-slate-400">
              Not Visited Properties
            </div>
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

      {/* --- Table with overflow --- */}
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
          isLoading={isLoadingDatas}
        />
      </div>
    </div>
  );
}

export default RegisterPropertyPage;

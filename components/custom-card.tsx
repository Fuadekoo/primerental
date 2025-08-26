"use client";
import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Search,
  ChevronLeft,
  ChevronRight,
  Trash2,
  UserCircle2,
  FolderOpen,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";

// Helper to format image URLs
const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  // If already an absolute URL or starts with /, use as is
  if (url.startsWith("http") || url.startsWith("/")) return url;
  // Otherwise, fetch from local API endpoint
  return `/api/filedata/${encodeURIComponent(url)}`;
};

// Button component
const Button = ({
  children,
  className,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement>) => (
  <button
    className={`disabled:opacity-50 disabled:cursor-not-allowed transition-colors ${className}`}
    {...props}
  >
    {children}
  </button>
);

type Patient = {
  id: string;
  name: string;
  problemType: string;
  diagnosis: string;
  date: string;
  priority: number;
  status: boolean;
  images?: string[];
};

type CustomCardProps = {
  patientHistory: Patient[];
  onDelete?: (id: string) => void;
};

interface ZoomedImagesState {
  urls: string[];
  currentIndex: number;
}

const PER_PAGE_OPTIONS = [3, 6, 9, 12];

export const CustomCard: React.FC<CustomCardProps> = ({
  patientHistory,
  onDelete,
}) => {
  const { generalCaseId } = useParams<{ generalCaseId: string }>();
  const router = useRouter();
  const [perPage, setPerPage] = useState(PER_PAGE_OPTIONS[1]);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [zoomedImages, setZoomedImages] = useState<ZoomedImagesState | null>(
    null
  );

  const handleImageClick = (imageUrls: string[], startIndex: number = 0) => {
    if (imageUrls && imageUrls.length > 0) {
      setZoomedImages({ urls: imageUrls, currentIndex: startIndex });
    }
  };

  const handleCloseZoom = () => setZoomedImages(null);

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomedImages((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentIndex: (prev.currentIndex + 1) % prev.urls.length,
      };
    });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomedImages((prev) => {
      if (!prev) return null;
      return {
        ...prev,
        currentIndex:
          (prev.currentIndex - 1 + prev.urls.length) % prev.urls.length,
      };
    });
  };

  const filteredPatients = useMemo(() => {
    return patientHistory
      .filter((patient) => {
        if (statusFilter === "all") return true;
        return (patient.status ? "solved" : "pending") === statusFilter;
      })
      .filter((patient) => {
        const query = searchQuery.toLowerCase();
        return (
          patient.name.toLowerCase().includes(query) ||
          patient.problemType.toLowerCase().includes(query) ||
          patient.diagnosis.toLowerCase().includes(query)
        );
      });
  }, [patientHistory, searchQuery, statusFilter]);

  const totalPages = Math.ceil(filteredPatients.length / perPage);
  const paginatedPatients = filteredPatients.slice(
    (page - 1) * perPage,
    page * perPage
  );

  const handleFilterChange = () => setPage(1);
  const handleSearchButton = (e: React.FormEvent) => {
    e.preventDefault();
    handleFilterChange();
  };

  // Priority badge color
  const getPriorityColor = (priority: number) => {
    if (priority >= 8) return "bg-red-100 text-red-700";
    if (priority >= 5) return "bg-yellow-100 text-yellow-700";
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="bg-gradient-to-br from-blue-50 to-white rounded-2xl shadow-lg p-6 sm:p-10">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <FolderOpen className="text-blue-600" size={32} />
        <h1 className="text-2xl font-bold text-blue-900 tracking-tight">
          Patient Case History
        </h1>
      </div>

      {/* Filters and Search */}
      <form
        className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6"
        onSubmit={handleSearchButton}
      >
        <div className="relative w-full sm:w-auto flex">
          <button
            type="submit"
            className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-l-lg px-3 transition-colors"
            aria-label="Search"
            style={{ borderTopRightRadius: 0, borderBottomRightRadius: 0 }}
          >
            <Search className="h-5 w-5" />
          </button>
          <input
            type="text"
            placeholder="Search by name, problem..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 p-2 pl-3 border border-gray-300 rounded-r-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
          />
        </div>
        <div className="flex items-center gap-4 w-full sm:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              handleFilterChange();
            }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
          >
            <option value="all">All Statuses</option>
            <option value="solved">Solved</option>
            <option value="pending">Pending</option>
          </select>
          <select
            value={perPage}
            onChange={(e) => {
              setPerPage(Number(e.target.value));
              handleFilterChange();
            }}
            className="p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white text-sm"
          >
            {PER_PAGE_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt} per page
              </option>
            ))}
          </select>
        </div>
      </form>

      {/* Cards Grid */}
      {paginatedPatients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
          {paginatedPatients.map((patient) => (
            <div
              key={patient.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col justify-between shadow hover:shadow-lg transition-shadow group"
            >
              <div>
                {patient.images && patient.images.length > 0 && (
                  <div className="relative w-full h-40 mb-4 rounded-lg overflow-hidden">
                    <Image
                      src={formatImageUrl(patient.images[0])}
                      alt={patient.name}
                      layout="fill"
                      objectFit="cover"
                      className="cursor-pointer"
                      onClick={() => handleImageClick(patient.images || [], 0)}
                    />
                  </div>
                )}
                <div className="flex items-center gap-3 mb-3">
                  <UserCircle2 className="text-blue-400" size={32} />
                  <h2 className="text-lg font-semibold text-gray-800 group-hover:text-blue-700 transition-colors">
                    {patient.name}
                  </h2>
                </div>
                <div className="space-y-1 mb-2">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Problem:</span>
                    <span>{patient.problemType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">
                      Diagnosis:
                    </span>
                    <span>{patient.diagnosis}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Date:</span>
                    <span>{patient.date}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <span className="font-medium text-gray-700">Priority:</span>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-full text-xs font-bold ${getPriorityColor(
                        patient.priority
                      )}`}
                    >
                      {patient.priority}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex justify-between items-center mt-4">
                <span
                  className={`inline-block px-3 py-1 rounded-full text-xs font-bold ${
                    patient.status
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {patient.status ? "Solved" : "Pending"}
                </span>
                <div className="flex items-center gap-2">
                  <Button
                    className="bg-sky-400 text-white px-4 py-1.5 rounded-lg text-sm font-medium hover:bg-blue-700 shadow flex items-center gap-1"
                    onClick={() =>
                      router.push(
                        `/en/generalCase/${generalCaseId}/${patient.id}`
                      )
                    }
                    aria-label="View details"
                  >
                    <FolderOpen size={16} />
                    Details
                  </Button>
                  {onDelete && (
                    <Button
                      className="bg-red-100 text-red-700 p-2 rounded-lg hover:bg-red-200"
                      onClick={() => onDelete(patient.id)}
                      aria-label="Delete case"
                    >
                      <Trash2 size={16} />
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
          <FolderOpen size={48} className="mb-4 text-blue-200" />
          <div className="text-lg font-semibold mb-1">
            No matching history found
          </div>
          <div className="text-sm">
            Try adjusting your filters or search terms.
          </div>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mt-8 text-sm text-gray-700">
          <div>
            Showing{" "}
            <span className="font-semibold text-gray-900">
              {paginatedPatients.length > 0 ? (page - 1) * perPage + 1 : 0}
            </span>{" "}
            to{" "}
            <span className="font-semibold text-gray-900">
              {(page - 1) * perPage + paginatedPatients.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-900">
              {filteredPatients.length}
            </span>{" "}
            results
          </div>
          <div className="flex items-center gap-2">
            <Button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-md flex items-center"
            >
              <ChevronLeft size={16} />
            </Button>
            <span className="px-2 py-1 font-medium">
              Page {page} of {totalPages}
            </span>
            <Button
              disabled={page === totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="p-2 bg-white border border-gray-300 hover:bg-gray-100 rounded-md flex items-center"
            >
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {zoomedImages && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={handleCloseZoom}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {zoomedImages.urls.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 focus:outline-none z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={28} />
              </button>
            )}
            <div className="relative max-w-[90vw] max-h-[85vh]">
              <Image
                key={zoomedImages.urls[zoomedImages.currentIndex]}
                src={formatImageUrl(
                  zoomedImages.urls[zoomedImages.currentIndex]
                )}
                alt={`Zoomed view ${zoomedImages.currentIndex + 1}`}
                className="block object-contain max-w-full max-h-full rounded-lg"
                layout="intrinsic"
                width={1200}
                height={800}
              />
            </div>
            {zoomedImages.urls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 focus:outline-none z-10"
                aria-label="Next image"
              >
                <ChevronRight size={28} />
              </button>
            )}
            <button
              onClick={handleCloseZoom}
              className="absolute top-4 right-4 bg-white/20 text-white p-2 rounded-full hover:bg-white/30 focus:outline-none"
              aria-label="Close"
            >
              <X size={24} />
            </button>
            {zoomedImages.urls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full">
                {zoomedImages.currentIndex + 1} / {zoomedImages.urls.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

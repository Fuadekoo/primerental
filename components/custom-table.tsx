"use client";
import React, { useState } from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  getKeyValue,
} from "@heroui/react";
import { X, Search, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

export interface ColumnDef<T> {
  key: string;
  label: string;
  renderCell?: (item: T) => React.ReactNode;
}

interface CustomTableProps {
  rows: Array<
    Record<string, any> & { key?: string | number; id?: string | number }
  >;
  columns: Array<ColumnDef<Record<string, any>>>;
  totalRows: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  searchValue: string;
  onSearch: (value: string) => void;
  isLoading?: boolean;
}

interface ZoomedImagesState {
  urls: string[];
  currentIndex: number;
}

const PAGE_SIZES = [10, 25, 50, 100];

// Helper to format image URLs
const formatImageUrl = (url: string | null | undefined): string => {
  if (!url) return "/placeholder.png";
  // If already an absolute URL or starts with /, use as is
  if (url.startsWith("http") || url.startsWith("/")) return url;
  // Otherwise, fetch from local API endpoint
  return `/api/filedata/${encodeURIComponent(url)}`;
};

function CustomTable({
  rows,
  columns,
  totalRows,
  page,
  pageSize,
  onPageChange,
  onPageSizeChange,
  searchValue,
  onSearch,
  isLoading = false,
}: CustomTableProps) {
  const totalPages = Math.max(Math.ceil(totalRows / pageSize), 1);
  const [zoomedImages, setZoomedImages] = useState<ZoomedImagesState | null>(
    null
  );

  const handleImageClick = (imageUrls: string[], startIndex: number = 0) => {
    if (imageUrls && imageUrls.length > 0) {
      setZoomedImages({ urls: imageUrls, currentIndex: startIndex });
    }
  };

  const handleCloseZoom = () => {
    setZoomedImages(null);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomedImages((prev) => {
      if (!prev) return null;
      const nextIndex = (prev.currentIndex + 1) % prev.urls.length;
      return { ...prev, currentIndex: nextIndex };
    });
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setZoomedImages((prev) => {
      if (!prev) return null;
      const prevIndex =
        (prev.currentIndex - 1 + prev.urls.length) % prev.urls.length;
      return { ...prev, currentIndex: prevIndex };
    });
  };

  return (
    <div className="rounded-xl border border-slate-200/70 dark:border-neutral-800 bg-white/80 dark:bg-neutral-900 p-4">
      {/* Search and page size */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex items-center">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            aria-hidden="true"
          />
          <input
            type="text"
            placeholder="Search..."
            value={searchValue}
            onChange={(e) => onSearch(e.target.value)}
            className="px-3 py-2 pl-10 w-full sm:w-auto sm:min-w-[250px] text-sm rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            disabled={isLoading}
          />
        </div>
        <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
          <span>Show:</span>
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="px-3 py-2 rounded-md border border-slate-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-primary-500/30 focus:border-primary-500"
            disabled={isLoading}
          >
            {PAGE_SIZES.map((size) => (
              <option key={size} value={size}>
                {size}
              </option>
            ))}
          </select>
          <span>entries</span>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-auto rounded-lg border border-slate-200/70 dark:border-neutral-800 mt-4">
        <Table
          aria-label="Data table with dynamic content"
          className="bg-transparent"
        >
          <TableHeader columns={columns}>
            {(column) => (
              <TableColumn
                key={column.key}
                className="bg-slate-100 dark:bg-neutral-900/80 p-3 text-left text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider"
              >
                {column.label}
              </TableColumn>
            )}
          </TableHeader>
          <TableBody
            items={rows}
            emptyContent={
              !isLoading && rows.length === 0 ? "No data to display." : " "
            }
          >
            {(item) => (
              <TableRow
                key={item.key || item.id}
                className="border-b last:border-b-0 border-slate-200/70 dark:border-neutral-800 hover:bg-slate-50 dark:hover:bg-neutral-800/60 transition-colors"
              >
                {(columnKey) => {
                  const column = columns.find((col) => col.key === columnKey);
                  const cellValue = getKeyValue(item, columnKey);

                  // Preview for arrays of images/photos
                  if (
                    (columnKey === "images" || columnKey === "photos") &&
                    Array.isArray(cellValue) &&
                    cellValue.length > 0
                  ) {
                    return (
                      <TableCell className="p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                        <Image
                          src={formatImageUrl(cellValue[0])}
                          alt={`Preview for ${item.id || item.key}`}
                          width={100}
                          height={60}
                          className="object-cover rounded-md cursor-pointer h-16 w-24 ring-1 ring-slate-200 dark:ring-neutral-800"
                          onClick={() => handleImageClick(cellValue, 0)}
                          onError={(e) => {
                            const target = e.target as HTMLImageElement;
                            target.style.display = "none";
                          }}
                        />
                      </TableCell>
                    );
                  }

                  return (
                    <TableCell className="p-3 text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {column && column.renderCell
                        ? column.renderCell(item)
                        : cellValue}
                    </TableCell>
                  );
                }}
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Loading indicator */}
      {isLoading && rows.length === 0 && (
        <div className="flex justify-center items-center p-6">
          <span className="text-slate-500 dark:text-slate-400">
            Loading data...
          </span>
        </div>
      )}

      {/* Pagination */}
      <div className="flex flex-wrap items-center justify-between gap-4 mt-4 p-2 text-sm text-slate-700 dark:text-slate-300">
        <div>
          Showing{" "}
          <span className="font-semibold">
            {rows.length > 0
              ? Math.min((page - 1) * pageSize + 1, totalRows)
              : 0}
          </span>{" "}
          to{" "}
          <span className="font-semibold">
            {Math.min(page * pageSize, totalRows)}
          </span>{" "}
          of <span className="font-semibold">{totalRows}</span> results
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(Math.max(1, page - 1))}
              disabled={page === 1 || isLoading}
              className="px-2 py-1.5 rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft size={18} />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((pg) => {
                if (totalPages <= 3) return true;
                if (page <= 2) return pg <= 3;
                if (page >= totalPages - 1) return pg >= totalPages - 2;
                return Math.abs(pg - page) <= 1;
              })
              .map((pg) => (
                <button
                  key={pg}
                  onClick={() => onPageChange(pg)}
                  disabled={pg === page || isLoading}
                  className={`px-3 py-1.5 rounded border transition-colors ${
                    pg === page
                      ? "bg-primary-600 dark:bg-primary-500 text-white font-semibold border-primary-600 dark:border-primary-500"
                      : "bg-white dark:bg-neutral-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800"
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {pg}
                </button>
              ))}
            <button
              onClick={() => onPageChange(Math.min(totalPages, page + 1))}
              disabled={page === totalPages || isLoading}
              className="px-2 py-1.5 rounded border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 hover:bg-slate-50 dark:hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center transition-colors"
              aria-label="Next page"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {zoomedImages && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
          onClick={handleCloseZoom}
        >
          <div
            className="relative w-full h-full flex items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Previous Button */}
            {zoomedImages.urls.length > 1 && (
              <button
                onClick={handlePrevImage}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-neutral-900/60 text-white p-2 rounded-full hover:bg-neutral-800/80 focus:outline-none z-10"
                aria-label="Previous image"
              >
                <ChevronLeft size={24} />
              </button>
            )}

            {/* Image Container */}
            <div className="relative w-auto h-auto max-w-[90vw] max-h-[90vh]">
              <Image
                key={zoomedImages.urls[zoomedImages.currentIndex]}
                src={formatImageUrl(
                  zoomedImages.urls[zoomedImages.currentIndex]
                )}
                alt={`Zoomed view ${zoomedImages.currentIndex + 1} of ${
                  zoomedImages.urls.length
                }`}
                className="block object-contain max-w-full max-h-full rounded-lg ring-1 ring-white/20"
                layout="intrinsic"
                width={1200}
                height={800}
              />
            </div>

            {/* Next Button */}
            {zoomedImages.urls.length > 1 && (
              <button
                onClick={handleNextImage}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-neutral-900/60 text-white p-2 rounded-full hover:bg-neutral-800/80 focus:outline-none z-10"
                aria-label="Next image"
              >
                <ChevronRight size={24} />
              </button>
            )}

            {/* Close Button */}
            <button
              onClick={handleCloseZoom}
              className="absolute top-2 right-2 bg-neutral-900/60 text-white p-1.5 rounded-full hover:bg-neutral-800/80 focus:outline-none"
              aria-label="Close zoomed image"
            >
              <X size={20} />
            </button>

            {/* Counter */}
            {zoomedImages.urls.length > 1 && (
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-xs px-2 py-1 rounded-full">
                {zoomedImages.currentIndex + 1} / {zoomedImages.urls.length}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default CustomTable;

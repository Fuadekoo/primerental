"use client";
import React from "react";
import type { ActivityItem } from "@/actions/admin/dashboard";

type Props = {
  data?: ActivityItem[];
  isLoading?: boolean;
};

export default function RecentActivity({ data, isLoading }: Props) {
  if (isLoading) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 border border-slate-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
        <div className="space-y-3">
          <div className="h-4 rounded bg-slate-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 rounded bg-slate-200 dark:bg-neutral-800 animate-pulse" />
          <div className="h-4 rounded bg-slate-200 dark:bg-neutral-800 animate-pulse" />
        </div>
      </div>
    );
  }

  const items = data ?? [];

  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 border border-slate-200 dark:border-neutral-800">
      <h3 className="text-lg font-semibold mb-3">Recent Activity</h3>
      {items.length === 0 ? (
        <p className="text-sm text-slate-500">No activity</p>
      ) : (
        <ul className="divide-y divide-slate-200 dark:divide-neutral-800">
          {items.map((a) => (
            <li key={a.id} className="py-3">
              <div className="font-medium text-slate-800 dark:text-slate-200">
                {a.title}
              </div>
              {a.description && (
                <div className="text-xs text-slate-500">{a.description}</div>
              )}
              <div className="text-[10px] text-slate-400 mt-1">
                {new Date(a.createdAt).toLocaleString()}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

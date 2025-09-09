"use client";
import React from "react";
import type { Appointment } from "@/actions/admin/dashboard";

export default function Schedule({ data }: { data?: Appointment[] }) {
  if (data && data.length > 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 border border-slate-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold mb-3">Upcoming Appointments</h3>
        <ul className="space-y-2">
          {data.map((a) => (
            <li
              key={a.id}
              className="flex items-center justify-between text-sm"
            >
              <div>
                <div className="font-medium text-slate-800 dark:text-slate-200">
                  {a.title}
                </div>
                <div className="text-xs text-slate-500">
                  {new Date(a.time).toLocaleString()}{" "}
                  {a.with ? `• ${a.with}` : ""}
                </div>
              </div>
              {a.location && (
                <span className="text-xs text-slate-500">{a.location}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    );
  }
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 border border-slate-200 dark:border-neutral-800">
      <h3 className="text-lg font-semibold mb-3">Upcoming Appointments</h3>
      <p className="text-sm text-slate-500">No data</p>
    </div>
  );
}

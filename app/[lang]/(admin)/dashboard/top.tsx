"use client";
import React from "react";
import Image from "next/image";
import { Button } from "@heroui/react";
import { MoreVertical } from "lucide-react";
import type { TopTenant } from "@/actions/admin/dashboard";

type Performer = { name: string; email: string; avatar: string };

const performers: Performer[] = [
  {
    name: "Rainer Brown",
    email: "rainer.b@example.com",
    avatar: "/avatars/01.png",
  },
  {
    name: "Alex Sullivan",
    email: "alex.s@example.com",
    avatar: "/avatars/02.png",
  },
  {
    name: "Conny Rany",
    email: "conny.r@example.com",
    avatar: "/avatars/03.png",
  },
  {
    name: "Lily Alexa",
    email: "lily.a@example.com",
    avatar: "/avatars/04.png",
  },
  {
    name: "Armin Falcon",
    email: "armin.f@example.com",
    avatar: "/avatars/05.png",
  },
  {
    name: "Agatha Smith",
    email: "agatha.s@example.com",
    avatar: "/avatars/01.png",
  },
];

const TopPerformers = ({ t }: { t: Record<string, string> }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700">
    <h3 className="font-bold text-lg text-gray-800 dark:text-white">
      {t.topTenants}
    </h3>
    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
      {performers.map((performer) => (
        <div key={performer.name} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src={performer.avatar}
              alt={performer.name}
              width={40}
              height={40}
              className="rounded-full"
            />
            <div>
              <p className="font-semibold text-sm text-gray-800 dark:text-gray-200">
                {performer.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {performer.email}
              </p>
            </div>
          </div>
          <Button isIconOnly variant="light" size="sm">
            <MoreVertical className="h-5 w-5 text-gray-400" />
          </Button>
        </div>
      ))}
    </div>
  </div>
);

// Accept data from server actions; fallback to existing UI when not provided
export default function Top({ data }: { data?: TopTenant[] }) {
  if (data && data.length > 0) {
    return (
      <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 border border-slate-200 dark:border-neutral-800">
        <h3 className="text-lg font-semibold mb-3">Top Tenants</h3>
        <ul className="divide-y divide-slate-200 dark:divide-neutral-800">
          {data.map((t) => (
            <li key={t.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-primary-100 dark:bg-primary-900/40 grid place-items-center text-primary-700 dark:text-primary-300 text-sm">
                  {t.name?.[0] ?? "T"}
                </div>
                <div>
                  <div className="font-medium text-slate-800 dark:text-slate-200">
                    {t.name}
                  </div>
                  <div className="text-xs text-slate-500">Unit {t.unit}</div>
                </div>
              </div>
              <div className="text-xs text-slate-500">
                Paid until {new Date(t.paidUntil).toLocaleDateString()}
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  // Fallback to existing component UI if props not passed
  return (
    <div className="bg-white dark:bg-neutral-900 rounded-lg shadow p-4 border border-slate-200 dark:border-neutral-800">
      <h3 className="text-lg font-semibold mb-3">Top Tenants</h3>
      <p className="text-sm text-slate-500">No data</p>
    </div>
  );
}

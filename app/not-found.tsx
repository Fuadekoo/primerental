"use client";

import React from "react";
import Link from "next/link";
import { Home, RotateCcw, Search } from "lucide-react";

export default function NotFound() {
  function handleReload() {
    if (typeof window !== "undefined") window.location.reload();
  }

  return (
    <main className="min-h-dvh bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-3xl">
        {/* Header / Brand */}
        <div className="mb-6 flex items-center gap-3">
          <div className="size-10 rounded bg-zinc-900 dark:bg-white flex items-center justify-center">
            <span className="text-white dark:text-zinc-900 font-extrabold text-lg">
              PR
            </span>
          </div>
          <div className="leading-tight">
            <p className="font-semibold tracking-tight">Primerental</p>
            <p className="text-xs text-zinc-500">Black & White</p>
          </div>
        </div>

        <section className="relative overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-900/40 dark:to-zinc-900">
          {/* Decorative background */}
          <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(60%_60%_at_50%_10%,black,transparent)]">
            <div className="absolute -top-24 left-1/2 h-64 w-[110%] -translate-x-1/2 rotate-6 bg-[linear-gradient(to_right,transparent,rgba(0,0,0,0.06),transparent)] dark:bg-[linear-gradient(to_right,transparent,rgba(255,255,255,0.06),transparent)]" />
          </div>

          <div className="relative p-6 sm:p-10">
            <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white/70 dark:bg-zinc-950/50 px-3 py-1 text-xs text-zinc-600 dark:text-zinc-400">
                  <span className="inline-block size-1.5 rounded-full bg-zinc-900 dark:bg-zinc-100" />
                  404 • Page not found
                </div>
                <h1 className="mt-3 text-3xl font-semibold tracking-tight">
                  We can’t find that page
                </h1>
                <p className="mt-2 max-w-prose text-sm text-zinc-600 dark:text-zinc-400">
                  The link may be broken or the page may have been moved. You
                  can go back to the homepage or try reloading.
                </p>
              </div>

              <div className="hidden sm:block text-zinc-300 dark:text-zinc-700">
                <Search size={120} strokeWidth={1.75} aria-hidden />
              </div>
            </div>

            {/* Actions */}
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-md bg-zinc-900 px-4 py-2 text-sm font-medium text-white shadow hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:bg-white dark:text-zinc-900 dark:hover:bg-zinc-200"
                aria-label="Back to home"
              >
                <Home className="size-4" aria-hidden />
                Home
              </Link>
              <button
                onClick={handleReload}
                className="inline-flex items-center gap-2 rounded-md border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-100 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-100 dark:hover:bg-zinc-800"
                aria-label="Reload page"
              >
                <RotateCcw className="size-4" aria-hidden />
                Restart
              </button>
            </div>

            <p className="mt-4 text-xs text-zinc-500">
              Tip: Double-check the URL or use the navigation to find what you
              need.
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

// app/providers.tsx
"use client";
import { Toaster } from "@/components/ui/sonner";
import { ReactNode } from "react";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <>
      <Toaster />
      {children}
    </>
  );
}

import type { Metadata } from "next";
import { Suspense } from "react";
import { Composer } from "@/components/composer";

export const metadata: Metadata = { title: "โพสต์ใหม่", robots: { index: false } };

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="skeleton h-96" />}>
      <Composer />
    </Suspense>
  );
}

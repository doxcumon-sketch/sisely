import type { Metadata } from "next";
import { Suspense } from "react";
import { SearchView } from "@/components/search-view";

export const metadata: Metadata = { title: "ค้นหา", description: "ค้นหาโพสต์ ห้อง ร้าน งาน ดีล และผู้คนในศรีสะเกษ", robots: { index: false } };

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="skeleton mx-auto h-14 max-w-3xl rounded-sm" />}>
      <SearchView />
    </Suspense>
  );
}

import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SISE · พื้นที่ออนไลน์ของคนศรีสะเกษ",
    short_name: "SISE",
    description: "ศรีสะเกษ เมืองเล็ก ไม่ธรรมดา — ชุมชน ร้าน งาน ที่เที่ยว และดีลท้องถิ่น",
    start_url: "/",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#5b3df5",
    theme_color: "#5b3df5",
    lang: "th",
    categories: ["social", "lifestyle", "travel"],
    icons: [
      { src: "/icon-192", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
    shortcuts: [
      { name: "โพสต์ใหม่", url: "/create", description: "กำลังคิดอะไรอยู่?" },
      { name: "วันนี้มีอะไร", url: "/events?when=today" },
      { name: "ห้อง", url: "/rooms" },
    ],
  };
}

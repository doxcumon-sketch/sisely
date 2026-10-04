"use client";

export default function GlobalError({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <div className="mx-auto max-w-md py-20 text-center">
      <h1 className="font-editorial text-2xl font-bold">มีบางอย่างผิดพลาด</h1>
      <p className="mt-2 text-muted">ขออภัย โหลดหน้านี้ไม่สำเร็จ ลองใหม่อีกครั้ง</p>
      <button type="button" onClick={reset} className="press mt-6 rounded-sm bg-night px-6 py-3 font-semibold text-on-night">ลองใหม่</button>
    </div>
  );
}

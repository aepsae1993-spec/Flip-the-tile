import Link from "next/link";
import { BookOpenCheck } from "lucide-react";

export function BrandLogo() {
  return (
    <Link href="/" className="inline-flex items-center gap-2.5 font-semibold tracking-tight">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-sm shadow-primary/25">
        <BookOpenCheck className="size-5" aria-hidden="true" />
      </span>
      <span className="text-lg">เปิดป้าย <span className="text-primary">อ่านคำ</span></span>
    </Link>
  );
}

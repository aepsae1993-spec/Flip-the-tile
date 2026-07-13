import Link from "next/link";
import Image from "next/image";
import { SCHOOL_LOGO_URL, SCHOOL_NAME } from "@/lib/school";

export function BrandLogo() {
  return (
    <Link href="/" className="inline-flex min-w-0 items-center gap-2.5 font-semibold tracking-tight" aria-label={`เปิดป้าย อ่านคำ · ${SCHOOL_NAME}`}>
      <span className="grid size-11 shrink-0 place-items-center rounded-full border border-primary/25 bg-card p-1 shadow-sm shadow-primary/15">
        <Image src={SCHOOL_LOGO_URL} width={40} height={40} sizes="40px" priority alt={`ตรา${SCHOOL_NAME}`} className="size-full object-contain" />
      </span>
      <span className="min-w-0">
        <span className="block text-base leading-tight sm:text-lg">เปิดป้าย <span className="text-primary">อ่านคำ</span></span>
        <span className="mt-0.5 block text-[10px] leading-tight font-medium text-muted-foreground sm:text-xs">
          โรงเรียนวัดบางขุด <span className="whitespace-nowrap">(อุ่นพิทยาคาร)</span>
        </span>
      </span>
    </Link>
  );
}

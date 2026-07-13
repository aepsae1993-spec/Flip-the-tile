import Image from "next/image";
import { SCHOOL_CREDIT, SCHOOL_LOGO_URL, SCHOOL_NAME } from "@/lib/school";

export function SchoolCredit() {
  return (
    <footer className="border-t border-border/70 bg-background/92 px-4 py-5 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-center gap-3 text-center">
        <span className="grid size-11 shrink-0 place-items-center rounded-full border border-primary/25 bg-card p-1 shadow-sm">
          <Image src={SCHOOL_LOGO_URL} width={40} height={40} sizes="40px" alt={`ตรา${SCHOOL_NAME}`} className="size-full object-contain" />
        </span>
        <p className="text-sm font-medium leading-relaxed text-muted-foreground">
          {SCHOOL_CREDIT}
        </p>
      </div>
    </footer>
  );
}

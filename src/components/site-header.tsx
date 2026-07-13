import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="เมนูหลัก">
          <Link href="/#how" className="transition-colors hover:text-foreground">วิธีใช้งาน</Link>
          <Link href="/play/demo" className="transition-colors hover:text-foreground">ทดลองเล่น</Link>
          <Link href="/dashboard" className="transition-colors hover:text-foreground">แดชบอร์ด</Link>
        </nav>
        <Button asChild size="sm" className="rounded-full px-5">
          <Link href="/create">+ สร้างชุดคำ</Link>
        </Button>
      </div>
    </header>
  );
}

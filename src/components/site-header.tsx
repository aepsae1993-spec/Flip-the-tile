import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { getCurrentAccount } from "@/lib/auth";

export async function SiteHeader() {
  const account = await getCurrentAccount();
  return (
    <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <BrandLogo />
        <nav className="hidden items-center gap-7 text-sm font-medium text-muted-foreground md:flex" aria-label="เมนูหลัก">
          <Link href="/#how" className="transition-colors hover:text-foreground">วิธีใช้งาน</Link>
          <Link href="/play/demo" className="transition-colors hover:text-foreground">ทดลองเล่น</Link>
          <Link href="/dashboard" className="transition-colors hover:text-foreground">แดชบอร์ด</Link>
        </nav>
        <div className="flex items-center gap-2">
          {!account && <Button asChild variant="ghost" size="sm"><Link href="/login">เข้าสู่ระบบ</Link></Button>}
          <Button asChild size="sm" className="rounded-full px-5"><Link href={account ? "/dashboard" : "/register"}>{account ? "แดชบอร์ด" : "สมัครสมาชิก"}</Link></Button>
        </div>
      </div>
    </header>
  );
}

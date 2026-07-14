"use client";

import { useState, useTransition, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, MoreHorizontal, Pencil, Share2, Trash2, UserRoundX } from "lucide-react";
import { deleteWordSetAction } from "@/app/create/actions";
import {
  removeWordSetShareAction,
  shareWordSetAction,
  type WordSetShare,
} from "@/app/dashboard/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function WordSetActions({ id, title, shares = [] }: { id: string; title: string; shares?: WordSetShare[] }) {
  const router = useRouter();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [deleteError, setDeleteError] = useState("");
  const [shareError, setShareError] = useState("");
  const [email, setEmail] = useState("");
  const [currentShares, setCurrentShares] = useState(shares);
  const [pending, startTransition] = useTransition();

  function remove() {
    setDeleteError("");
    startTransition(async () => {
      const result = await deleteWordSetAction(id);
      if (result.error) return setDeleteError(result.error);
      setDeleteOpen(false);
      router.refresh();
    });
  }

  function share(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setShareError("");
    startTransition(async () => {
      const result = await shareWordSetAction(id, email);
      if (result.error) return setShareError(result.error);
      if (result.share) {
        setCurrentShares((items) => [
          ...items.filter((item) => item.id !== result.share?.id),
          result.share,
        ]);
      }
      setEmail("");
      router.refresh();
    });
  }

  function unshare(shareId: string) {
    setShareError("");
    startTransition(async () => {
      const result = await removeWordSetShareAction(shareId);
      if (result.error) return setShareError(result.error);
      setCurrentShares((items) => items.filter((item) => item.id !== shareId));
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`จัดการชุดป้าย ${title}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-44">
          <DropdownMenuItem asChild className="py-2">
            <Link href={`/sets/${id}/edit`}><Pencil className="size-4" />แก้ไขชุดคำ</Link>
          </DropdownMenuItem>
          <DropdownMenuItem className="py-2" onSelect={() => setShareOpen(true)}>
            <Share2 className="size-4" />แชร์ให้สมาชิก
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="py-2" onSelect={() => setDeleteOpen(true)}>
            <Trash2 className="size-4" />ลบชุดคำ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={shareOpen} onOpenChange={setShareOpen}>
        <DialogContent>
          <form onSubmit={share}>
            <DialogHeader>
              <DialogTitle>แชร์ “{title}” ให้สมาชิก</DialogTitle>
              <DialogDescription>กรอกอีเมลของสมาชิกที่สมัครและได้รับอนุมัติแล้ว สมาชิกจะเห็นชุดนี้ในแดชบอร์ดและนำไปเล่นได้</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-5">
              <div className="space-y-2">
                <Label htmlFor={`share-email-${id}`}>อีเมลสมาชิก</Label>
                <Input id={`share-email-${id}`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="teacher@example.com" autoComplete="email" required />
              </div>
              {shareError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{shareError}</p>}
              {currentShares.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm font-medium">สมาชิกที่เข้าถึงได้ ({currentShares.length})</p>
                  <div className="max-h-40 space-y-2 overflow-y-auto">
                    {currentShares.map((item) => (
                      <div key={item.id} className="flex items-center justify-between gap-3 rounded-lg border bg-muted/35 px-3 py-2">
                        <span className="min-w-0 truncate text-sm">{item.recipientEmail}</span>
                        <Button type="button" variant="ghost" size="icon-sm" disabled={pending} onClick={() => unshare(item.id)} aria-label={`ยกเลิกแชร์ให้ ${item.recipientEmail}`}>
                          <UserRoundX className="size-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShareOpen(false)} disabled={pending}>ปิด</Button>
              <Button type="submit" disabled={pending || !email.trim()}>
                {pending ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Share2 className="mr-2 size-4" />}
                แชร์ให้สมาชิก
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลบชุดคำนี้หรือไม่</DialogTitle>
            <DialogDescription>ชุด “{title}” และข้อมูลป้ายทั้งหมดจะถูกลบถาวร ไม่สามารถย้อนกลับได้</DialogDescription>
          </DialogHeader>
          {deleteError && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{deleteError}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteOpen(false)} disabled={pending}>ยกเลิก</Button>
            <Button variant="destructive" onClick={remove} disabled={pending}>
              {pending && <LoaderCircle className="mr-2 size-4 animate-spin" />}
              ลบชุดคำ
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

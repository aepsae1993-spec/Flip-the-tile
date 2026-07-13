"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { deleteWordSetAction } from "@/app/create/actions";
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

export function WordSetActions({ id, title }: { id: string; title: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  const [pending, startTransition] = useTransition();

  function remove() {
    setError("");
    startTransition(async () => {
      const result = await deleteWordSetAction(id);
      if (result.error) return setError(result.error);
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon-sm" aria-label={`จัดการชุดคำ ${title}`}>
            <MoreHorizontal className="size-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="min-w-40">
          <DropdownMenuItem asChild className="py-2">
            <Link href={`/sets/${id}/edit`}><Pencil className="size-4" />แก้ไขชุดคำ</Link>
          </DropdownMenuItem>
          <DropdownMenuItem variant="destructive" className="py-2" onSelect={() => setOpen(true)}>
            <Trash2 className="size-4" />ลบชุดคำ
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>ลบชุดคำนี้หรือไม่</DialogTitle>
            <DialogDescription>ชุด “{title}” และคำทั้งหมดจะถูกลบถาวร ไม่สามารถย้อนกลับได้</DialogDescription>
          </DialogHeader>
          {error && <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)} disabled={pending}>ยกเลิก</Button>
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

"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Eye,
  ImageIcon,
  Layers3,
  LoaderCircle,
  Sparkles,
  Type,
  Upload,
  X,
} from "lucide-react";
import { createWordSetAction, updateWordSetAction, type SetContentType } from "@/app/create/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MAX_CARD_COUNT, MIN_CARD_COUNT } from "@/lib/game-limits";
import { createClient } from "@/lib/supabase/client";

const countOptions = [6, 9, 12, 16, 20, 30, 40, 50];
const exampleWords = "โรงเรียน\nปลา\nม้า\nบ้าน\nทะเล\nห้องเรียน\nดอกไม้\nพระอาทิตย์\nสายรุ้ง\nครอบครัว\nความสุข\nขอบคุณ";

type InitialCard = { wordText: string; imageUrl: string | null };
type InitialSet = {
  id: string;
  title: string;
  grade: string;
  contentType: SetContentType;
  cards: InitialCard[];
};
type ImageEntry = {
  label: string;
  imageUrl: string;
  previewUrl?: string;
  file?: File;
};

function blankImageEntries(count: number, existing: InitialCard[] = []): ImageEntry[] {
  return Array.from({ length: count }, (_, index) => ({
    label: existing[index]?.wordText || `รูปที่ ${index + 1}`,
    imageUrl: existing[index]?.imageUrl || "",
  }));
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  const maxSide = 1600;
  const scale = Math.min(1, maxSide / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) {
    bitmap.close();
    throw new Error("ไม่สามารถเตรียมรูปภาพได้");
  }

  context.imageSmoothingEnabled = true;
  context.imageSmoothingQuality = "high";
  context.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/webp", 0.88));
  if (!blob) throw new Error("ไม่สามารถย่อรูปภาพได้");
  if (blob.size > 3 * 1024 * 1024) throw new Error("รูปภาพยังมีขนาดใหญ่เกิน 3 MB กรุณาเลือกรูปอื่น");
  return blob;
}

export function CreateSetForm({ initialSet }: { initialSet?: InitialSet }) {
  const router = useRouter();
  const previewUrls = useRef(new Set<string>());
  const initialCards = initialSet?.cards ?? [];
  const initialCount = Math.min(initialCards.length || 12, MAX_CARD_COUNT);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  const [title, setTitle] = useState(initialSet?.title ?? "คำพื้นฐาน ป.1–3");
  const [grade, setGrade] = useState(initialSet?.grade ?? "ป.1–3");
  const [contentType, setContentType] = useState<SetContentType>(initialSet?.contentType ?? "word");
  const [count, setCount] = useState(initialCount);
  const [useAllWords, setUseAllWords] = useState(false);
  const [rawWords, setRawWords] = useState(initialCards.map((card) => card.wordText).join("\n") || exampleWords);
  const [imageEntries, setImageEntries] = useState<ImageEntry[]>(() => blankImageEntries(initialCount, initialCards));
  const enteredWords = useMemo(() => rawWords.split(/\r?\n|,/).map((word) => word.trim()).filter(Boolean), [rawWords]);
  const allWords = useMemo(() => enteredWords.slice(0, MAX_CARD_COUNT), [enteredWords]);
  const words = useMemo(() => useAllWords ? allWords : allWords.slice(0, count), [allWords, count, useAllWords]);
  const imageReadyCount = imageEntries.slice(0, count).filter((entry) => entry.file || entry.imageUrl).length;
  const isReady = title.trim().length > 0
    && (contentType === "word" ? (useAllWords ? words.length >= 2 : words.length === count) : imageReadyCount === count);

  useEffect(() => {
    if (!saved) return;
    const redirectTimer = window.setTimeout(() => window.location.assign("/dashboard"), 1500);
    return () => window.clearTimeout(redirectTimer);
  }, [saved]);

  useEffect(() => () => {
    previewUrls.current.forEach((url) => URL.revokeObjectURL(url));
  }, []);

  function chooseCount(nextCount: number) {
    const safeCount = Math.min(MAX_CARD_COUNT, Math.max(MIN_CARD_COUNT, Math.round(nextCount)));
    setUseAllWords(false);
    setCount(safeCount);
    setImageEntries((current) => Array.from({ length: safeCount }, (_, index) => current[index] ?? {
      label: `รูปที่ ${index + 1}`,
      imageUrl: "",
    }));
  }

  function selectImage(index: number, file?: File) {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      setError("กรุณาเลือกไฟล์รูปภาพเท่านั้น");
      return;
    }
    if (file.size > 20 * 1024 * 1024) {
      setError("รูปต้นฉบับต้องมีขนาดไม่เกิน 20 MB");
      return;
    }

    setError("");
    setImageEntries((current) => current.map((entry, entryIndex) => {
      if (entryIndex !== index) return entry;
      if (entry.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl);
        previewUrls.current.delete(entry.previewUrl);
      }
      const filename = file.name.replace(/\.[^.]+$/, "").trim();
      const previewUrl = URL.createObjectURL(file);
      previewUrls.current.add(previewUrl);
      return {
        label: entry.label.startsWith("รูปที่ ") && filename ? filename.slice(0, 160) : entry.label,
        imageUrl: "",
        file,
        previewUrl,
      };
    }));
  }

  function clearImage(index: number) {
    setImageEntries((current) => current.map((entry, entryIndex) => {
      if (entryIndex !== index) return entry;
      if (entry.previewUrl) {
        URL.revokeObjectURL(entry.previewUrl);
        previewUrls.current.delete(entry.previewUrl);
      }
      return { label: `รูปที่ ${index + 1}`, imageUrl: "" };
    }));
  }

  async function uploadImages(): Promise<ImageEntry[]> {
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("กรุณาเข้าสู่ระบบใหม่ก่อนอัปโหลดรูป");

    const uploaded = [...imageEntries.slice(0, count)];
    for (let index = 0; index < uploaded.length; index += 1) {
      const entry = uploaded[index];
      if (entry.imageUrl && !entry.file) {
        setUploadProgress(index + 1);
        continue;
      }
      if (!entry.file) throw new Error(`กรุณาเลือกรูปที่ ${index + 1}`);

      const compressed = await compressImage(entry.file);
      const path = `${user.id}/${crypto.randomUUID()}.webp`;
      const { error: uploadError } = await supabase.storage.from("card-images").upload(path, compressed, {
        cacheControl: "31536000",
        contentType: "image/webp",
        upsert: false,
      });
      if (uploadError) throw new Error(`อัปโหลดรูปที่ ${index + 1} ไม่สำเร็จ`);
      const { data } = supabase.storage.from("card-images").getPublicUrl(path);
      uploaded[index] = { label: entry.label || `รูปที่ ${index + 1}`, imageUrl: data.publicUrl };
      setImageEntries((current) => current.map((item, itemIndex) => itemIndex === index ? uploaded[index] : item));
      setUploadProgress(index + 1);
    }

    setImageEntries(uploaded);
    return uploaded;
  }

  async function save() {
    if (!isReady || saving || saved) return;
    setError("");
    setSaving(true);
    setUploadProgress(0);

    try {
      const uploadedImages = contentType === "image" ? await uploadImages() : [];
      const cards = contentType === "word"
        ? words.map((wordText) => ({ wordText, imageUrl: null }))
        : uploadedImages.map((entry, index) => ({
          wordText: entry.label.trim() || `รูปที่ ${index + 1}`,
          imageUrl: entry.imageUrl,
        }));
      const input = { title, grade, contentType, cards };
      const result = initialSet
        ? await updateWordSetAction({ id: initialSet.id, ...input })
        : await createWordSetAction(input);
      if (result.error) {
        setError(result.error);
        return;
      }
      setSaved(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "เกิดข้อผิดพลาดระหว่างบันทึก กรุณาลองใหม่อีกครั้ง");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-primary"><Layers3 className="size-5" /></span>
            <div><CardTitle>ข้อมูลชุดป้าย</CardTitle><p className="mt-1 text-sm text-muted-foreground">เลือกเปิดเป็นคำหรือรูปภาพได้ในแต่ละชุด</p></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-7 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="title">ชื่อชุด</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="grade">ระดับชั้น</Label><Input id="grade" value={grade} onChange={(event) => setGrade(event.target.value)} /></div>
          </div>

          <div className="space-y-3">
            <Label>รูปแบบป้าย</Label>
            <div className="grid gap-3 sm:grid-cols-2">
              <Button type="button" variant="outline" onClick={() => setContentType("word")} className={`h-auto justify-start gap-3 rounded-2xl border-2 p-4 text-left transition ${contentType === "word" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}>
                <span className="grid size-10 place-items-center rounded-xl bg-background shadow-sm"><Type className="size-5" /></span>
                <span><strong className="block">โหมดคำ</strong><span className="text-xs text-muted-foreground">พลิกแล้วแสดงข้อความ</span></span>
              </Button>
              <Button type="button" variant="outline" onClick={() => { setContentType("image"); setUseAllWords(false); }} className={`h-auto justify-start gap-3 rounded-2xl border-2 p-4 text-left transition ${contentType === "image" ? "border-primary bg-primary/5 text-primary" : "border-border hover:border-primary/40"}`}>
                <span className="grid size-10 place-items-center rounded-xl bg-background shadow-sm"><ImageIcon className="size-5" /></span>
                <span><strong className="block">โหมดรูปภาพ</strong><span className="text-xs text-muted-foreground">พลิกแล้วแสดงรูปเต็มใบ</span></span>
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label>จำนวนแผ่นป้าย</Label>
            <div className="flex flex-wrap gap-2">{countOptions.map((option) => <Button key={option} type="button" variant={!useAllWords && count === option ? "default" : "outline"} className="min-w-14" onClick={() => chooseCount(option)}>{option}</Button>)}{contentType === "word" && <Button type="button" variant={useAllWords ? "default" : "outline"} onClick={() => setUseAllWords(true)}><Layers3 className="mr-1.5 size-4" /> ใช้ทุกคำ</Button>}</div>
            <div className="flex max-w-xs items-center gap-3 rounded-xl border bg-muted/30 p-3"><Label htmlFor="custom-count" className="shrink-0">กำหนดเอง</Label><Input id="custom-count" type="number" inputMode="numeric" min={MIN_CARD_COUNT} max={MAX_CARD_COUNT} value={useAllWords ? "" : count} placeholder="2–50" onChange={(event) => { if (event.target.value) chooseCount(Number(event.target.value)); }} /><span className="shrink-0 text-sm text-muted-foreground">รายการ</span></div>
            {contentType === "word" && <p className="text-xs text-muted-foreground">กำหนดจำนวนใดก็ได้ตั้งแต่ 2–50 เช่น 42 หรือ 45 คำ ส่วน “ใช้ทุกคำ” จะใช้ตามที่กรอกสูงสุด 50 คำ</p>}
          </div>

          {contentType === "word" ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between"><Label htmlFor="words">คำศัพท์ (หนึ่งคำต่อหนึ่งบรรทัด)</Label><span className={`text-sm font-medium ${(useAllWords ? words.length >= 2 : words.length === count) ? "text-emerald-600" : "text-muted-foreground"}`}>{useAllWords ? `${words.length} คำ` : `${words.length} / ${count} คำ`}</span></div>
              <Textarea id="words" value={rawWords} onChange={(event) => setRawWords(event.target.value)} className="min-h-64 resize-y leading-7" />
              {!useAllWords && words.length < count && <p className="text-sm text-amber-700">เพิ่มอีก {count - words.length} คำเพื่อให้ครบจำนวนแผ่น</p>}
              {useAllWords && words.length < 2 && <p className="text-sm text-amber-700">เพิ่มอย่างน้อย 2 คำเพื่อบันทึกชุดคำ</p>}
              {enteredWords.length > MAX_CARD_COUNT && <p className="text-sm text-amber-700">รองรับสูงสุด {MAX_CARD_COUNT} คำ ระบบจะใช้ {MAX_CARD_COUNT} คำแรก</p>}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-wrap items-end justify-between gap-2">
                <div><Label>รูปภาพแต่ละแผ่น</Label><p className="mt-1 text-xs text-muted-foreground">ระบบย่อภาพเป็น WebP อัตโนมัติ ภาพไม่ถูกตัดและยังคงความคมชัด</p></div>
                <span className={`text-sm font-medium ${imageReadyCount === count ? "text-emerald-600" : "text-muted-foreground"}`}>{imageReadyCount} / {count} รูป</span>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {imageEntries.slice(0, count).map((entry, index) => {
                  const preview = entry.previewUrl || entry.imageUrl;
                  return (
                    <div key={index} className="rounded-2xl border bg-muted/25 p-3">
                      <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-dashed bg-background">
                        {preview ? <Image src={preview} alt={entry.label || `รูปที่ ${index + 1}`} fill unoptimized={preview.startsWith("blob:")} className="object-contain p-2" sizes="(max-width: 640px) 90vw, 320px" /> : <div className="grid size-full place-items-center text-muted-foreground"><ImageIcon className="size-10" /></div>}
                        {preview && <Button type="button" variant="secondary" size="icon" className="absolute right-2 top-2 size-8 rounded-full" onClick={() => clearImage(index)} aria-label={`ลบรูปที่ ${index + 1}`}><X className="size-4" /></Button>}
                        <label className="absolute inset-x-2 bottom-2 flex cursor-pointer items-center justify-center rounded-lg bg-background/95 px-3 py-2 text-xs font-medium shadow-sm backdrop-blur hover:bg-background">
                          <Upload className="mr-1.5 size-3.5" />{preview ? "เปลี่ยนรูป" : `เลือกรูปที่ ${index + 1}`}
                          <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(event) => { selectImage(index, event.target.files?.[0]); event.target.value = ""; }} />
                        </label>
                      </div>
                      <Input className="mt-2 h-9" value={entry.label} maxLength={160} aria-label={`ชื่อรูปที่ ${index + 1}`} onChange={(event) => setImageEntries((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, label: event.target.value } : item))} placeholder="ชื่อรูป (ไม่บังคับ)" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {saving && contentType === "image" && <p className="rounded-lg bg-blue-50 p-3 text-sm text-blue-700">กำลังย่อและอัปโหลดรูป {uploadProgress} / {count}</p>}
          {error && <p role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
          <div className="flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-1 size-4" /> ย้อนกลับ</Button>
            <Button type="button" disabled={!isReady || saving || saved} onClick={save}>{saving ? <LoaderCircle className="mr-2 size-4 animate-spin" /> : <Check className="mr-1 size-4" />}{initialSet ? "บันทึกการแก้ไข" : "บันทึก"}</Button>
          </div>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden border-blue-100">
          <CardHeader className="bg-blue-50/70"><CardTitle className="flex items-center gap-2 text-base"><Eye className="size-4 text-primary" /> ตัวอย่างแผ่นป้าย</CardTitle></CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-2.5">{Array.from({ length: Math.min(contentType === "word" && useAllWords ? words.length : count, 12) }, (_, index) => {
              const preview = imageEntries[index]?.previewUrl || imageEntries[index]?.imageUrl;
              return <div key={index} className="relative grid aspect-square place-items-center overflow-hidden rounded-xl border border-blue-200 bg-blue-50 font-bold text-blue-700">{contentType === "image" && preview ? <Image src={preview} alt="" fill unoptimized={preview.startsWith("blob:")} className="object-contain p-1" sizes="100px" /> : index + 1}</div>;
            })}</div>
            <div className="mt-5 space-y-3 rounded-xl bg-muted p-4 text-sm">
              <p className="flex justify-between"><span className="text-muted-foreground">ชื่อชุด</span><span className="max-w-44 truncate font-medium">{title || "ยังไม่ได้ตั้งชื่อ"}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">รูปแบบ</span><span className="font-medium">{contentType === "image" ? "รูปภาพ" : "คำ"}</span></p>
              <p className="flex justify-between"><span className="text-muted-foreground">สถานะ</span><span className={`inline-flex items-center gap-1 font-medium ${isReady ? "text-emerald-600" : "text-amber-700"}`}>{isReady && <Check className="size-3.5" />}{isReady ? "พร้อมบันทึก" : "กำลังกรอก"}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>

      {saved && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-950/35 px-4 backdrop-blur-sm" role="status" aria-live="assertive">
          <div className="relative w-full max-w-sm overflow-hidden rounded-[2rem] border border-emerald-200 bg-background p-8 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-300">
            <Sparkles className="absolute left-8 top-8 size-6 animate-bounce text-amber-400" aria-hidden="true" />
            <Sparkles className="absolute right-8 top-12 size-4 animate-pulse text-primary" aria-hidden="true" />
            <div className="mx-auto grid size-24 place-items-center rounded-full bg-emerald-100 ring-8 ring-emerald-50 animate-in zoom-in spin-in-12 duration-500"><CheckCircle2 className="size-14 text-emerald-600" aria-hidden="true" /></div>
            <h2 className="mt-6 text-2xl font-bold tracking-tight">บันทึกชุดป้ายสำเร็จ!</h2>
            <p className="mt-2 text-sm text-muted-foreground">กำลังกลับไปยังแดชบอร์ดครู เพื่อดูชุดของคุณ</p>
            <div className="mx-auto mt-6 h-1.5 w-40 overflow-hidden rounded-full bg-emerald-100"><div className="h-full w-full origin-left animate-[success-progress_1.5s_ease-in-out_forwards] rounded-full bg-emerald-500" /></div>
          </div>
        </div>
      )}
    </div>
  );
}

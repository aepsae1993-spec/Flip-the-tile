"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Check, Eye, Layers3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const countOptions = [6, 9, 12, 16, 20, 30];
const exampleWords = "บัว\nปลา\nม้า\nบ้าน\nทะเล\nโรงเรียน\nดอกไม้\nพระอาทิตย์\nสายรุ้ง\nครอบครัว\nความสุข\nขอบคุณ";

export function CreateSetForm() {
  const router = useRouter();
  const [title, setTitle] = useState("คำพื้นฐาน ป.1–3");
  const [grade, setGrade] = useState("ป.1–3");
  const [count, setCount] = useState(12);
  const [rawWords, setRawWords] = useState(exampleWords);

  const words = useMemo(() => rawWords.split(/\r?\n|,/).map((word) => word.trim()).filter(Boolean).slice(0, count), [rawWords, count]);
  const isReady = title.trim().length > 0 && words.length === count;

  function startGame() {
    if (!isReady) return;
    localStorage.setItem("wordflip-custom-set", JSON.stringify({ title: title.trim(), grade, words }));
    router.push("/play/custom");
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_360px]">
      <Card>
        <CardHeader className="border-b">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-xl bg-blue-50 text-primary"><Layers3 className="size-5" /></span>
            <div><CardTitle>ข้อมูลชุดคำ</CardTitle><p className="mt-1 text-sm text-muted-foreground">กรอกข้อมูลและวางคำที่ต้องการใช้ในเกม</p></div>
          </div>
        </CardHeader>
        <CardContent className="space-y-7 p-6">
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2"><Label htmlFor="title">ชื่อชุดคำ</Label><Input id="title" value={title} onChange={(event) => setTitle(event.target.value)} /></div>
            <div className="space-y-2"><Label htmlFor="grade">ระดับชั้น</Label><Input id="grade" value={grade} onChange={(event) => setGrade(event.target.value)} /></div>
          </div>
          <div className="space-y-3">
            <Label>จำนวนแผ่นป้าย</Label>
            <div className="flex flex-wrap gap-2">
              {countOptions.map((option) => (
                <Button key={option} type="button" variant={count === option ? "default" : "outline"} className="min-w-14" onClick={() => setCount(option)}>{option}</Button>
              ))}
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between"><Label htmlFor="words">คำศัพท์ (หนึ่งคำต่อหนึ่งบรรทัด)</Label><span className={`text-sm font-medium ${words.length === count ? "text-emerald-600" : "text-muted-foreground"}`}>{words.length} / {count} คำ</span></div>
            <Textarea id="words" value={rawWords} onChange={(event) => setRawWords(event.target.value)} className="min-h-64 resize-y leading-7" placeholder="พิมพ์หนึ่งคำต่อหนึ่งบรรทัด" />
            {words.length < count && <p className="text-sm text-amber-700">เพิ่มอีก {count - words.length} คำเพื่อให้ครบจำนวนแผ่น</p>}
          </div>
          <div className="flex flex-col-reverse justify-between gap-3 border-t pt-6 sm:flex-row">
            <Button type="button" variant="ghost" onClick={() => router.back()}><ArrowLeft className="mr-1 size-4" /> ย้อนกลับ</Button>
            <Button type="button" disabled={!isReady} onClick={startGame}>บันทึกและเริ่มเล่น <ArrowRight className="ml-1 size-4" /></Button>
          </div>
        </CardContent>
      </Card>

      <div className="lg:sticky lg:top-24 lg:self-start">
        <Card className="overflow-hidden border-blue-100">
          <CardHeader className="bg-blue-50/70"><CardTitle className="flex items-center gap-2 text-base"><Eye className="size-4 text-primary" /> ตัวอย่างแผ่นป้าย</CardTitle></CardHeader>
          <CardContent className="p-5">
            <div className="grid grid-cols-3 gap-2.5">
              {Array.from({ length: Math.min(count, 12) }, (_, index) => (
                <div key={index} className="grid aspect-square place-items-center rounded-xl border border-blue-200 bg-blue-50 font-bold text-blue-700">{index + 1}</div>
              ))}
            </div>
            <div className="mt-5 space-y-3 rounded-xl bg-muted p-4 text-sm">
              <p className="flex items-center justify-between"><span className="text-muted-foreground">ชื่อชุด</span><span className="max-w-44 truncate font-medium">{title || "ยังไม่ได้ตั้งชื่อ"}</span></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">ระดับชั้น</span><span className="font-medium">{grade || "—"}</span></p>
              <p className="flex items-center justify-between"><span className="text-muted-foreground">ความพร้อม</span><span className={`inline-flex items-center gap-1 font-medium ${isReady ? "text-emerald-600" : "text-amber-700"}`}>{isReady && <Check className="size-3.5" />}{isReady ? "พร้อมเล่น" : "กำลังกรอก"}</span></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import Link from "next/link";
import { ArrowRight, Check, MousePointerClick, Share2, Sparkles } from "lucide-react";
import { MiniFlipDemo } from "@/components/mini-flip-demo";
import { SiteHeader } from "@/components/site-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const steps = [
  { icon: Sparkles, title: "สร้างชุดคำ", text: "พิมพ์หรือวางคำหลายคำ แล้วเลือกระดับชั้นได้ตามต้องการ" },
  { icon: Share2, title: "เปิดหน้าห้องหรือแชร์", text: "เล่นบนจอใหญ่ หรือส่งลิงก์ให้นักเรียนเข้าร่วมได้" },
  { icon: MousePointerClick, title: "เลือกป้ายแล้วอ่าน", text: "แผ่นป้ายพลิกอย่างนุ่มนวล พร้อมคำขนาดใหญ่ชัดเจน" },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <SiteHeader />
      <section className="relative overflow-hidden bg-grid-soft">
        <div className="absolute -left-32 top-28 size-80 rounded-full bg-blue-200/35 blur-3xl" />
        <div className="absolute -right-20 top-10 size-72 rounded-full bg-sky-200/40 blur-3xl" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.1fr_.9fr] lg:py-28">
          <div>
            <Badge variant="secondary" className="mb-5 rounded-full px-3 py-1.5 text-primary">
              <Sparkles className="mr-1.5 size-3.5" /> เกมฝึกอ่านสำหรับทุกห้องเรียน
            </Badge>
            <h1 className="max-w-3xl text-4xl font-bold leading-[1.12] tracking-[-.035em] sm:text-5xl lg:text-6xl">
              <span className="block">พลิกป้าย เปิดคำ</span>
              <span className="mt-2 block text-[.86em] leading-[1.18] text-primary md:whitespace-nowrap">สร้างความมั่นใจในการอ่าน</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
              ครูสร้างเกมเปิดแผ่นป้ายได้ในไม่กี่นาที กำหนดคำ จำนวนแผ่น และรูปแบบการเล่นเองได้ เด็ก ๆ สนุก ครูใช้ง่าย
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20">
                <Link href="/create">สร้างชุดคำฟรี <ArrowRight className="ml-1 size-4" /></Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7 text-base">
                <Link href="/play/demo">ทดลองเล่นเกม</Link>
              </Button>
            </div>
            <div className="mt-7 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              {["ไม่ต้องติดตั้ง", "รองรับมือถือและทีวี", "เริ่มเล่นได้ทันที"].map((item) => (
                <span key={item} className="inline-flex items-center gap-1.5"><Check className="size-4 text-emerald-600" />{item}</span>
              ))}
            </div>
          </div>
          <div className="mx-auto w-full max-w-xl lg:ml-auto"><MiniFlipDemo /></div>
        </div>
      </section>

      <section id="how" className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold text-primary">เริ่มง่ายใน 3 ขั้นตอน</p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">จากคำศัพท์ สู่เกมสนุกหน้าห้อง</h2>
          <p className="mt-4 text-muted-foreground">ออกแบบมาให้ครูใช้เวลาเตรียมน้อยลง และมีเวลาเล่นกับเด็กมากขึ้น</p>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {steps.map((step, index) => (
            <Card key={step.title} className="border-blue-100 shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <span className="grid size-11 place-items-center rounded-2xl bg-blue-50 text-primary"><step.icon className="size-5" /></span>
                  <span className="font-mono text-sm text-muted-foreground">0{index + 1}</span>
                </div>
                <h3 className="mt-6 text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 leading-7 text-muted-foreground">{step.text}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto mb-20 max-w-7xl px-4 sm:px-6">
        <div className="overflow-hidden rounded-[2rem] bg-primary px-6 py-12 text-center text-primary-foreground shadow-xl shadow-primary/20 sm:px-12">
          <h2 className="text-3xl font-bold">พร้อมเปลี่ยนคาบอ่านให้สนุกขึ้นหรือยัง?</h2>
          <p className="mx-auto mt-3 max-w-xl text-blue-100">สร้างชุดคำแรกได้ทันที แล้วเปิดเล่นบนหน้าจอในห้องเรียน</p>
          <Button asChild size="lg" variant="secondary" className="mt-7 rounded-full px-7 text-primary">
            <Link href="/create">เริ่มสร้างชุดคำ <ArrowRight className="ml-1 size-4" /></Link>
          </Button>
        </div>
      </section>
    </main>
  );
}

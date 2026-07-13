# เปิดป้าย อ่านคำ

เว็บเกมฝึกอ่านสำหรับห้องเรียน ครูสร้างชุดคำ กำหนดจำนวนแผ่น และเปิดเล่นบนมือถือ แท็บเล็ต หรือจอหน้าห้องได้ทันที

## ทดลองในเครื่อง

```bash
npm install
npm run dev
```

เปิด `http://localhost:3000`

เส้นทางสำคัญ:

- `/` หน้าแนะนำและเกมสาธิต
- `/dashboard` แดชบอร์ดครูตัวอย่าง
- `/create` สร้างชุดคำและบันทึกใน localStorage
- `/play/demo` เกมชุดตัวอย่าง
- `/play/custom` เกมจากชุดคำที่สร้างเอง

## เชื่อม Supabase

1. คัดลอก `.env.example` เป็น `.env.local` และใส่ URL กับ publishable key ของโปรเจกต์
2. เปิด SQL Editor ใน Supabase แล้วรัน `supabase/schema.sql`
3. โครงสร้างตารางและ RLS รองรับโปรไฟล์ครู ชุดคำ และคำแต่ละแผ่นแล้ว

ห้ามนำ secret key หรือ service role key ไปใส่ในตัวแปร `NEXT_PUBLIC_*`

## ตรวจคุณภาพ

```bash
npm run lint
npm run build
```

เทคโนโลยี: Next.js App Router, TypeScript, Tailwind CSS, shadcn/ui และ Supabase SSR

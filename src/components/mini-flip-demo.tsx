"use client";

import { useState } from "react";

const demoWords = ["โรงเรียน", "ปลา", "ม้า", "บ้าน", "ดาว", "ทะเล"];

export function MiniFlipDemo() {
  const [opened, setOpened] = useState(1);

  return (
    <div className="rounded-[2rem] border bg-white p-4 shadow-2xl shadow-blue-950/10 sm:p-6">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[.2em] text-primary">ชุดคำตัวอย่าง</p>
          <p className="mt-1 font-semibold">คำพื้นฐาน ป.1–3</p>
        </div>
        <span className="rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">1 / 6 คำ</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {demoWords.map((word, index) => {
          const isOpen = opened === index;
          return (
            <button
              key={word}
              type="button"
              aria-label={isOpen ? `คำว่า ${word}` : `เปิดป้ายหมายเลข ${index + 1}`}
              onClick={() => setOpened(index)}
              className={`card-perspective aspect-[4/3] min-h-20 ${isOpen ? "card-flipped" : ""}`}
            >
              <span className="card-inner relative block size-full">
                <span className="card-face absolute inset-0 grid place-items-center rounded-2xl border border-blue-300 bg-blue-50 text-2xl font-bold text-blue-700 shadow-sm transition-transform hover:-translate-y-1">{index + 1}</span>
                <span className="card-face card-back absolute inset-0 grid place-items-center rounded-2xl bg-primary px-2 text-xl font-bold text-primary-foreground shadow-lg shadow-primary/20">{word}</span>
              </span>
            </button>
          );
        })}
      </div>
      <p className="mt-4 text-center text-xs text-muted-foreground">ลองแตะหมายเลขเพื่อเปิดคำ</p>
    </div>
  );
}

"use client";
import Image from "next/image";
import { useState } from "react";
import { coverUrl } from "@/lib/helpers";

const WOVEN = "repeating-linear-gradient(135deg, oklch(0.93 0.006 262) 0 11px, oklch(0.955 0.004 262) 11px 22px)";

export default function BookCover({ isbn, title, size = "M", priority = false }: { isbn: string; title: string; size?: "M" | "L"; priority?: boolean }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="absolute inset-0" style={{ background: WOVEN }}>
      {!failed && (
        <Image
          src={coverUrl(isbn, size)}
          alt={title}
          fill
          sizes={size === "L" ? "120px" : "(max-width: 640px) 45vw, 180px"}
          className="object-cover"
          loading={priority ? undefined : "lazy"}
          priority={priority}
          onError={() => setFailed(true)}
        />
      )}
    </div>
  );
}

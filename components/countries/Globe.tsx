"use client";
import { useEffect, useRef } from "react";
import { createGlobe, type GlobeHandle } from "./globe-draw";

export default function Globe({ dark, visited, selected, onSelect }: { dark: boolean; visited: Set<string>; selected: string | null; onSelect: (n: string) => void }) {
  const nodeRef = useRef<HTMLDivElement>(null);
  const handle = useRef<GlobeHandle | null>(null);
  const accent = "rgb(214 81 81)";

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return;
    let alive = true;
    node.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono),monospace;font-size:12px;color:oklch(0.6 0.02 262)">loading atlas…</div>';
    fetch("/atlas/countries-110m.json")
      .then((r) => r.json())
      .then((world) => {
        if (!alive || !nodeRef.current) return;
        handle.current = createGlobe(nodeRef.current, world, { dark, accent, visited, onSelect });
      })
      .catch(() => { if (nodeRef.current) nodeRef.current.innerHTML = '<div style="position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:var(--font-mono),monospace;font-size:12px;color:oklch(0.6 0.02 262)">map unavailable — see list →</div>'; });
    return () => { alive = false; handle.current?.destroy(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dark]);

  useEffect(() => { if (selected) handle.current?.selectByName(selected); }, [selected]);

  return <div ref={nodeRef} className="relative h-[340px] sm:h-[420px] lg:h-[520px] w-full" />;
}

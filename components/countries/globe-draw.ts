import * as d3 from "d3";
import * as topojson from "topojson-client";
import polygonClipping from "polygon-clipping";

export interface GlobeOptions {
  dark: boolean;
  accent: string;
  visited: Set<string>;
  onSelect: (name: string) => void;
}
export interface GlobeHandle {
  destroy: () => void;
  selectByName: (name: string) => void;
  rebuild: (opts: GlobeOptions) => void;
}

export function createGlobe(node: HTMLElement, world: any, opts: GlobeOptions): GlobeHandle {
  const NS = "http://www.w3.org/2000/svg";
  let rotation: [number, number] = [-28, -22];
  let raf = 0, animSpin = 0;
  let dragging = false, hovering = false, animating = false;
  let cleanupFns: Array<() => void> = [];
  let pathByName: Record<string, { el: SVGPathElement; visited: boolean }> = {};
  let geoEls: { el: SVGPathElement; feature: any }[] = [];
  let borderEls: { el: SVGPathElement; feature: any }[] = [];
  let redraw = () => {};
  let tipEl: HTMLDivElement | null = null;
  let current = opts;

  function build(o: GlobeOptions) {
    current = o;
    const dark = o.dark;
    const accent = o.accent;
    if (raf) cancelAnimationFrame(raf);
    node.innerHTML = "";
    node.style.cursor = "grab";
    node.style.background = dark
      ? "radial-gradient(circle at 50% 42%, oklch(0.26 0.03 262), oklch(0.17 0.02 262) 72%)"
      : "radial-gradient(circle at 50% 42%, oklch(0.995 0.002 255), oklch(0.965 0.004 255) 80%)";

    const land = topojson.feature(world, world.objects.countries) as any;
    const ukFeat = land.features.find((f: any) => f.properties && f.properties.name === "Ukraine");
    if (ukFeat) {
      const crimeaPoly = [[[36.65, 45.35], [36.4, 45.0], [35.5, 44.95], [34.7, 44.45], [33.95, 44.38], [33.45, 44.6], [32.45, 45.4], [33.0, 46.1], [33.6, 46.2], [34.9, 46.05], [35.6, 45.95], [36.2, 45.45], [36.65, 45.35]]];
      try {
        let merged = polygonClipping.union(ukFeat.geometry.coordinates as any, crimeaPoly as any);
        let geom: any = { type: "MultiPolygon", coordinates: merged };
        if (d3.geoArea(geom) > 2 * Math.PI) {
          geom.coordinates = (merged as any).map((poly: any) => poly.map((ring: any) => ring.slice().reverse()));
        }
        geom.coordinates = geom.coordinates
          .map((poly: any) => [poly[0]])
          .filter((poly: any) => d3.geoArea({ type: "Polygon", coordinates: poly } as any) > 1e-7);
        ukFeat.geometry = geom;
      } catch {}
    }

    const w = node.clientWidth || 760, h = node.clientHeight || 520;
    const proj = d3.geoOrthographic().clipAngle(90).rotate(rotation).translate([w / 2, h / 2]).scale(Math.min(w, h) / 2 - 16);
    const path = d3.geoPath(proj);
    const graticule = d3.geoGraticule10();
    const sphere: any = { type: "Sphere" };

    const svg = document.createElementNS(NS, "svg");
    svg.setAttribute("width", "100%");
    svg.setAttribute("height", "100%");
    svg.setAttribute("viewBox", `0 0 ${w} ${h}`);
    svg.style.display = "block";
    svg.style.touchAction = "none";
    svg.style.shapeRendering = "geometricPrecision";
    const mk = (tag: string) => document.createElementNS(NS, tag) as any;

    const oceanFill = dark ? "oklch(0.235 0.03 255)" : "oklch(0.955 0.011 235)";
    const sph = mk("path"); sph.setAttribute("d", path(sphere) || ""); sph.style.fill = oceanFill; sph.style.stroke = dark ? "oklch(0.42 0.04 255)" : "oklch(0.87 0.012 245)"; sph.style.strokeWidth = "1"; svg.appendChild(sph);
    const gr = mk("path"); gr.setAttribute("fill", "none"); gr.style.stroke = dark ? "oklch(0.34 0.02 255)" : "oklch(0.9 0.008 245)"; gr.style.strokeWidth = "0.5"; svg.appendChild(gr);

    const landFill = dark ? "oklch(0.33 0.018 262)" : "oklch(0.9 0.008 255)";
    const base = (p: any, visited: boolean) => { p.style.fill = visited ? accent : landFill; p.style.stroke = "none"; p.style.filter = "none"; };
    const emph = (p: any, visited: boolean) => { if (visited) { p.style.filter = dark ? "drop-shadow(0 0 7px " + accent + ")" : "brightness(1.07)"; } else { p.style.fill = dark ? "oklch(0.4 0.018 262)" : "oklch(0.84 0.011 255)"; } };

    const landG = mk("g"); svg.appendChild(landG);
    pathByName = {}; geoEls = [];
    land.features.forEach((f: any) => {
      const name = f.properties && f.properties.name;
      const visited = o.visited.has(name);
      const p = mk("path");
      p.style.cursor = visited ? "pointer" : "grab";
      p.style.transition = "fill 0.18s ease, filter 0.18s ease";
      base(p, visited);
      p.addEventListener("mouseenter", () => { hovering = true; emph(p, visited); showTip(name, visited); });
      p.addEventListener("mousemove", (e: any) => moveTip(e));
      p.addEventListener("mouseleave", () => { hovering = false; base(p, visited); hideTip(); });
      if (visited) p.addEventListener("click", (e: any) => { e.stopPropagation(); o.onSelect(name); });
      pathByName[name] = { el: p, visited };
      geoEls.push({ el: p, feature: f });
      landG.appendChild(p);
    });

    const ukGeom = world.objects.countries.geometries.find((g: any) => g.properties && g.properties.name === "Ukraine");
    const borderColor = dark ? "oklch(0.52 0.025 255)" : "oklch(0.72 0.012 255)";
    const meshGeom = topojson.mesh(world, world.objects.countries, (a: any, b: any) => a !== ukGeom && b !== ukGeom);
    const meshEl = mk("path"); meshEl.setAttribute("fill", "none"); meshEl.style.stroke = borderColor; meshEl.style.strokeWidth = "0.7"; meshEl.style.strokeLinejoin = "round"; meshEl.style.strokeLinecap = "round"; meshEl.style.pointerEvents = "none"; svg.appendChild(meshEl);
    borderEls = [{ el: meshEl, feature: meshGeom }];
    if (ukFeat) { const ukLine = mk("path"); ukLine.setAttribute("fill", "none"); ukLine.style.stroke = borderColor; ukLine.style.strokeWidth = "0.7"; ukLine.style.strokeLinejoin = "round"; ukLine.style.pointerEvents = "none"; svg.appendChild(ukLine); borderEls.push({ el: ukLine, feature: ukFeat }); }

    node.appendChild(svg);

    const tip = document.createElement("div");
    tip.style.cssText = "position:absolute;pointer-events:none;opacity:0;transform:translate(-50%,-135%);font-family:var(--font-mono),monospace;font-size:11px;padding:5px 9px;border-radius:7px;background:oklch(0.21 0.02 262);color:white;white-space:nowrap;transition:opacity 0.12s ease;z-index:6;";
    node.appendChild(tip); tipEl = tip;

    redraw = () => {
      proj.rotate(rotation);
      gr.setAttribute("d", path(graticule) || "");
      for (const g of geoEls) g.el.setAttribute("d", path(g.feature) || "");
      for (const b of borderEls) b.el.setAttribute("d", path(b.feature) || "");
    };
    redraw();

    let lastX = 0, lastY = 0; const k = 0.26;
    const onDown = (e: any) => { dragging = true; node.style.cursor = "grabbing"; const pt = e.touches ? e.touches[0] : e; lastX = pt.clientX; lastY = pt.clientY; hideTip(); };
    const onMove = (e: any) => { if (!dragging) return; const pt = e.touches ? e.touches[0] : e; const dx = pt.clientX - lastX, dy = pt.clientY - lastY; lastX = pt.clientX; lastY = pt.clientY; rotation = [rotation[0] + dx * k, Math.max(-78, Math.min(78, rotation[1] - dy * k))]; redraw(); if (e.cancelable) e.preventDefault(); };
    const onUp = () => { dragging = false; node.style.cursor = "grab"; };
    svg.addEventListener("mousedown", onDown);
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    svg.addEventListener("touchstart", onDown, { passive: true });
    svg.addEventListener("touchmove", onMove, { passive: false });
    window.addEventListener("touchend", onUp);
    cleanupFns.push(() => { window.removeEventListener("mousemove", onMove); window.removeEventListener("mouseup", onUp); window.removeEventListener("touchend", onUp); });

    const spin = () => { if (!dragging && !hovering && !animating) { rotation = [rotation[0] + 0.12, rotation[1]]; redraw(); } raf = requestAnimationFrame(spin); };
    raf = requestAnimationFrame(spin);

    function showTip(name: string, visited: boolean) { if (!tipEl) return; tipEl.textContent = visited ? name + " · visited" : name; tipEl.style.opacity = "1"; }
    function moveTip(e: any) { if (!tipEl) return; const r = node.getBoundingClientRect(); tipEl.style.left = (e.clientX - r.left) + "px"; tipEl.style.top = (e.clientY - r.top) + "px"; }
    function hideTip() { if (tipEl) tipEl.style.opacity = "0"; }

    (build as any)._rotateTo = (name: string) => {
      const rec = geoEls.find((g) => g.feature.properties && g.feature.properties.name === name);
      if (!rec) return;
      const c = d3.geoCentroid(rec.feature);
      const target: [number, number] = [-c[0], -c[1]];
      const start = rotation.slice() as [number, number];
      let dl = target[0] - start[0]; dl = ((dl + 180) % 360 + 360) % 360 - 180;
      const dp = target[1] - start[1];
      const dur = 700, t0 = performance.now();
      animating = true;
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / dur);
        const e = t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
        rotation = [start[0] + dl * e, start[1] + dp * e];
        redraw();
        if (t < 1) animSpin = requestAnimationFrame(step); else animating = false;
      };
      animSpin = requestAnimationFrame(step);
    };
  }

  build(opts);

  return {
    destroy() { if (raf) cancelAnimationFrame(raf); if (animSpin) cancelAnimationFrame(animSpin); cleanupFns.forEach((f) => f()); cleanupFns = []; },
    selectByName(name: string) {
      const dark = current.dark;
      Object.values(pathByName).forEach((rec) => { if (rec.visited) { rec.el.style.fill = current.accent; rec.el.style.filter = "none"; rec.el.style.stroke = dark ? "oklch(0.2 0.02 262)" : "oklch(0.99 0.002 255)"; rec.el.style.strokeWidth = "0.6"; } });
      const sel = pathByName[name];
      if (sel) { sel.el.style.filter = dark ? "drop-shadow(0 0 8px " + current.accent + ")" : "brightness(1.1)"; sel.el.style.stroke = dark ? "white" : "oklch(0.3 0.02 262)"; sel.el.style.strokeWidth = "1.5"; }
      (build as any)._rotateTo(name);
    },
    rebuild(o: GlobeOptions) { if (raf) cancelAnimationFrame(raf); if (animSpin) cancelAnimationFrame(animSpin); cleanupFns.forEach((f) => f()); cleanupFns = []; build(o); },
  };
}

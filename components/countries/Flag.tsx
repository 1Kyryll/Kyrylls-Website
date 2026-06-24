// Flag emoji (regional-indicator pairs) don't render on Windows and some
// browsers, so flags are drawn as images keyed by the ISO country code.
// Source: flagcdn.com — a fixed 160px-wide asset (valid for every flag,
// ~1KB each) downscaled via CSS height; width is intrinsic so each flag
// keeps its true aspect ratio.
export default function Flag({ code, height = 20, className = "" }: { code: string; height?: number; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`https://flagcdn.com/w160/${code.toLowerCase()}.png`}
      alt={`${code} flag`}
      loading="lazy"
      className={`inline-block shrink-0 rounded-xs object-contain align-middle ${className}`}
      style={{ height, width: "auto" }}
    />
  );
}

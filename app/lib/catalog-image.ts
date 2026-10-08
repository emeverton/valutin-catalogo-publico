export function catalogImageClass(src: string, extra = "") {
  // Preserve the source photo's colors; no blend/filter effect is applied.
  return ["object-contain", extra].filter(Boolean).join(" ");
}

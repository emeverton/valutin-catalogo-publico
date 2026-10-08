import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { describe, it } from "node:test";

const ROOT = new URL("..", import.meta.url).pathname;

function rg(pattern, fixed = false) {
  const result = spawnSync("rg", ["-n", ...(fixed ? ["--fixed-strings"] : []), "--glob", "!node_modules/**", "--glob", "!.next/**", "--glob", "!pnpm-lock.yaml", "--glob", "!tests/**", "--", pattern, "."], { cwd: ROOT, encoding: "utf8" });
  if (result.error || ![0, 1].includes(result.status)) throw new Error(result.stderr || "rg failed");
  return result.stdout;
}

describe("TEST 11 — nenhum href público wa.me", () => {
  it("frontend não contém wa.me / api.whatsapp / web.whatsapp", () => {
    const hits = rg("wa\\.me|api\\.whatsapp\\.com|web\\.whatsapp\\.com");
    const publicHits = hits.split("\n").filter((line) => {
      if (!line) return false;
      if (line.includes("handler.ts")) return false;
      if (line.includes("no-public-wame")) return false;
      return true;
    });
    assert.equal(publicHits.join("\n"), "", publicHits.join("\n"));
  });
});

describe("TEST 12 — nenhum href público /wa", () => {
  it("componentes e pages não apontam CTA para /wa", () => {
    const hits = [
      ...rg('href="/wa', true).split("\n"),
      ...rg("href={'/wa", true).split("\n"),
      ...rg("href={\`/wa", true).split("\n"),
      ...rg("/wa\\?src=").split("\n"),
    ].filter((line) => {
      if (!line) return false;
      if (line.includes("handler.ts")) return false;
      if (line.includes("retail-gate.ts")) return false;
      if (line.includes("QualificationModal.tsx")) return false;
      if (line.includes("tests/")) return false;
      return true;
    });
    assert.equal(hits.join("\n"), "", hits.join("\n"));
  });
});

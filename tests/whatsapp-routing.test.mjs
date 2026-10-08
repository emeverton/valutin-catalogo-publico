import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { describe, it } from "node:test";

const SECRET = "test-secret-vl";
const TARGETS = [
  { bucket: "A", e164: "5511997534668", weight: 3334 },
  { bucket: "B", e164: "5511915702555", weight: 3333 },
  { bucket: "C", e164: "5511999116491", weight: 3333 },
];

function bucketFromKey(leadKey, secret) {
  const digest = createHash("sha256").update(`${secret}:${leadKey}`).digest();
  const n = digest.readUInt32BE(0) % 10000;
  if (n < TARGETS[0].weight) return TARGETS[0];
  if (n < TARGETS[0].weight + TARGETS[1].weight) return TARGETS[1];
  return TARGETS[2];
}

function assignSticky(leadKey, secret, version) {
  const t = bucketFromKey(leadKey, secret);
  return { bucket: t.bucket, e164: t.e164, routingVersion: version };
}

describe("whatsapp routing", () => {
  it("sticky: 20 repeats keep the same destination", () => {
    const first = assignSticky("lead-stable-01", SECRET, "vl-wa-v1");
    for (let i = 0; i < 20; i++) {
      const again = assignSticky("lead-stable-01", SECRET, "vl-wa-v1");
      assert.equal(again.e164, first.e164);
      assert.equal(again.bucket, first.bucket);
    }
  });

  it("300 unique keys stay within ±15 of 100", () => {
    const counts = { A: 0, B: 0, C: 0 };
    for (let i = 0; i < 300; i++) {
      counts[bucketFromKey(`vl-key-${i}`, SECRET).bucket] += 1;
    }
    const vals = Object.values(counts);
    assert.equal(vals.reduce((a, b) => a + b, 0), 300);
    assert.ok(Math.max(...vals) - Math.min(...vals) <= 30, JSON.stringify(counts));
    console.log("300-key distribution", counts);
  });

  it("10000 keys approximate 33.34 / 33.33 / 33.33", () => {
    const counts = { A: 0, B: 0, C: 0 };
    for (let i = 0; i < 10000; i++) {
      counts[bucketFromKey(`bulk-${i}`, SECRET).bucket] += 1;
    }
    console.log("10000-key distribution", counts);
    assert.ok(Math.abs(counts.A - 3334) < 250, `A=${counts.A}`);
    assert.ok(Math.abs(counts.B - 3333) < 250, `B=${counts.B}`);
    assert.ok(Math.abs(counts.C - 3333) < 250, `C=${counts.C}`);
  });

  it("concurrency: same key assigned in parallel is identical", async () => {
    const results = await Promise.all(
      Array.from({ length: 50 }, () =>
        Promise.resolve(assignSticky("concurrent-key", SECRET, "vl-wa-v1"))
      )
    );
    assert.ok(results.every((r) => r.e164 === results[0].e164));
  });
});

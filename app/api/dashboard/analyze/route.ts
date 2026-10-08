import { NextRequest, NextResponse } from "next/server";
import { aggregateDashboard } from "@/app/lib/dashboard/aggregate";
import {
  buildRulesAnalysis,
  maybeEnhanceWithOpenAI,
} from "@/app/lib/dashboard/ai-analysis";
import {
  isValidIsoDate,
  parsePeriodKey,
  previousRange,
  resolveCustomRange,
  resolvePeriod,
} from "@/app/lib/dashboard/periods";
import type { DateRange, StudioPlatform } from "@/app/lib/dashboard/types";

export const dynamic = "force-dynamic";

function resolveRange(body: {
  period?: string;
  since?: string;
  until?: string;
}): DateRange {
  if (isValidIsoDate(body.since) && isValidIsoDate(body.until)) {
    return resolveCustomRange(body.since!, body.until!);
  }
  const key = parsePeriodKey(body.period || "mtd");
  return resolvePeriod(key === "custom" ? "mtd" : key);
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as {
      period?: string;
      since?: string;
      until?: string;
      compare?: "off" | "previous" | "custom";
      compareSince?: string;
      compareUntil?: string;
      platforms?: StudioPlatform[];
    };

    const platforms: StudioPlatform[] =
      body.platforms?.length
        ? body.platforms
        : ["meta", "google", "ga4", "kommo", "instagram"];

    const currentRange = resolveRange(body);
    const current = await aggregateDashboard(currentRange);

    let compare = null;
    if (body.compare && body.compare !== "off") {
      const compareRange =
        body.compare === "custom" &&
        isValidIsoDate(body.compareSince) &&
        isValidIsoDate(body.compareUntil)
          ? resolveCustomRange(body.compareSince!, body.compareUntil!)
          : previousRange(currentRange);
      compare = await aggregateDashboard(compareRange);
    }

    let analysis = buildRulesAnalysis(current, compare, platforms);
    analysis = await maybeEnhanceWithOpenAI(analysis, current);

    return NextResponse.json({
      analysis,
      currentPeriod: current.period,
      comparePeriod: compare?.period || null,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "analyze failed" },
      { status: 500 }
    );
  }
}

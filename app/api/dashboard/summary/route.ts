import { NextRequest, NextResponse } from "next/server";
import { unstable_cache } from "next/cache";
import { aggregateDashboard } from "@/app/lib/dashboard/aggregate";
import {
  isValidIsoDate,
  parsePeriodKey,
  previousRange,
  resolveCustomRange,
  resolvePeriod,
} from "@/app/lib/dashboard/periods";
import type { DateRange, DashboardCompareResponse } from "@/app/lib/dashboard/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;

const aggregateCached = unstable_cache(
  async (period: DateRange) => aggregateDashboard(period),
  ["valutin-dashboard-summary-v2"],
  { revalidate: 300 }
);

function resolveFromParams(params: URLSearchParams, prefix = ""): DateRange {
  const sinceKey = prefix ? `${prefix}Since` : "since";
  const untilKey = prefix ? `${prefix}Until` : "until";
  const periodKeyName = prefix ? `${prefix}Period` : "period";

  const since = params.get(sinceKey);
  const until = params.get(untilKey);
  if (isValidIsoDate(since) && isValidIsoDate(until)) {
    return resolveCustomRange(since!, until!);
  }

  const periodKey = parsePeriodKey(params.get(periodKeyName));
  if (periodKey === "custom") {
    return resolvePeriod("mtd");
  }
  return resolvePeriod(periodKey);
}

export async function GET(req: NextRequest) {
  const params = req.nextUrl.searchParams;
  const forceFresh = params.get("fresh") === "1";
  const compareMode = params.get("compare"); // "1" | "previous" | null

  try {
    const currentRange = resolveFromParams(params);
    const getSummary = forceFresh ? aggregateDashboard : aggregateCached;
    const current = await getSummary(currentRange);

    let compare = null;
    if (compareMode === "1" || compareMode === "previous") {
      const compareSince = params.get("compareSince");
      const compareUntil = params.get("compareUntil");
      const compareRange =
        isValidIsoDate(compareSince) && isValidIsoDate(compareUntil)
          ? resolveCustomRange(compareSince!, compareUntil!)
          : previousRange(currentRange);
      compare = await getSummary(compareRange);
    }

    const body: DashboardCompareResponse = { current, compare };
    const res = NextResponse.json(body);
    if (!forceFresh) {
      res.headers.set(
        "Cache-Control",
        "private, max-age=60, stale-while-revalidate=240"
      );
    } else {
      res.headers.set("Cache-Control", "no-store");
    }
    return res;
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "aggregate failed" },
      { status: 500 }
    );
  }
}

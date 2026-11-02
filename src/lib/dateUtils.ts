import { connection } from "next/server";

/**
 * Utility to calculate ISO timestamp thresholds for Supabase .gte('created_at', ...) queries.
 * Awaits connection() from next/server to safely opt into dynamic execution before reading the current time,
 * preventing Next.js 15/16 blocking-prerender-current-time errors during partial prerendering.
 */
export async function getDateFilterTimestamp(dateRange?: string | null): Promise<string | null> {
  if (!dateRange || dateRange.toLowerCase() === "all" || dateRange.toLowerCase() === "all_time") {
    return null;
  }

  // Await dynamic connection to prevent Next.js prerender current time blocking error
  await connection();

  const now = new Date();

  switch (dateRange.toLowerCase()) {
    case "today": {
      // Midnight at the beginning of today (00:00:00.000)
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
      return startOfToday.toISOString();
    }
    case "this_week": {
      // Midnight on Monday of the current calendar week (00:00:00.000)
      const day = now.getDay();
      const diffToMonday = day === 0 ? 6 : day - 1;
      const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday, 0, 0, 0, 0);
      return startOfWeek.toISOString();
    }
    case "last_7_days": {
      // Midnight 7 days prior to today (full 7 calendar days)
      const past7Days = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7, 0, 0, 0, 0);
      return past7Days.toISOString();
    }
    case "this_month": {
      // 1st of the current month at midnight (00:00:00.000)
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1, 0, 0, 0, 0);
      return startOfMonth.toISOString();
    }
    case "last_month": {
      // 1st of the previous calendar month at midnight (00:00:00.000)
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1, 0, 0, 0, 0);
      return startOfLastMonth.toISOString();
    }
    case "this_year": {
      // January 1st of the current year at midnight (00:00:00.000)
      const startOfYear = new Date(now.getFullYear(), 0, 1, 0, 0, 0, 0);
      return startOfYear.toISOString();
    }
    default:
      return null;
  }
}

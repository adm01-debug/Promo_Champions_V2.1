/**
 * Product Analytics — lightweight client-side tracker.
 * Tracks page views, time-on-page, and interaction counts.
 * Batches writes to reduce DB calls.
 */
import { supabase } from "@/integrations/supabase/client";

// Generate a stable session id per browser tab
const SESSION_ID = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

interface PageSession {
  id?: string;
  route: string;
  pageTitle: string;
  enteredAt: number;
  interactions: number;
  referrerRoute: string | null;
  flushed: boolean;
}

let currentPage: PageSession | null = null;
let salespersonId: string | null = null;

export function setAnalyticsSalesperson(id: string | null) {
  salespersonId = id;
}

function getDeviceType(): string {
  return window.innerWidth < 768 ? "mobile" : "desktop";
}

/**
 * Called on route change — flush previous page and start tracking new one.
 */
export async function trackPageEnter(route: string, pageTitle: string, referrer: string | null) {
  // Flush the previous page first
  await flushCurrentPage();

  currentPage = {
    route,
    pageTitle,
    enteredAt: Date.now(),
    interactions: 0,
    referrerRoute: referrer,
    flushed: false,
  };

  if (!salespersonId) return;

  try {
    const { data } = await supabase
      .from("page_analytics")
      .insert({
        salesperson_id: salespersonId,
        route,
        page_title: pageTitle,
        session_id: SESSION_ID,
        device_type: getDeviceType(),
        referrer_route: referrer,
        entered_at: new Date().toISOString(),
      })
      .select("id")
      .single();

    if (data && currentPage) {
      currentPage.id = data.id;
    }
  } catch {
    // Silent fail — analytics should never break the app
  }
}

/**
 * Record an interaction (click, form submit, etc.)
 */
export function trackInteraction() {
  if (currentPage) {
    currentPage.interactions += 1;
  }
}

/**
 * Flush duration + interactions for the current page to the DB.
 */
export async function flushCurrentPage() {
  if (!currentPage || currentPage.flushed || !currentPage.id || !salespersonId) {
    currentPage = null;
    return;
  }

  const durationSeconds = Math.round((Date.now() - currentPage.enteredAt) / 1000);
  const pageId = currentPage.id;
  const interactions = currentPage.interactions;

  currentPage.flushed = true;
  currentPage = null;

  try {
    await supabase
      .from("page_analytics")
      .update({
        duration_seconds: durationSeconds,
        interactions,
        exited_at: new Date().toISOString(),
      })
      .eq("id", pageId);
  } catch {
    // Silent fail
  }
}

// Flush on tab close / navigate away
if (typeof window !== "undefined") {
  window.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      flushCurrentPage();
    }
  });

  window.addEventListener("beforeunload", () => {
    flushCurrentPage();
  });
}

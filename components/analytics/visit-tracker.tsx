"use client";

import * as React from "react";
import { usePathname } from "next/navigation";

function VisitTracker() {
  const pathname = usePathname();
  const activeVisitId = React.useRef<string | null>(null);
  const startedAt = React.useRef<number>(0);
  const lastTrackedPath = React.useRef<string | null>(null);

  const sendDuration = React.useCallback((id: string) => {
    const seconds = Math.round((Date.now() - startedAt.current) / 1000);
    if (seconds < 1) return;
    const payload = JSON.stringify({ id, seconds });
    if (navigator.sendBeacon) {
      navigator.sendBeacon(
        "/api/track/visit/duration",
        new Blob([payload], { type: "application/json" })
      );
    } else {
      fetch("/api/track/visit/duration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        keepalive: true,
      }).catch(() => {});
    }
    activeVisitId.current = null;
  }, []);

  const startVisit = React.useCallback(() => {
    const params = new URLSearchParams(window.location.search);
    fetch("/api/track/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        path: window.location.pathname,
        referrer: document.referrer || null,
        utmSource: params.get("utm_source"),
        utmMedium: params.get("utm_medium"),
        utmCampaign: params.get("utm_campaign"),
        utmTerm: params.get("utm_term"),
        utmContent: params.get("utm_content"),
      }),
    })
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { id?: string } | null) => {
        if (data?.id) {
          activeVisitId.current = data.id;
          startedAt.current = Date.now();
        }
      })
      .catch(() => {});
  }, []);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    if (lastTrackedPath.current === pathname) return;
    lastTrackedPath.current = pathname;

    if (activeVisitId.current) sendDuration(activeVisitId.current);
    startVisit();
  }, [pathname, sendDuration, startVisit]);

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    const onHide = () => {
      if (activeVisitId.current) sendDuration(activeVisitId.current);
    };
    window.addEventListener("pagehide", onHide);
    return () => window.removeEventListener("pagehide", onHide);
  }, [sendDuration]);

  return null;
}

export { VisitTracker };

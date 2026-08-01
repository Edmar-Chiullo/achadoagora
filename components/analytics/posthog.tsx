"use client";

import * as React from "react";
import posthog from "posthog-js";

function PostHog() {
  React.useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const host = process.env.NEXT_PUBLIC_POSTHOG_HOST;
    if (!key || !host || typeof window === "undefined") return;
    posthog.init(key, { api_host: host, capture_pageview: true, capture_pageleave: true });
  }, []);

  return null;
}

export { PostHog };

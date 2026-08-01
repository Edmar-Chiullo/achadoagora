"use client";

import * as React from "react";

const UTM_COOKIE = "utm_source";

function readCookie(name: string) {
  return document.cookie
    .split("; ")
    .find((row) => row.startsWith(`${name}=`))
    ?.split("=")[1];
}

function UtmCapture() {
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const source = params.get("utm_source");
    if (source && readCookie(UTM_COOKIE) !== source) {
      document.cookie = `${UTM_COOKIE}=${encodeURIComponent(
        source
      )}; path=/; max-age=2592000; samesite=lax`;
    }
  }, []);

  return null;
}

export { UtmCapture };

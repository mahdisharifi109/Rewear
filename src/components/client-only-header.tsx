"use client";

import dynamic from "next/dynamic";

// Client-only wrapper to render Header only on the client
const DynamicHeader = dynamic(() => import("./header"), { ssr: false });

export function ClientOnlyHeader() {
  return <DynamicHeader />;
}

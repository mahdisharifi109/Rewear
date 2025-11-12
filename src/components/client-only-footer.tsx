"use client";

import dynamic from "next/dynamic";

// Client-only wrapper to allow ssr:false for Footer
const DynamicFooter = dynamic(() => import("./footer").then(m => m.Footer), { ssr: false });

export function ClientOnlyFooter() {
  return <DynamicFooter />;
}

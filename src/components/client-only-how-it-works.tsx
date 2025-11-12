"use client";

import dynamic from "next/dynamic";

// Client-only wrapper to allow ssr:false for HowItWorks
const DynamicHowItWorks = dynamic(
  () => import("@/components/how-it-works").then(m => m.HowItWorks),
  { ssr: false }
);

export function ClientOnlyHowItWorks() {
  return <DynamicHowItWorks />;
}

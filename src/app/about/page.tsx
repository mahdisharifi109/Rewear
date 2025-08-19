import { Suspense } from "react";
import AboutContent from "./AboutContent";

export default function AboutPage() {
  return (
    <Suspense fallback={<div>A carregar...</div>}>
      <AboutContent />
    </Suspense>
  );
}

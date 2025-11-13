"use client";

import { useEffect, useRef, useState } from "react";
import { Skeleton } from "./ui/skeleton";

export default function PromotionalVideo() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsIntersecting(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div className="relative max-w-4xl mx-auto">
      {!isLoaded && (
        <Skeleton className="absolute inset-0 h-[400px] w-full rounded-xl" />
      )}
      <video
        ref={videoRef}
        className="rounded-xl shadow-2xl border border-border/50"
        src={isIntersecting ? "https://storage.googleapis.com/gemini-generative-ai-public-supported-storage/assets/promotional_video_secondwave.mp4" : undefined}
        width="100%"
        height="auto"
        controls
        loop
        muted
        playsInline
        preload="none"
        onLoadedData={() => setIsLoaded(true)}
        style={{ opacity: isLoaded ? 1 : 0, transition: "opacity 0.3s" }}
      >
        Seu navegador não suporta a tag de vídeo.
      </video>
    </div>
  );
}

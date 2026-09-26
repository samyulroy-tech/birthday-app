"use client";

import { FxProvider } from "@/lib/FxProvider";
import { Experience } from "@/components/Experience";

export default function Home() {
  return (
    <FxProvider>
      <Experience />
    </FxProvider>
  );
}
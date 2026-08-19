"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/primitives";
import type { MapPin } from "./leaflet-map";

const Leaflet = dynamic(() => import("./leaflet-map"), { ssr: false, loading: () => <Skeleton className="h-[420px] w-full rounded-3xl" /> });

export function Map(props: { pins: MapPin[]; className?: string; zoom?: number; center?: [number, number] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border shadow-sm [&_.leaflet-container]:z-0">
      <Leaflet {...props} />
    </div>
  );
}
export type { MapPin };

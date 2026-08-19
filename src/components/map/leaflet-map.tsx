"use client";

import * as React from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface MapPin {
  id: string;
  lat: number;
  lng: number;
  title: string;
  subtitle?: string;
  href?: string;
  accent?: boolean;
}

const pinIcon = (accent?: boolean) =>
  L.divIcon({
    className: "",
    html: `<div style="width:34px;height:34px;transform:translate(-50%,-100%)">
      <svg viewBox="0 0 24 24" width="34" height="34" style="filter:drop-shadow(0 4px 6px rgb(14 42 92 / .35))">
        <path d="M12 2a7 7 0 0 0-7 7c0 5.25 7 13 7 13s7-7.75 7-13a7 7 0 0 0-7-7z" fill="${accent ? "#19aee5" : "#1a4fb0"}"/>
        <circle cx="12" cy="9" r="2.6" fill="white"/>
      </svg></div>`,
    iconSize: [34, 34],
    iconAnchor: [0, 0],
    popupAnchor: [0, -34],
  });

function FitBounds({ pins }: { pins: MapPin[] }) {
  const map = useMap();
  React.useEffect(() => {
    if (!pins.length) return;
    if (pins.length === 1) {
      map.setView([pins[0].lat, pins[0].lng], 13);
      return;
    }
    map.fitBounds(L.latLngBounds(pins.map((p) => [p.lat, p.lng] as [number, number])), { padding: [40, 40] });
  }, [pins, map]);
  return null;
}

export default function LeafletMap({ pins, className, zoom = 11, center }: { pins: MapPin[]; className?: string; zoom?: number; center?: [number, number] }) {
  const c = center ?? (pins[0] ? [pins[0].lat, pins[0].lng] : [41.04, 29.0]);
  return (
    <MapContainer center={c} zoom={zoom} scrollWheelZoom={false} className={className ?? "h-[420px] w-full"} attributionControl>
      <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png" />
      <FitBounds pins={pins} />
      {pins.map((p) => (
        <Marker key={p.id} position={[p.lat, p.lng]} icon={pinIcon(p.accent)}>
          <Popup>
            <div style={{ minWidth: 160 }}>
              <strong style={{ display: "block", fontSize: 13 }}>{p.title}</strong>
              {p.subtitle && <span style={{ fontSize: 12, color: "#5b6b85" }}>{p.subtitle}</span>}
              {p.href && (
                <a href={p.href} style={{ display: "block", marginTop: 6, fontSize: 12, fontWeight: 600, color: "#1a4fb0" }}>
                  →
                </a>
              )}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}

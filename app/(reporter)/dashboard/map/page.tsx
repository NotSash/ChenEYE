"use client";

import React, { useEffect, useState, useRef } from "react";
import { useSession } from "@/components/providers/SessionProvider";
import { createClient } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { MapPin, Layers } from "lucide-react";

interface ReportMarker {
  id: string;
  report_id: string;
  violation_type: string;
  location_text: string;
  location_lat: number;
  location_lng: number;
  date: string;
  status: string;
}

const CHENNAI_CENTER = { lat: 13.0827, lng: 80.2707 };

export default function ViolationMapPage() {
  const { profile, loading: sessionLoading } = useSession();
  const [reports, setReports] = useState<ReportMarker[]>([]);
  const [loading, setLoading] = useState(true);
  const [mapLoaded, setMapLoaded] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);

  // Fetch reports with coordinates
  useEffect(() => {
    if (!profile) return;
    const fetchReports = async () => {
      setLoading(true);
      const supabase = createClient();
      const { data } = await supabase
        .from("reports")
        .select("id, report_id, violation_type, location_text, location_lat, location_lng, date, status")
        .eq("reporter_anonymous_id", profile.anonymous_id)
        .not("location_lat", "is", null)
        .not("location_lng", "is", null) as { data: ReportMarker[] | null };
      if (data) setReports(data);
      setLoading(false);
    };
    fetchReports();
  }, [profile]);

  // Load Leaflet dynamically (only on client)
  useEffect(() => {
    if (typeof window === "undefined" || mapLoaded) return;

    // Add Leaflet CSS
    if (!document.querySelector('link[href*="leaflet"]')) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // Add Leaflet JS
    if (!(window as any).L) {
      const script = document.createElement("script");
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.onload = () => {
        setMapLoaded(true);
      };
      document.head.appendChild(script);
    } else {
      setMapLoaded(true);
    }
  }, []);

  // Initialize map
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || mapInstanceRef.current) return;
    const L = (window as any).L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      center: [CHENNAI_CENTER.lat, CHENNAI_CENTER.lng],
      zoom: 12,
      zoomControl: false,
    });

    // Warm-toned tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
    }).addTo(map);

    // Move zoom control to bottom-right
    L.control.zoom({ position: "bottomright" }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [mapLoaded]);

  // Add markers when reports update
  useEffect(() => {
    if (!mapInstanceRef.current || !mapLoaded) return;
    const L = (window as any).L;
    const map = mapInstanceRef.current;

    // Clear existing markers
    map.eachLayer((layer: any) => {
      if (layer instanceof L.Marker) {
        map.removeLayer(layer);
      }
    });

    const statusEmoji: Record<string, string> = {
      submitted: "📋",
      under_review: "🔍",
      approved: "✅",
      rejected: "❌",
      action_taken: "🛡️",
    };

    reports.forEach((report) => {
      const emoji = statusEmoji[report.status] || "📍";
      const icon = L.divIcon({
        html: `<div style="font-size:24px;text-align:center;filter:drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${emoji}</div>`,
        className: "",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
      });

      L.marker([report.location_lat, report.location_lng], { icon })
        .addTo(map)
        .bindPopup(`
          <div style="min-width:180px;font-family:system-ui;">
            <strong style="font-size:14px;">${report.violation_type}</strong><br/>
            <span style="font-size:12px;color:#666;">📍 ${report.location_text}</span><br/>
            <span style="font-size:12px;color:#666;">📅 ${new Date(report.date).toLocaleDateString("en-IN")}</span><br/>
            <span style="font-size:11px;color:#888;">${report.report_id}</span>
          </div>
        `);
    });

    // Fit bounds if there are markers
    if (reports.length > 0) {
      const bounds = L.latLngBounds(reports.map((r) => [r.location_lat, r.location_lng]));
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 15 });
    }
  }, [reports, mapLoaded]);

  if (sessionLoading) {
    return (
      <div className="h-[calc(100vh-120px)] rounded-2xl bg-[var(--bg-tertiary)] animate-pulse" />
    );
  }

  return (
    <div className="space-y-4 pb-24 md:pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Violation Map</h1>
          <p className="text-sm text-[var(--text-secondary)] mt-1">
            {reports.length} report{reports.length !== 1 ? "s" : ""} plotted on map
          </p>
        </div>
        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--bg-tertiary)] text-xs text-[var(--text-tertiary)]">
          <Layers size={14} /> Chennai
        </div>
      </div>

      {/* Map Container */}
      <div className="relative rounded-2xl overflow-hidden border border-[var(--border-primary)]" style={{ height: "calc(100vh - 240px)", minHeight: "400px" }}>
        <div ref={mapRef} className="w-full h-full" />

        {/* Loading overlay */}
        {(loading || !mapLoaded) && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--bg-primary)]/80 backdrop-blur-sm">
            <div className="text-center">
              <MapPin size={32} className="mx-auto text-[var(--brand-primary)] animate-bounce" />
              <p className="text-sm text-[var(--text-secondary)] mt-2">Loading map...</p>
            </div>
          </div>
        )}

        {/* No reports overlay */}
        {!loading && mapLoaded && reports.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <Card variant="glass" padding="md">
              <div className="text-center">
                <MapPin size={28} className="mx-auto text-[var(--text-tertiary)] mb-2" />
                <p className="text-sm font-medium text-[var(--text-primary)]">No Reports on Map</p>
                <p className="text-xs text-[var(--text-tertiary)] mt-1">
                  Reports with location data will appear here
                </p>
              </div>
            </Card>
          </div>
        )}
      </div>

      {/* Legend */}
      <Card variant="outlined" padding="sm">
        <div className="flex flex-wrap items-center gap-4 text-xs text-[var(--text-secondary)]">
          <span className="font-medium text-[var(--text-primary)]">Legend:</span>
          <span>📋 Submitted</span>
          <span>🔍 Under Review</span>
          <span>✅ Approved</span>
          <span>❌ Rejected</span>
          <span>🛡️ Action Taken</span>
        </div>
      </Card>
    </div>
  );
}

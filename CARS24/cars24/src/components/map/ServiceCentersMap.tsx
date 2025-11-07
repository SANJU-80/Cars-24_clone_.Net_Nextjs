"use client";

import { useEffect, useRef, useState } from "react";

import { loadGoogleMaps } from "@/lib/location";
import type { ServiceCenterWithDistance } from "@/data/serviceCenters";

interface LatLngLiteral {
  lat: number;
  lng: number;
}

interface ServiceCentersMapProps {
  serviceCenters: ServiceCenterWithDistance[];
  center?: LatLngLiteral | null;
  className?: string;
  zoom?: number;
  fallbackCenter?: LatLngLiteral;
}

const ServiceCentersMap = ({
  serviceCenters,
  center,
  className,
  zoom = 12,
  fallbackCenter,
}: ServiceCentersMapProps) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

  useEffect(() => {
    let isCancelled = false;

    const renderMap = async () => {
      setIsLoading(true);
      setLoadError(null);

      try {
        const maps = await loadGoogleMaps();
        if (!maps) {
          setLoadError("Google Maps is not configured.");
          return;
        }

        if (isCancelled || !containerRef.current) {
          return;
        }

        if (!mapRef.current) {
          mapRef.current = new maps.maps.Map(containerRef.current, {
            center: center ?? fallbackCenter ?? { lat: 20.5937, lng: 78.9629 },
            zoom,
            mapTypeControl: false,
            streetViewControl: false,
            fullscreenControl: false,
            clickableIcons: true,
          });
        }

        if (!infoWindowRef.current) {
          infoWindowRef.current = new maps.maps.InfoWindow();
        }

        // Clear existing markers
        markersRef.current.forEach((marker) => marker.setMap(null));
        markersRef.current = [];

        if (!mapRef.current) {
          return;
        }

        const bounds = new maps.maps.LatLngBounds();
        let boundsExtended = false;

        serviceCenters.forEach((serviceCenter) => {
          const position = { lat: serviceCenter.lat, lng: serviceCenter.lng };
          const marker = new maps.maps.Marker({
            position,
            map: mapRef.current!,
            title: serviceCenter.name,
            icon: {
              path: maps.maps.SymbolPath.CIRCLE,
              scale: serviceCenter.type === "service" ? 8 : 6,
              strokeColor: serviceCenter.type === "service" ? "#1d4ed8" : "#f97316",
              strokeWeight: 2,
              fillColor: serviceCenter.type === "service" ? "#60a5fa" : "#fb923c",
              fillOpacity: 0.9,
            },
          });

          marker.addListener("click", () => {
            const infoWindow = infoWindowRef.current;
            if (!infoWindow) return;

            infoWindow.setContent(
              `<div style="max-width:220px;font-family:Inter,system-ui,sans-serif;">
                <strong style="display:block;margin-bottom:4px;color:#111827;">${serviceCenter.name}</strong>
                <span style="display:block;font-size:12px;color:#4b5563;margin-bottom:4px;">${serviceCenter.address}</span>
                ${serviceCenter.phone ? `<span style="display:block;font-size:12px;color:#4b5563;">${serviceCenter.phone}</span>` : ""}
                ${serviceCenter.hours ? `<span style=\"display:block;font-size:11px;color:#6b7280;margin-top:4px;\">Hours: ${serviceCenter.hours}</span>` : ""}
              </div>`
            );
            infoWindow.open({
              anchor: marker,
              map: mapRef.current!,
              shouldFocus: false,
            });
          });

          markersRef.current.push(marker);
          bounds.extend(position);
          boundsExtended = true;
        });

        if (center && !boundsExtended) {
          mapRef.current.setCenter(center);
          mapRef.current.setZoom(zoom);
        } else if (boundsExtended) {
          mapRef.current.fitBounds(bounds, serviceCenters.length === 1 ? undefined : 72);
          if (serviceCenters.length === 1) {
            mapRef.current.setZoom(zoom);
          }
        } else if (fallbackCenter) {
          mapRef.current.setCenter(fallbackCenter);
          mapRef.current.setZoom(zoom);
        }
      } catch (error) {
        console.error("Failed to render Google Map", error);
        setLoadError("Map could not be loaded. Check the browser console for details.");
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    renderMap();

    return () => {
      isCancelled = true;
    };
  }, [serviceCenters, center, zoom, fallbackCenter]);

  return (
    <div className={`relative w-full overflow-hidden rounded-lg bg-gray-100 ${className ?? ""}`}>
      <div ref={containerRef} className="h-full min-h-[260px] w-full" />
      {isLoading && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/70 text-sm text-gray-600">
          Loading map...
        </div>
      )}
      {loadError && (
        <div className="absolute inset-x-0 bottom-0 m-3 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-700 shadow-sm">
          {loadError}
        </div>
      )}
      {!isLoading && serviceCenters.length === 0 && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center text-sm text-gray-500">
          No nearby service locations to display.
        </div>
      )}
    </div>
  );
};

export default ServiceCentersMap;



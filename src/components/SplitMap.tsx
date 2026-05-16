import L from "leaflet";
import { useEffect, useMemo, useRef } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { DisplayRecommendation } from "../types/planner";
import { categoryMeta } from "../types/recommendation";
import { formatDuration, formatPriceRange } from "../utils/filterRecommendations";
import { createRoadmapIcon, splitCenter } from "../utils/mapHelpers";

interface SplitMapProps {
  items: DisplayRecommendation[];
  selectedIds: Set<string>;
  activeId: string | null;
  onMarkerFocus: (id: string) => void;
}

const MarkerLayer = ({
  items,
  selectedIds,
  activeId,
  onMarkerFocus,
}: SplitMapProps) => {
  const map = useMap();
  const markerRefs = useRef<Record<string, L.Marker>>({});

  useEffect(() => {
    if (!activeId) return;
    const active = items.find((item) => item.recommendation.id === activeId);
    const marker = markerRefs.current[activeId];
    if (!active || !marker) return;

    let centered = false;
    const centerActivePopup = () => {
      if (centered) return;
      centered = true;
      marker.openPopup();

      window.setTimeout(() => {
        const popup = marker.getPopup()?.getElement();
        const mapContainer = map.getContainer();
        if (!popup || !mapContainer) return;

        const popupRect = popup.getBoundingClientRect();
        const mapRect = mapContainer.getBoundingClientRect();
        const deltaX =
          popupRect.left + popupRect.width / 2 - (mapRect.left + mapRect.width / 2);
        const deltaY =
          popupRect.top + popupRect.height / 2 - (mapRect.top + mapRect.height / 2);

        map.panBy([deltaX, deltaY], { animate: false });
      }, 120);
    };

    map.once("moveend", centerActivePopup);
    map.flyTo([active.recommendation.lat, active.recommendation.lng], 14, {
      duration: 0.55,
    });
    const fallbackTimer = window.setTimeout(centerActivePopup, 750);

    return () => {
      map.off("moveend", centerActivePopup);
      window.clearTimeout(fallbackTimer);
    };
  }, [activeId, items, map]);

  const routePositions = items.map((item) => [
    item.recommendation.lat,
    item.recommendation.lng,
  ]) as [number, number][];

  return (
    <>
      {routePositions.length > 1 && (
        <Polyline
          positions={routePositions}
          pathOptions={{
            color: "#2F8FA3",
            opacity: 0.72,
            weight: 4,
            dashArray: "8 10",
          }}
        />
      )}

      {items.map((item, index) => {
        const recommendation = item.recommendation;
        const isSelected = selectedIds.has(recommendation.id);
        const isActive = activeId === recommendation.id;
        const meta = categoryMeta[recommendation.category];

        return (
          <Marker
            key={recommendation.id}
            position={[recommendation.lat, recommendation.lng]}
            icon={createRoadmapIcon(index + 1, isActive, isSelected)}
            ref={(marker) => {
              if (marker) markerRefs.current[recommendation.id] = marker;
            }}
            eventHandlers={{
              click: () => onMarkerFocus(recommendation.id),
              mouseover: () => onMarkerFocus(recommendation.id),
            }}
          >
            <Popup autoPan={false}>
              <div className="max-h-80 w-64 overflow-y-auto pr-1">
                <div className="mb-2 flex items-center gap-2">
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-full text-base"
                    style={{ backgroundColor: meta.marker, color: "#F6F2EA" }}
                    aria-hidden="true"
                  >
                    {meta.emoji}
                  </span>
                  <div>
                    <p className="font-heading text-base font-extrabold text-navy-900">
                      {recommendation.title}
                    </p>
                    <p className="text-xs font-bold text-sea-700">{meta.label}</p>
                  </div>
                </div>
                <p className="text-sm leading-5 text-navy-700">
                  {recommendation.description}
                </p>
                <div className="mt-3 grid gap-1 text-xs font-bold text-navy-700">
                  <span>{formatDuration(recommendation.durationMinutes)}</span>
                  <span>
                    {formatPriceRange(
                      recommendation.priceMin,
                      recommendation.priceMax,
                    )}
                  </span>
                  <span>{recommendation.address}</span>
                </div>
                <div className="mt-3 rounded-lg bg-sea-50 p-3">
                  <p className="text-xs font-extrabold uppercase text-sea-700">
                    Why this fits
                  </p>
                  <p className="mt-1 text-xs font-semibold leading-5 text-navy-700">
                    {item.reason}
                  </p>
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const SplitMap = ({ items, selectedIds, activeId, onMarkerFocus }: SplitMapProps) => {
  const bounds = useMemo(() => {
    if (items.length === 0) return undefined;
    return L.latLngBounds(
      items.map((item) => [item.recommendation.lat, item.recommendation.lng]),
    ).pad(0.22);
  }, [items]);

  return (
    <div className="overflow-hidden rounded-lg border border-navy-900/10 bg-sand-50 p-2 shadow-card">
      <MapContainer
        center={splitCenter}
        zoom={13}
        bounds={bounds}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <MarkerLayer
          items={items}
          selectedIds={selectedIds}
          activeId={activeId}
          onMarkerFocus={onMarkerFocus}
        />
      </MapContainer>
    </div>
  );
};

export default SplitMap;

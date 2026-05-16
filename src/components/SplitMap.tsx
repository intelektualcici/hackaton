import L from "leaflet";
import { useEffect } from "react";
import {
  MapContainer,
  Marker,
  TileLayer,
  useMap,
} from "react-leaflet";
import type { DisplayRecommendation } from "../types/planner";
import { createRoadmapIcon, splitCenter } from "../utils/mapHelpers";

interface SplitMapProps {
  items: DisplayRecommendation[];
  selectedIds: Set<string>;
  activeId: string | null;
  onMarkerFocus: (id: string) => void;
}

const parseRouteSignature = (routeSignature: string): [number, number][] => {
  if (!routeSignature) return [];

  return routeSignature
    .split("|")
    .map((point) => {
      const [lat, lng] = point.split(",").map(Number);
      return [lat, lng] as [number, number];
    })
    .filter(([lat, lng]) => Number.isFinite(lat) && Number.isFinite(lng));
};

const RouteViewport = ({ routeSignature }: { routeSignature: string }) => {
  const map = useMap();

  useEffect(() => {
    const routePositions = parseRouteSignature(routeSignature);
    if (routePositions.length === 0) return;

    if (routePositions.length === 1) {
      map.setView(routePositions[0], 16, {
        animate: true,
      });
      return;
    }

    map.fitBounds(L.latLngBounds(routePositions).pad(0.16), {
      animate: true,
      maxZoom: 16,
      padding: [64, 64],
    });
  }, [map, routeSignature]);

  return null;
};

const MarkerLayer = ({
  items,
  selectedIds,
  activeId,
  onMarkerFocus,
}: SplitMapProps) => {
  return (
    <>
      {items.map((item, index) => {
        const recommendation = item.recommendation;
        const isSelected = selectedIds.has(recommendation.id);
        const isActive = activeId === recommendation.id;

        return (
          <Marker
            key={recommendation.id}
            position={[recommendation.lat, recommendation.lng]}
            icon={createRoadmapIcon(index + 1, isActive, isSelected)}
            zIndexOffset={isActive ? 1000 : index}
            eventHandlers={{
              click: () => onMarkerFocus(recommendation.id),
              mouseover: () => onMarkerFocus(recommendation.id),
            }}
          />
        );
      })}
    </>
  );
};

const SplitMap = ({ items, selectedIds, activeId, onMarkerFocus }: SplitMapProps) => {
  const routeSignature = items
    .map((item) => `${item.recommendation.lat},${item.recommendation.lng}`)
    .join("|");

  return (
    <div className="overflow-hidden rounded-lg border border-navy-900/10 bg-sand-50 p-2 shadow-card">
      <MapContainer
        center={splitCenter}
        zoom={13}
        scrollWheelZoom={false}
        className="z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />
        <RouteViewport routeSignature={routeSignature} />
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

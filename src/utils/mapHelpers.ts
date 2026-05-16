import L from "leaflet";
import { categoryMeta, type RecommendationCategory } from "../types/recommendation";

export const splitCenter: [number, number] = [43.5081, 16.4402];

export const createCategoryIcon = (
  category: RecommendationCategory,
  isActive: boolean,
  isSelected: boolean,
) => {
  const meta = categoryMeta[category];
  const size = isActive || isSelected ? 42 : 34;
  const border = isSelected ? "#F4B24A" : "#F6F2EA";

  return L.divIcon({
    className: "visit-split-marker",
    html: `<span style="background:${meta.marker};border-color:${border};width:${size}px;height:${size}px;font-size:${isActive ? 20 : 17}px">${meta.emoji}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size],
    popupAnchor: [0, -size],
  });
};

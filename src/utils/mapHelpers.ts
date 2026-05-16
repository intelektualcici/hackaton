import L from "leaflet";

export const splitCenter: [number, number] = [43.5081, 16.4402];

export const createRoadmapIcon = (
  order: number,
  isActive: boolean,
  isSelected: boolean,
) => {
  const size = isActive ? 34 : 28;
  const background = isActive ? "#F4B24A" : "#2F8FA3";
  const border = isSelected ? "#F4B24A" : "#F6F2EA";
  const color = isActive ? "#111512" : "#F6F2EA";

  return L.divIcon({
    className: "visit-split-marker",
    html: `<span style="background:${background};border-color:${border};color:${color};width:${size}px;height:${size}px;font-size:${isActive ? 15 : 13}px;font-weight:800">${order}</span>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
};

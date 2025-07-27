export const toGeoJSON = (location: { lat: number; lng: number }) => ({
  type: "Point" as const,
  coordinates: [location.lng, location.lat] as [number, number],
});

export const fromGeoJSON = (location: {
  type: "Point";
  coordinates: [number, number];
}) => ({
  lng: location.coordinates[0],
  lat: location.coordinates[1],
});

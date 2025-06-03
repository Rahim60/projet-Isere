import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet';
import { useEffect } from 'react';
import 'leaflet/dist/leaflet.css';

// Composant qui permet de zoomer automatiquement sur une commune sélectionnée
function ZoomToFeature({ feature }) {
  const map = useMap();

  useEffect(() => {
    if (typeof window === "undefined" || !map || !feature) return;

    const coords = feature.geometry.coordinates;
    let bounds = [];

    if (feature.geometry.type === "Polygon") {
      bounds = coords[0].map(([lng, lat]) => [lat, lng]);
    } else if (feature.geometry.type === "MultiPolygon") {
      bounds = coords[0][0].map(([lng, lat]) => [lat, lng]);
    }

    if (bounds.length > 0) {
      map.fitBounds(bounds);
    }
  }, [feature, map]);

  return null;
}

// Composant principal de la carte
export default function Map({ geojsonData, selectedFeature }) {
  return (
    <>
      <h1 className='text-center'>Le département de l&aposIsère</h1>

      {/* Conteneur de la carte avec centre et zoom par défaut */}
      <MapContainer
        center={[45.1885, 5.7245]}
        zoom={9}
        style={{ height: '100%', width: '100%' }}
      >
        {/* Calque OpenStreetMap */}
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* Affichage de toutes les communes en gris clair */}
        {geojsonData && (
          <GeoJSON data={geojsonData} style={{ color: "#bbb", weight: 1 }} />
        )}

        {/* Mise en surbrillance de la commune sélectionnée */}
        {selectedFeature && (
          <>
            <GeoJSON
              data={selectedFeature}
              style={{ color: "blue", weight: 3, fillOpacity: 0.2 }}
            />
            <ZoomToFeature feature={selectedFeature} />
          </>
        )}
      </MapContainer>
    </>
  );
}

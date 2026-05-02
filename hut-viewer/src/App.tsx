import { useCallback, useEffect, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllInformation } from './api/api';
import { type HutType } from './hut-data/HutType';
import { HutList } from './hut-data/HutList';
import { HutMapMarkers } from './map/HutMapMarkers';

function App() {
  const [huts, setHuts] = useState<HutType[]>([]);
  const [hoveredHutId, setHoveredHutId] = useState<number | null>(null);
  const [detailsOpenByHutId, setDetailsOpenByHutId] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchAllInformation().then(setHuts);
  }, []);

  const handleMarkerSelect = useCallback((hut: HutType) => {
    setDetailsOpenByHutId((prev) => ({ ...prev, [hut.id]: true }));
    requestAnimationFrame(() => {
      document.getElementById(`hut-card-${hut.id}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
      });
    });
  }, []);

  const handleDetailsOpenChange = useCallback((hutId: number, open: boolean) => {
    setDetailsOpenByHutId((prev) => ({ ...prev, [hutId]: open }));
  }, []);

  useEffect(() => {
    console.log(huts);
  }, [huts]);

  return (
    <section id="center">
      <MapContainer style={{ height: '100%', width: '100%' }} center={[47, 8]} zoom={7} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <HutMapMarkers huts={huts} hoveredHutId={hoveredHutId} onMarkerSelect={handleMarkerSelect} />
      </MapContainer>
      <aside className="hut-sidebar" aria-label="Hut list">
        <HutList
          huts={huts}
          hoveredHutId={hoveredHutId}
          onHoverHut={setHoveredHutId}
          detailsOpenByHutId={detailsOpenByHutId}
          onDetailsOpenChange={handleDetailsOpenChange}
        />
      </aside>
    </section>
  );
}

export default App;

import { useEffect, useState } from 'react';
import './App.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { fetchAllInformation } from './api/api';
import { type HutType } from './hut-data/HutType';
import { HutList } from './hut-data/HutList';

function App() {
  const [huts, setHuts] = useState<HutType[]>([]);

  useEffect(() => {
    fetchAllInformation().then(setHuts);
  }, []);

  return (
    <section id="center">
      <MapContainer style={{ height: '100%', width: '100%' }} center={[47, 8]} zoom={7} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {huts.map((hut) => (
          <Marker key={hut.id} position={hut.location}>
            <Popup>{hut.geographical_name}</Popup>
          </Marker>
        ))}
      </MapContainer>
      <aside className="hut-sidebar" aria-label="Hut list">
        <HutList huts={huts} />
      </aside>
    </section>
  );
}

export default App;

import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import DashboardLayout from '../../../components/DashboardLayout';
import axios from 'axios';

export default function ProjectMap() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    axios.get('/api/projects').then(res => setProjects(res.data.data));
  }, []);

  return (
    <DashboardLayout title="National Project Map" roleName="Citizen">
      <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '500px', width: '100%' }}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {projects.map(p => (
          <Marker key={p.id} position={[p.start_lat, p.start_lng]}>
            <Popup>
              {p.name} - {p.status}
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </DashboardLayout>
  );
}

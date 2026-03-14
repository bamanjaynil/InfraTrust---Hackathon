import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import Card from '../../../components/Card';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function DeliveryControl() {
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    axios.get('/api/deliveries').then(res => setDeliveries(res.data.data));
  }, []);

  return (
    <DashboardLayout title="Delivery Control" roleName="Admin">
      <Card title="Deliveries">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Driver</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.status}</td>
                <td>{d.driver_id}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Tracking Map">
        <MapContainer center={[12.9716, 77.5946]} zoom={13} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {deliveries.map(d => (
            <Marker key={d.id} position={[12.9716, 77.5946]}>
              <Popup>{d.id}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
    </DashboardLayout>
  );
}

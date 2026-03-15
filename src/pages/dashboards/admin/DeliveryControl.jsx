import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import Card from '../../../components/Card';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

export default function DeliveryControl() {
  const [deliveries, setDeliveries] = useState([]);
  const [drivers, setDrivers] = useState([]);
  const [trackingPoints, setTrackingPoints] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState('');
  const [assigning, setAssigning] = useState(false);

  useEffect(() => {
    axios.get('/api/deliveries').then(res => setDeliveries(res.data.data));
    axios.get('/api/drivers').then(res => setDrivers(res.data.data || []));
    axios.get('/api/tracking').then(res => setTrackingPoints(res.data.data || []));
  }, []);

  const assignDriver = async (deliveryId) => {
    if (!selectedDriver) {
      alert('Select a driver first');
      return;
    }

    setAssigning(true);
    try {
      await axios.post('/api/deliveries/assign-driver', { delivery_id: deliveryId, driver_id: selectedDriver });
      const res = await axios.get('/api/deliveries');
      setDeliveries(res.data.data);
      alert('Driver assigned');
    } catch (err) {
      console.error(err);
      alert('Failed to assign driver');
    } finally {
      setAssigning(false);
    }
  };

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
                <td className="space-y-2">
                  <div>{d.driver_id || 'Unassigned'}</div>
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-zinc-900 border border-zinc-800 rounded-lg px-2 py-1 text-xs text-zinc-200"
                      value={selectedDriver}
                      onChange={(e) => setSelectedDriver(e.target.value)}
                    >
                      <option value="">Assign Driver</option>
                      {drivers.map((driver) => (
                        <option key={driver.id} value={driver.id}>{driver.name}</option>
                      ))}
                    </select>
                    <button
                      onClick={() => assignDriver(d.id)}
                      disabled={assigning || !selectedDriver}
                      className="px-2 py-1 rounded bg-blue-500 text-white text-xs disabled:opacity-50"
                    >
                      {assigning ? 'Assigning...' : 'Assign'}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      <Card title="Tracking Map">
        <MapContainer center={[12.9716, 77.5946]} zoom={12} style={{ height: '400px', width: '100%' }}>
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {deliveries.map(d => {
            if (!d.start_lat || !d.start_lng || !d.end_lat || !d.end_lng) return null;
            return (
              <React.Fragment key={d.id}>
                <Marker position={[d.start_lat, d.start_lng]}>
                  <Popup>{d.project_name || d.project_id} - Pickup</Popup>
                </Marker>
                <Marker position={[d.end_lat, d.end_lng]}>
                  <Popup>{d.project_name || d.project_id} - Destination</Popup>
                </Marker>
                <Polyline positions={[[d.start_lat, d.start_lng], [d.end_lat, d.end_lng]]} pathOptions={{ color: 'cyan' }} />
              </React.Fragment>
            );
          })}
          {trackingPoints.map((point, idx) => (
            <Marker key={`truck-${idx}`} position={[point.latitude, point.longitude]}>
              <Popup>{point.truck_id} - {new Date(point.timestamp).toLocaleTimeString()}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </Card>
    </DashboardLayout>
  );
}

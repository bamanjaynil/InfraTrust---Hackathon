import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import axios from 'axios';
import { useAuthStore } from '../../../store/authStore';

export default function ActiveDeliveries() {
  const { user } = useAuthStore();
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    if (user?.id) {
      axios.get(`/api/deliveries/driver/${user.id}`).then(res => setDeliveries(res.data.data));
    }
  }, [user?.id]);

  const startDelivery = async (id) => {
    await axios.post(`/api/deliveries/${id}/start`);
    // Refresh deliveries
  };

  return (
    <DashboardLayout title="Active Deliveries" roleName="Driver">
      <Card title="Deliveries">
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {deliveries.map(d => (
              <tr key={d.id}>
                <td>{d.id}</td>
                <td>{d.status}</td>
                <td>
                  {d.status === 'ASSIGNED' && <Button onClick={() => startDelivery(d.id)}>Start</Button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}

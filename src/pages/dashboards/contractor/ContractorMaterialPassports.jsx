import React, { useEffect, useState } from 'react';
import DashboardLayout from '../../../components/DashboardLayout';
import axios from 'axios';
import Card from '../../../components/Card';

export default function ContractorMaterialPassports() {
  const [passports, setPassports] = useState([]);

  useEffect(() => {
    axios.get('/api/passports/project/all').then(res => setPassports(res.data.data));
  }, []);

  return (
    <DashboardLayout title="Material Passports" roleName="Contractor">
      <Card>
        <table className="w-full">
          <thead>
            <tr>
              <th>ID</th>
              <th>Material</th>
              <th>Quantity</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {passports.map(p => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.material_type}</td>
                <td>{p.quantity}</td>
                <td>{p.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </DashboardLayout>
  );
}

import React, { useState } from 'react';
import { QrReader } from 'react-qr-reader';
import axios from 'axios';
import DashboardLayout from '../../../components/DashboardLayout';

export default function DriverQRScanner() {
  const [data, setData] = useState('No result');

  return (
    <DashboardLayout title="QR Scanner" roleName="Driver">
      <QrReader
        onResult={(result, error) => {
          if (!!result) {
            setData(result?.text);
            axios.post('/api/passports/verify', {
              passport_id: JSON.parse(result.text).passport_id,
              arrival_lat: 0,
              arrival_lng: 0,
              arrival_time: new Date().toISOString()
            }).then(() => alert('Verified!'));
          }
        }}
        style={{ width: '100%' }}
      />
      <p>{data}</p>
    </DashboardLayout>
  );
}

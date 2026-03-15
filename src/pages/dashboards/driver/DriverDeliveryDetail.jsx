import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { Truck, MapPin, Clock, CheckCircle, AlertCircle, Play, Map } from 'lucide-react';
import { QrReader } from 'react-qr-reader';
import useDriverStore from '../../../store/driverStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';

export default function DriverDeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    activeDelivery,
    fetchDeliveryById,
    startDelivery,
    markArrived,
    verifyDelivery,
    updateTracking,
    trackingStatus,
    loading,
    error,
  } = useDriverStore();
  const [locationError, setLocationError] = useState(null);
  const [qrScanResult, setQrScanResult] = useState(null);
  const [qrError, setQrError] = useState(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const trackingInterval = useRef(null);

  useEffect(() => {
    fetchDeliveryById(id);
  }, [id, fetchDeliveryById]);

  useEffect(() => {
    if (trackingStatus === 'TRACKING' && activeDelivery?.truck_number) {
      trackingInterval.current = setInterval(() => {
        if ('geolocation' in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              updateTracking({
                truck_id: activeDelivery.truck_number,
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
                timestamp: new Date().toISOString(),
              });
              setLocationError(null);
            },
            () => {
              setLocationError('Unable to retrieve location. Please check GPS settings.');
            }
          );
        }
      }, 30000);
    } else if (trackingInterval.current) {
      clearInterval(trackingInterval.current);
    }

    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, [trackingStatus, activeDelivery, updateTracking]);

  const handleStart = async () => {
    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        await startDelivery(id);
        updateTracking({
          truck_id: activeDelivery.truck_number,
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          timestamp: new Date().toISOString(),
        });
      },
      () => {
        alert('GPS location is required to start delivery.');
      }
    );
  };

  const onQrResult = (result, scannerError) => {
    if (result) {
      const text = result?.text || result;
      try {
        const payload = JSON.parse(text);
        setQrScanResult(payload.passport_id || text);
      } catch {
        setQrScanResult(text);
      }
      setQrError(null);
    }

    if (scannerError) {
      setQrError('QR read error. Move camera closer or adjust lighting.');
    }
  };

  const handleVerify = async () => {
    if (!qrScanResult) {
      alert('Please scan the passport QR code first.');
      return;
    }

    if (!('geolocation' in navigator)) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setIsVerifying(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          await verifyDelivery(qrScanResult, position.coords.latitude, position.coords.longitude);
          await fetchDeliveryById(id);
          alert('Delivery verified');
        } catch {
          alert('Verification failed');
        } finally {
          setIsVerifying(false);
        }
      },
      () => {
        alert('GPS location is required to verify delivery.');
        setIsVerifying(false);
      }
    );
  };

  if (loading && !activeDelivery) {
    return (
      <DashboardLayout title="Delivery Details" roleName="Driver">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full" />
        </div>
      </DashboardLayout>
    );
  }

  if (error || !activeDelivery) {
    return (
      <DashboardLayout title="Delivery Details" roleName="Driver">
        <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-xl text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-red-500">Error Loading Delivery</h3>
          <p className="text-red-400 mt-2">{error || 'Delivery not found'}</p>
          <Button onClick={() => navigate('/driver/deliveries')} className="mt-6 bg-red-500 hover:bg-red-600">
            Back to Deliveries
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title={`Delivery #${activeDelivery.id.substring(0, 8)}`}
      roleName="Driver"
      badgeColorClass="bg-blue-500/10 text-blue-500 border-blue-500/20"
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{activeDelivery.material_type}</h3>
                  <p className="text-zinc-500 text-sm">Volume: {activeDelivery.volume} units</p>
                </div>
              </div>
              <StatusBadge status={activeDelivery.status} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 py-6 border-t border-zinc-800">
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-zinc-500 mt-1" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Destination Project</p>
                    <p className="text-sm text-zinc-200 font-medium">{activeDelivery.project_name}</p>
                    <p className="text-xs text-zinc-500 mt-1">{activeDelivery.city}, {activeDelivery.district}, {activeDelivery.state}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-zinc-500 mt-1" />
                  <div>
                    <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Dispatch Time</p>
                    <p className="text-sm text-zinc-200 font-medium">
                      {new Date(activeDelivery.dispatch_time || activeDelivery.timestamp).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {locationError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-center gap-3 text-red-500 text-sm">
                <AlertCircle className="w-4 h-4" />
                {locationError}
              </div>
            )}
          </Card>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeDelivery.status === 'ASSIGNED' && (
              <Button onClick={handleStart} loading={loading} className="bg-blue-600 hover:bg-blue-700 h-16 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Start Delivery
              </Button>
            )}
            {activeDelivery.status === 'IN_TRANSIT' && (
              <Button onClick={() => markArrived(id)} loading={loading} className="bg-purple-600 hover:bg-purple-700 h-16 text-lg">
                <MapPin className="w-5 h-5 mr-2" />
                Mark Arrived
              </Button>
            )}
            {activeDelivery.status === 'ARRIVED' && (
              <div className="space-y-3">
                <Card title="QR Verification" noPadding>
                  <div className="p-4">
                    <p className="text-sm text-zinc-400 mb-2">Scan the material passport QR code upon arrival to verify delivery.</p>
                    <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-lg">
                      <QrReader
                        onResult={onQrResult}
                        constraints={{ facingMode: 'environment' }}
                        videoStyle={{ width: '100%', borderRadius: '8px' }}
                      />
                      {qrError && <p className="mt-2 text-xs text-red-400">{qrError}</p>}
                      {qrScanResult && <p className="mt-2 text-xs text-emerald-400">Scanned passport ID: {qrScanResult}</p>}
                      <Button onClick={handleVerify} loading={isVerifying} className="mt-3 w-full">
                        Verify Delivery
                      </Button>
                    </div>
                  </div>
                </Card>
              </div>
            )}
            {(activeDelivery.status === 'VERIFIED' || activeDelivery.status === 'COMPLETED') && (
              <div className="col-span-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Delivery verified</span>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <Card title="Vehicle Info">
            <div className="flex items-center gap-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <div className="p-2 rounded bg-zinc-800 text-zinc-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Truck Number Plate</p>
                <p className="text-lg font-mono font-bold text-zinc-100">{activeDelivery.truck_number || 'Pending assignment'}</p>
              </div>
            </div>
          </Card>

          <Card title="Tracking Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Live GPS</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${trackingStatus === 'TRACKING' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
                  <span className={`text-xs font-bold uppercase ${trackingStatus === 'TRACKING' ? 'text-emerald-500' : 'text-zinc-500'}`}>
                    {trackingStatus === 'TRACKING' ? 'Active' : 'Inactive'}
                  </span>
                </div>
              </div>
              {trackingStatus === 'TRACKING' && (
                <div className="p-3 bg-zinc-900 rounded-lg border border-zinc-800 flex items-center gap-3">
                  <Map className="w-4 h-4 text-blue-500" />
                  <span className="text-xs text-zinc-400">Location data is being sent to HQ</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}

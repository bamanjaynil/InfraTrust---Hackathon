import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DashboardLayout from '../../../components/DashboardLayout';
import { Navigation, Truck, MapPin, Clock, CheckCircle, AlertCircle, Play, Map } from 'lucide-react';
import useDriverStore from '../../../store/driverStore';
import Card from '../../../components/Card';
import Button from '../../../components/Button';
import StatusBadge from '../../../components/StatusBadge';

export default function DriverDeliveryDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { activeDelivery, fetchDeliveryById, startDelivery, markArrived, completeDelivery, updateTracking, trackingStatus, loading, error } = useDriverStore();
  const [locationError, setLocationError] = useState(null);
  const trackingInterval = useRef(null);

  useEffect(() => {
    fetchDeliveryById(id);
  }, [id, fetchDeliveryById]);

  // GPS Tracking Logic
  useEffect(() => {
    if (trackingStatus === 'TRACKING' && activeDelivery) {
      trackingInterval.current = setInterval(() => {
        if ("geolocation" in navigator) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const { latitude, longitude } = position.coords;
              updateTracking({
                truck_id: activeDelivery.truck_id,
                latitude,
                longitude,
                timestamp: new Date().toISOString()
              });
              setLocationError(null);
            },
            (err) => {
              console.error('Geolocation error:', err);
              setLocationError('Unable to retrieve location. Please check GPS settings.');
            }
          );
        }
      }, 30000); // Every 30 seconds
    } else {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    }

    return () => {
      if (trackingInterval.current) {
        clearInterval(trackingInterval.current);
      }
    };
  }, [trackingStatus, activeDelivery, updateTracking]);

  const handleStart = async () => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          await startDelivery(id);
          // Initial tracking update
          updateTracking({
            truck_id: activeDelivery.truck_id,
            latitude,
            longitude,
            timestamp: new Date().toISOString()
          });
        },
        (err) => {
          console.error('Geolocation error:', err);
          alert('GPS location is required to start delivery.');
        }
      );
    } else {
      alert('Geolocation is not supported by your browser.');
    }
  };

  if (loading && !activeDelivery) {
    return (
      <DashboardLayout title="Delivery Details" roleName="Driver">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full"></div>
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
        {/* Main Info */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <div className="flex justify-between items-start mb-6">
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                  <Truck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-zinc-100">{activeDelivery.material_type}</h3>
                  <p className="text-zinc-500 text-sm">Volume: {activeDelivery.volume} m³</p>
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
                      {new Date(activeDelivery.timestamp).toLocaleString()}
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

          {/* Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {activeDelivery.status === 'ASSIGNED' && (
              <Button 
                onClick={handleStart} 
                loading={loading}
                className="bg-blue-600 hover:bg-blue-700 h-16 text-lg"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Delivery
              </Button>
            )}
            {activeDelivery.status === 'IN_TRANSIT' && (
              <Button 
                onClick={() => markArrived(id)} 
                loading={loading}
                className="bg-purple-600 hover:bg-purple-700 h-16 text-lg"
              >
                <MapPin className="w-5 h-5 mr-2" />
                Mark Arrived
              </Button>
            )}
            {activeDelivery.status === 'ARRIVED' && (
              <Button 
                onClick={() => completeDelivery(id)} 
                loading={loading}
                className="bg-emerald-600 hover:bg-emerald-700 h-16 text-lg"
              >
                <CheckCircle className="w-5 h-5 mr-2" />
                Complete Delivery
              </Button>
            )}
            {activeDelivery.status === 'COMPLETED' && (
              <div className="col-span-full bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl flex items-center justify-center gap-3 text-emerald-500">
                <CheckCircle className="w-5 h-5" />
                <span className="font-bold">Delivery Successfully Completed</span>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card title="Vehicle Info">
            <div className="flex items-center gap-4 p-3 bg-zinc-900 rounded-lg border border-zinc-800">
              <div className="p-2 rounded bg-zinc-800 text-zinc-400">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Truck Number Plate</p>
                <p className="text-lg font-mono font-bold text-zinc-100">{activeDelivery.truck_id}</p>
              </div>
            </div>
          </Card>

          <Card title="Tracking Status">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-zinc-500">Live GPS</span>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${trackingStatus === 'TRACKING' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`}></div>
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

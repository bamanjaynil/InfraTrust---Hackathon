import React, { useState } from 'react';
import { useAuthStore } from '../../../store/authStore';
import useCitizenStore from '../../../store/citizenStore';
import DashboardLayout from '../../../components/DashboardLayout';
import InputField from '../../../components/InputField';
import Button from '../../../components/Button';
import { Camera, MapPin, Navigation, AlertTriangle, Upload } from 'lucide-react';

import { submitReport } from '../../../services/reportService';

export default function ReportRoadIssue() {
  const { user } = useAuthStore();
  const { userLocation, setUserLocation } = useCitizenStore();
  const [formData, setFormData] = useState({
    description: '',
    latitude: userLocation?.latitude || '',
    longitude: userLocation?.longitude || '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [locating, setLocating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleDetectLocation = () => {
    setLocating(true);
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          setUserLocation({ latitude: lat, longitude: lng });
          setFormData(prev => ({
            ...prev,
            latitude: lat,
            longitude: lng
          }));
          setLocating(false);
        },
        (error) => {
          console.error("Error detecting location", error);
          setLocating(false);
          if (error.code === 1) {
            setError('Location permission denied. Please enable GPS.');
          } else {
            setError('Failed to detect location. Please ensure location services are enabled.');
          }
        }
      );
    } else {
      setLocating(false);
      setError('Geolocation is not supported by your browser.');
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({ ...prev, image: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!formData.description || !formData.latitude || !formData.longitude || !formData.image) {
      setError('Please fill in all fields, including location and photo.');
      return;
    }

    setSubmitting(true);
    try {
      // For a real app, we'd use FormData for file uploads.
      // Here we'll just send the base64 image preview.
      await submitReport({
        description: formData.description,
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        photo: imagePreview,
        project_id: null // Can be linked to a project later by admin or AI
      });
      
      setSuccess(true);
      setFormData({ description: '', latitude: '', longitude: '', image: null });
      setImagePreview(null);
    } catch (err) {
      console.error(err);
      setError('Failed to submit report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <DashboardLayout title="Report Road Issue" roleName="Citizen" badgeColorClass="border-emerald-500/30 text-emerald-400">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 text-center">
          <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-zinc-100">Report a Road Issue</h2>
          <p className="text-zinc-400 mt-2">Help us maintain infrastructure quality by reporting potholes, cracks, or incomplete work.</p>
        </div>

        {success ? (
          <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-emerald-500/20 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-zinc-100 mb-2">Report Submitted Successfully!</h3>
            <p className="text-zinc-400 mb-6">Thank you for your contribution. Our AI system will verify the issue and notify the relevant authorities.</p>
            <Button onClick={() => setSuccess(false)}>Report Another Issue</Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-6 space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Issue Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the issue (e.g., Large pothole on the left lane, incomplete paving...)"
                rows={4}
                className="w-full bg-zinc-950 border border-zinc-800 rounded-lg p-3 text-zinc-200 placeholder-zinc-600 focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none resize-none"
              />
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <label className="block text-sm font-medium text-zinc-300">
                  Location Coordinates
                </label>
                <button 
                  type="button" 
                  onClick={handleDetectLocation}
                  disabled={locating}
                  className="text-xs flex items-center gap-1 bg-zinc-800 hover:bg-zinc-700 text-emerald-400 px-3 py-1.5 rounded-md transition-colors disabled:opacity-50"
                >
                  <Navigation className="w-3.5 h-3.5" />
                  {locating ? 'Detecting...' : 'Auto Detect GPS'}
                </button>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Latitude"
                    value={formData.latitude}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-zinc-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <MapPin className="h-4 w-4 text-zinc-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Longitude"
                    value={formData.longitude}
                    readOnly
                    className="w-full pl-10 pr-4 py-2 bg-zinc-950/50 border border-zinc-800 rounded-lg text-zinc-400 cursor-not-allowed focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-300 mb-2">
                Photo Evidence
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-zinc-800 border-dashed rounded-lg hover:border-emerald-500/50 transition-colors bg-zinc-950/50">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="mx-auto h-48 object-cover rounded-md" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setFormData(prev => ({ ...prev, image: null })); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  ) : (
                    <>
                      <Camera className="mx-auto h-12 w-12 text-zinc-500" />
                      <div className="flex text-sm text-zinc-400 justify-center mt-2">
                        <label htmlFor="file-upload" className="relative cursor-pointer rounded-md font-medium text-emerald-400 hover:text-emerald-300 focus-within:outline-none">
                          <span>Upload a file</span>
                          <input id="file-upload" name="file-upload" type="file" accept="image/*" className="sr-only" onChange={handleImageChange} />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG, GIF up to 10MB</p>
                    </>
                  )}
                </div>
              </div>
            </div>

            <Button type="submit" isLoading={submitting} className="w-full flex justify-center items-center gap-2">
              <Upload className="w-4 h-4" />
              Submit Report
            </Button>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}

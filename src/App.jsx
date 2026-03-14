import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './auth/Login';
import Register from './auth/Register';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './dashboards/admin/AdminDashboard';
import ContractorDashboard from './dashboards/contractor/ContractorDashboard';
import DriverDashboard from './dashboards/driver/DriverDashboard';
import DriverDeliveries from './pages/dashboards/driver/DriverDeliveries';
import DriverDeliveryDetail from './pages/dashboards/driver/DriverDeliveryDetail';
import DriverHistory from './pages/dashboards/driver/DriverHistory';
import DriverProfile from './pages/dashboards/driver/DriverProfile';
import CitizenDashboard from './dashboards/citizen/CitizenDashboard';

import AdminProjects from './pages/dashboards/admin/AdminProjects';
import CreateProject from './pages/dashboards/admin/CreateProject';
import AdminContractors from './pages/dashboards/admin/AdminContractors';
import AdminDeliveries from './pages/dashboards/admin/AdminDeliveries';
import DeliveryControl from './pages/dashboards/admin/DeliveryControl';
import AdminReports from './pages/dashboards/admin/AdminReports';
import AdminTrustScores from './pages/dashboards/admin/AdminTrustScores';
import AdminProjectDetail from './pages/dashboards/admin/AdminProjectDetail';
import ContractorProjects from './pages/dashboards/contractor/ContractorProjects';
import ContractorProjectDetail from './pages/dashboards/contractor/ContractorProjectDetail';
import MaterialRequests from './pages/dashboards/contractor/MaterialRequests';
import ContractorDeliveries from './pages/dashboards/contractor/ContractorDeliveries';
import ContractorDrivers from './pages/dashboards/contractor/ContractorDrivers';
import ContractorReports from './pages/dashboards/contractor/ContractorReports';
import CitizenProjects from './pages/dashboards/citizen/Projects';
import ReportRoadIssue from './pages/dashboards/citizen/ReportRoadIssue';
import MyReports from './pages/dashboards/citizen/MyReports';
import ProjectDetail from './pages/dashboards/ProjectDetail';
import ActiveDeliveries from './pages/dashboards/driver/ActiveDeliveries';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-zinc-950">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route 
            path="/admin/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/projects" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProjects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/projects/create" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CreateProject />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/projects/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminProjectDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/contractors" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminContractors />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/deliveries" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDeliveries />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/delivery-control" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <DeliveryControl />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/reports" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminReports />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/admin/trust-scores" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminTrustScores />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/contractor/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <ContractorDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractor/projects" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <ContractorProjects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractor/projects/:id" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <ContractorProjectDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractor/material-requests" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <MaterialRequests />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractor/deliveries" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <ContractorDeliveries />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractor/drivers" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <ContractorDrivers />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/contractor/reports" 
            element={
              <ProtectedRoute allowedRoles={['CONTRACTOR']}>
                <ContractorReports />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/driver/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/deliveries" 
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverDeliveries />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/active-deliveries" 
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <ActiveDeliveries />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/deliveries/:id" 
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverDeliveryDetail />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/history" 
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverHistory />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/driver/profile" 
            element={
              <ProtectedRoute allowedRoles={['DRIVER']}>
                <DriverProfile />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/citizen/dashboard" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenDashboard />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/projects" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <CitizenProjects />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/report" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <ReportRoadIssue />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/citizen/reports" 
            element={
              <ProtectedRoute allowedRoles={['CITIZEN']}>
                <MyReports />
              </ProtectedRoute>
            } 
          />

          <Route 
            path="/projects/:id" 
            element={
              <ProtectedRoute allowedRoles={['ADMIN', 'CONTRACTOR', 'CITIZEN']}>
                <ProjectDetail />
              </ProtectedRoute>
            } 
          />

          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
}

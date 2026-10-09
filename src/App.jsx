import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppContext } from './context/AppContext';

import Layout from './components/Layout';
import Login from './pages/Login';
import NurseDashboard from './pages/NurseDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  const { currentUser } = useAppContext();

  return (
    <Routes>
      <Route path="/login" element={!currentUser ? <Login /> : <Navigate to={`/${currentUser}`} />} />
      
      <Route element={<Layout />}>
        <Route path="/nurse" element={currentUser === 'nurse' ? <NurseDashboard /> : <Navigate to="/login" />} />
        <Route path="/doctor" element={currentUser === 'doctor' ? <DoctorDashboard /> : <Navigate to="/login" />} />
        <Route path="/admin" element={currentUser === 'admin' ? <AdminDashboard /> : <Navigate to="/login" />} />
      </Route>

      <Route path="*" element={<Navigate to="/login" />} />
    </Routes>
  );
}

export default App;

import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Settings, Users, Activity, HeartPulse, UserPlus, Info } from 'lucide-react';

const AdminDashboard = () => {
  const { patients, addPatient, capacity } = useAppContext();
  const [newPatientName, setNewPatientName] = useState('');

  const admittedPatients = patients.filter(p => p.status === 'Admitted');
  const dischargedPatients = patients.filter(p => p.status === 'Discharged');
  const deceasedPatients = patients.filter(p => p.status === 'Deceased');

  const resolvedCases = dischargedPatients.length + deceasedPatients.length;
  
  const mortalityRate = resolvedCases > 0 
    ? ((deceasedPatients.length / resolvedCases) * 100).toFixed(1) 
    : 0;

  const successRate = resolvedCases > 0 
    ? ((dischargedPatients.length / resolvedCases) * 100).toFixed(1) 
    : 0;

  const occupancyRate = ((admittedPatients.length / capacity) * 100).toFixed(1);

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatientName) return;
    addPatient(newPatientName);
    setNewPatientName('');
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card glass-panel flex flex-col gap-2 relative group">
          <div className="flex items-center gap-2 text-primary-light">
            <Users size={20} />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Occupancy</h3>
            <Info size={14} className="text-muted ml-auto cursor-help" title="Formula: (Admitted / Capacity) * 100" />
          </div>
          <p className="text-3xl font-bold">{admittedPatients.length} <span className="text-sm text-muted font-normal">/ {capacity}</span></p>
          <div className="w-full bg-border rounded-full h-2 mt-2">
            <div className="bg-primary h-2 rounded-full" style={{ width: `${occupancyRate}%` }}></div>
          </div>
        </div>

        <div className="card glass-panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-danger-light">
            <Activity size={20} />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Mortality Rate</h3>
            <Info size={14} className="text-muted ml-auto cursor-help" title="Formula: (Deceased / Total Resolved Cases) * 100" />
          </div>
          <p className="text-3xl font-bold">{mortalityRate}%</p>
          <p className="text-xs text-muted mt-auto">Benchmark: 15%</p>
        </div>

        <div className="card glass-panel flex flex-col gap-2">
          <div className="flex items-center gap-2 text-success">
            <HeartPulse size={20} />
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Success Rate</h3>
            <Info size={14} className="text-muted ml-auto cursor-help" title="Formula: (Discharged / Total Resolved Cases) * 100" />
          </div>
          <p className="text-3xl font-bold">{successRate}%</p>
          <p className="text-xs text-muted mt-auto">Target: 85%</p>
        </div>
        
        <div className="card glass-panel flex flex-col gap-2 justify-center items-center text-center">
           <h3 style={{ fontSize: '1rem', margin: 0 }} className="text-muted">Total Resolved</h3>
           <p className="text-3xl font-bold">{resolvedCases}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Admit Patient Form */}
        <div className="card glass-panel" style={{ height: 'fit-content' }}>
          <div className="flex items-center gap-2 mb-6">
            <UserPlus color="var(--primary-light)" />
            <h2 style={{ margin: 0 }}>Admit Patient</h2>
          </div>
          <form onSubmit={handleAddPatient} className="flex flex-col gap-4">
            <div className="input-group">
              <label htmlFor="patientName">Patient Name</label>
              <input 
                id="patientName"
                type="text" 
                className="input-field" 
                placeholder="Enter full name"
                value={newPatientName}
                onChange={(e) => setNewPatientName(e.target.value)}
                required
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary mt-4" 
              disabled={!newPatientName || admittedPatients.length >= capacity}
            >
              Admit New Patient
            </button>
            {admittedPatients.length >= capacity && (
              <p className="text-xs text-danger mt-2 text-center">Maximum capacity reached.</p>
            )}
          </form>
        </div>

        {/* Patient Directory */}
        <div className="md:col-span-2 card glass-panel">
          <div className="flex items-center justify-between mb-6">
            <h2 style={{ margin: 0 }}>Patient Directory</h2>
            <div className="flex gap-2">
              <span className="badge badge-admitted">Admitted: {admittedPatients.length}</span>
              <span className="badge badge-discharged">Discharged: {dischargedPatients.length}</span>
            </div>
          </div>
          
          <div className="table-wrapper" style={{ maxHeight: '400px', overflowY: 'auto' }}>
            <table>
              <thead style={{ position: 'sticky', top: 0, zIndex: 10 }}>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Admitted On</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {[...patients].reverse().map(p => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600 }}>{p.id}</td>
                    <td>{p.name}</td>
                    <td>{new Date(p.admissionDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${p.status === 'Admitted' ? 'badge-admitted' : p.status === 'Discharged' ? 'badge-discharged' : 'badge-deceased'}`}>
                        {p.status}
                      </span>
                    </td>
                  </tr>
                ))}
                {patients.length === 0 && (
                  <tr>
                    <td colSpan="4" className="text-center text-muted py-8">No patients in the system.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

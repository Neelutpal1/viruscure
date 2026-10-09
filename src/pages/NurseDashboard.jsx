import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Thermometer, Save, UserCheck, AlertTriangle, UserPlus, Clock } from 'lucide-react';

const NurseDashboard = () => {
  const { patients, records, recordTemperature, addPatient, capacity } = useAppContext();
  
  const [selectedPatient, setSelectedPatient] = useState('');
  const [temperature, setTemperature] = useState('');
  const [observations, setObservations] = useState('');
  const [tempError, setTempError] = useState('');
  
  // Admit Patient State
  const [newPatientName, setNewPatientName] = useState('');

  const today = new Date().toISOString().split('T')[0];

  const admittedPatients = patients.filter(p => p.status === 'Admitted');

  // Patients who are admitted and haven't had temperature taken today
  const pendingPatients = admittedPatients.filter(p => 
    !records.some(r => r.patientId === p.id && r.date === today)
  );

  const completedPatients = admittedPatients.filter(p => 
    records.some(r => r.patientId === p.id && r.date === today)
  );

  const handleSaveTemp = (e) => {
    e.preventDefault();
    setTempError('');
    
    if (!selectedPatient || !temperature) return;
    
    const tempValue = parseFloat(temperature);
    if (tempValue < 34.0 || tempValue > 43.0) {
      setTempError('Temperature must be between 34.0°C and 43.0°C');
      return;
    }

    const isAlarm = tempValue > 40.0;
    recordTemperature(selectedPatient, tempValue, observations, isAlarm);
    
    if (isAlarm) {
      alert('URGENT ALARM TRIGGERED! Doctor has been notified of critical temperature.');
    }

    setSelectedPatient('');
    setTemperature('');
    setObservations('');
  };

  const handleAddPatient = (e) => {
    e.preventDefault();
    if (!newPatientName) return;
    addPatient(newPatientName);
    setNewPatientName('');
    alert('Patient admitted successfully.');
  };

  const isOverdue = (admissionDateStr) => {
    // If admitted before today, and no reading today, it's overdue
    const adDate = new Date(admissionDateStr).toISOString().split('T')[0];
    return adDate < today;
  };

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Left Column: Forms */}
        <div className="flex flex-col gap-8">
          {/* Input Form */}
          <div className="card glass-panel" style={{ height: 'fit-content' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Thermometer color="var(--primary-light)" />
                <h2 style={{ margin: 0 }}>Record Temperature</h2>
              </div>
            </div>
            
            <form onSubmit={handleSaveTemp} className="flex flex-col gap-4">
              <div className="input-group">
                <label htmlFor="patient">Select Patient</label>
                <select 
                  id="patient"
                  className="input-field" 
                  value={selectedPatient}
                  onChange={(e) => setSelectedPatient(e.target.value)}
                  required
                >
                  <option value="" disabled>-- Choose a patient --</option>
                  {pendingPatients.map(p => (
                    <option key={p.id} value={p.id}>
                      {p.id} - {p.name} {isOverdue(p.admissionDate) ? '(OVERDUE)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              <div className="input-group">
                <label htmlFor="temperature">Temperature (°C) [34.0 - 43.0]</label>
                <input 
                  id="temperature"
                  type="number" 
                  step="0.1"
                  className="input-field" 
                  placeholder="e.g. 37.5"
                  value={temperature}
                  onChange={(e) => setTemperature(e.target.value)}
                  required
                />
                {tempError && <span className="text-danger mt-1 text-sm">{tempError}</span>}
              </div>

              <div className="input-group">
                <label htmlFor="observations">Optional Observations / Security Notes</label>
                <textarea 
                  id="observations"
                  className="input-field" 
                  placeholder="Any other notes or malicious activity reported..."
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  rows={3}
                />
              </div>

              <button type="submit" className="btn btn-primary mt-4" disabled={!selectedPatient || !temperature}>
                <Save size={18} /> Save Record
              </button>
            </form>
          </div>

          {/* Admit Patient Form */}
          <div className="card glass-panel" style={{ height: 'fit-content' }}>
            <div className="flex items-center gap-2 mb-6">
              <UserPlus color="var(--accent-light)" />
              <h2 style={{ margin: 0 }}>Admit New Patient</h2>
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
                className="btn btn-secondary mt-2" 
                disabled={!newPatientName || admittedPatients.length >= capacity}
              >
                Admit Patient
              </button>
              {admittedPatients.length >= capacity && (
                <p className="text-xs text-danger mt-2 text-center">Maximum capacity of {capacity} reached.</p>
              )}
            </form>
          </div>
        </div>

        {/* Right Column: Status Lists */}
        <div className="flex flex-col gap-6">
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ margin: 0 }}>Pending Check ({pendingPatients.length})</h3>
            </div>
            {pendingPatients.length === 0 ? (
              <p className="text-muted text-center" style={{ padding: '2rem 0' }}>All patients checked for today!</p>
            ) : (
              <div className="flex flex-col gap-2">
                {pendingPatients.map(p => {
                  const overdue = isOverdue(p.admissionDate);
                  return (
                    <div key={p.id} className="flex items-center justify-between" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem', borderLeft: overdue ? '3px solid var(--danger)' : 'none' }}>
                      <span>{p.id} - {p.name}</span>
                      {overdue ? (
                        <span className="text-danger flex items-center gap-1" style={{ fontSize: '0.875rem' }}><Clock size={14}/> OVERDUE</span>
                      ) : (
                        <span className="text-warning" style={{ fontSize: '0.875rem' }}>Needs Check</span>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h3 style={{ margin: 0 }}>Completed Today ({completedPatients.length})</h3>
            </div>
            <div className="flex flex-col gap-2">
              {completedPatients.map(p => {
                const record = records.find(r => r.patientId === p.id && r.date === today);
                return (
                  <div key={p.id} className="flex items-center justify-between" style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.02)', borderRadius: '0.5rem' }}>
                    <div className="flex items-center gap-2">
                      <UserCheck size={16} className="text-success" />
                      <span>{p.id} - {p.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {record?.alarm && <AlertTriangle size={16} className="text-danger" />}
                      <span style={{ fontWeight: 600 }}>{record?.temperature}°C</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default NurseDashboard;

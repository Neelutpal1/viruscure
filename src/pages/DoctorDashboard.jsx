import React, { useState } from 'react';
import { useAppContext } from '../context/AppContext';
import { Stethoscope, CheckCircle, Activity, AlertTriangle, BellRing } from 'lucide-react';

const DoctorDashboard = () => {
  const { patients, records, doctorVisit } = useAppContext();
  const [selectedRecordId, setSelectedRecordId] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState('');

  const today = new Date().toISOString().split('T')[0];

  // Get today's records that haven't been visited by doctor yet
  // Sort so alarms are at the top
  const pendingVisits = records
    .filter(r => r.date === today && !r.doctorVisited)
    .sort((a, b) => (b.alarm === true) - (a.alarm === true));

  const handleAction = (action) => {
    if (!selectedRecordId) return;
    doctorVisit(selectedRecordId, doctorNotes, action);
    setSelectedRecordId(null);
    setDoctorNotes('');
  };

  const selectedRecord = records.find(r => r.id === selectedRecordId);
  const patient = selectedRecord ? patients.find(p => p.id === selectedRecord.patientId) : null;

  // History calculation for the selected patient
  const patientHistory = patient ? records.filter(r => r.patientId === patient.id).sort((a, b) => new Date(b.date) - new Date(a.date)) : [];
  
  // Calculate consecutive days without fever (<= 37.5)
  let daysWithoutFever = 0;
  for (const r of patientHistory) {
    if (r.temperature <= 37.5) {
      daysWithoutFever++;
    } else {
      break;
    }
  }

  const isEligibleForDischarge = daysWithoutFever >= 3;

  return (
    <div className="flex flex-col gap-8 pb-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Pending Visits List */}
        <div className="card glass-panel flex flex-col gap-4">
          <div className="flex items-center gap-2 mb-2">
            <Stethoscope color="var(--accent-light)" />
            <h2 style={{ margin: 0 }}>Pending Visits</h2>
          </div>
          <p className="text-muted text-sm">Review patients checked by nurses today.</p>
          
          {pendingVisits.length === 0 ? (
            <div className="text-center text-muted" style={{ padding: '2rem 0' }}>
              <CheckCircle size={48} className="mx-auto mb-2 text-success" style={{ opacity: 0.5 }} />
              <p>All caught up!</p>
            </div>
          ) : (
            <div className="flex flex-col gap-3">
              {pendingVisits.map(record => {
                const pat = patients.find(p => p.id === record.patientId);
                const isSelected = selectedRecordId === record.id;
                return (
                  <div 
                    key={record.id} 
                    className={`flex flex-col gap-2 p-4 cursor-pointer transition-all ${isSelected ? 'border-primary' : 'border-border'}`}
                    style={{ 
                      background: isSelected ? 'rgba(59, 130, 246, 0.1)' : 'rgba(255,255,255,0.02)', 
                      borderRadius: '0.75rem',
                      border: `1px solid ${isSelected ? 'var(--primary)' : record.alarm ? 'var(--danger)' : 'var(--border)'}`,
                      boxShadow: record.alarm && !isSelected ? '0 0 10px rgba(239, 68, 68, 0.3)' : 'none'
                    }}
                    onClick={() => setSelectedRecordId(record.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span style={{ fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {record.alarm && <BellRing size={16} className="text-danger animate-pulse" />}
                        {pat?.id} - {pat?.name}
                      </span>
                      <span className={record.temperature > 37.5 ? 'text-danger' : 'text-success'} style={{ fontWeight: 700 }}>
                        {record.temperature}°C
                      </span>
                    </div>
                    {record.nurseObservations && (
                      <div className="text-sm text-muted italic">
                        " {record.nurseObservations} "
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Patient Details & Action */}
        <div className="md:col-span-2">
          {selectedRecord && patient ? (
            <div className="card glass-panel animate-fade-in flex flex-col gap-6" style={{ border: selectedRecord.alarm ? '1px solid var(--danger)' : '1px solid var(--border)' }}>
              
              {selectedRecord.alarm && (
                <div className="bg-danger text-white p-3 rounded-lg flex items-center justify-center gap-2 font-bold mb-2">
                  <AlertTriangle size={20} /> URGENT ALARM: Critical Temperature Recorded
                </div>
              )}

              <div className="flex justify-between items-start">
                <div>
                  <h2 style={{ fontSize: '1.5rem', marginBottom: '0.25rem' }}>{patient.name} ({patient.id})</h2>
                  <p className="text-muted">Admitted: {new Date(patient.admissionDate).toLocaleDateString()}</p>
                </div>
                {isEligibleForDischarge && (
                  <div className="badge badge-success flex items-center gap-1" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                    <CheckCircle size={16} /> Eligible for Discharge
                  </div>
                )}
                {!isEligibleForDischarge && (
                  <div className="badge badge-warning flex items-center gap-1" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem', background: 'rgba(245, 158, 11, 0.2)', color: 'var(--warning)' }}>
                    <AlertTriangle size={16} /> {daysWithoutFever}/3 Days No Fever
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p className="text-muted text-sm mb-1">Today's Temperature</p>
                  <p className={`text-2xl font-bold ${selectedRecord.temperature > 37.5 ? 'text-danger' : 'text-success'}`}>
                    {selectedRecord.temperature}°C
                  </p>
                </div>
                <div style={{ background: 'var(--surface)', padding: '1rem', borderRadius: '0.5rem' }}>
                  <p className="text-muted text-sm mb-1">Status</p>
                  <p className="text-2xl font-bold text-primary">{patient.status}</p>
                </div>
              </div>

              <div>
                <h3 className="mb-2 flex items-center gap-2"><Activity size={18}/> Temperature History</h3>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Temp</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {patientHistory.slice(0, 5).map(h => (
                        <tr key={h.id}>
                          <td>{new Date(h.date).toLocaleDateString()}</td>
                          <td className={h.temperature > 37.5 ? 'text-danger' : 'text-success'}>{h.temperature}°C</td>
                          <td className="text-sm text-muted">{h.doctorNotes || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex flex-col gap-4 mt-4">
                <div className="input-group">
                  <label htmlFor="notes">Doctor's Clinical Notes</label>
                  <textarea 
                    id="notes"
                    className="input-field"
                    rows={3}
                    placeholder="Enter clinical assessment notes..."
                    value={doctorNotes}
                    onChange={(e) => setDoctorNotes(e.target.value)}
                    required
                  />
                </div>
                
                <div className="flex flex-wrap gap-4 mt-2">
                  <button className="btn btn-secondary flex-1" onClick={() => handleAction('continue')} disabled={!doctorNotes}>
                    Continue Treatment
                  </button>
                  <button className="btn btn-primary flex-1" onClick={() => handleAction('reassess')} disabled={!doctorNotes}>
                    Reassess Patient
                  </button>
                  <button 
                    className="btn btn-success flex-1" 
                    onClick={() => { if(confirm('Approve discharge? This cannot be undone.')) handleAction('discharge'); }}
                    disabled={!doctorNotes}
                  >
                    Approve Discharge
                  </button>
                  <button 
                    className="btn btn-danger" 
                    onClick={() => { if(confirm('Mark patient as deceased? This cannot be undone.')) handleAction('deceased'); }}
                    disabled={!doctorNotes}
                  >
                    Mark Deceased
                  </button>
                </div>
                {!doctorNotes && <p className="text-danger text-sm text-center">Clinical notes are required before taking action.</p>}
              </div>

            </div>
          ) : (
            <div className="card h-full flex flex-col items-center justify-center text-muted" style={{ minHeight: '400px', border: '1px dashed var(--border)' }}>
              <Stethoscope size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
              <p>Select a patient from the queue to review.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DoctorDashboard;

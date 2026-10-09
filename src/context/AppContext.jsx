import React, { createContext, useContext, useState, useEffect } from 'react';
import CryptoJS from 'crypto-js';

const AppContext = createContext();

const SECRET_KEY = 'viruscure_secure_key_123';

const MOCK_PATIENTS = [
  { id: 'P001', name: 'John Doe', status: 'Admitted', admissionDate: new Date().toISOString() },
  { id: 'P002', name: 'Jane Smith', status: 'Admitted', admissionDate: new Date().toISOString() },
  { id: 'P003', name: 'Robert Johnson', status: 'Admitted', admissionDate: new Date(Date.now() - 86400000 * 2).toISOString() },
];

const pastDate = new Date(Date.now() - 86400000).toISOString().split('T')[0];
const MOCK_RECORDS = [
  { id: 'R001', patientId: 'P003', date: pastDate, temperature: 37.1, doctorVisited: true, doctorNotes: 'Improving', nurseObservations: 'Slept well', alarm: false }
];

// Helper to safely encrypt and decrypt data
const encryptData = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), SECRET_KEY).toString();
  } catch (e) {
    return null;
  }
};

const decryptData = (ciphertext) => {
  try {
    const bytes = CryptoJS.AES.decrypt(ciphertext, SECRET_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (e) {
    return null;
  }
};

export const AppProvider = ({ children }) => {
  const [patients, setPatients] = useState(() => {
    const saved = localStorage.getItem('viruscure_patients_enc');
    if (saved) {
      const dec = decryptData(saved);
      if (dec) return dec;
    }
    return MOCK_PATIENTS;
  });

  const [records, setRecords] = useState(() => {
    const saved = localStorage.getItem('viruscure_records_enc');
    if (saved) {
      const dec = decryptData(saved);
      if (dec) return dec;
    }
    return MOCK_RECORDS;
  });

  const [currentUser, setCurrentUser] = useState(() => {
    const saved = localStorage.getItem('viruscure_user_enc');
    if (saved) {
      const dec = decryptData(saved);
      if (dec) return dec;
    }
    return null;
  });

  // Save to encrypted local storage on change
  useEffect(() => {
    localStorage.setItem('viruscure_patients_enc', encryptData(patients));
  }, [patients]);

  useEffect(() => {
    localStorage.setItem('viruscure_records_enc', encryptData(records));
  }, [records]);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('viruscure_user_enc', encryptData(currentUser));
    } else {
      localStorage.removeItem('viruscure_user_enc');
    }
  }, [currentUser]);

  // Auth Actions
  const login = (username, password) => {
    // Mock authentication check
    if (password !== 'password123') return false;
    
    let role = null;
    if (username === 'nurse') role = 'nurse';
    else if (username === 'doctor') role = 'doctor';
    else if (username === 'admin') role = 'admin';
    
    if (role) {
      setCurrentUser(role);
      return true;
    }
    return false;
  };

  const logout = () => setCurrentUser(null);

  // App Actions
  const addPatient = (name) => {
    // Edge case 3: 2 patients assigned last available bed (Concurrency simulation)
    const currentAdmittedCount = patients.filter(p => p.status === 'Admitted').length;
    if (currentAdmittedCount >= 74) {
      alert("CONCURRENCY ERROR: Cannot admit patient. Maximum capacity of 74 beds reached. Allocation rejected.");
      return false;
    }
    
    try {
      const newPatient = {
        id: `P-${Date.now().toString().slice(-6)}`,
        name,
        status: 'Admitted',
        admissionDate: new Date().toISOString()
      };
      setPatients([...patients, newPatient]);
      return true;
    } catch (error) {
      // Edge case 6: Net fails after click save
      alert("NETWORK/STORAGE ERROR: Failed to save patient. Please try again.");
      return false;
    }
  };

  const recordTemperature = (patientId, temperature, observations, alarm) => {
    // Edge case 7: Incorrect timestamp. We enforce the system's exact current date.
    const systemDate = new Date().toISOString().split('T')[0];

    if (temperature === null || temperature === undefined || temperature === '' || isNaN(temperature)) {
      alert("EXCEPTION: Temperature value is missing or invalid.");
      return false;
    }

    const patient = patients.find(p => p.id === patientId);
    if (patient?.status === 'Deceased') {
      alert("EXCEPTION: Cannot record temperature for a deceased patient.");
      return false;
    }
    
    // Edge case 1: Nurse records temp, another nurse tries again 2 mins later
    const existingRecord = records.find(r => r.patientId === patientId && r.date === systemDate);
    if (existingRecord) {
      alert(`CONFLICT ERROR: A temperature of ${existingRecord.temperature}°C was already recorded today. Duplicate or conflicting entry blocked.`);
      return false;
    }

    try {
      const newRecord = {
        id: `R${Date.now()}`,
        patientId,
        date: systemDate,
        temperature: parseFloat(temperature),
        nurseObservations: observations,
        doctorVisited: false,
        doctorNotes: '',
        alarm: alarm
      };
      setRecords([...records, newRecord]);
      return true;
    } catch (error) {
      // Edge case 6: Net fails
      alert("NETWORK/STORAGE ERROR: Failed to save temperature reading. Please check connection.");
      return false;
    }
  };

  const doctorVisit = (recordId, notes, action) => {
    // Edge case 4: Nurse tries to discharge patient
    if ((action === 'discharge' || action === 'deceased') && currentUser !== 'doctor') {
      alert("PERMISSION ERROR: Only an authorized doctor can approve a discharge or mark as deceased.");
      return false;
    }

    const record = records.find(r => r.id === recordId);
    if (!record) return false;

    // Edge case 2: Doctor examines before nurse records temp
    // The UI hides patients without records, but we protect the API layer here:
    const systemDate = new Date().toISOString().split('T')[0];
    if (record.date !== systemDate) {
      alert("PROTOCOL ERROR: Cannot review patient. No temperature recorded by nurse for today.");
      return false;
    }

    // Edge case 5: Abnormal temp entered while discharge pending
    if (action === 'discharge') {
      if (record.temperature > 37.5 || record.alarm) {
        alert("CLINICAL ERROR: Cannot discharge patient. An abnormal temperature was just logged, invalidating the discharge criteria.");
        return false;
      }
    }

    try {
      setRecords(records.map(r => 
        r.id === recordId ? { ...r, doctorVisited: true, doctorNotes: notes, alarm: false } : r
      ));
      
      if (action === 'discharge' || action === 'deceased') {
        updatePatientStatus(record.patientId, action === 'discharge' ? 'Discharged' : 'Deceased');
      }
      return true;
    } catch (error) {
      // Edge case 6: Net fails
      alert("NETWORK/STORAGE ERROR: Failed to process clinical decision.");
      return false;
    }
  };

  const updatePatientStatus = (patientId, status) => {
    setPatients(patients.map(p => 
      p.id === patientId ? { ...p, status } : p
    ));
  };

  const value = {
    patients,
    records,
    currentUser,
    login,
    logout,
    addPatient,
    recordTemperature,
    doctorVisit,
    updatePatientStatus,
    capacity: 74
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export const useAppContext = () => useContext(AppContext);

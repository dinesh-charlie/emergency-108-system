import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from '../MapView';
import useWebSocket from '../useWebSocket';

const API_URL = 'http://localhost:8080/api/emergency';

function CallerPage() {
  const [sosActive, setSosActive]   = useState(false);
  const [status, setStatus]         = useState('Press the Emergency Button');
  const [location, setLocation]     = useState(null);
  const [eta, setEta]               = useState(null);
  const [driverInfo, setDriverInfo] = useState(null);
  const [callTime, setCallTime]     = useState(null);
  const [savedCall, setSavedCall]   = useState(null);
 const { ambulanceLocation, reached } = useWebSocket(sosActive, location);
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setLocation({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4)
        }),
        () => setLocation({ lat: '11.6643', lng: '78.1460' })
      );
    } else {
      setLocation({ lat: '11.6643', lng: '78.1460' });
    }
  }, []);

  const handleSOS = async () => {
    if (sosActive) {
      setSosActive(false);
      setStatus('Press the Emergency Button');
      setEta(null); setDriverInfo(null);
      setCallTime(null); setSavedCall(null);
      return;
    }
    setSosActive(true);
    setCallTime(new Date().toLocaleTimeString('ta-IN'));
    setStatus('📡 Emergency Message Sending...');
    try {
      const response = await axios.post(`${API_URL}/call`, {
        callerName: 'SOS User', callerPhone: '+91 90000 00000',
        emergencyType: 'OTHER',
        latitude: location?.lat || 11.6643,
        longitude: location?.lng || 78.1460,
        address: 'Salem, Tamil Nadu', callStatus: 'PENDING'
      });
      setSavedCall(response.data);
      setStatus('🚑 Ambulance Coming!');
      setEta(6);
      setDriverInfo({
        name: 'Rajesh Kumar', vehicle: 'TN-01-K-1234',
        phone: '+91 98400 12345', hospital: 'Salem Government Hospital'
      });
      setTimeout(() => { setStatus('✅ Help is Coming!'); setEta(4); }, 5000);
    } catch (error) {
      setStatus('❌ Connection error!');
      setSosActive(false);
    }
    if (reached) {
  setStatus('🏥 Ambulance Arrived!');
  setEta(0);
}
  };

  return (
    <div className="app-container">
      <div className="main-content">

        <div className="sos-section">
          <p className="sos-hint">
            {sosActive ? 'Cancel them agin Press the Button' : status}
          </p>
          <button
            className={`sos-btn ${sosActive ? 'sos-btn--calling' : ''}`}
            onClick={handleSOS}
          >
            <span className="sos-number">108</span>
            <span className="sos-label">{sosActive ? 'CALLING...' : 'SOS'}</span>
          </button>
          <div className={`status-box ${sosActive ? 'status-box--active' : ''}`}>
            <p className="status-text">{status}</p>
            {callTime && <p className="call-time">Call time: {callTime}</p>}
          </div>
        </div>

        <div className="card">
          <div className="card-header"><span>📍</span>
            <h2 className="card-title">Your Location</h2>
          </div>
          {location ? (
            <div className="location-info">
              <p className="location-address">Salem, Tamil Nadu</p>
              <p className="location-coords">{location.lat}° N, {location.lng}° E</p>
            </div>
          ) : <p className="loading-text">Fecthing the Location...</p>}
        </div>

        <MapView callerLocation={location} ambulanceLocation={ambulanceLocation} sosActive={sosActive} />

        {savedCall && (
          <div className="card card--blue">
            <div className="card-header"><span>🗄️</span>
              <h2 className="card-title">Database Saved!</h2>
            </div>
            <div className="driver-grid">
              <div className="driver-item">
                <span className="driver-label">Call ID</span>
                <span className="driver-value">#{savedCall.id}</span>
              </div>
              <div className="driver-item">
                <span className="driver-label">Status</span>
                <span className="driver-value">{savedCall.callStatus}</span>
              </div>
            </div>
          </div>
        )}

        {sosActive && driverInfo && (
          <div className="card card--green">
            <div className="card-header"><span>🚑</span>
              <h2 className="card-title">Ambulance coming</h2>
              {eta && <span className="eta-badge">ETA: {eta} min</span>}
            </div>
            <div className="driver-grid">
              <div className="driver-item"><span className="driver-label">Driver</span><span className="driver-value">{driverInfo.name}</span></div>
              <div className="driver-item"><span className="driver-label">Vehicle</span><span className="driver-value">{driverInfo.vehicle}</span></div>
              <div className="driver-item"><span className="driver-label">Phone</span><span className="driver-value">{driverInfo.phone}</span></div>
              <div className="driver-item"><span className="driver-label">Hospital</span><span className="driver-value">{driverInfo.hospital}</span></div>
            </div>
            <a href={`tel:${driverInfo.phone}`} className="call-btn">📞 call the Driver</a>
          </div>
        )}

        <div className="card">
          <div className="card-header"><span>💡</span><h2 className="card-title">Emergency Tips</h2></div>
          <ul className="tips-list">
            <li>Stay Calm</li>
            <li>Give Valid Location</li>
            <li>Don't Move Patient</li>
            <li>Ambulance on the Way,Stay Line</li>
          </ul>
        </div>

      </div>
    </div>
  );
}

export default CallerPage;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import MapView from '../MapView';

const API_URL = 'http://localhost:8080/api/emergency';

function DriverDashboard() {

  const [calls, setCalls]         = useState([]);
  const [activeCall, setActiveCall] = useState(null);
  const [driverLocation, setDriverLocation] = useState(null);
  const [status, setStatus]       = useState('AVAILABLE');

  // Driver GPS location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.watchPosition(
        (pos) => setDriverLocation({
          lat: pos.coords.latitude.toFixed(4),
          lng: pos.coords.longitude.toFixed(4)
        }),
        () => setDriverLocation({ lat: '11.6500', lng: '78.1300' })
      );
    }
  }, []);

  // Pending calls fetch 
  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000); 
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await axios.get(`${API_URL}/calls/pending`);
      setCalls(res.data);
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const acceptCall = async (call) => {
    try {
      await axios.put(`${API_URL}/call/${call.id}/dispatch`);
      setActiveCall(call);
      setStatus('ON_DUTY');
      fetchCalls();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  const completeCall = async () => {
    try {
      await axios.put(`${API_URL}/call/${activeCall.id}/complete`);
      setActiveCall(null);
      setStatus('AVAILABLE');
      fetchCalls();
    } catch (err) {
      console.error('Error:', err);
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">

        {/* Driver Info */}
        <div className="card">
          <div className="card-header">
            <span>🚑</span>
            <h2 className="card-title">Driver Dashboard</h2>
            <span className={`eta-badge ${status === 'AVAILABLE' ? '' : 'eta-badge--red'}`}>
              {status === 'AVAILABLE' ? '✅ Available' : '🚨 On Duty'}
            </span>
          </div>
          <div className="driver-grid">
            <div className="driver-item">
              <span className="driver-label">Driver</span>
              <span className="driver-value">Rajesh Kumar</span>
            </div>
            <div className="driver-item">
              <span className="driver-label">Vehicle</span>
              <span className="driver-value">TN-01-K-1234</span>
            </div>
            <div className="driver-item">
              <span className="driver-label">Location</span>
              <span className="driver-value">
                {driverLocation ? `${driverLocation.lat}° N` : 'Loading...'}
              </span>
            </div>
            <div className="driver-item">
              <span className="driver-label">Status</span>
              <span className="driver-value" style={{color: status === 'AVAILABLE' ? '#16a34a' : '#dc2626'}}>
                {status}
              </span>
            </div>
          </div>
        </div>

        {/* Active Call */}
        {activeCall && (
          <div className="card card--green">
            <div className="card-header">
              <span>🆘</span>
              <h2 className="card-title">Active Emergency</h2>
              <span className="eta-badge">#{activeCall.id}</span>
            </div>
            <div className="driver-grid">
              <div className="driver-item">
                <span className="driver-label">Caller</span>
                <span className="driver-value">{activeCall.callerName || 'SOS User'}</span>
              </div>
              <div className="driver-item">
                <span className="driver-label">Phone</span>
                <span className="driver-value">{activeCall.callerPhone}</span>
              </div>
              <div className="driver-item">
                <span className="driver-label">Type</span>
                <span className="driver-value">{activeCall.emergencyType}</span>
              </div>
              <div className="driver-item">
                <span className="driver-label">Address</span>
                <span className="driver-value">{activeCall.address}</span>
              </div>
            </div>

            {/* Map - Driver → Caller */}
            <div style={{marginTop:'12px'}}>
              <MapView
                callerLocation={{
                  lat: activeCall.latitude,
                  lng: activeCall.longitude
                }}
                ambulanceLocation={driverLocation}
                sosActive={true}
              />
            </div>

            <button className="call-btn" onClick={completeCall}
              style={{background:'#16a34a', marginTop:'8px'}}>
              ✅ complete the call
            </button>
          </div>
        )}

        {/* Pending Calls List */}
        <div className="card">
          <div className="card-header">
            <span>📋</span>
            <h2 className="card-title">Pending Calls</h2>
            <span className="eta-badge">{calls.length} calls</span>
          </div>

          {calls.length === 0 ? (
            <p className="loading-text">no Pending calls  ✅</p>
          ) : (
            calls.map(call => (
              <div key={call.id} style={{
                border: '1px solid #fee2e2', borderRadius: '10px',
                padding: '12px', marginBottom: '8px',
                background: '#fff5f5'
              }}>
                <div className="driver-grid">
                  <div className="driver-item">
                    <span className="driver-label">Call ID</span>
                    <span className="driver-value">#{call.id}</span>
                  </div>
                  <div className="driver-item">
                    <span className="driver-label">Type</span>
                    <span className="driver-value">{call.emergencyType}</span>
                  </div>
                  <div className="driver-item">
                    <span className="driver-label">Phone</span>
                    <span className="driver-value">{call.callerPhone}</span>
                  </div>
                  <div className="driver-item">
                    <span className="driver-label">Time</span>
                    <span className="driver-value" style={{fontSize:'12px'}}>
                      {new Date(call.calledAt).toLocaleTimeString('ta-IN')}
                    </span>
                  </div>
                </div>
                <button
                  className="call-btn"
                  onClick={() => acceptCall(call)}
                  style={{marginTop:'8px'}}
                  disabled={status === 'ON_DUTY'}
                >
                  🚑 Accept 
                </button>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

export default DriverDashboard;
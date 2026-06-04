import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API_URL = 'http://localhost:8080/api/emergency';

function DispatcherPanel() {

  const [calls, setCalls]   = useState([]);
  const [stats, setStats]   = useState({
    total: 0, pending: 0, dispatched: 0, completed: 0
  });
  const [loading, setLoading] = useState(true);

  // 5 sec refresh
  useEffect(() => {
    fetchCalls();
    const interval = setInterval(fetchCalls, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchCalls = async () => {
    try {
      const res = await axios.get(`${API_URL}/calls`);
      const data = res.data;
      setCalls(data);

      
      setStats({
        total:      data.length,
        pending:    data.filter(c => c.callStatus === 'PENDING').length,
        dispatched: data.filter(c => c.callStatus === 'DISPATCHED').length,
        completed:  data.filter(c => c.callStatus === 'COMPLETED').length,
      });
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setLoading(false);
    }
  };

  const dispatchCall = async (id) => {
    try {
      await axios.put(`${API_URL}/call/${id}/dispatch`);
      fetchCalls();
    } catch (err) { console.error(err); }
  };

  const completeCall = async (id) => {
    try {
      await axios.put(`${API_URL}/call/${id}/complete`);
      fetchCalls();
    } catch (err) { console.error(err); }
  };

  // Status color
  const getStatusColor = (status) => {
    switch(status) {
      case 'PENDING':    return { bg: '#fef9c3', color: '#854d0e', border: '#fde047' };
      case 'DISPATCHED': return { bg: '#dbeafe', color: '#1e40af', border: '#93c5fd' };
      case 'ARRIVED':    return { bg: '#dcfce7', color: '#166534', border: '#86efac' };
      case 'COMPLETED':  return { bg: '#f0fdf4', color: '#15803d', border: '#bbf7d0' };
      case 'CANCELLED':  return { bg: '#f1f5f9', color: '#64748b', border: '#cbd5e1' };
      default:           return { bg: '#f8fafc', color: '#334155', border: '#e2e8f0' };
    }
  };

  return (
    <div className="app-container">
      <div className="main-content">

        {/* Stats Cards */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '10px', marginBottom: '4px'
        }}>
          <div className="card" style={{textAlign:'center', background:'#fff5f5', border:'1px solid #fecaca'}}>
            <div style={{fontSize:'28px', fontWeight:'800', color:'#dc2626'}}>{stats.total}</div>
            <div style={{fontSize:'12px', color:'#888', fontWeight:'600'}}>TOTAL CALLS</div>
          </div>
          <div className="card" style={{textAlign:'center', background:'#fefce8', border:'1px solid #fde047'}}>
            <div style={{fontSize:'28px', fontWeight:'800', color:'#ca8a04'}}>{stats.pending}</div>
            <div style={{fontSize:'12px', color:'#888', fontWeight:'600'}}>PENDING</div>
          </div>
          <div className="card" style={{textAlign:'center', background:'#eff6ff', border:'1px solid #93c5fd'}}>
            <div style={{fontSize:'28px', fontWeight:'800', color:'#2563eb'}}>{stats.dispatched}</div>
            <div style={{fontSize:'12px', color:'#888', fontWeight:'600'}}>DISPATCHED</div>
          </div>
          <div className="card" style={{textAlign:'center', background:'#f0fdf4', border:'1px solid #86efac'}}>
            <div style={{fontSize:'28px', fontWeight:'800', color:'#16a34a'}}>{stats.completed}</div>
            <div style={{fontSize:'12px', color:'#888', fontWeight:'600'}}>COMPLETED</div>
          </div>
        </div>

        {/* All Calls */}
        <div className="card">
          <div className="card-header">
            <span>📋</span>
            <h2 className="card-title">All Emergency Calls</h2>
            <span className="eta-badge">{stats.total} total</span>
          </div>

          {loading && <p className="loading-text">Loading...</p>}

          {!loading && calls.length === 0 && (
            <p className="loading-text">No call ✅</p>
          )}

          {calls.map(call => {
            const sc = getStatusColor(call.callStatus);
            return (
              <div key={call.id} style={{
                border: `1px solid ${sc.border}`,
                borderRadius: '12px', padding: '12px',
                marginBottom: '10px', background: sc.bg
              }}>
                {/* Call Header */}
                <div style={{
                  display: 'flex', justifyContent: 'space-between',
                  marginBottom: '8px', alignItems: 'center'
                }}>
                  <span style={{fontSize:'15px', fontWeight:'700'}}>
                    🆘 Call #{call.id}
                  </span>
                  <span style={{
                    fontSize: '11px', fontWeight: '700',
                    padding: '3px 10px', borderRadius: '20px',
                    background: sc.border, color: sc.color
                  }}>
                    {call.callStatus}
                  </span>
                </div>

                {/* Call Details */}
                <div className="driver-grid">
                  <div className="driver-item">
                    <span className="driver-label">Phone</span>
                    <span className="driver-value" style={{fontSize:'13px'}}>
                      {call.callerPhone}
                    </span>
                  </div>
                  <div className="driver-item">
                    <span className="driver-label">Type</span>
                    <span className="driver-value" style={{fontSize:'13px'}}>
                      {call.emergencyType}
                    </span>
                  </div>
                  <div className="driver-item">
                    <span className="driver-label">Location</span>
                    <span className="driver-value" style={{fontSize:'12px'}}>
                      {call.latitude?.toFixed(3)}° N
                    </span>
                  </div>
                  <div className="driver-item">
                    <span className="driver-label">Time</span>
                    <span className="driver-value" style={{fontSize:'12px'}}>
                      {call.calledAt
                        ? new Date(call.calledAt).toLocaleTimeString('ta-IN')
                        : '-'}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div style={{display:'flex', gap:'8px', marginTop:'10px'}}>
                  {call.callStatus === 'PENDING' && (
                    <button
                      className="call-btn"
                      onClick={() => dispatchCall(call.id)}
                      style={{flex:1, padding:'8px', fontSize:'13px'}}
                    >
                      🚑 Dispatched
                    </button>
                  )}
                  {call.callStatus === 'DISPATCHED' && (
                    <button
                      className="call-btn"
                      onClick={() => completeCall(call.id)}
                      style={{
                        flex:1, padding:'8px',
                        fontSize:'13px', background:'#16a34a'
                      }}
                    >
                      ✅ Completed
                    </button>
                  )}
                  {(call.callStatus === 'COMPLETED' ||
                    call.callStatus === 'CANCELLED') && (
                    <span style={{
                      fontSize:'13px', color:'#888',
                      padding:'8px'
                    }}>
                      {call.callStatus === 'COMPLETED' ? '✅ Done' : '❌ Cancelled'}
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}

export default DispatcherPanel;
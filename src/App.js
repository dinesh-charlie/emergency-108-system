import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import DriverDashboard from './pages/DriverDashboard';
import CallerPage from './pages/CallerPage';
import DispatcherPanel from './pages/DispatcherPanel';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <nav className="nav-bar">
        <span className="nav-logo">🚨 108 Emergency</span>
        <div className="nav-links">
          <Link to="/" className="nav-link">📱 Caller</Link>
          <Link to="/driver" className="nav-link">🚑 Driver</Link>
        <Link to="/dispatcher" className="nav-link">🎛️ Dispatch</Link>
        </div>
      </nav>
      <Routes>
        <Route path="/" element={<CallerPage />} />
        <Route path="/driver" element={<DriverDashboard />} />
        <Route path="/dispatcher" element={<DispatcherPanel />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
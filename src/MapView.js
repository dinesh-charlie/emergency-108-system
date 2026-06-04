import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const callerIcon = new L.Icon({
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34],
});

const ambulanceIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  iconSize: [30, 46], iconAnchor: [15, 46], popupAnchor: [1, -34],
});

function getDistance(pos1, pos2) {
  const R = 6371;
  const dLat = (pos2[0] - pos1[0]) * Math.PI / 180;
  const dLng = (pos2[1] - pos1[1]) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(pos1[0] * Math.PI/180) *
    Math.cos(pos2[0] * Math.PI/180) *
    Math.sin(dLng/2) * Math.sin(dLng/2);
  return (R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))).toFixed(1);
}

function MapView({ callerLocation, ambulanceLocation, sosActive }) {

  const defaultPos    = [11.6643, 78.1460];
  const mapRef        = useRef(null);
  const ambMarkerRef  = useRef(null);
  const routeRef      = useRef(null);
  const fittedRef     = useRef(false);

  const callerPos = callerLocation
    ? [parseFloat(callerLocation.lat), parseFloat(callerLocation.lng)]
    : defaultPos;

  const ambPos = ambulanceLocation
    ? [parseFloat(ambulanceLocation.lat), parseFloat(ambulanceLocation.lng)]
    : null;

  // ✅ Ambulance marker smooth move — map zoom reset
  useEffect(() => {
    if (!ambPos) {
      fittedRef.current = false;
      return;
    }

    // First time மட்டும் fitBounds
    if (mapRef.current && !fittedRef.current) {
      const bounds = L.latLngBounds([callerPos, ambPos]);
      mapRef.current.fitBounds(bounds, { padding: [60, 60] });
      fittedRef.current = true;
    }

    // Marker smooth move
    if (ambMarkerRef.current) {
      ambMarkerRef.current.setLatLng(ambPos);
    }

    // Route update
    if (routeRef.current) {
      routeRef.current.setLatLngs([ambPos, callerPos]);
    }

  }, [ambulanceLocation]); // eslint-disable-line

  return (
    <div style={{ marginBottom: '16px' }}>

      <div style={{
        display: 'flex', alignItems: 'center',
        gap: '8px', fontSize: '15px',
        fontWeight: '700', marginBottom: '8px'
      }}>
        <span>🗺️</span>
        <span>Live Location Map</span>
        {sosActive && (
          <span style={{
            background: '#fee2e2', color: '#dc2626',
            fontSize: '11px', fontWeight: '700',
            padding: '2px 8px', borderRadius: '20px'
          }}>● LIVE</span>
        )}
      </div>

      <MapContainer
        center={callerPos}
        zoom={14}
        ref={mapRef}
        style={{
          height: '300px', width: '100%',
          borderRadius: '12px', border: '1px solid #e9ecef'
        }}
      >
        <TileLayer
          attribution='© OpenStreetMap'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* Caller Marker */}
        <Marker position={callerPos} icon={callerIcon}>
          <Popup>
            <b>🆘Your Location!</b><br />
            {callerPos[0].toFixed(4)}° N, {callerPos[1].toFixed(4)}° E
          </Popup>
        </Marker>

        {/* Ambulance Marker — ✅  */}
        {sosActive && ambPos && (
          <Marker
            position={ambPos}
            icon={ambulanceIcon}
            ref={ambMarkerRef}
          >
            <Popup>
              <b>🚑 Ambulance!</b><br />
              TN-01-K-1234
            </Popup>
          </Marker>
        )}

        {/* Route Line — ✅  */}
        {sosActive && ambPos && (
          <Polyline
            positions={[ambPos, callerPos]}
            ref={routeRef}
            pathOptions={{
              color: '#e74c3c', weight: 4,
              opacity: 0.8, dashArray: '10, 8'
            }}
          />
        )}

      </MapContainer>

      {/* Distance Bar */}
      {sosActive && ambPos && (
        <div style={{
          display: 'flex', justifyContent: 'space-between',
          marginTop: '8px', padding: '8px 12px',
          background: '#f0fdf4', borderRadius: '10px',
          border: '1px solid #86efac'
        }}>
          <span style={{ fontSize: '13px', color: '#555' }}>
            📍 Your ←----→ 🚑 Ambulance
          </span>
          <span style={{ fontSize: '13px', fontWeight: '700', color: '#16a34a' }}>
            {getDistance(callerPos, ambPos)} km
          </span>
        </div>
      )}

      <div style={{
        display: 'flex', gap: '16px',
        marginTop: '6px', fontSize: '13px', color: '#555'
      }}>
        <span>📍 Your</span>
        {sosActive && ambPos && <span>🟢 Ambulance</span>}
        {sosActive && ambPos && <span style={{color:'red'}}>- - Route</span>}
      </div>

    </div>
  );
}

export default MapView;
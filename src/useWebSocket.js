import { useState, useEffect } from 'react';

function useWebSocket(sosActive, callerLocation) {

  const [ambulanceLocation, setAmbulanceLocation] = useState(null);
  const [reached, setReached] = useState(false);

  useEffect(() => {

    if (!sosActive || !callerLocation) {
      setAmbulanceLocation(null);
      setReached(false);
      return;
    }

    // Caller location
    const targetLat = parseFloat(callerLocation.lat);
    const targetLng = parseFloat(callerLocation.lng);

    // Ambulance start — caller
    let ambLat = targetLat - 0.05;
    let ambLng = targetLng - 0.05;

    // Initial position set
    setAmbulanceLocation({
      lat: ambLat.toFixed(4),
      lng: ambLng.toFixed(4)
    });

    const interval = setInterval(() => {

      // Target
      const step = 0.008;
      const diffLat = targetLat - ambLat;
      const diffLng = targetLng - ambLng;
      const distance = Math.sqrt(diffLat * diffLat + diffLng * diffLng);

      // ✅ Reached check — 0.002 distance stop
      if (distance < 0.002) {
        setAmbulanceLocation({
          lat: targetLat.toFixed(4),
          lng: targetLng.toFixed(4)
        });
        setReached(true);
        clearInterval(interval);
        return;
      }

      // Direction calculate move
      ambLat += (diffLat / distance) * step;
      ambLng += (diffLng / distance) * step;

      setAmbulanceLocation({
        lat: ambLat.toFixed(4),
        lng: ambLng.toFixed(4)
      });

    }, 1000); // 1  move

    return () => clearInterval(interval);

  }, [sosActive, callerLocation]); // eslint-disable-line

  return { ambulanceLocation, reached };
}

export default useWebSocket;
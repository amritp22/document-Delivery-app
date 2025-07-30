import { useEffect } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const useAgentLocationTracking = (requestId, agentId, shouldTrack) => {
  useEffect(() => {
    if (!shouldTrack || !agentId || !requestId) return;

    const socket = new SockJS('http://localhost:8080/ws-location');
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
    });

    let watchId = null;

    client.onConnect = () => {
      console.log('Connected for live location tracking');

      watchId = navigator.geolocation.watchPosition(
        (position) => {
          const locationPayload = {
            requestId,
            agentId,
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          };
          client.publish({
            destination: '/app/location',
            body: JSON.stringify(locationPayload),
          });
          console.log('real location sent:', locationPayload);
        },
        (error) => {
          console.error('Location error:', error);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 10000,
          timeout: 20000,
        }
      );
    };

    client.activate();

    // ✅ Proper cleanup
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
      client.deactivate();
    };
  }, [requestId, agentId, shouldTrack]);
};

export default useAgentLocationTracking;

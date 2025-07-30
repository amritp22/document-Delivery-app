import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Polyline, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

// // 🚲 Bike icon for agent
const bikeIcon = L.divIcon({
  className: 'custom-bike-icon',
  html: `<img src="https://cdn-icons-png.flaticon.com/512/9638/9638592.png" style="width:35px; transform: rotate(90deg);" />`,
  iconSize: [35, 35],
  iconAnchor: [17, 35],
});



// 📍 Destination icon
const destinationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/854/854878.png',
  iconSize: [30, 30],
});

// Helper to convert to [lat, lng]
const toLatLng = (location) =>
  location.latitude && location.longitude ? [location.latitude, location.longitude] : null;

// Fit map to show both markers
const FitMapToBounds = ({ agentPos, destinationPos }) => {
  const map = useMap();

  useEffect(() => {
    if (agentPos && destinationPos) {
      const bounds = L.latLngBounds([agentPos, destinationPos]);
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [agentPos, destinationPos, map]);

  return null;
};
const LiveTracking = ({ agentId, destination }) => {
// const LiveTracking = () => {
  // const [agentLocation, setAgentLocation] = useState({
  //   latitude: 19.2643072,
  //   longitude: 72.974336, // Start
  // });

  // const destination = {
  //   latitude: 19.218330,
  //   longitude: 72.978088, // End
  // };

  const [agentLocation, setAgentLocation] = useState({ latitude: null, longitude: null });
  const markerRef = useRef(null);

    // Connect to WebSocket and subscribe to agent's location updates
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws-location'); // Your backend WebSocket URL
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');
        client.subscribe(`/topic/location/${agentId}`, (message) => {
          const data = JSON.parse(message.body);
          console.log('Received location:', data);

          // Update agent location state
          setAgentLocation({ latitude: data.latitude, longitude: data.longitude });
        });
      },
    });

    client.activate();

    return () => {
      if (client && client.active) client.deactivate();
    };
  }, [agentId]);

  const agentPos = toLatLng(agentLocation);
  const destinationPos = toLatLng(destination);
  
  // Simulate movement toward destination
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     setAgentLocation((prev) => {
  //       const step = 0.0005;

  //       const latReached = Math.abs(prev.latitude - destination.latitude) < step;
  //       const lngReached = Math.abs(prev.longitude - destination.longitude) < step;

  //       if (latReached && lngReached) {
  //         clearInterval(interval);
  //         return prev;
  //       }

  //       return {
  //         latitude: prev.latitude > destination.latitude ? prev.latitude - step : prev.latitude + step,
  //         longitude: prev.longitude > destination.longitude ? prev.longitude - step : prev.longitude + step,
  //       };
  //     });
  //   }, 2000);

  //   return () => clearInterval(interval);
  // }, [destination]);

  // Update marker smoothly
  useEffect(() => {
    if (markerRef.current && agentPos) {
      markerRef.current.setLatLng(agentPos);
    }
  }, [agentPos]);

  return (
    <div className="p-4 border rounded shadow bg-white" style={{ height: '70vh' }}>
      <h2 className="text-xl font-semibold mb-3">Live Agent Tracking</h2>
      {agentPos ? (
        <MapContainer
          center={agentPos}
          zoom={15}
          scrollWheelZoom={true}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />

          {/* Auto-zoom to include agent and destination */}
          <FitMapToBounds agentPos={agentPos} destinationPos={destinationPos} />

          {/* 🧍‍♂️ Agent marker with bike icon */}
          <Marker position={agentPos} icon={bikeIcon} ref={markerRef} />

          {/* 📍 Destination marker */}
          {destinationPos && <Marker position={destinationPos} icon={destinationIcon} />}

          {/* Route line */}
          {agentPos && destinationPos && (
            <Polyline positions={[agentPos, destinationPos]} color="blue" />
          )}
        </MapContainer>
      ) : (
        <p>Waiting for agent location updates...</p>
      )}
    </div>
  );
};

export default LiveTracking;

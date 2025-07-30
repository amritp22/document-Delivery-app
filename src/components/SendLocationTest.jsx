import React from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';

const SendLocationTest = () => {
  const sendTestLocation = () => {
    const socket = new SockJS('http://localhost:8080/ws-location');
    const client = new Client({
      webSocketFactory: () => socket,
      debug: (str) => console.log(str),
      reconnectDelay: 5000,
      onConnect: () => {
        console.log('Connected to WebSocket');

        const testLocation = {
          agentId: 3, // Replace later with dynamic ID
          latitude: 25.0760,
          longitude: 66.8777,
          requestId: 23
        };

        client.publish({
          destination: '/app/location',
          body: JSON.stringify(testLocation),
        });

        console.log('Test location sent:', testLocation);

        // Disconnect to clean up socket
        setTimeout(() => client.deactivate(), 2000);
      },
    });

    client.activate();
  };

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">Test Agent Location Sender</h2>
      <button
        onClick={sendTestLocation}
        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
      >
        Send Test Location
      </button>
      <p className="mt-4 text-gray-500">This will simulate a live location update for agent ID 3.</p>
    </div>
  );
};

export default SendLocationTest;

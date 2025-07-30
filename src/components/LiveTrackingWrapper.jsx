// src/components/LiveTrackingWrapper.jsx
import React from 'react';
import { useParams,useLocation } from 'react-router-dom';
import LiveTracking from './LiveTracking';

const LiveTrackingWrapper = () => {
  const location = useLocation();// Accesses navigation state passed from naivgate in user delivery request
  const destination = location.state?.destination; // contains { latitude, longitude }
  const { agentId } = useParams();           // grabs :agentId from the URL
  return <LiveTracking agentId={Number(agentId)} destination={destination}/>;
};

export default LiveTrackingWrapper;

import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Polyline,useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useAuth } from "./AuthContext";

const toRad = (value) => (value * Math.PI) / 180;

// Haversine formula to calculate distance between two lat-lon points
const haversineDistance = ([lat1, lon1], [lat2, lon2]) => {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c; // Distance in km
};

const DeliveryRequestForm = () => {
  const { auth } = useAuth();

  const [pickup, setPickup] = useState("");
  const [drop, setDrop] = useState("");
  const [pickupCoords, setPickupCoords] = useState(null);
  const [dropCoords, setDropCoords] = useState(null);
  const [distance, setDistance] = useState(null);
  const [senderName, setSenderName] = useState("");
  const [receiverName, setReceiverName] = useState("");
  const [senderPhone, setSenderPhone] = useState("");
  const [receiverPhone, setReceiverPhone] = useState("");
  const [weight, setWeight] = useState("");
  const [cost, setCost] = useState(null);

  const [pickupSuggestions, setPickupSuggestions] = useState([]);
  const [dropSuggestions, setDropSuggestions] = useState([]);

  // Track if a location has been selected to disable suggestions display
  const [pickupSelected, setPickupSelected] = useState(false);
  const [dropSelected, setDropSelected] = useState(false);

  const calculateCost = (dist, weightCategory) => {
    let ratePerKm = 6; // base rate
    let multiplier = 1;
  
    if (weightCategory === "<1kg") multiplier = 1;
    else if (weightCategory === "1-5kg") multiplier = 1.5;
    else if (weightCategory === ">5kg") multiplier = 2;
  
    return (dist * ratePerKm * multiplier).toFixed(2);
  };
  
  const fetchSuggestions = async (query, setter) => {
    if (!query) {
      setter([]);
      return;
    }
    try {
      const res = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: query,
          format: "json",
          addressdetails: 1,
          limit: 5,
        },
      });
      setter(res.data);
    } catch (err) {
      console.error("Suggestion fetch failed", err);
    }
  };

  const handlePickupChange = (e) => {
    const value = e.target.value;
    setPickup(value);
    setPickupSelected(false);
    fetchSuggestions(value, setPickupSuggestions);
  };

  const handleDropChange = (e) => {
    const value = e.target.value;
    setDrop(value);
    setDropSelected(false);
    fetchSuggestions(value, setDropSuggestions);
  };

  const MapBoundsAdjuster = ({ pickupCoords, dropCoords }) => {
    const map = useMap();
  
    useEffect(() => {
      if (pickupCoords && dropCoords) {
        const bounds = [pickupCoords, dropCoords];
        map.fitBounds(bounds, { padding: [50, 50] }); // Add some padding so markers are not at edges
      }
    }, [pickupCoords, dropCoords, map]);
  
    return null;
  };
  // Calculate distance using Haversine formula when coords change
  useEffect(() => {
    if (pickupCoords && dropCoords) {
      const dist = haversineDistance(pickupCoords, dropCoords);
      setDistance(dist.toFixed(2));
    } else {
      setDistance(null);
    }
  }, [pickupCoords, dropCoords]);
    // calculating the cost
    useEffect(() => {
      if (distance && weight) {
        const deliveryCost = calculateCost(distance, weight);
        setCost(deliveryCost);
      }
    }, [distance, weight]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      pickupLocation: pickup,
      dropLocation: drop,
      distanceInKm: distance,
      cost: cost,
      senderName,
      receiverName,
      senderPhone,
      receiverPhone,
      weight,
    };
    try {
      const res = await axios.post(`http://localhost:8080/api/deliveries/create/${auth.userId}`, payload);
      alert("Delivery request submitted!");
    } catch (err) {
      console.error(err);
      alert("Error submitting request");
    }
  };

  return (
    <div className="container mt-5">
      <div className="card shadow p-4">
        <h3 className="text-center mb-4">City Courier Delivery Request</h3>
        <form onSubmit={handleSubmit}>
          <div className="row">
            {/* Sender and receiver fields */}
            <div className="col-md-6 mb-3">
              <label>Sender Name</label>
              <input
                className="form-control"
                value={senderName}
                onChange={(e) => setSenderName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Sender Phone</label>
              <input
                className="form-control"
                value={senderPhone}
                onChange={(e) => setSenderPhone(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Receiver Name</label>
              <input
                className="form-control"
                value={receiverName}
                onChange={(e) => setReceiverName(e.target.value)}
                required
              />
            </div>
            <div className="col-md-6 mb-3">
              <label>Receiver Phone</label>
              <input
                className="form-control"
                value={receiverPhone}
                onChange={(e) => setReceiverPhone(e.target.value)}
                required
              />
            </div>

            {/* Pickup Location */}
            <div className="col-md-6 mb-3 position-relative">
              <label>Pickup Location</label>
              <input
                className="form-control"
                value={pickup}
                onChange={handlePickupChange}
                required
                autoComplete="off"
              />
              {!pickupSelected && pickupSuggestions.length > 0 && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                  {pickupSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setPickup(item.display_name);
                        setPickupCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                        setPickupSuggestions([]);
                        setPickupSelected(true);
                      }}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Drop Location */}
            <div className="col-md-6 mb-3 position-relative">
              <label>Drop Location</label>
              <input
                className="form-control"
                value={drop}
                onChange={handleDropChange}
                required
                autoComplete="off"
              />
              {!dropSelected && dropSuggestions.length > 0 && (
                <ul className="list-group position-absolute w-100" style={{ zIndex: 1000 }}>
                  {dropSuggestions.map((item, idx) => (
                    <li
                      key={idx}
                      className="list-group-item list-group-item-action"
                      onClick={() => {
                        setDrop(item.display_name);
                        setDropCoords([parseFloat(item.lat), parseFloat(item.lon)]);
                        setDropSuggestions([]);
                        setDropSelected(true);
                      }}
                    >
                      {item.display_name}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Weight Dropdown */}
            <div className="col-md-6 mb-3">
              <label>Item Weight</label>
              <select
                className="form-control"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                required
              >
                <option value="">Select</option>
                <option value="<1kg">Less than 1kg</option>
                <option value="1-5kg">1-5kg</option>
                <option value=">5kg">More than 5kg</option>
              </select>
            </div>
          </div>

          {distance && (
            <div className="alert alert-info">
              Estimated Distance: <strong>{distance} km</strong>
            </div>
          )}
          {cost && (
            <div className="alert alert-success">
              Estimated Delivery Cost: <strong>₹{cost}</strong>
            </div>
          )}

            {pickupCoords && dropCoords && (
              <MapContainer center={pickupCoords} zoom={13} style={{ height: "300px", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution="&copy; OpenStreetMap contributors"
                />
                <Marker position={pickupCoords} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41] })} />
                <Marker position={dropCoords} icon={L.icon({ iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png", iconSize: [25, 41] })} />
                <Polyline positions={[pickupCoords, dropCoords]} color="blue" />
                <MapBoundsAdjuster pickupCoords={pickupCoords} dropCoords={dropCoords} />
              </MapContainer>
            )}

          {/* {pickupCoords && dropCoords && (
            <MapContainer center={pickupCoords} zoom={13} style={{ height: "300px", width: "100%" }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap contributors"
              />
              <Marker
                position={pickupCoords}
                icon={L.icon({
                  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconSize: [25, 41],
                })}
              />
              <Marker
                position={dropCoords}
                icon={L.icon({
                  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
                  iconSize: [25, 41],
                })}
              />
              <Polyline positions={[pickupCoords, dropCoords]} color="blue" />
            </MapContainer>
          )} */}

          <div className="text-center mt-4">
            <button type="submit" className="btn btn-primary">
              Submit Delivery Request
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default DeliveryRequestForm;

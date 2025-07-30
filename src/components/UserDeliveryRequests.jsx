import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function UserDeliveryRequests() {
  const [requests, setRequests] = useState([]);
  const userId = localStorage.getItem("userId");
  const navigate = useNavigate();
  
  //live chat using GenAi
  const [chatOrder, setChatOrder] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");


  // Fetch all delivery requests for the user
  useEffect(() => {
    axios
      .get(`http://localhost:8080/api/deliveries/user/${userId}/requests`)
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Error fetching user requests", err));
  }, [userId]);

  // Helper function to convert drop address to coordinates using Nominatim
  const getCoordinatesFromAddress = async (address) => {
    try {
      const response = await axios.get("https://nominatim.openstreetmap.org/search", {
        params: {
          q: address,
          format: "json",
          limit: 1,
        },
        headers: {
          'Accept-Language': 'en',
        },
      });

      if (response.data.length > 0) {
        const { lat, lon } = response.data[0];
        return { latitude: parseFloat(lat), longitude: parseFloat(lon) };
      } else {
        throw new Error("No coordinates found for address");
      }
    } catch (error) {
      console.error("Geocoding error:", error);
      return null;
    }
  };

  // Handle Track Live button click
  const handleTrackClick = async (agentId, dropLocation) => {
    const coordinates = await getCoordinatesFromAddress(dropLocation);
    if (coordinates) {
      navigate(`/track/${agentId}`, {
        state: { destination: coordinates },
      });
    } else {
      alert("Unable to get drop location coordinates");
    }
  };
  const openChat = (order) => {
  setChatOrder(order);
  setChatMessages([]); // reset chat
  setChatInput("");
  };

  const sendChatMessage = async () => {
  if (!chatInput.trim()) return;

  const newMessages = [...chatMessages, { from: "user", text: chatInput }];

  try {
    const res = await axios.post(
      `http://localhost:8080/api/genai/chat?message=${encodeURIComponent(chatInput)}&orderId=${chatOrder.id}`
    );

    const aiReply = res.data;
    newMessages.push({ from: "bot", text: aiReply });
  } catch (err) {
    newMessages.push({ from: "bot", text: "Error getting reply." });
  }

  setChatMessages(newMessages);
  setChatInput("");
};



  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📦 My Delivery Requests</h2>
      <div className="table-responsive">
        <table className="table table-bordered table-hover">
          <thead className="table-dark">
            <tr>
              <th>ID</th>
              <th>Pickup</th>
              <th>Drop</th>
              <th>Weight</th>
              <th>Cost</th>
              <th>Status</th>
              <th>Assigned Agent</th>
              <th>Live Tracking</th>
              <th>Chat</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr key={req.id}>
                <td>{req.id}</td>
                <td>{req.pickupLocation}</td>
                <td>{req.dropLocation}</td>
                <td>{req.weight}</td>
                <td>₹{req.cost}</td>
                <td>
                  <span className={`badge bg-${
                    req.status === 'PENDING' ? 'warning' :
                    req.status === 'ASSIGNED' ? 'info' : 'success'
                  }`}>
                    {req.status}
                  </span>
                </td>
                <td>{req.assignedAgent ? req.assignedAgent.name : "Not Assigned"}</td>
                <td>
                  {req.status === 'IN_TRANSIT' ? (
                    <button
                      className="btn btn-sm btn-primary"
                      onClick={() => handleTrackClick(req.assignedAgent.id, req.dropLocation)}
                    >
                      Track Live
                    </button>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
                <td>
                  {req.status === 'IN_TRANSIT' ? (
                    <button
                      className="btn btn-sm btn-outline-secondary"
                      onClick={() => openChat(req)}
                    >
                      Chat
                    </button>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
            {requests.length === 0 && (
              <tr>
                <td colSpan="8" className="text-center text-muted py-4">
                  You haven't placed any delivery requests yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
              {chatOrder && (
          <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Chat About Order #{chatOrder.id}</h5>
                  <button type="button" className="btn-close" onClick={() => setChatOrder(null)}></button>
                </div>
                <div className="modal-body" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                  {chatMessages.map((msg, i) => (
                    <div key={i} className={`mb-2 text-${msg.from === 'user' ? 'end' : 'start'}`}>
                      <span className={`badge bg-${msg.from === 'user' ? 'primary' : 'success'}`}>
                        {msg.text}
                      </span>
                    </div>
                  ))}
                </div>
                <div className="modal-footer">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendChatMessage()}
                  />
                  <button className="btn btn-primary" onClick={sendChatMessage}>
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

    </div>
  );
}

export default UserDeliveryRequests;

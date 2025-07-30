import axios from "axios";
import { useEffect, useState } from "react";
import useAgentLocationTracking from "./useAgentLocationTracking";


function AssignedRequests() {
  const [assignedRequests, setAssignedRequests] = useState([]);
  const [statusUpdate, setStatusUpdate] = useState({});
  const [shouldTrack, setShouldTrack] = useState(false); // New state
  const [reqIdTransit, setreqIdTransit] = useState(-1);
  const agentId = localStorage.getItem("userId");

  useEffect(() => {
    axios.get(`http://localhost:8080/api/deliveries/assigned/${agentId}`)
      .then((res) => setAssignedRequests(res.data))
      .catch((err) => console.error("Failed to fetch assigned requests", err));
  }, [agentId]);

  // 🛰️ Location tracking hook
  useAgentLocationTracking(reqIdTransit,agentId, shouldTrack);

  const handleStatusChange = (requestId, newStatus) => {
    setStatusUpdate({ ...statusUpdate, [requestId]: newStatus });
  };

  const updateStatus = async (requestId) => {
    const status = statusUpdate[requestId];
    if (!status) {
      alert("Please select a status");
      return;
    }

    try {
      await axios.put(`http://localhost:8080/api/deliveries/${requestId}/status?status=${status}`);
      alert("Status updated successfully");

      setAssignedRequests((prev) =>
        prev.map((req) =>
          req.id === requestId ? { ...req, status } : req
        )
      );

      // 🚀 Start tracking if status is IN_TRANSIT
      if (status === "IN_TRANSIT") {
        setShouldTrack(true);
        setreqIdTransit(requestId);

      }

    } catch (err) {
      console.error("Status update failed", err);
      alert("Failed to update status");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📦 Assigned Delivery Requests</h2>
      <div className="table-responsive">
        <table className="table table-striped table-bordered">
          <thead className="table-dark">
            <tr>
              <th>Sender Phone no</th>
              <th>Pickup</th>
              <th>Reciever Phone no</th>
              <th>Drop</th>
              <th>Weight</th>
              <th>Status</th>
              <th>Change Status</th>
            </tr>
          </thead>
          <tbody>
            {assignedRequests.map((req) => (
              <tr key={req.id}>
                <td>{req.senderPhone}</td>
                <td>{req.pickupLocation}</td>
                <td>{req.receiverPhone}</td>
                <td>{req.dropLocation}</td>
                <td>{req.weight} kg</td>
                <td><span className={`badge bg-${
                    req.status === 'PENDING' ? 'warning' :
                    req.status === 'ASSIGNED' ? 'info' : 'success'
                  }`}>{req.status}</span></td>
                <td>
                  <div className="d-flex flex-column flex-md-row align-items-md-center">
                    <select
                      className="form-select me-2 mb-2 mb-md-0"
                      value={statusUpdate[req.id] || ""}
                      onChange={(e) =>
                        handleStatusChange(req.id, e.target.value)
                      }
                    >
                      <option value="">-- Select Status --</option>
                      <option value="PICKED_UP">Picked</option>
                      <option value="IN_TRANSIT">On the Way</option>
                      <option value="DELIVERED">Delivered</option>
                    </select>
                    <button
                      onClick={() => updateStatus(req.id)}
                      className="btn btn-success"
                    >
                      Update
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {assignedRequests.length === 0 && (
              <tr>
                <td colSpan="7" className="text-center text-muted py-4">
                  No assigned requests.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AssignedRequests;

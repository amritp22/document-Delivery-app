import axios from "axios";
import { useEffect, useState } from "react";

function PendingRequests() {
  const [requests, setRequests] = useState([]);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    axios
      .get("http://localhost:8080/api/deliveries/pending")
      .then((res) => setRequests(res.data))
      .catch((err) => console.error("Failed to fetch pending requests", err));
  }, []);

  const handleAssign = async (requestId) => {
    try {
      await axios.put(
        `http://localhost:8080/api/deliveries/assign/${requestId}/agent/${userId}`
        // , {
        //   headers: {
        //     Authorization: `Bearer ${localStorage.getItem("token")}`,
        //   },
        // }
      );
      alert("Assigned to you successfully");
      setRequests((prev) => prev.filter((req) => req.id !== requestId));
    } catch (err) {
      console.error(err);
      alert("Assignment failed");
    }
  };

  return (
    <div className="container mt-4">
      <h2 className="text-center mb-4">📦 Pending Delivery Requests</h2>

      <div className="table-responsive">
        <table className="table table-bordered table-hover shadow-sm">
          <thead className="table-primary">
            <tr>
              <th scope="col">Request ID</th>
              <th scope="col">Pickup Location</th>
              <th scope="col">Drop Location</th>
              <th scope="col">Weight</th>
              <th scope="col" className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <tr key={req.id}>
                  <td>{req.id}</td>
                  <td>{req.pickupLocation}</td>
                  <td>{req.dropLocation}</td>
                  <td>{req.weight} kg</td>
                  <td className="text-center">
                    <button
                      className="btn btn-success btn-sm"
                      onClick={() => handleAssign(req.id)}
                    >
                      Assign to Me
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="text-center text-muted">
                  No pending requests
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default PendingRequests;

import { useEffect,useState } from 'react';
import SockJS from 'sockjs-client';
import { Client } from '@stomp/stompjs';
import { toast } from 'react-toastify';

const NotificationComponent = ({ role,userId }) => {
   
  const [showInstructionPrompt, setShowInstructionPrompt] = useState(false);
  const [userInstruction, setUserInstruction] = useState('');
  const [agentNo, setAgentNo] = useState(0);

  useEffect(() => {
    // if (role !== 'AGENT') return; // ✅ Only subscribe if logged-in user is AGENT
    if (!role || !userId) return; // Wait until both are available
    const socket = new SockJS('http://localhost:8080/ws-location'); // WebSocket endpoint
    const stompClient = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      debug: (str) => console.log(str),
    });

    stompClient.onConnect = () => {
      console.log('✅ Connected to WebSocket as agent');

      // ✅ If role is AGENT → listen for new delivery broadcast
      if (role === 'AGENT') {
        stompClient.subscribe('/topic/notifications/agents', (message) => {
          const msg = message.body;
          console.log('🔔 Notification received:', msg);

          // ✅ Play notification sound
          const audio = new Audio('/notification.wav');
          audio.play();

          // ✅ Show alert or toast (can replace with better UI)
          // alert(msg);
          // ✅ Show toast instead of alert
          toast.info(`📦 ${msg}`);
        });
      }

      // ✅ If role is USER → listen for own order status updates
      if (role === 'USER') {
        stompClient.subscribe(`/topic/notifications/user/${userId}`, (message) => {
          const msg = message.body;
          console.log('🔔 User Notification:', msg);
          new Audio('/notification.wav').play();
          toast.success(`🚚 ${msg}`);
        });
      }

       // ✅ 🔔 Common notify channel for any role (you mentioned this above) less than 1km
      stompClient.subscribe(`/topic/notify/${userId}`, (message) => {
        // const notification = message.body;
        const data = JSON.parse(message.body); // ⬅️ parse JSON
        const agentId = data.agent;
        const userMessage = data.message;
        console.log('🔔 General usermages prompt:', userMessage);
        setAgentNo(agentId);
        setShowInstructionPrompt(true);
        console.log('🔔 General agent prompt:', agentNo);
        new Audio('/notification.wav').play();
        toast.info(`📩 ${userMessage}`);
         // 👉 Show popup to user
      });

      // Subscribe to specific instruction notification (assuming userId or agentId is known)
        stompClient.subscribe(`/topic/notifyAgent/${userId}`, (message) => {
          const msg = message.body;
          console.log('🧭 Direct Instruction:', msg);

          const audio = new Audio('/notification.wav');
          audio.play();
          toast.info(`📬 Instruction: ${msg}`);
        });

    };

    stompClient.activate();

    return () => {
      stompClient.deactivate();
    };
  }, [role,userId,agentNo]);

  const handleSendInstruction = async () => {
    if (!userInstruction.trim()) return;
    try {
      const response = await fetch('http://localhost:8080/api/genai/instruction', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentNo,
          userId,
          instruction: userInstruction,
        }),
      });

      if (response.ok) {
        toast.success("✅ Instruction sent to agent!");
        setShowInstructionPrompt(false);
        setUserInstruction('');
      } else {
        toast.error("❌ Failed to send instruction.");
      }
    } catch (error) {
      console.error("Error sending instruction:", error);
      toast.error("❌ Something went wrong.");
    }
  };
  // return null; // No UI needed
  return (
    <>
      {/* <div style={{ padding: '20px', background: '#eee' }}>
      <button onClick={() => setShowInstructionPrompt(true)}>Force Show Input</button>
    </div> */}

      {showInstructionPrompt && (
  <>
    {/* Overlay */}
    <div
      className="modal-backdrop fade show"
      style={{ zIndex: 1040 }}
    ></div>

    {/* Popup Modal */}
    <div
      className="modal d-block"
      tabIndex="-1"
      role="dialog"
      style={{ zIndex: 1050 }}
    >
      <div className="modal-dialog modal-dialog-centered" role="document">
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">Delivery Instructions</h5>
            <button
              type="button"
              className="btn-close"
              onClick={() => setShowInstructionPrompt(false)}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body">
            <p>Enter last-minute delivery instruction:</p>
            <input
              type="text"
              className="form-control"
              value={userInstruction}
              onChange={(e) => setUserInstruction(e.target.value)}
              placeholder="e.g., gate, doorbell broken, call me"
            />
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSendInstruction}
            >
              Send to Agent
            </button>
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => setShowInstructionPrompt(false)}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </>
)}
    </>
  );
};

export default NotificationComponent;

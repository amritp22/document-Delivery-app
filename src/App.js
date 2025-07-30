import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import CreateDelivery from "./components/CreateDelivery";
import PendingRequests from "./components/PendingRequests";
import Home from "./components/Home";
import Auth from "./components/Auth";
import AssignedRequests from "./components/AssignedRequests";
import UserDeliveryRequests from "./components/UserDeliveryRequests";
import LiveTracking from "./components/LiveTracking";
import LiveTrackingWrapper from "./components/LiveTrackingWrapper";
import SendLocationTest from "./components/SendLocationTest";
import NotificationComponent from "./components/NotificationComponent";
import { useAuth } from "./components/AuthContext";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // 🟡 Import the CSS

function App() {
  const { auth} = useAuth();
  return (
    <>
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/create" element={<CreateDelivery />} />
        <Route path="/pending" element={<PendingRequests />} />
        <Route path="/assingedorder" element={<AssignedRequests />} />
        <Route path="/login" element={<Auth />} />
        <Route path="/orders" element={<UserDeliveryRequests />} />
        {/* New route for live tracking: */}
        <Route path="/track/:agentId" element={<LiveTrackingWrapper />} />
        <Route path="/send-test-location" element={<SendLocationTest />} />
      </Routes>
      <Footer />
    </Router>
    <NotificationComponent role={auth.role} userId={auth.userId} />
    {/* 🟢 REQUIRED for toast to work */}
    <ToastContainer />
    </>
  );
}

export default App;

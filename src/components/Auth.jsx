import React, { useState } from "react";
import { useAuth } from "./AuthContext";
import { useNavigate } from "react-router-dom";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [form, setForm] = useState({
    email: "",
    password: "",
    name: "",
    role: "USER",
  });
  const navigate = useNavigate();
  const { login } = useAuth();
  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = isLogin ? "http://localhost:8080/api/auth/login" : "http://localhost:8080/api/auth/register";
    const payload = isLogin
      ? { email: form.email, password: form.password }
      : form;

    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      // You can store token or redirect here
      if (data.token) {
        localStorage.setItem("token", data.token);
      }
      if (!res.ok) {
        throw new Error(data.message || "Something went wrong");
      }else{
        console.log(data,"recived from backend");
        
        login(data);  // store in context + localStorage
        navigate("/");  // redirect to home
      }

      setMessage(data.token ? "Success!" : "Registered successfully!");

      
    } catch (err) {
      setMessage("Error: " + err.message);
    }
  };

  return (
    <div className="auth-container" style={styles.container}>
      <h2>{isLogin ? "Login" : "Register"}</h2>
      <form onSubmit={handleSubmit} style={styles.form}>
        {!isLogin && (
          <>
            <input
              type="text"
              name="name"
              placeholder="Full Name"
              value={form.name}
              onChange={handleChange}
              required
              style={styles.input}
            />
            <select name="role" value={form.role} onChange={handleChange} style={styles.input}>
              <option value="USER">User</option>
              {/* <option value="ADMIN">Admin</option> */}
              <option value="AGENT">Agent</option>
            </select>
          </>
        )}

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          style={styles.input}
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
          style={styles.input}
        />

        <button type="submit" style={styles.button}>
          {isLogin ? "Login" : "Register"}
        </button>
      </form>

      <button onClick={() => setIsLogin(!isLogin)} style={styles.toggle}>
        {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
      </button>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: "400px",
    margin: "auto",
    padding: "2rem",
    background: "#f0f8ff",
    borderRadius: "12px",
    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
    fontFamily: "Arial",
  },
  form: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  input: {
    padding: "10px",
    borderRadius: "5px",
    border: "1px solid #ccc",
  },
  button: {
    background: "orange",
    color: "white",
    padding: "10px",
    border: "none",
    borderRadius: "5px",
    cursor: "pointer",
  },
  toggle: {
    marginTop: "1rem",
    background: "none",
    color: "blue",
    border: "none",
    cursor: "pointer",
    textDecoration: "underline",
  },
  message: {
    marginTop: "1rem",
    color: "green",
  },
};

export default Auth;

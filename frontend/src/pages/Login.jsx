import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css"; // Updated CSS file
import StudyImage from "../assets/Edex.png"; // Example Illustration

const Login = () => {
  const { loginWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      navigate("/chat"); // Redirect to chat after login
    } catch (error) {
      console.error("Google Sign-In Error:", error);
    }
  };

  const handleBackToHome = () => {
    navigate("/"); // Redirect to Home.jsx
  };

  return (
    <div className="login-container">
      <div className="login-box">
        {/* Left Section */}
        <div className="left-section">
          <h2>Welcome to Edex</h2>
          {/* Mobile Illustration: visible only on mobile */}
          <div className="mobile-illustration">
            <img src={StudyImage} alt="Study" className="illustration" />
          </div>
          <p>
            Your personalized AI-powered learning assistant. Ask questions,
            explore topics, and learn at your own pace. Join Edex today and
            unlock a world of knowledge!
          </p>
          <button onClick={handleLogin} className="google-login-btn">
            Sign in with Google
          </button>
          <button onClick={handleBackToHome} className="back-to-home-btn">
            Back to Home
          </button>
        </div>

        {/* Right Section - Illustration for Desktop */}
        <div className="right-section">
          <img src={StudyImage} alt="Study" className="illustration" />
        </div>
      </div>
    </div>
  );
};

export default Login;

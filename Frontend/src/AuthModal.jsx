import "./AuthModal.css";
import { useState } from "react";
import logo from "./assets/logo.png";

function AuthModal({ setShowAuth }) {
  const [activeTab, setActiveTab] = useState("login");
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="auth-overlay">

      <div className="auth-modal">

        {/* Close */}
        <button
          className="close-btn"
          onClick={() => setShowAuth(false)}
        >
          <i className="fa-solid fa-xmark"></i>
        </button>

        {/* LEFT SIDE */}
        <div className="auth-left">

          <img
            src={logo}
            alt="logo"
            className="auth-logo"
          />

          <h1>NexaMind-AI</h1>

          <p className="tagline">
            Your AI Productivity Partner
          </p>

          <div className="glow-line"></div>

          <p className="desc">
            Chat smarter. Work faster.
            <br />
            Unlock the power of AI with
            <br />
            NexaMind.
          </p>
        </div>

        {/* RIGHT SIDE */}
        <div className="auth-right">

          {/* Tabs */}
          <div className="auth-tabs">

            <button
              className={
                activeTab === "login"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("login")
              }
            >
              Login
            </button>

            <button
              className={
                activeTab === "signup"
                  ? "active"
                  : ""
              }
              onClick={() =>
                setActiveTab("signup")
              }
            >
              Sign Up
            </button>

          </div>

          <h2>
            {activeTab === "login"
              ? "Welcome Back"
              : "Create Account"}
          </h2>

          <p className="sub-text">
            {activeTab === "login"
              ? "Login to continue your journey"
              : "Create your account"}
          </p>

          {/* Email */}
          <input
            className="auth-input"
            type="email"
            placeholder="Email Address"
          />

          {/* Password */}
          <div className="password-box">
            <input
              className="auth-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
            />

            <span
              className="eye"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              <i className={showPassword?"fa-regular fa-eye":"fa-regular fa-eye-slash"}></i>
            </span>
          </div>

          <button className="login-btn">
            {activeTab === "login"
              ? "Login"
              : "Sign Up"}
          </button>

          <div className="divider">
            <span>or continue with</span>
          </div>

          <button className="google-btn">
            <img
              src="https://cdn-icons-png.flaticon.com/512/300/300221.png"
              alt=""
            />
            Continue with Google
          </button>

        </div>
      </div>
    </div>
  );
}

export default AuthModal;
import "./AuthModal.css";
import { useState } from "react";
import logo from "./assets/logo.png";
import { toast } from "react-toastify";

function AuthModal({ setShowAuth, setUser }) {
  const [activeTab, setActiveTab] =
    useState("login");

  const [showPassword,
    setShowPassword] =
    useState(false);

  const [name, setName] =
    useState("");

  const [email, setEmail] =
    useState("");

  const [password,
    setPassword] =
    useState("");

  const [loading,
    setLoading] =
    useState(false);

  const handleAuth = async () => {
    try {
      setLoading(true);

      const endpoint =
        activeTab === "login"
          ? "login"
          : "signup";

      const body =
        activeTab === "login"
          ? {
            email,
            password,
          }
          : {
            name,
            email,
            password,
          };

      const response = await fetch(
        `http://localhost:5000/auth/${endpoint}`,
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      const data =
        await response.json();

      if (!response.ok) {
        throw new Error(
          data.message
        );
      }

      // save auth
      if (data.token) {
        localStorage.setItem(
          "token",
          data.token
        );
      }

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      
      setUser(data.user);

      setShowAuth(false);

      toast.success(
        activeTab === "login"
          ? "Login Successful "
          : "Account Created "
      );

    } catch (error) {
      toast.error(
        error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href =
      "http://localhost:5000/auth/google";
  };

  return (
    <div className="auth-overlay">

      <div className="auth-modal">

        {/* Close */}
        <button
          className="close-btn"
          onClick={() =>
            setShowAuth(false)
          }
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

          {/* NAME */}
          {activeTab === "signup" && (
            <input
              className="auth-input"
              type="text"
              placeholder="Full Name"
              value={name}
              onChange={(e) =>
                setName(
                  e.target.value
                )
              }
            />
          )}

          {/* EMAIL */}
          <input
            className="auth-input"
            type="email"
            placeholder="Email Address"
            value={email}
            onChange={(e) =>
              setEmail(
                e.target.value
              )
            }
          />

          {/* PASSWORD */}
          <div className="password-box">

            <input
              className="auth-input"
              type={
                showPassword
                  ? "text"
                  : "password"
              }
              placeholder="Password"
              value={password}
              onChange={(e) =>
                setPassword(
                  e.target.value
                )
              }
            />

            <span
              className="eye"
              onClick={() =>
                setShowPassword(
                  !showPassword
                )
              }
            >
              <i
                className={
                  showPassword
                    ? "fa-regular fa-eye"
                    : "fa-regular fa-eye-slash"
                }
              ></i>
            </span>

          </div>

          <button
            className="login-btn"
            onClick={handleAuth}
            disabled={loading}
          >
            {loading
              ? "Please wait..."
              : activeTab ===
                "login"
                ? "Login"
                : "Sign Up"}
          </button>

          <div className="divider">
            <span>
              or continue with
            </span>
          </div>

          <button
            className="google-btn"
            onClick={
              handleGoogleLogin
            }
          >
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
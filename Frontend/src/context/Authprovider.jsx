import { useNavigate } from "react-router-dom";
import { createContext, useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() =>
    localStorage.getItem("authTokens")
      ? JSON.parse(localStorage.getItem("authTokens"))
      : null
  );
  const [user, setUser] = useState(() =>
    localStorage.getItem("authTokens")
      ? jwtDecode(localStorage.getItem("authTokens"))
      : null
  );
  const [loading, setLoading] = useState(true);

  const navigate = useNavigate();

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: e.target.username.value,
        password: e.target.password.value,
      });

      const data = response.data;
      if (response.status === 200) {
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(data));
        navigate("/");
        return { success: true };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        error: error.response?.data?.detail || "Login failed",
      };
    }
  };

  const registerUser = async (e) => {
    e.preventDefault();
    try {
      const username = e.target.username.value;
      const password = e.target.password.value;
      const confirmation = e.target.confirmation.value;

      if (password !== confirmation) {
        return {
          error: "Passwords do not match",
        };
      }

      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        username: username,
        password: password,
        confirmation: confirmation,
      });

      if (response.status === 201) {
        return { success: true };
      }
    } catch (error) {
      console.error("Registration error:", error);
      if (error.response?.data) {
        return {
          error: error.response.data,
        };
      }
      return {
        error: "Registration failed",
      };
    }
  };

  const logoutUser = () => {
    setAuthTokens(null);
    setUser(null);
    localStorage.removeItem("authTokens");
    navigate("/");
  };

  const updateToken = async () => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {
          refresh: authTokens?.refresh,
        }
      );

      const data = response.data;
      if (response.status === 200) {
        setAuthTokens(data);
        setUser(jwtDecode(data.access));
        localStorage.setItem("authTokens", JSON.stringify(data));
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logoutUser();
    }
  };

  useEffect(() => {
    if (loading) {
      setLoading(false);
    }
  }, [loading]);

  // Set up token refresh interval
  useEffect(() => {
    const fourMinutes = 1000 * 60 * 4;
    let interval = setInterval(() => {
      if (authTokens) {
        updateToken();
      }
    }, fourMinutes);
    return () => clearInterval(interval);
  }, [authTokens]);

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {loading ? null : children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

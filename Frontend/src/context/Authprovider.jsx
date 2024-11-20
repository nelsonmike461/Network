import { useNavigate } from "react-router-dom";
import { createContext, useState, useEffect, useCallback } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [authTokens, setAuthTokens] = useState(() => {
    const tokens = localStorage.getItem("authTokens");
    return tokens ? JSON.parse(tokens) : null;
  });

  const [user, setUser] = useState(() => {
    const tokens = localStorage.getItem("authTokens");
    return tokens ? jwtDecode(JSON.parse(tokens).access) : null;
  });

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Configure axios defaults for authorization
  useEffect(() => {
    if (authTokens) {
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${authTokens.access}`;
    } else {
      delete axios.defaults.headers.common["Authorization"];
    }
  }, [authTokens]);

  const updateTokens = useCallback((tokens) => {
    if (tokens) {
      localStorage.setItem("authTokens", JSON.stringify(tokens));
      setAuthTokens(tokens);
      setUser(jwtDecode(tokens.access));
      axios.defaults.headers.common[
        "Authorization"
      ] = `Bearer ${tokens.access}`;
    } else {
      localStorage.removeItem("authTokens");
      setAuthTokens(null);
      setUser(null);
      delete axios.defaults.headers.common["Authorization"];
    }
  }, []);

  const loginUser = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login/", {
        username: e.target.username.value,
        password: e.target.password.value,
      });

      if (response.status === 200) {
        updateTokens(response.data);
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
    const { username, password, confirmation } = e.target;

    if (password.value !== confirmation.value) {
      return { error: "Passwords do not match" };
    }

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/register/", {
        username: username.value,
        password: password.value,
        confirmation: confirmation.value,
      });

      if (response.status === 201) {
        return { success: true };
      }
    } catch (error) {
      console.error("Registration error:", error);
      return {
        error: error.response?.data || "Registration failed",
      };
    }
  };

  const logoutUser = useCallback(async () => {
    // First clear tokens and state
    updateTokens(null);

    try {
      if (authTokens?.refresh) {
        // Make the logout request after clearing tokens
        await axios.post("http://127.0.0.1:8000/api/logout/", {
          refresh: authTokens.refresh,
        });
      }
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      navigate("/");
    }
  }, [authTokens, updateTokens, navigate]);

  const updateToken = useCallback(async () => {
    // Don't try to refresh if there are no tokens
    if (!authTokens?.refresh) return;

    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/token/refresh/",
        {
          refresh: authTokens.refresh,
        }
      );

      if (response.status === 200) {
        const newTokens = {
          access: response.data.access,
          refresh: response.data.refresh, // Make sure to use the new refresh token
        };
        updateTokens(newTokens);
      }
    } catch (error) {
      console.error("Token refresh error:", error);
      logoutUser();
    }
  }, [authTokens, updateTokens, logoutUser]);

  useEffect(() => {
    let intervalId = null;

    const refreshToken = async () => {
      if (authTokens) {
        await updateToken();
      }
    };

    if (loading) {
      refreshToken();
    }

    const fourMinutes = 1000 * 60 * 4;
    intervalId = setInterval(() => {
      refreshToken();
    }, fourMinutes);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [authTokens, loading, updateToken]);

  useEffect(() => {
    setLoading(false);
  }, []);

  const contextData = {
    user,
    authTokens,
    loginUser,
    logoutUser,
    registerUser,
  };

  return (
    <AuthContext.Provider value={contextData}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

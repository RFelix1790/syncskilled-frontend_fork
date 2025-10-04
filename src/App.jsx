// src/App.jsx
import { Routes, Route, Navigate, NavLink } from "react-router-dom";
import ProtectedRoute from "./auth/ProtectedRoute";
import { useAuth } from "./auth/AuthContext";

import Homepage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MePage from "./pages/MePage";
import CategoriesPage from "./pages/CategoriesPage";
import CategorySkillsPage from "./pages/CategorySkillsPage";
import PostPage from "./pages/PostPage";
import PostDetails from "./pages/PostDetails";
import CreatePost from "./pages/CreatePost";

export default function App() {
  const { user, logout } = useAuth();

  return (
    <div className="page">
      <div className="container">
        {/* Navbar */}
        <nav className="navbar">
          <div className="navbar-inner">
            <div className="brand">SyncSkilled</div>
            <div className="nav-links">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                Home
              </NavLink>
              <NavLink
                to="posts"
                className={({ isActive }) =>
                  isActive ? "nav-link nav-link-active" : "nav-link"
                }
              >
                {" "}
                Posts
              </NavLink>

              {user && (
                <NavLink
                  to="/catalog"
                  className={({ isActive }) =>
                    isActive ? "nav-link nav-link-active" : "nav-link"
                  }
                >
                  Catalog
                </NavLink>
              )}

              {user ? (
                <>
                  <NavLink
                    to="/me"
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link-active" : "nav-link"
                    }
                  >
                    Profile
                  </NavLink>
                  <button className="btn-primary" onClick={logout}>
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <NavLink
                    to="/login"
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link-active" : "nav-link"
                    }
                  >
                    Login
                  </NavLink>
                  <NavLink
                    to="/register"
                    className={({ isActive }) =>
                      isActive ? "nav-link nav-link-active" : "nav-link"
                    }
                  >
                    Register
                  </NavLink>
                </>
              )}
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          {/* Public pages */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/posts" element={<PostPage />} />
          <Route path="/posts/:postId" element={<PostDetails />} />

          {/* Protected pages */}
          <Route
            path="/me"
            element={
              <ProtectedRoute>
                <MePage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog"
            element={
              <ProtectedRoute>
                <CategoriesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/catalog/:idOrSlug"
            element={
              <ProtectedRoute>
                <CategorySkillsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/posts/create"
            element={
              <ProtectedRoute>
                <CreatePost />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}

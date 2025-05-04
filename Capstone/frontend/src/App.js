import { BrowserRouter as Router, Routes, Route, Link, useNavigate} from "react-router-dom";
import { useState, useEffect } from "react";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import LogoutButton from "./components/LogoutButton";
import AdminDashboard from "./pages/AdminDashboard";
import Profile from "./pages/Profile";
import './App.css';


function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [isAdmin, setIsAdmin] = useState(false); // Track if user is an admin
    const [userProfile, setUserProfile] = useState(null);
    const userRole = localStorage.getItem("role");

    useEffect(() => {
        const token = localStorage.getItem("token");

        if (token) {
            // Decode token or fetch user role from API
            fetch("http://127.0.0.1:5000/me", { 
                headers: { Authorization: `Bearer ${token}` }
            })
            .then(res => res.json())
            .then(data => {
                setIsAuthenticated(true);
                setIsAdmin(data.role === "admin"); // Assuming API returns a role
                localStorage.setItem("role", data.role);
                setUserProfile(data);
            })
            .catch(() => {
                setIsAuthenticated(false);
                setIsAdmin(false);
            });
        }
    }, []);

    return (
        <Router>
        <div>
            {/* Show navigation only if user is logged in */}
            {isAuthenticated && (
                <nav>
                    <ul>
                        {userRole === "member" && <li><Link to="/dashboard">Dashboard</Link></li>}
                        {userRole === "admin" && <li><Link to="/admin-dashboard">Admin Dashboard</Link></li>}
                    </ul>
                    <LogoutButton setIsAuthenticated={setIsAuthenticated} />
                </nav>
            )}

            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/register" element={<Register setIsAuthenticated={setIsAuthenticated} />} />
                <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <Home />} />
                <Route path="/classes" element={isAuthenticated ? <Classes /> : <Home />} />
                <Route path="/profile" element={isAuthenticated ? <Profile user={userProfile}/> : <Home />} />
                
                {/* Protect Admin Route */}
                <Route 
                    path="/admin-dashboard" 
                    element={isAuthenticated && userRole === "admin" ? <AdminDashboard /> : <Dashboard />} 
                />
            </Routes>
        </div>
    </Router>
    );
}
console.log({ Home, Login, Register, Dashboard, Classes, LogoutButton, AdminDashboard, Profile });

export default App;

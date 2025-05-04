import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Login.css";

function Login({ setIsAuthenticated }) {
    const [formData, setFormData] = useState({ email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/login", formData);
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);
            setIsAuthenticated(true);
            navigate(res.data.role === "admin" ? "/admin-dashboard" : "/dashboard");
        } catch (error) {
            console.error("Login failed", error.response?.data);
            if (error.response && error.response.status === 401) {
                setError("Invalid email or password.");
            } else {
                setError("Something went wrong. Please try again later.");
            }
        }
    };

    return (
        <div className="login-container">
            <div className="login-box">
                <h1>Login</h1>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="email" 
                        name="email" 
                        placeholder="Email" 
                        onChange={handleChange} 
                        value={formData.email}
                        required 
                    />
                    <input 
                        type="password" 
                        name="password" 
                        placeholder="Password" 
                        onChange={handleChange} 
                        value={formData.password}
                        required 
                    />
                    <button type="submit">Login</button>
                </form>

                {error && <p>{error}</p>}
            </div>
        </div>
    );
}

export default Login;

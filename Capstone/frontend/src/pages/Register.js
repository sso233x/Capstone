import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./Register.css";

function Register() {
    const [formData, setFormData] = useState({ name: "", email: "", password: "" });
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError("");
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:5000/register", formData);
            console.log("Response:", res.data);
            navigate("/dashboard");
        } catch (error) {
            console.error("Signup failed", error.response?.data);
            if (error.response && error.response.data?.error) {
                setError(error.response.data.error);
            } else {
                setError("Something went wrong. Please try again.");
            }
        }
    };

    return (
        <div className="register-container">
            <div className="register-box">
                <h1>Register</h1>
                <form onSubmit={handleSubmit}>
                    <input 
                        type="text" 
                        name="name" 
                        placeholder="Name" 
                        onChange={handleChange} 
                        value={formData.name}
                        required 
                    />
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
                    <button type="submit">Sign Up</button>
                </form>
                {error && <p>{error}</p>}
            </div>
        </div>
    );
}

export default Register;

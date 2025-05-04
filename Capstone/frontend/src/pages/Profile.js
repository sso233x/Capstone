import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './Profile.css';

function Profile() {
    const [profileData, setProfileData] = useState(null);
    const [loading, setLoading] = useState(true); // Manage loading state
    const [error, setError] = useState(null); // Manage error state
    const navigate = useNavigate();

    useEffect(() => {
        axios.get('http://localhost:5000/profile', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        })
        .then(response => {
            setProfileData(response.data);
            setLoading(false); // Set loading to false after data is fetched
        })
        .catch(error => {
            setError("There was an error fetching your profile data.");
            setLoading(false); // Set loading to false on error
            console.error("There was an error fetching the profile data!", error);
        });
    }, []);

    const handleCancelMembership = async () => {
        const confirmCancel = window.confirm("Are you sure you want to cancel your membership? This will remove your account and all class enrollments.");

        if (!confirmCancel) return;

        try {
            await axios.delete('http://localhost:5000/cancel-membership', {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json',
                }
            });

            // Clear local storage and redirect
            localStorage.removeItem("token");
            localStorage.removeItem("role");
            alert("Your membership has been cancelled.");
            navigate("/");

        } catch (err) {
            console.error("Failed to cancel membership:", err);
            alert("An error occurred while cancelling your membership.");
        }
    };

    if (loading) {
        return (
            <div className="profile-container">
                <div className="loading-spinner">Loading...</div>
                {/* Optionally, replace the 'Loading...' text with a spinner or animation */}
            </div>
        );
    }

    if (error) {
        return (
            <div className="profile-container">
                <div className="error-message">{error}</div>
            </div>
        );
    }

    return (
        <div className="profile-container">
            <div className="profile-header">
                <h1>{profileData.name}'s Profile</h1>
            </div>

            <div className="profile-details">
                <p><strong>Email:</strong> {profileData.email}</p>
                <p><strong>Role:</strong> {profileData.role}</p>
            </div>

            <div className="classes-section">
                <h2>Enrolled Classes</h2>
                {profileData.enrolled_classes.length > 0 ? (
                    <ul>
                        {profileData.enrolled_classes.map((classInfo) => (
                            <li key={classInfo.class_id}>
                                <strong>{classInfo.class_name}</strong>
                                <p>Schedule: {classInfo.schedule}</p>
                                <p>Status: {classInfo.status}</p>
                                <p>Timestamp: {new Date(classInfo.timestamp).toLocaleString()}</p>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No classes enrolled yet.</p>
                )}
            </div>

            <div className="cancel-membership">
                <button onClick={handleCancelMembership} className="cancel-btn">
                    Cancel Membership
                </button>
            </div>
        </div>
    );
}

export default Profile;

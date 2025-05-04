import { useNavigate } from "react-router-dom";

function LogoutButton({setIsAuthenticated}) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem("token");
        setIsAuthenticated(false); 

        alert("You have been logged out.");
        
        navigate("/"); 
    };

    return <button onClick={handleLogout}>Logout</button>;
}

export default LogoutButton;

import './Home.css';
import { Link } from 'react-router-dom';

function Home() {
    return (
        <div className="home-container">
            <div className="home-box">
                <h1>Welcome to FitTrack</h1>
                <p>Manage your gym classes, track progress, and stay healthy!</p>
                <Link to="/login">Login</Link>
                <Link to="/register">Register</Link>
            </div>
        </div>
    );
}

export default Home;

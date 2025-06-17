import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
    faSearch, 
    faCode, 
    faUsers, 
    faCalendarAlt,
    faCodeBranch
} from '@fortawesome/free-solid-svg-icons';
import '../styles/Home.css';

const Home = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch('http://localhost:5001/users');
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    const handleUserClick = (userId) => {
        navigate(`/profile/${userId}`);
    };

    return (
        <div className="home-container">
            <section className="hero-section">
                <div className="hero-content">
                    <h1>Welcome!</h1>
                    <p>Connect, Collaborate, and Create Amazing Projects Together</p>
                    <Link to="/register" className="cta-button">
                        Register & Contribute
                    </Link>
                </div>
            </section>

            <section className="features-section">
                <div className="feature-card">
                    <FontAwesomeIcon icon={faSearch} className="feature-icon" />
                    <h3>Find Projects</h3>
                    <p>Discover exciting open-source projects and events that match your interests and skills.</p>
                </div>

                <div className="feature-card">
                    <FontAwesomeIcon icon={faCode} className="feature-icon" />
                    <h3>Showcase Your Work</h3>
                    <p>Share your projects and contributions with the community to get feedback and recognition.</p>
                </div>

                <div className="feature-card">
                    <FontAwesomeIcon icon={faUsers} className="feature-icon" />
                    <h3>Connect with Developers</h3>
                    <p>Network with like-minded developers, find collaborators, and build your professional network.</p>
                </div>
            </section>


            <section className="users-section">
                <h2>Featured Members</h2>
                {loading ? (
                    <p className="loading">Loading members...</p>
                ) : error ? (
                    <p className="error">{error}</p>
                ) : (
                    <ul className="users-list">
                        {users.slice(0, 6).map(user => (
                            <li 
                                key={user.id} 
                                className="user-card" 
                                onClick={() => handleUserClick(user.id)}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        handleUserClick(user.id);
                                    }
                                }}
                            >
                                <h3>{user.name}</h3>
                                <p>{user.email}</p>
                                <p><strong>Department:</strong> {user.department}</p>
                            </li>
                        ))}
                    </ul>
                )}
            </section>
        </div>
    );
};

export default Home;

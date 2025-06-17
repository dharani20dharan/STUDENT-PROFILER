import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "../styles/Navbar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle, faBell, faSignOutAlt } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Set up polling for new notifications every 5 seconds
            const interval = setInterval(fetchNotifications, 5000);
            return () => clearInterval(interval);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            const [notifs, count] = await Promise.all([
                notificationService.getUserNotifications(user.id),
                notificationService.getUnreadCount(user.id)
            ]);
            setNotifications(notifs);
            setUnreadCount(count);
        } catch (error) {
            console.error('Error fetching notifications:', error);
        }
    };

    const handleNotificationClick = async () => {
        setShowNotifications(!showNotifications);
        if (!showNotifications && unreadCount > 0) {
            try {
                await notificationService.markNotificationsAsRead(user.id);
                setUnreadCount(0);
            } catch (error) {
                console.error('Error marking notifications as read:', error);
            }
        }
    };

    const toggleDropdown = () => {
        setShowDropdown(!showDropdown);
        if (showNotifications) {
            setShowNotifications(false);
        }
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="navbar">
            <div className="navbar-left">
                <Link to="/" className="logo">
                    <img src="/logo192.png" alt="Logo" />
                </Link>
                <div className="nav-links">
                    <Link to="/" className={location.pathname === "/" ? "active" : ""}>
                        Home
                    </Link>
                    <Link to="/projects" className={location.pathname === "/projects" ? "active" : ""}>
                        Projects
                    </Link>
                    <Link to="/events" className={location.pathname === "/events" ? "active" : ""}>
                        Events
                    </Link>
                    {user && (
                        <Link to="/register" className={location.pathname === "/register" ? "active" : ""}>
                            Register
                        </Link>
                    )}
                </div>
            </div>
            <div className="navbar-right">
                <div className="search-bar">
                    <FontAwesomeIcon icon={faSearch} className="search-icon" />
                    <input type="text" placeholder="Search for skills, projects, jobs..." />
                </div>
                {user ? (
                    <div className="user-section">
                        <div className="notification-icon" onClick={handleNotificationClick}>
                            <FontAwesomeIcon icon={faBell} />
                            {unreadCount > 0 && (
                                <span className="notification-badge">{unreadCount}</span>
                            )}
                        </div>
                        {showNotifications && (
                            <div className="notifications-dropdown">
                                {notifications.length > 0 ? (
                                    notifications.map((notification) => (
                                        <div key={notification.id} className="notification-item">
                                            <p>{notification.message}</p>
                                            <small>Project: {notification.project_title}</small>
                                            <small>Type: {notification.project_type}</small>
                                            <small>Time: {new Date(notification.created_at).toLocaleString()}</small>
                                        </div>
                                    ))
                                ) : (
                                    <div className="notification-item empty">
                                        No notifications
                                    </div>
                                )}
                            </div>
                        )}
                        <Link to={`/profile/${user.id}`} className="profile-button">
                            <FontAwesomeIcon icon={faUserCircle} size={28} />
                            <span>My Profile</span>
                        </Link>
                        <button onClick={handleLogout} className="logout-button">
                            <FontAwesomeIcon icon={faSignOutAlt} />
                            <span>Logout</span>
                        </button>
                    </div>
                ) : (
                    <div className="auth-buttons">
                        <Link to="/login" className="login-button">
                            Login
                        </Link>
                        <Link to="/register" className="register-button">
                            Register
                        </Link>
                    </div>
                )}
            </div>
        </nav>
    );
};

export default Navbar;

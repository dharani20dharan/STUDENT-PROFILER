import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faUserCircle, faBell, faSignOutAlt, faBars, faTimes } from "@fortawesome/free-solid-svg-icons";
import { useAuth } from '../context/AuthContext';
import { notificationService } from '../services/notificationService';

const Navbar = () => {
    const [showDropdown, setShowDropdown] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (user) {
            fetchNotifications();
            // Poll every 10s to be less aggressive
            const interval = setInterval(fetchNotifications, 10000);
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

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const NavLink = ({ to, children }) => {
        const isActive = location.pathname === to;
        return (
            <Link
                to={to}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 
                ${isActive
                        ? 'bg-primary/10 text-primary'
                        : 'text-text-secondary hover:text-text-primary hover:bg-white/5'
                    }`}
            >
                {children}
            </Link>
        );
    };

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    {/* Logo */}
                    <Link to="/" className="flex-shrink-0 flex items-center space-x-2">
                        <img className="h-8 w-auto" src="/logo192.png" alt="SkillHub" />
                        <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            SkillHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-2">
                        <NavLink to="/">Home</NavLink>
                        <NavLink to="/projects">Projects</NavLink>
                        <NavLink to="/events">Events</NavLink>
                        {user && <NavLink to="/register">Register</NavLink>}
                    </div>

                    {/* Search & User Actions */}
                    <div className="hidden md:flex items-center space-x-6">
                        <div className="relative group">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faSearch} className="text-gray-500 group-focus-within:text-primary transition-colors" />
                            </div>
                            <input
                                type="text"
                                className="block w-64 pl-10 pr-3 py-1.5 border border-white/10 rounded-full leading-5 bg-black/20 text-text-primary placeholder-gray-500 focus:outline-none focus:bg-black/40 focus:border-primary/50 focus:ring-1 focus:ring-primary/50 sm:text-sm transition-all"
                                placeholder="Search..."
                            />
                        </div>

                        {user ? (
                            <div className="flex items-center space-x-4">
                                {/* Notifications */}
                                <div className="relative">
                                    <button
                                        onClick={handleNotificationClick}
                                        className="p-2 rounded-full text-text-secondary hover:text-primary hover:bg-primary/10 transition-colors relative"
                                    >
                                        <FontAwesomeIcon icon={faBell} size="lg" />
                                        {unreadCount > 0 && (
                                            <span className="absolute top-0 right-0 block h-4 w-4 rounded-full bg-red-500 text-white text-xs font-bold flex items-center justify-center border-2 border-background">
                                                {unreadCount}
                                            </span>
                                        )}
                                    </button>

                                    {/* Notification Dropdown */}
                                    {showNotifications && (
                                        <div className="absolute right-0 mt-2 w-80 glass-card p-2 origin-top-right focus:outline-none z-50">
                                            <div className="px-4 py-2 border-b border-white/5">
                                                <h3 className="text-sm font-semibold text-text-primary">Notifications</h3>
                                            </div>
                                            <div className="max-h-64 overflow-y-auto">
                                                {notifications.length > 0 ? (
                                                    notifications.map((notification) => (
                                                        <div key={notification.id} className="p-3 hover:bg-white/5 rounded-lg mb-1 cursor-pointer transition-colors">
                                                            <p className="text-sm text-text-primary">{notification.message}</p>
                                                            <div className="mt-1 flex justify-between text-xs text-text-secondary">
                                                                <span>{notification.project_title}</span>
                                                                <span>{new Date(notification.created_at).toLocaleDateString()}</span>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-4 text-center text-text-secondary text-sm">
                                                        No new notifications
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Profile Dropdown Trigger */}
                                <div className="relative ml-3">
                                    <div className="flex items-center space-x-3">
                                        <Link to={`/profile/${user.id}`} className="flex items-center space-x-2 text-sm font-medium text-text-primary hover:text-primary transition-colors">
                                            <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                                                <div className="h-full w-full rounded-full bg-background flex items-center justify-center overflow-hidden">
                                                    {user.profile_picture ? (
                                                        <img src={user.profile_picture} alt="" className="h-full w-full object-cover" />
                                                    ) : (
                                                        <FontAwesomeIcon icon={faUserCircle} className="text-text-secondary" />
                                                    )}
                                                </div>
                                            </div>
                                            <span className="hidden lg:block">{user.name || "User"}</span>
                                        </Link>

                                        <button
                                            onClick={handleLogout}
                                            className="text-text-secondary hover:text-red-400 transition-colors p-2"
                                            title="Logout"
                                        >
                                            <FontAwesomeIcon icon={faSignOutAlt} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="text-sm font-medium text-text-secondary hover:text-text-primary transition-colors">
                                    Log in
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-4 py-2 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-blue-dark shadow-lg shadow-primary/25 transition-all hover:scale-105"
                                >
                                    Get Started
                                </Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="flex md:hidden">
                        <button
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                            className="p-2 rounded-md text-text-secondary hover:text-white hover:bg-white/10"
                        >
                            <FontAwesomeIcon icon={isMobileMenuOpen ? faTimes : faBars} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden glass border-t border-white/5">
                    <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                        <Link to="/" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-white/5">Home</Link>
                        <Link to="/projects" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-white/5">Projects</Link>
                        <Link to="/events" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-white/5">Events</Link>
                        {user && (
                            <>
                                <Link to="/profile" className="block px-3 py-2 rounded-md text-base font-medium text-text-primary hover:bg-white/5">Profile</Link>
                                <button onClick={handleLogout} className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-white/5">Logout</button>
                            </>
                        )}
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;


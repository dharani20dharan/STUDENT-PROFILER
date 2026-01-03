import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faSearch,
    faCode,
    faUsers,
    faArrowRight,
    faStar
} from '@fortawesome/free-solid-svg-icons';
import { useAuth } from '../context/AuthContext';

// Helper to get API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Home = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const { user: currentUser } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const response = await fetch(`${API_URL}/users`);
                if (!response.ok) throw new Error('Failed to fetch users');
                const data = await response.json();
                setUsers(data);
            } catch (err) {
                console.error(err.message);
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
        <div className="min-h-screen">
            {/* Hero Section */}
            <section className="relative overflow-hidden py-20 lg:py-32">
                {/* Background Blobs */}
                <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl -z-10 animate-pulse"></div>
                <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-accent/20 rounded-full blur-3xl -z-10 animate-pulse delay-1000"></div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
                    <h1 className="text-5xl md:text-7xl font-bold mb-6">
                        <span className="block text-text-primary">Connect, Collaborate,</span>
                        <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                            Create Amazing Things
                        </span>
                    </h1>
                    <p className="mt-4 max-w-2xl mx-auto text-xl text-text-secondary">
                        The ultimate platform for students to showcase their skills, find teammates, and bring ideas to life.
                    </p>

                    <div className="mt-10 flex justify-center gap-4">
                        {!currentUser ? (
                            <>
                                <Link to="/register" className="px-8 py-3 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-blue-dark shadow-lg shadow-primary/25 transition-all hover:scale-105 flex items-center">
                                    Get Started <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                                </Link>
                                <Link to="/login" className="px-8 py-3 rounded-full bg-white/10 text-white font-bold text-lg hover:bg-white/20 backdrop-blur-sm border border-white/10 transition-all">
                                    Log In
                                </Link>
                            </>
                        ) : (
                            <Link to="/projects" className="px-8 py-3 rounded-full bg-primary text-white font-bold text-lg hover:bg-primary-blue-dark shadow-lg shadow-primary/25 transition-all hover:scale-105 flex items-center">
                                Explore Projects <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                            </Link>
                        )}
                    </div>

                    {/* Stats */}
                    {!loading && (
                        <div className="mt-16 grid grid-cols-2 gap-8 md:grid-cols-3 lg:max-w-4xl lg:mx-auto">
                            <div className="glass p-6 rounded-2xl">
                                <div className="text-4xl font-bold text-primary">{users.length}+</div>
                                <div className="text-sm text-text-secondary mt-1">Talented Students</div>
                            </div>
                            <div className="glass p-6 rounded-2xl">
                                <div className="text-4xl font-bold text-accent">50+</div>
                                <div className="text-sm text-text-secondary mt-1">Active Projects</div>
                            </div>
                            <div className="glass p-6 rounded-2xl hidden md:block">
                                <div className="text-4xl font-bold text-green-400">24/7</div>
                                <div className="text-sm text-text-secondary mt-1">Collaboration</div>
                            </div>
                        </div>
                    )}
                </div>
            </section>

            {/* Features Preview */}
            <section className="py-20 bg-black/20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-3 gap-8">
                        <div className="glass-card p-8 group">
                            <div className="h-12 w-12 rounded-lg bg-primary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faSearch} className="text-2xl text-primary" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Find Opportunities</h3>
                            <p className="text-text-secondary">Discover open-source projects and events tailored to your skills and interests.</p>
                        </div>
                        <div className="glass-card p-8 group">
                            <div className="h-12 w-12 rounded-lg bg-accent/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faCode} className="text-2xl text-accent" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Showcase Work</h3>
                            <p className="text-text-secondary">Build a professional portfolio that stands out. Share your code, designs, and achievements.</p>
                        </div>
                        <div className="glass-card p-8 group">
                            <div className="h-12 w-12 rounded-lg bg-green-500/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                                <FontAwesomeIcon icon={faUsers} className="text-2xl text-green-500" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-3">Community</h3>
                            <p className="text-text-secondary">Network with peers, find mentors, and collaborate on real-world applications.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Top Talent Showcase */}
            <section className="py-20">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold text-white mb-4">Meet Top Talent</h2>
                        <p className="text-text-secondary max-w-2xl mx-auto">Discover skilled individuals ready to collaborate.</p>
                    </div>

                    {loading ? (
                        <div className="flex justify-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            {users.slice(0, 6).map(user => (
                                <div
                                    key={user.id}
                                    onClick={() => handleUserClick(user.id)}
                                    className="glass-card p-6 cursor-pointer group flex items-start space-x-4 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <FontAwesomeIcon icon={faArrowRight} className="text-primary -rotate-45" />
                                    </div>

                                    <div className="flex-shrink-0">
                                        <div className="h-14 w-14 rounded-full bg-surface border border-white/10 overflow-hidden">
                                            <img
                                                src={user.profile_picture ? `${API_URL}${user.profile_picture}` : "https://via.placeholder.com/150"}
                                                alt={user.name}
                                                className="h-full w-full object-cover"
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-white group-hover:text-primary transition-colors">{user.name}</h3>
                                        <p className="text-sm text-text-secondary mb-2">{user.department}</p>
                                        <div className="flex items-center space-x-1">
                                            <FontAwesomeIcon icon={faStar} className="text-yellow-500 text-xs" />
                                            <span className="text-xs text-text-secondary">Rising Star</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {!loading && users.length > 6 && (
                        <div className="mt-12 text-center">
                            <button className="text-primary hover:text-white font-medium transition-colors">
                                View All Members
                            </button>
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
};

export default Home;


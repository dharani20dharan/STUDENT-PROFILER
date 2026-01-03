import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faProjectDiagram, faCalendarAlt, faSearch } from '@fortawesome/free-solid-svg-icons';

// Helper to get API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Register = () => {
    const [entries, setEntries] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getAuthToken = () => localStorage.getItem('token');

    const fetchAllEntries = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const token = getAuthToken();
            if (!token) {
                setError("You must be logged in to view entries.");
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/all-projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch entries');

            const data = await response.json();
            setEntries(data);
        } catch (err) {
            console.error("Error fetching entries:", err);
            setError("Failed to fetch entries. " + err.message);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAllEntries();
    }, [fetchAllEntries]);

    const handleEntryClick = (entry) => {
        setSelectedEntry(entry);
        setShowDetailModal(true);
    };

    const handleRegisterEntry = async (entryId) => {
        try {
            const token = getAuthToken();
            if (!token) {
                alert("You must be logged in to register.");
                return;
            }

            const response = await fetch(`${API_URL}/api/projects/${entryId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                if (response.status === 409) {
                    alert("You have already registered for this entry!");
                } else {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || 'Failed to register');
                }
                return;
            }

            alert('Successfully registered!');
            setShowDetailModal(false);
        } catch (err) {
            console.error('Error registering:', err);
            alert('Error registering: ' + err.message);
        }
    };

    const handleViewProfile = (userIdToView) => {
        navigate(`/profile/${userIdToView}`);
    };

    const { projects, events } = {
        projects: entries.filter(entry => entry.type === 'project'),
        events: entries.filter(entry => entry.type === 'event')
    };

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-bold text-white mb-4">Discover & Contribute</h1>
                    <p className="text-text-secondary max-w-2xl mx-auto">
                        Explore open source projects and community events. Join, collaborate, and make an impact.
                    </p>
                </div>

                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-6 text-center max-w-xl mx-auto">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : (
                    <div className="space-y-16">
                        {/* Projects Section */}
                        <section>
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-lg bg-primary/20 text-primary mr-3">
                                    <FontAwesomeIcon icon={faProjectDiagram} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Community Projects</h2>
                            </div>

                            {projects.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {projects.map(entry => (
                                        <EventCard
                                            key={entry.id}
                                            project={entry}
                                            onClick={() => handleEntryClick(entry)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-text-secondary">No active projects found.</p>
                                </div>
                            )}
                        </section>

                        {/* Events Section */}
                        <section>
                            <div className="flex items-center mb-6">
                                <div className="p-2 rounded-lg bg-accent/20 text-accent mr-3">
                                    <FontAwesomeIcon icon={faCalendarAlt} />
                                </div>
                                <h2 className="text-2xl font-bold text-white">Upcoming Events</h2>
                            </div>

                            {events.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {events.map(entry => (
                                        <EventCard
                                            key={entry.id}
                                            project={entry}
                                            onClick={() => handleEntryClick(entry)}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-10 bg-white/5 rounded-xl border border-white/5">
                                    <p className="text-text-secondary">No upcoming events found.</p>
                                </div>
                            )}
                        </section>
                    </div>
                )}
            </div>

            {/* Modal */}
            {showDetailModal && selectedEntry && (
                <EventDetailModal
                    show={true}
                    project={selectedEntry}
                    isHost={false}
                    onRegister={handleRegisterEntry}
                    onDelete={() => { }}
                    registeredUsers={[]}
                    onViewProfile={handleViewProfile}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedEntry(null);
                    }}
                />
            )}
        </div>
    );
};

export default Register;

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import EventCard from '../components/EventCard';
import EventModal from '../components/EventModal';
import EventDetailModal from '../components/EventDetailModal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus } from '@fortawesome/free-solid-svg-icons';

// Helper to get API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

const Events = () => {
    const [userEntries, setUserEntries] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const getAuthToken = () => localStorage.getItem('token');

    const modalInitialData = useMemo(() => {
        if (selectedEntry) {
            return {
                id: selectedEntry.id,
                project_name: selectedEntry.project_name,
                project_description: selectedEntry.project_description,
                links: selectedEntry.links,
                type: selectedEntry.type
            };
        }
        return { type: 'event' };
    }, [selectedEntry]);

    const fetchUserEntries = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setError('You must be logged in to view events.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch events');

            const data = await response.json();
            const eventsOnly = data.filter(entry => entry.type === 'event');
            setUserEntries(eventsOnly);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchRegisteredUsers = useCallback(async (entryId) => {
        try {
            const token = getAuthToken();
            if (!token) return [];

            const response = await fetch(`${API_URL}/api/projects/${entryId}/registrations`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch registered users');

            return await response.json();
        } catch (err) {
            console.error('Error fetching registered users:', err);
            return [];
        }
    }, []);

    useEffect(() => {
        fetchUserEntries();
    }, [fetchUserEntries]);

    const handleCreateEntry = useCallback(async (newEntryData) => {
        try {
            const token = getAuthToken();
            if (!token) {
                alert("You must be logged in to create an entry.");
                return;
            }

            const response = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEntryData),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || 'Failed to create entry');
            }

            setShowCreateModal(false);
            fetchUserEntries();
            // Optional: Success message
        } catch (err) {
            console.error('Error creating entry:', err);
            alert('Error creating entry: ' + err.message);
        }
    }, [fetchUserEntries]);

    const handleEntryCardClick = useCallback(async (entry) => {
        setSelectedEntry(entry);
        const isCurrentUsersEntry = entry.user_id === parseInt(user?.id);

        if (isCurrentUsersEntry) {
            const users = await fetchRegisteredUsers(entry.id);
            setRegisteredUsers(users);
        } else {
            setRegisteredUsers([]);
        }
        setShowDetailModal(true);
    }, [user?.id, fetchRegisteredUsers]);

    const handleDeleteEntry = useCallback(async (entryId) => {
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) return;

        try {
            const token = getAuthToken();
            if (!token) return;

            const response = await fetch(`${API_URL}/api/projects/${entryId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete event');

            setShowDetailModal(false);
            setSelectedEntry(null);
            fetchUserEntries();
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Error deleting event: ' + err.message);
        }
    }, [fetchUserEntries]);

    const handleRegisterForEntry = useCallback(async (entryId) => {
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
                }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || 'Failed to register');
            }

            alert('Successfully registered!');
            // Refresh registration list if viewing (though usually user registers as non-host)
        } catch (err) {
            console.error('Error registering:', err);
            alert('Error registering: ' + err.message);
        }
    }, []);

    const handleViewProfile = useCallback((userIdToView) => {
        navigate(`/profile/${userIdToView}`);
    }, [navigate]);

    return (
        <div className="min-h-screen pb-12">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">My Events</h1>
                        <p className="text-text-secondary">Manage and organize your events efficiently.</p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary hover:bg-primary-blue-dark text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/25 transition-all transform hover:scale-105 active:scale-95 flex items-center"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Create New Event
                        </button>
                    )}
                </div>

                {/* Content */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                    </div>
                ) : error ? (
                    <div className="bg-red-500/10 border border-red-500/50 text-red-500 rounded-lg p-6 text-center max-w-xl mx-auto">
                        <p className="font-bold">{error}</p>
                    </div>
                ) : userEntries.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-2xl border border-white/5">
                        <p className="text-text-secondary text-lg mb-4">No events found.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-primary hover:text-white font-medium transition-colors"
                        >
                            Create your first event
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {userEntries.map((entry) => (
                            <EventCard
                                key={entry.id}
                                project={entry}
                                onClick={() => handleEntryCardClick(entry)}
                            />
                        ))}
                    </div>
                )}
            </div>

            {/* Modals */}
            {showDetailModal && selectedEntry && (
                <EventDetailModal
                    show={true}
                    project={selectedEntry}
                    registeredUsers={registeredUsers}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedEntry(null);
                        setRegisteredUsers([]);
                    }}
                    onDelete={() => handleDeleteEntry(selectedEntry.id)}
                    onRegister={() => handleRegisterForEntry(selectedEntry.id)}
                    onViewProfile={handleViewProfile}
                    isHost={selectedEntry.user_id === parseInt(user?.id)}
                />
            )}

            <EventModal
                show={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onSubmit={handleCreateEntry}
                initialData={modalInitialData}
            />
        </div>
    );
};

export default Events;

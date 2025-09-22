// src/pages/Events.js
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import '../styles/Events.css'; 
import EventCard from '../components/EventCard'; 
import EventModal from '../components/EventModal'; 
import EventDetailModal from '../components/EventDetailModal'; 
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Events = () => {
    // Renamed state to hold all user's entries (events and projects)
    const [userEntries, setUserEntries] = useState([]); 
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null); // Renamed state
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    // Memoize the initialData for EventModal
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

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

    const fetchUserEntries = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setError('You must be logged in to view events.');
                setLoading(false);
                return;
            }

            const response = await fetch('http://localhost:5001/api/projects', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch events');
            }

            const data = await response.json();
            // Filter to only show events
            const eventsOnly = data.filter(entry => entry.type === 'event');
            setUserEntries(eventsOnly);
            setLoading(false);
        } catch (err) {
            console.error('Error fetching events:', err);
            setError('Failed to load events');
            setLoading(false);
        }
    }, []);

    const fetchRegisteredUsers = useCallback(async (entryId) => {
        try {
            const token = getAuthToken();
            if (!token) {
                console.error("No token to fetch registered users.");
                return [];
            }
            const response = await fetch(`http://localhost:5001/api/projects/${entryId}/registrations`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                throw new Error(errorData.message || `Failed to fetch registered users: ${response.statusText}`);
            }
            const data = await response.json();
            return data;
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

            const response = await fetch('http://localhost:5001/api/projects', { 
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(newEntryData),
            });

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                console.error('Error creating entry - Server Response:', errorData);
                throw new Error(errorData.message || `Failed to create entry: ${response.statusText}`);
            }

            const createdEntry = await response.json();
            console.log('Entry created successfully:', createdEntry);
            setShowCreateModal(false);
            fetchUserEntries(); 
            alert('Entry created successfully!');
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
        if (!window.confirm("Are you sure you want to delete this event? This action cannot be undone.")) {
            return;
        }

        try {
            const token = getAuthToken();
            if (!token) {
                alert("You must be logged in to delete an event.");
                return;
            }

            const response = await fetch(`http://localhost:5001/api/projects/${entryId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                throw new Error(errorData.message || `Failed to delete event: ${response.statusText}`);
            }

            setShowDetailModal(false);
            setSelectedEntry(null);
            setRegisteredUsers([]);
            fetchUserEntries();
            alert('Event deleted successfully!');
        } catch (err) {
            console.error('Error deleting event:', err);
            alert('Error deleting event: ' + err.message);
        }
    }, [fetchUserEntries]);

    const handleRegisterForEntry = useCallback(async (entryId) => {
        try {
            const token = getAuthToken();
            if (!token) {
                alert("You must be logged in to register for an event.");
                return;
            }

            const response = await fetch(`http://localhost:5001/api/projects/${entryId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                throw new Error(errorData.message || `Failed to register for event: ${response.statusText}`);
            }

            alert('Successfully registered for the event!');
            const users = await fetchRegisteredUsers(entryId);
            setRegisteredUsers(users);
        } catch (err) {
            console.error('Error registering for event:', err);
            alert('Error registering for event: ' + err.message);
        }
    }, [fetchRegisteredUsers]);

    const handleViewProfile = useCallback((userIdToView) => {
        navigate(`/profile/${userIdToView}`);
    }, [navigate]);

    // Memoize filtered entries
    const { events, projects } = useMemo(() => ({
        events: userEntries.filter(entry => entry.type === 'event'),
        projects: userEntries.filter(entry => entry.type === 'project')
    }), [userEntries]);

    return (
        <div className="events-container">
            <div className="events-header">
                <h1>Events</h1>
                {user && (
                    <button 
                        onClick={() => setShowCreateModal(true)} 
                        className="create-button"
                    >
                        Create New Event
                    </button>
                )}
            </div>
            {loading ? (
                <div className="loading">Loading events...</div>
            ) : error ? (
                <div className="error">{error}</div>
            ) : userEntries.length === 0 ? (
                <div className="no-events">
                    <p>No events found.</p>
                </div>
            ) : (
                <div className="events-grid">
                    {userEntries.map((entry) => (
                        <EventCard
                            key={entry.id}
                            project={entry}
                            onClick={() => handleEntryCardClick(entry)}
                        />
                    ))}
                </div>
            )}
            {showDetailModal && selectedEntry && (
                <EventDetailModal
                    event={selectedEntry}
                    registeredUsers={registeredUsers}
                    onClose={() => {
                        setShowDetailModal(false);
                        setSelectedEntry(null);
                        setRegisteredUsers([]);
                    }}
                    onDelete={() => handleDeleteEntry(selectedEntry.id)}
                    onRegister={() => handleRegisterForEntry(selectedEntry.id)}
                    isCurrentUsersEvent={selectedEntry.user_id === parseInt(user?.id)}
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

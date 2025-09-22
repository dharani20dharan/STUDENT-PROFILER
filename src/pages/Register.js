// src/pages/Register.js
import React, { useState, useEffect, useCallback } from 'react';
import '../styles/Register.css';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [entries, setEntries] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    const getAuthToken = () => {
        return localStorage.getItem('token');
    };

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

            const url = 'http://localhost:5001/api/all-projects';
            const response = await fetch(url, {
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
                console.error('Error fetching entries - Server Response:', errorData);
                throw new Error(errorData.message || `Failed to fetch entries: ${response.statusText}`);
            }

            const data = await response.json();
            console.log('Fetched All Entries Data:', data);
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
                alert("You must be logged in to register for an entry.");
                return;
            }

            const response = await fetch(`http://localhost:5001/api/projects/${entryId}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({})
            });

            if (!response.ok) {
                let errorData;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                console.error('Error registering for entry - Server Response:', errorData);
                if (response.status === 409) {
                    alert("You have already registered for this entry!");
                } else {
                    alert('Error registering for entry: ' + (errorData.message || response.statusText));
                }
                return;
            }

            const data = await response.json();
            console.log('Registration successful:', data);
            alert('Successfully registered for the entry!');
            setShowDetailModal(false);
        } catch (err) {
            console.error('Error registering for entry:', err);
            alert('Error registering for entry: ' + err.message);
        }
    };

    const handleViewProfile = (userIdToView) => {
        navigate(`/profile/${userIdToView}`);
    };

    // Separate projects and events
    const projects = entries.filter(entry => entry.type === 'project');
    const events = entries.filter(entry => entry.type === 'event');

    return (
        <div className="register-container">
            <div className="register-header">
                <h1>Register & Contribute!</h1>
            </div>

            <div className="register-content">
                {loading && <p className="loading-message">Loading entries...</p>}
                {error && <p className="error-message">{error}</p>}

                {!loading && !error && (
                    <div className="entries-split">
                        <div className="entries-column">
                            <h2>Community Projects</h2>
                            {projects.length === 0 ? (
                                <p className="no-entries-message">
                                    No projects available for registration yet.
                                </p>
                            ) : (
                                <div className="entries-list">
                                    {projects.map(entry => (
                                        <EventCard
                                            key={entry.id}
                                            project={entry}
                                            onClick={() => handleEntryClick(entry)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className="entries-column">
                            <h2>Community Events</h2>
                            {events.length === 0 ? (
                                <p className="no-entries-message">
                                    No events available for registration yet.
                                </p>
                            ) : (
                                <div className="entries-list">
                                    {events.map(entry => (
                                        <EventCard
                                            key={entry.id}
                                            project={entry}
                                            onClick={() => handleEntryClick(entry)}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <EventDetailModal
                show={showDetailModal}
                onClose={() => {
                    setShowDetailModal(false);
                    setSelectedEntry(null);
                }}
                project={selectedEntry}
                isHost={false}
                onRegister={handleRegisterEntry}
                onDelete={() => {}}
                registeredUsers={[]}
                onViewProfile={handleViewProfile}
            />
        </div>
    );
};

export default Register;

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

const Projects = () => {
    const [userEntries, setUserEntries] = useState([]);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [selectedEntry, setSelectedEntry] = useState(null);
    const [registeredUsers, setRegisteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { user } = useAuth();
    const navigate = useNavigate();

    const getAuthToken = () => localStorage.getItem('token');

    const fetchUserEntries = useCallback(async () => {
        try {
            const token = getAuthToken();
            if (!token) {
                setError('You must be logged in to view projects.');
                setLoading(false);
                return;
            }

            const response = await fetch(`${API_URL}/api/projects`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to fetch projects');

            const data = await response.json();
            const projectsOnly = data.filter(entry => entry.type === 'project');
            setUserEntries(projectsOnly);
        } catch (err) {
            console.error('Error fetching projects:', err);
            setError('Failed to load projects');
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

    const handleCreateProject = useCallback(async (projectData) => {
        try {
            const token = getAuthToken();
            if (!token) {
                alert("You must be logged in to create a project.");
                return;
            }

            const response = await fetch(`${API_URL}/api/projects`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    ...projectData,
                    type: 'project'
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: response.statusText }));
                throw new Error(errorData.message || 'Failed to create project');
            }

            setShowCreateModal(false);
            fetchUserEntries();
            // Success handled by UI update
        } catch (err) {
            console.error('Error creating project:', err);
            alert('Error creating project: ' + err.message);
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

    const handleDeleteEntry = useCallback(async (id) => {
        if (!window.confirm("Are you sure you want to delete this project?")) return;

        try {
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/api/projects/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to delete project');

            setShowDetailModal(false);
            fetchUserEntries();
        } catch (err) {
            console.error('Error deleting project:', err);
            alert('Error deleting project: ' + err.message);
        }
    }, [fetchUserEntries]);

    const handleRegisterForEntry = useCallback(async (id) => {
        try {
            const token = getAuthToken();
            const response = await fetch(`${API_URL}/api/projects/${id}/register`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Failed to register');

            alert('Successfully registered!');
            // Refresh logic if needed
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
                        <h1 className="text-3xl font-bold text-white mb-2">My Projects</h1>
                        <p className="text-text-secondary">Showcase your work and find collaborators.</p>
                    </div>
                    {user && (
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-primary hover:bg-primary-blue-dark text-white px-6 py-3 rounded-full font-bold shadow-lg shadow-primary/25 transition-all transform hover:scale-105 active:scale-95 flex items-center"
                        >
                            <FontAwesomeIcon icon={faPlus} className="mr-2" /> Add New Project
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
                        <p className="text-text-secondary text-lg mb-4">No projects found.</p>
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="text-primary hover:text-white font-medium transition-colors"
                        >
                            Create your first project
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
                onSubmit={handleCreateProject}
                initialData={{ type: 'project' }}
            />
        </div>
    );
};

export default Projects; 
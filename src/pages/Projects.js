import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import '../styles/Projects.css';
import EventCard from '../components/EventCard';
import EventDetailModal from '../components/EventDetailModal';
import EventModal from '../components/EventModal';

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

    useEffect(() => {
        fetchUserEntries();
    }, []);

    const fetchUserEntries = async () => {
        try {
            const response = await axios.get('http://localhost:5001/api/projects', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            // Filter to only show projects
            const projectsOnly = response.data.filter(entry => entry.type === 'project');
            setUserEntries(projectsOnly);
            setLoading(false);
        } catch (error) {
            console.error('Error fetching projects:', error);
            setError('Failed to load projects');
            setLoading(false);
        }
    };

    const handleEntryCardClick = (entry) => {
        setSelectedEntry(entry);
        setShowDetailModal(true);
    };

    const handleDeleteEntry = async (id) => {
        try {
            const response = await axios.delete(`http://localhost:5001/api/projects/${id}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 204) {
                fetchUserEntries();
            }
        } catch (error) {
            console.error('Error deleting project:', error);
            alert('Error deleting project: ' + error.message);
        }
    };

    const handleRegisterForEntry = async (id) => {
        try {
            const response = await axios.post(`http://localhost:5001/api/projects/${id}/register`, null, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            if (response.status === 200) {
                fetchUserEntries();
            }
        } catch (error) {
            console.error('Error registering for project:', error);
            alert('Error registering for project: ' + error.message);
        }
    };

    const handleCreateProject = async (projectData) => {
        try {
            const token = localStorage.getItem('token');
            if (!token) {
                alert("You must be logged in to create a project.");
                return;
            }

            const response = await fetch('http://localhost:5001/api/projects', {
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
                let errorData;
                const contentType = response.headers.get("content-type");
                if (contentType && contentType.includes("application/json")) {
                    errorData = await response.json();
                } else {
                    errorData = await response.text();
                }
                throw new Error(errorData.message || `Failed to create project: ${response.statusText}`);
            }

            const createdProject = await response.json();
            setShowCreateModal(false);
            fetchUserEntries();
            alert('Project created successfully!');
        } catch (err) {
            console.error('Error creating project:', err);
            alert('Error creating project: ' + err.message);
        }
    };

    if (loading) return <div className="loading">Loading projects...</div>;
    if (error) return <div className="error">{error}</div>;

    return (
        <div className="projects-container">
            <div className="projects-header">
                <h1>Projects</h1>
                {user && (
                    <button 
                        onClick={() => setShowCreateModal(true)} 
                        className="create-button"
                    >
                        Create New Project
                    </button>
                )}
            </div>
            {userEntries.length === 0 ? (
                <div className="no-projects">
                    <p>No projects found.</p>
                </div>
            ) : (
                <div className="projects-grid">
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
                onSubmit={handleCreateProject}
                initialData={{ type: 'project' }}
            />
        </div>
    );
};

export default Projects; 
// src/components/EventModal.js
import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCodeBranch, faLink } from '@fortawesome/free-solid-svg-icons';
// The import for EventModal.css is removed as styles are consolidated in styles.css

const EventModal = ({ show, onClose, onSubmit, initialData = {} }) => {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [links, setLinks] = useState('');
    const [type, setType] = useState('event'); // New state for type, default to 'event'

    // Reset form fields when modal is shown or initialData changes
    useEffect(() => {
        if (show) {
            setProjectName(initialData.project_name || '');
            setProjectDescription(initialData.project_description || '');
            setLinks(initialData.links || '');
            setType(initialData.type || 'event'); // Set type from initialData or default
        }
    }, [show, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        // Ensure links is a string, even if empty
        const linksString = links ? links : ''; 
        onSubmit({ 
            project_name: projectName, 
            project_description: projectDescription, 
            links: linksString,
            type: type // Include the new type
        });
    };

    if (!show) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content event-detail-modal">
                <button className="modal-close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>

                <div className="detail-header">
                    <FontAwesomeIcon 
                        icon={type === 'event' ? faCalendarAlt : faCodeBranch} 
                        className="detail-icon" 
                    />
                    <h2>{initialData.id ? 'Edit Entry' : 'Create New Entry'}</h2>
                </div>

                <div className="detail-body">
                    <form onSubmit={handleSubmit}>
                        <div className="detail-section">
                            <h3>Entry Type</h3>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="form-control"
                                required
                            >
                                <option value="event">Event</option>
                                <option value="project">Project</option>
                            </select>
                        </div>

                        <div className="detail-section">
                            <h3>{type === 'event' ? 'Event Name' : 'Project Name'}</h3>
                            <input
                                type="text"
                                value={projectName}
                                onChange={(e) => setProjectName(e.target.value)}
                                className="form-control"
                                required
                                placeholder={`Enter ${type === 'event' ? 'event' : 'project'} name`}
                            />
                        </div>

                        <div className="detail-section">
                            <h3>Description</h3>
                            <textarea
                                value={projectDescription}
                                onChange={(e) => setProjectDescription(e.target.value)}
                                className="form-control"
                                rows="4"
                                placeholder={`Describe your ${type === 'event' ? 'event' : 'project'}`}
                                required
                            />
                        </div>

                        <div className="detail-section">
                            <h3>Links</h3>
                            <div className="input-with-icon">
                                <FontAwesomeIcon icon={faLink} className="input-icon" />
                                <input
                                    type="text"
                                    value={links}
                                    onChange={(e) => setLinks(e.target.value)}
                                    className="form-control"
                                    placeholder="Enter comma-separated URLs (optional)"
                                />
                            </div>
                        </div>

                        <div className="detail-section">
                            <button type="submit" className="btn register-btn">
                                {initialData.id ? 'Update Entry' : 'Create Entry'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default EventModal;

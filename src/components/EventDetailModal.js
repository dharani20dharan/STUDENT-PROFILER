// src/components/EventDetailModal.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCodeBranch, faExternalLinkAlt, faTimes, faUser, faTrash } from '@fortawesome/free-solid-svg-icons';

const EventDetailModal = ({ 
    show, 
    onClose, 
    project, // Renamed from 'project' to 'entry' for consistency, but kept 'project' for now to match prop name
    isHost, 
    onDelete, 
    registeredUsers, 
    onViewProfile,
    onRegister // New prop for registration functionality
}) => {
    if (!show || !project) {
        return null;
    }

    // Destructure properties including the new 'type'
    const { id, project_name, project_description, links, creator_name, user_id, type } = project;

    // Determine icon and type display based on the 'type' property
    let icon;
    let typeDisplay;
    if (type === 'event') {
        icon = <FontAwesomeIcon icon={faCalendarAlt} className="detail-icon" />;
        typeDisplay = 'Event';
    } else {
        icon = <FontAwesomeIcon icon={faCodeBranch} className="detail-icon" />;
        typeDisplay = 'Project';
    }

    // Split links string into an array for rendering
    const linkArray = links ? links.split(',').map(link => link.trim()).filter(link => link) : [];

    return (
        <div className="modal-overlay">
            <div className="modal-content event-detail-modal"> {/* Added class for specific styling */}
                <button className="modal-close-btn" onClick={onClose}>
                    <FontAwesomeIcon icon={faTimes} />
                </button>
                <div className="detail-header">
                    {icon}
                    <h2>{project_name}</h2>
                    <span className={`detail-type-badge ${type === 'event' ? 'event-type' : 'project-type'}`}>{typeDisplay}</span>
                </div>

                <div className="detail-body">
                    <div className="detail-section">
                        <h3>Description</h3>
                        <p className="detail-description">{project_description}</p>
                    </div>

                    <div className="detail-section">
                        <h3>Created by</h3>
                        <p className="detail-creator">
                            <FontAwesomeIcon icon={faUser} className="creator-icon" />
                            <span 
                                className="creator-name-link" 
                                onClick={() => onViewProfile(user_id)}
                                role="button"
                                tabIndex={0}
                                onKeyPress={(e) => {
                                    if (e.key === 'Enter') {
                                        onViewProfile(user_id);
                                    }
                                }}
                            >
                                {creator_name}
                            </span>
                        </p>
                    </div>

                    {linkArray.length > 0 && (
                        <div className="detail-section">
                            <h3>{typeDisplay} Links</h3>
                            <ul className="detail-links">
                                {linkArray.map((link, index) => (
                                    <li key={index}>
                                        <a href={link} target="_blank" rel="noopener noreferrer">
                                            <FontAwesomeIcon icon={faExternalLinkAlt} />
                                            {link}
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {isHost ? (
                        <div className="detail-section">
                            <h3>Registered Users</h3>
                            {registeredUsers.length > 0 ? (
                                <ul className="registered-users-list">
                                    {registeredUsers.map(user => (
                                        <li key={user.user_id}>
                                            <span 
                                                className="registered-user-name" 
                                                onClick={() => onViewProfile(user.user_id)}
                                                role="button"
                                                tabIndex={0}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onViewProfile(user.user_id);
                                                    }
                                                }}
                                            >
                                                <FontAwesomeIcon icon={faUser} className="user-icon" />
                                                {user.name} ({user.email})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="no-registrations">No users have registered for this {type} yet.</p>
                            )}
                            <button 
                                onClick={() => onDelete(id)} 
                                className="btn delete-btn"
                            >
                                <FontAwesomeIcon icon={faTrash} />
                                Delete {typeDisplay}
                            </button>
                        </div>
                    ) : (
                        <div className="detail-section">
                            <button 
                                onClick={() => onRegister(id)} 
                                className="btn register-btn"
                            >
                                Register for this {typeDisplay}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;

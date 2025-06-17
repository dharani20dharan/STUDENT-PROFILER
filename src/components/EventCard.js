// src/components/EventCard.js
import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCodeBranch } from '@fortawesome/free-solid-svg-icons'; // Import icons

const EventCard = ({ project, onClick }) => { // Renamed prop from 'project' to 'entry' for clarity
    // Destructure properties including the new 'type'
    const { project_name, project_description, creator_name, type } = project; 

    // Determine icon and type display based on the 'type' property
    let icon;
    let typeDisplay;
    let typeClass = ''; // For potential styling based on type

    if (type === 'event') {
        icon = <FontAwesomeIcon icon={faCalendarAlt} className="card-icon event-icon" />;
        typeDisplay = 'Event';
        typeClass = 'event-type';
    } else { // Default to project if type is not 'event' or is undefined
        icon = <FontAwesomeIcon icon={faCodeBranch} className="card-icon project-icon" />;
        typeDisplay = 'Project';
        typeClass = 'project-type';
    }

    return (
        <div className="event-card" onClick={onClick}> {/* Renamed class to event-card */}
            <div className="card-header">
                {icon}
                <h3 className="card-title">{project_name}</h3>
                <span className={`card-type-badge ${typeClass}`}>{typeDisplay}</span> {/* Display type */}
            </div>
            <p className="card-description">{project_description}</p>
            <p className="card-creator">Created by: {creator_name}</p>
        </div>
    );
};

export default EventCard;

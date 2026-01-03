import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCodeBranch, faUser } from '@fortawesome/free-solid-svg-icons';

const EventCard = ({ project, onClick }) => {
    const { project_name, project_description, creator_name, type } = project;

    const isEvent = type === 'event';
    const icon = isEvent ? faCalendarAlt : faCodeBranch;
    const typeLabel = isEvent ? 'Event' : 'Project';

    // Dynamic styles based on type
    const accentColor = isEvent ? 'text-accent' : 'text-primary';
    const badgeBg = isEvent ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20';

    return (
        <div
            onClick={onClick}
            className="glass-card p-5 cursor-pointer group hover:scale-[1.02] active:scale-95 transition-all duration-300 flex flex-col h-full"
        >
            <div className="flex justify-between items-start mb-3">
                <div className={`h-10 w-10 rounded-lg ${isEvent ? 'bg-accent/20' : 'bg-primary/20'} flex items-center justify-center`}>
                    <FontAwesomeIcon icon={icon} className={`text-xl ${accentColor}`} />
                </div>
                <span className={`px-2 py-1 rounded text-xs font-medium border ${badgeBg} uppercase tracking-wider`}>
                    {typeLabel}
                </span>
            </div>

            <h3 className="text-xl font-bold text-white mb-2 line-clamp-1 group-hover:text-primary transition-colors">
                {project_name}
            </h3>

            <p className="text-text-secondary text-sm mb-4 line-clamp-3 flex-grow">
                {project_description}
            </p>

            <div className="mt-auto pt-4 border-t border-white/5 flex items-center text-xs text-text-secondary">
                <FontAwesomeIcon icon={faUser} className="mr-2" />
                <span className="truncate">By {creator_name}</span>
            </div>
        </div>
    );
};

export default EventCard;

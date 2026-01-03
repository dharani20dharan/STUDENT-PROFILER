import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCalendarAlt, faCodeBranch, faExternalLinkAlt, faTimes, faUser, faTrash, faCheckCircle } from '@fortawesome/free-solid-svg-icons';

const EventDetailModal = ({
    show,
    onClose,
    project,
    isHost,
    onDelete,
    registeredUsers,
    onViewProfile,
    onRegister
}) => {
    if (!show || !project) return null;

    const { id, project_name, project_description, links, creator_name, user_id, type } = project;
    const isEvent = type === 'event';
    const linkArray = links ? links.split(',').map(link => link.trim()).filter(link => link) : [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-2xl relative overflow-hidden animate-fade-in-up max-h-[90vh] flex flex-col">

                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-start bg-white/5 shrink-0">
                    <div className="flex gap-4">
                        <div className={`p-3 rounded-xl h-fit ${isEvent ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                            <FontAwesomeIcon icon={isEvent ? faCalendarAlt : faCodeBranch} className="text-2xl" />
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-1">{project_name}</h2>
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${isEvent ? 'bg-accent/10 text-accent border-accent/20' : 'bg-primary/10 text-primary border-primary/20'}`}>
                                {isEvent ? 'Event' : 'Project'}
                            </span>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-text-secondary hover:text-white transition-colors p-1">
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Body - Scrollable */}
                <div className="p-6 overflow-y-auto custom-scrollbar space-y-8">

                    {/* Description */}
                    <div className="prose prose-invert max-w-none">
                        <h3 className="text-sm uppercase tracking-wider text-text-secondary font-semibold mb-3">Description</h3>
                        <p className="text-text-primary leading-relaxed whitespace-pre-wrap">{project_description}</p>
                    </div>

                    {/* Links */}
                    {linkArray.length > 0 && (
                        <div>
                            <h3 className="text-sm uppercase tracking-wider text-text-secondary font-semibold mb-3">Resources</h3>
                            <div className="flex flex-wrap gap-2">
                                {linkArray.map((link, index) => (
                                    <a
                                        key={index}
                                        href={link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 transition-colors text-primary text-sm"
                                    >
                                        <FontAwesomeIcon icon={faExternalLinkAlt} className="text-xs" />
                                        <span className="truncate max-w-[200px]">{link}</span>
                                    </a>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Creator Info */}
                    <div>
                        <h3 className="text-sm uppercase tracking-wider text-text-secondary font-semibold mb-3">Organizer</h3>
                        <div
                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all cursor-pointer group w-fit"
                            onClick={() => onViewProfile(user_id)}
                        >
                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-lg">
                                {creator_name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                                <p className="font-bold text-white group-hover:text-primary transition-colors">{creator_name}</p>
                                <p className="text-xs text-text-secondary">View Profile</p>
                            </div>
                        </div>
                    </div>

                    {/* Host View: Registered Users */}
                    {isHost && (
                        <div>
                            <h3 className="text-sm uppercase tracking-wider text-text-secondary font-semibold mb-3 flex items-center justify-between">
                                <span>Registered Participants</span>
                                <span className="bg-white/10 px-2 py-1 rounded-full text-xs text-white">{registeredUsers.length}</span>
                            </h3>

                            {registeredUsers.length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                    {registeredUsers.map(user => (
                                        <div
                                            key={user.user_id}
                                            className="flex items-center gap-3 p-3 rounded-lg bg-white/5 border border-white/5"
                                        >
                                            <div className="h-8 w-8 rounded-full bg-surface flex items-center justify-center text-text-secondary">
                                                <FontAwesomeIcon icon={faUser} className="text-xs" />
                                            </div>
                                            <div className="overflow-hidden">
                                                <p
                                                    className="text-sm font-medium text-white truncate cursor-pointer hover:text-primary"
                                                    onClick={() => onViewProfile(user.user_id)}
                                                >
                                                    {user.name}
                                                </p>
                                                <p className="text-xs text-text-secondary truncate">{user.email}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-4 rounded-lg bg-dashed border border-dashed border-white/10 text-center">
                                    <p className="text-text-secondary text-sm">No registrations yet.</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-white/10 bg-white/5 shrink-0">
                    {isHost ? (
                        <button
                            onClick={() => onDelete(id)}
                            className="w-full py-3 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 hover:text-red-400 border border-red-500/20 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faTrash} />
                            Delete {isEvent ? 'Event' : 'Project'}
                        </button>
                    ) : (
                        <button
                            onClick={() => onRegister(id)}
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-blue-dark text-white font-bold rounded-lg shadow-lg shadow-primary/25 transition-all transform active:scale-95 flex items-center justify-center gap-2"
                        >
                            <FontAwesomeIcon icon={faCheckCircle} />
                            Register for this {isEvent ? 'Event' : 'Project'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EventDetailModal;

import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes, faCalendarAlt, faCodeBranch, faLink } from '@fortawesome/free-solid-svg-icons';

const EventModal = ({ show, onClose, onSubmit, initialData = {} }) => {
    const [projectName, setProjectName] = useState('');
    const [projectDescription, setProjectDescription] = useState('');
    const [links, setLinks] = useState('');
    const [type, setType] = useState('event');

    useEffect(() => {
        if (show) {
            setProjectName(initialData.project_name || '');
            setProjectDescription(initialData.project_description || '');
            setLinks(initialData.links || '');
            setType(initialData.type || 'event');
        }
    }, [show, initialData]);

    const handleSubmit = (e) => {
        e.preventDefault();
        const linksString = links ? links : '';
        onSubmit({
            project_name: projectName,
            project_description: projectDescription,
            links: linksString,
            type: type
        });
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="glass-card w-full max-w-lg relative overflow-hidden animate-fade-in-up">
                {/* Header */}
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${type === 'event' ? 'bg-accent/20 text-accent' : 'bg-primary/20 text-primary'}`}>
                            <FontAwesomeIcon icon={type === 'event' ? faCalendarAlt : faCodeBranch} />
                        </div>
                        <h2 className="text-xl font-bold text-white">
                            {initialData.id ? 'Edit Entry' : 'Create New Entry'}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="text-text-secondary hover:text-white transition-colors"
                    >
                        <FontAwesomeIcon icon={faTimes} className="text-xl" />
                    </button>
                </div>

                {/* Body */}
                <form onSubmit={handleSubmit} className="p-6 space-y-5">

                    {/* Type Selection */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Entry Type</label>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setType('event')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${type === 'event'
                                        ? 'bg-accent/20 border-accent text-white'
                                        : 'bg-surface border-white/10 text-text-secondary hover:border-white/20'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" /> Event
                            </button>
                            <button
                                type="button"
                                onClick={() => setType('project')}
                                className={`p-3 rounded-lg border text-sm font-medium transition-all ${type === 'project'
                                        ? 'bg-primary/20 border-primary text-white'
                                        : 'bg-surface border-white/10 text-text-secondary hover:border-white/20'
                                    }`}
                            >
                                <FontAwesomeIcon icon={faCodeBranch} className="mr-2" /> Project
                            </button>
                        </div>
                    </div>

                    {/* Name */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">
                            {type === 'event' ? 'Event Name' : 'Project Name'}
                        </label>
                        <input
                            type="text"
                            value={projectName}
                            onChange={(e) => setProjectName(e.target.value)}
                            required
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50"
                            placeholder="e.g., Hackathon 2024"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Description</label>
                        <textarea
                            value={projectDescription}
                            onChange={(e) => setProjectDescription(e.target.value)}
                            required
                            rows="4"
                            className="w-full px-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50 resize-none"
                            placeholder="Describe what this is about..."
                        />
                    </div>

                    {/* Links */}
                    <div>
                        <label className="block text-sm font-medium text-text-secondary mb-2">Links (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FontAwesomeIcon icon={faLink} className="text-text-secondary" />
                            </div>
                            <input
                                type="text"
                                value={links}
                                onChange={(e) => setLinks(e.target.value)}
                                className="w-full pl-10 pr-4 py-3 bg-black/20 border border-white/10 rounded-lg text-white focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all placeholder:text-text-secondary/50"
                                placeholder="http://example.com, http://github.com/..."
                            />
                        </div>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                        <button
                            type="submit"
                            className="w-full py-3 px-4 bg-primary hover:bg-primary-blue-dark text-white font-bold rounded-lg shadow-lg shadow-primary/25 transition-all transform active:scale-95"
                        >
                            {initialData.id ? 'Update Entry' : 'Create Entry'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EventModal;

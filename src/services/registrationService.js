import axios from 'axios';
import { notificationService } from './notificationService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

export const registrationService = {
    async registerForProject(userId, projectId) {
        try {
            const response = await axios.post(`${API_URL}/api/projects/${projectId}/register`, {}, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error registering for project:', error);
            throw error;
        }
    },

    // ... rest of your existing registration service methods ...
}; 
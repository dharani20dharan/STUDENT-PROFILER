import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001';

// Get the auth token from localStorage
const getAuthToken = () => {
    const token = localStorage.getItem('token');
    return token ? `Bearer ${token}` : '';
};

export const notificationService = {
    // Create a new notification
    async createNotification(userId, projectId, joineeId) {
        try {
            const response = await axios.post(`${API_URL}/api/notifications`, {
                userId,
                projectId,
                joineeId
            }, {
                headers: {
                    'Authorization': getAuthToken()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error creating notification:', error);
            throw error;
        }
    },

    // Get notifications for a user
    async getUserNotifications(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/notifications/${userId}`, {
                headers: {
                    'Authorization': getAuthToken()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching notifications:', error);
            throw error;
        }
    },

    // Mark notifications as read
    async markNotificationsAsRead(userId) {
        try {
            const response = await axios.put(`${API_URL}/api/notifications/${userId}/read`, {}, {
                headers: {
                    'Authorization': getAuthToken()
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error marking notifications as read:', error);
            throw error;
        }
    },

    // Get unread notification count
    async getUnreadCount(userId) {
        try {
            const response = await axios.get(`${API_URL}/api/notifications/${userId}/unread`, {
                headers: {
                    'Authorization': getAuthToken()
                }
            });
            return response.data.count;
        } catch (error) {
            console.error('Error getting unread count:', error);
            throw error;
        }
    }
}; 
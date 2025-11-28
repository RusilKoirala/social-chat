import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token and credentials
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    config.withCredentials = true; // Send cookies
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.error || error.message || 'Something went wrong';
    return Promise.reject(new Error(message));
  }
);

class ApiService {
  // Auth endpoints
  async sendOTP(email, username) {
    return api.post('/api/auth/send-otp', { email, username });
  }

  async verifyOTP(email, otp) {
    return api.post('/api/auth/verify-otp', { email, otp });
  }

  async register(username, email, password, otp) {
    return api.post('/api/auth/register', { username, email, password, otp });
  }

  async login(email, password) {
    return api.post('/api/auth/login', { email, password });
  }

  async loginWithGoogle(credential) {
    return api.post('/api/auth/google', { credential });
  }

  async getCurrentUser() {
    return api.get('/api/auth/me');
  }

  // User endpoints
  async getUsers(search = '') {
    return api.get('/api/users', { params: { search } });
  }

  async getUserProfile(userId) {
    return api.get(`/api/users/${userId}`);
  }

  async updateProfile(data) {
    return api.put('/api/users/profile', data);
  }

  // Message endpoints
  async getRoomMessages(room, limit = 50, before = null) {
    const params = { limit };
    if (before) params.before = before;
    return api.get(`/api/messages/room/${room}`, { params });
  }

  async getPrivateMessages(userId, limit = 50, before = null) {
    const params = { limit };
    if (before) params.before = before;
    return api.get(`/api/messages/private/${userId}`, { params });
  }

  // Friend endpoints
  async sendFriendRequest(receiverId) {
    return api.post('/api/friends/request', { receiverId });
  }

  async acceptFriendRequest(requestId) {
    return api.put(`/api/friends/request/${requestId}/accept`);
  }

  async rejectFriendRequest(requestId) {
    return api.put(`/api/friends/request/${requestId}/reject`);
  }

  async getFriendRequests() {
    return api.get('/api/friends/requests');
  }

  async getFriends() {
    return api.get('/api/friends');
  }

  async getFriendshipStatus(userId) {
    return api.get(`/api/friends/status/${userId}`);
  }

  async removeFriend(userId) {
    return api.delete(`/api/friends/${userId}`);
  }

  async logout() {
    return api.post('/api/auth/logout');
  }
}

export default new ApiService();

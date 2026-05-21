import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';


const api = axios.create({
  baseURL: API_BASE_URL,
});

// Интерсептор для добавления JWT токена
api.interceptors.request.use(config => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ========== Auth ==========
export const authAPI = {
  login: async (username, password) => {
    const response = await api.post('/auth/signin', { username, password });
    if (response.data.token) return response.data;
    throw new Error(response.data.error || 'Login failed');
  },
  register: async (userData) => {
    const response = await api.post('/auth/signup', userData);
    return response.data;
  },
  getCurrentUser: async () => {
    const response = await api.get('/users/me');
    return response.data;
  },
};

// Books
export const bookAPI = {
  getAll: () => api.get('/books'),
  getById: (id) => api.get(`/books/${id}`),
  getQuestions: (bookId) => api.get(`/books/${bookId}/questions`),
  getAchievements: (bookId) => api.get(`/books/${bookId}/achievements`),
  getFigurines: (bookId) => api.get(`/books/${bookId}/figurines`),
  create: (bookData) => api.post('/books', bookData),
  delete: (id) => api.delete(`/books/${id}`),

  createQuestion: (bookId, question) => api.post(`/books/${bookId}/questions`, question),
  addQuestionAnchor: (bookId, anchor) => api.post(`/books/${bookId}/anchors`, anchor),
  createAchievement: (bookId, ach) => api.post(`/books/${bookId}/achievements`, ach),
  createFigurine: (bookId, fig) => api.post(`/books/${bookId}/figurines`, fig),
};

// Progress
export const progressAPI = {
  startReading: (userId, bookId) => api.post(`/progress/start?userId=${userId}&bookId=${bookId}`),
  heartbeat: (userId, bookId, seconds) => 
    api.post(`/progress/heartbeat?userId=${userId}&bookId=${bookId}&seconds=${seconds}`),
  submitAnswer: (answerData) => api.post('/progress/answer', answerData),
  getProgress: (userId, bookId) => api.get(`/progress/${userId}/${bookId}`),
  getBatchProgress: (userIds, bookId) => 
    api.post(`/progress/batch?bookId=${bookId}`, userIds),
};

// ========== Shelf ==========
export const shelfAPI = {
  getMyShelf: () => api.get('/shelves/me'),
  addCompletedBook: (bookData) => api.post('/shelves/me/books', bookData),
  updateShelf: (name, isPublic) => api.put(`/shelves/me?name=${name}&isPublic=${isPublic}`),
  getPublicShelves: () => api.get('/shelves/public'),
  getUserShelf: (targetUserId, isAdmin = false) => 
    api.get(`/shelves/user/${targetUserId}?isAdmin=${isAdmin}`),
};

// ========== Gamification ==========
export const gamificationAPI = {
  getUserAchievements: (userId) => api.get(`/gamification/users/${userId}/achievements`),
  getUserFigurines: (userId) => api.get(`/gamification/users/${userId}/figurines`),
};

// ========== Groups ==========
export const groupAPI = {
  create: (name) => api.post('/groups', { name }),
  join: (inviteCode) => api.post(`/groups/join/${inviteCode}`),
  leave: (groupId) => api.post(`/groups/${groupId}/leave`),
  removeMember: (groupId, targetUserId) => 
    api.delete(`/groups/${groupId}/members/${targetUserId}`),
  assignBook: (groupId, bookId, bookTitle, deadline) => 
    api.post(`/groups/${groupId}/assign-book`, { bookId, bookTitle, deadline }),
  removeAssignedBook: (groupId) => api.delete(`/groups/${groupId}/assigned-book`),
  completeDeadline: (groupId) => api.post(`/groups/${groupId}/complete-deadline`),
  deleteGroup: (groupId) => api.delete(`/groups/${groupId}`),
  getGroup: (groupId) => api.get(`/groups/${groupId}`),
  getMyGroups: () => api.get('/groups/my'),
};
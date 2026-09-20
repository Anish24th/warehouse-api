const API_BASE = '/api';

export const getAuthToken = () => localStorage.getItem('ac_warehouse_token');
export const setAuthToken = (token) => localStorage.setItem('ac_warehouse_token', token);
export const removeAuthToken = () => localStorage.removeItem('ac_warehouse_token');

export const getStoredUser = () => {
    const userStr = localStorage.getItem('ac_warehouse_user');
    return userStr ? JSON.parse(userStr) : null;
};
export const setStoredUser = (user) => localStorage.setItem('ac_warehouse_user', JSON.stringify(user));
export const removeStoredUser = () => localStorage.removeItem('ac_warehouse_user');

async function request(endpoint, options = {}) {
    const token = getAuthToken();
    const headers = {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
        ...options.headers
    };

    const config = {
        ...options,
        headers
    };

    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
        throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
}

export const api = {
    // Auth & Accounts
    login: (email, password) => request('/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
    register: (userData) => request('/auth/register', { method: 'POST', body: JSON.stringify(userData) }),
    guestLogin: () => request('/auth/guest', { method: 'POST' }),
    createWorker: (workerData) => request('/auth/create-worker', { method: 'POST', body: JSON.stringify(workerData) }),
    getMe: () => request('/auth/me'),
    getWorkers: () => request('/auth/workers'),

    // AC Models
    getAllACs: (params = '') => request(`/ac${params ? `?${params}` : ''}`),
    createAC: (acData) => request('/ac', { method: 'POST', body: JSON.stringify(acData) }),
    updateAC: (id, acData) => request(`/ac/${id}`, { method: 'PUT', body: JSON.stringify(acData) }),
    deleteAC: (id) => request(`/ac/${id}`, { method: 'DELETE' }),

    // Movements
    createMovement: (movementData) => request('/movements', { method: 'POST', body: JSON.stringify(movementData) }),
    getPendingMovements: () => request('/movements/pending'),
    getMyMovements: () => request('/movements/my'),
    getAllMovements: (params = '') => request(`/movements/all${params ? `?${params}` : ''}`),
    reviewMovement: (id, action, remarks) => request(`/movements/${id}/review`, {
        method: 'PATCH',
        body: JSON.stringify({ action, remarks })
    }),

    // Sales Sub-Dashboard
    getSalesAnalytics: () => request('/sales/summary'),

    // Problem / Issue Feed
    createIssue: (issueData) => request('/issues', { method: 'POST', body: JSON.stringify(issueData) }),
    getIssues: (params = '') => request(`/issues${params ? `?${params}` : ''}`),
    resolveIssue: (id, resolutionNotes) => request(`/issues/${id}/resolve`, {
        method: 'PATCH',
        body: JSON.stringify({ resolutionNotes })
    }),

    // Dashboard & Logs
    getDashboardStats: () => request('/dashboard/stats'),
    getAuditLogs: (params = '') => request(`/logs${params ? `?${params}` : ''}`)
};

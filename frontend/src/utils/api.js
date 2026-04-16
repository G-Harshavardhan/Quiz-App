import axios from 'axios';

// Base API instance
const api = axios.create({
    baseURL: 'https://quiz-app-production-4c0a.up.railway.app/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to attach access token
api.interceptors.request.use(
    (config) => {
        if (typeof window !== 'undefined') {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response interceptor to handle token refresh seamlessly
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        // Auth errors handling logic
        if (error.response?.status === 401 && !originalRequest._retry) {
            // Do not retry token logic on login/register endpoints
            if (originalRequest.url?.includes('login') || originalRequest.url?.includes('register')) {
                return Promise.reject(error);
            }

            originalRequest._retry = true;
            try {
                const refreshToken = localStorage.getItem('refresh_token');
                if (!refreshToken) {
                    throw new Error('No refresh token available');
                }

                const response = await axios.post('/api/accounts/token/refresh', {
                    refresh: refreshToken,
                });

                const { access } = response.data;
                localStorage.setItem('access_token', access);
                originalRequest.headers.Authorization = `Bearer ${access}`;

                return api(originalRequest);
            } catch (refreshError) {
                // Refresh token failed, clear storage
                if (typeof window !== 'undefined') {
                    localStorage.removeItem('access_token');
                    localStorage.removeItem('refresh_token');
                    window.location.href = '/signin';
                }
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export default api;

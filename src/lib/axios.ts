import axios from 'axios';
import { env } from '~/env';

export const aiApiClient = axios.create({
    baseURL: env.AI_API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth headers if needed
aiApiClient.interceptors.request.use(
    (config) => {
        // Add any authentication headers here if needed
        // For example, if you need to add an API key:
        // config.headers.Authorization = `Bearer ${env.AI_API_KEY}`;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for handling common errors
aiApiClient.interceptors.response.use(
    (response) => {
        return response;
    },
    (error) => {
        // Handle common error cases
        if (error.response?.status === 401) {
            console.error('Unauthorized access to AI API');
        } else if (error.response?.status === 429) {
            console.error('Rate limit exceeded for AI API');
        } else if (error.code === 'ECONNABORTED') {
            console.error('AI API request timeout');
        }

        return Promise.reject(error);
    }
);

export default aiApiClient;

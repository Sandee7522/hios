import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

const axiosInstance = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

// Request interceptor to add auth token
axiosInstance.interceptors.request.use(
    (config) => {
        // You might want to get the token from cookies or local storage here
        // For now, we'll assume it's handled via cookies or passed in headers if needed
        // Example: const token = localStorage.getItem('token');
        // if (token) {
        //   config.headers.Authorization = `Bearer ${token}`;
        // }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor for global error handling
axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        // Check for 401 Unauthorized to handle logout or token refresh if needed
        if (error.response && error.response.status === 401) {
            // Handle unauthorized access (e.g., redirect to login)
            console.error("Unauthorized access");
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;

'use client';

import Cookies from 'js-cookie';

/**
 * Get the current user's role from cookies
 * @returns {string|null} - 'user', 'instructor', 'admin', or null if not authenticated
 */
export function getUserRole() {
    try {
        const userRole = Cookies.get('userRole');
        return userRole || null;
    } catch (error) {
        console.error('Error getting user role:', error);
        return null;
    }
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
    try {
        const token = Cookies.get('token');
        return !!token;
    } catch (error) {
        console.error('Error checking authentication:', error);
        return false;
    }
}

/**
 * Get user profile data from cookies
 * @returns {object|null}
 */
export function getUserProfile() {
    try {
        const userDataString = Cookies.get('userData');
        if (userDataString) {
            return JSON.parse(userDataString);
        }
        return null;
    } catch (error) {
        console.error('Error getting user profile:', error);
        return null;
    }
}

/**
 * Logout user by clearing cookies
 */
export function logout() {
    try {
        Cookies.remove('token');
        Cookies.remove('userRole');
        Cookies.remove('userData');
        window.location.href = '/';
    } catch (error) {
        console.error('Error during logout:', error);
    }
}

/**
 * Get authentication token
 * @returns {string|null}
 */
export function getAuthToken() {
    try {
        return Cookies.get('token') || null;
    } catch (error) {
        console.error('Error getting auth token:', error);
        return null;
    }
}

/**
 * Set user authentication data
 * @param {string} token - JWT token
 * @param {string} role - User role
 * @param {object} userData - User profile data
 */
export function setAuthData(token, role, userData) {
    try {
        Cookies.set('token', token, { expires: 7 }); // 7 days
        Cookies.set('userRole', role, { expires: 7 });
        Cookies.set('userData', JSON.stringify(userData), { expires: 7 });
    } catch (error) {
        console.error('Error setting auth data:', error);
    }
}

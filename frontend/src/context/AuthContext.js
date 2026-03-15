'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '../utils/api';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        // Check if user is already logged in on mount
        const fetchUser = async () => {
            try {
                const token = localStorage.getItem('access_token');
                if (token) {
                    const res = await api.get('/accounts/profile');
                    setUser(res.data);
                }
            } catch (err) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('refresh_token');
            } finally {
                setLoading(false);
            }
        };
        fetchUser();
    }, []);

    const login = async (username, password) => {
        const res = await api.post('/accounts/login', { username, password });
        const { user: userData, tokens } = res.data;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        setUser(userData);
        router.push('/quiz');
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/accounts/register', userData);
        const { user: newUser, tokens } = res.data;
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        setUser(newUser);
        router.push('/quiz');
        return res.data;
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            if (refresh) {
                await api.post('/accounts/logout', { refresh });
            }
        } catch (err) {
            // Silently fail logout if token already expired
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            // Use window.location for a hard reset to home page as requested
            window.location.href = '/';
        }
    };

    const deleteAccount = async () => {
        try {
            await api.delete('/accounts/delete');
        } catch (err) {
            throw err;
        } finally {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            setUser(null);
            window.location.href = '/';
        }
    };

    // Protect quiz routes if not loading.
    useEffect(() => {
        if (!loading && !user && pathname?.startsWith('/quiz')) {
            router.push('/signin');
        }
        if (!loading && user && (pathname === '/signin' || pathname === '/signup')) {
            router.push('/quiz');
        }
    }, [user, loading, pathname, router]);

    return (
        <AuthContext.Provider value={{ user, login, register, logout, deleteAccount, loading, isAuthenticated: !!user }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);

'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SignInPage() {
    const [formData, setFormData] = useState({ username: '', password: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await login(formData.username, formData.password);
        } catch (err) {
            const errorData = err.response?.data;
            const errors = errorData?.errors || {};

            const message = errors.username?.[0] ||
                errors.password?.[0] ||
                errors.non_field_errors?.[0] ||
                errorData?.detail ||
                (err.response ? 'Invalid credentials or connection error.' : 'Cannot connect to server. Please ensure the backend is running.');

            setError(message);

            // Handle clearing based on error type
            if (errors.username) {
                setFormData({ username: '', password: '' });
            } else {
                setFormData(prev => ({ ...prev, password: '' }));
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '380px', padding: '1.75rem' }}>
                <div className="text-center mb-5">
                    <h1 style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>Welcome Back</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Sign in to continue to QuizApp</p>
                </div>

                {error && <div className="form-error" style={{ padding: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '1rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Username / Email</label>
                        <input name="username" type="text" className="glass-input" style={{ marginTop: '0' }} placeholder="Enter your username or email" required value={formData.username} onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Password</label>
                        <input name="password" type="password" className="glass-input" style={{ marginTop: '0' }} placeholder="Enter your password" required value={formData.password} onChange={handleChange} />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ padding: '12px' }} disabled={loading}>
                        {loading ? 'Signing In...' : 'Sign In'}
                    </button>
                </form>

                <p className="text-center mt-8" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Don't have an account? <Link href="/signup" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Sign Up</Link>
                </p>
            </div>
        </div>
    );
}

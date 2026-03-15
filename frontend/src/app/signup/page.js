'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '../../context/AuthContext';

export default function SignUpPage() {
    const [formData, setFormData] = useState({
        username: '',
        email: '',
        display_name: '',
        password: '',
        confirm_password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirm_password) {
            return setError('Passwords do not match');
        }

        setLoading(true);
        try {
            await register(formData);
        } catch (err) {
            const errorData = err.response?.data;
            const errors = errorData?.errors || {};

            // Priority 1: Field specific errors
            // Priority 2: General/Non-field errors
            // Priority 3: DRF detail errors
            // Priority 4: Network/Server down indicator
            const message = errors.username?.[0] ||
                errors.email?.[0] ||
                errors.password?.[0] ||
                errors.non_field_errors?.[0] ||
                errors.confirm_password?.[0] ||
                errorData?.detail ||
                (err.response ? `Server Error (${err.response.status}). Please check your backend configuration.` : 'Cannot connect to server. Please ensure the backend is running and URL is correct.');

            setError(message);
            setFormData(prev => ({ ...prev, password: '', confirm_password: '' }));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
            <div className="glass-panel animate-fade-in" style={{ width: '100%', maxWidth: '420px', padding: '1.75rem' }}>
                <div className="text-center mb-5">
                    <h1 style={{ fontSize: '1.7rem', marginBottom: '0.5rem' }}>Create Account</h1>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Join QuizApp to track your progress</p>
                </div>

                {error && <div className="form-error" style={{ padding: '8px', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleSubmit}>
                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Username</label>
                        <input name="username" type="text" className="glass-input" style={{ marginTop: '0' }} placeholder="Choose a username" required value={formData.username} onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Email</label>
                        <input name="email" type="email" className="glass-input" style={{ marginTop: '0' }} placeholder="you@email.com" required value={formData.email} onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Display Name (Optional)</label>
                        <input name="display_name" type="text" className="glass-input" style={{ marginTop: '0' }} placeholder="How should we call you?" value={formData.display_name} onChange={handleChange} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '0.75rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Password</label>
                        <input name="password" type="password" className="glass-input" style={{ marginTop: '0' }} placeholder="Minimum 8 characters" required value={formData.password} onChange={handleChange} minLength={8} />
                    </div>

                    <div className="form-group" style={{ marginBottom: '1.25rem' }}>
                        <label className="form-label" style={{ marginBottom: '0.75rem' }}>Confirm Password</label>
                        <input name="confirm_password" type="password" className="glass-input" style={{ marginTop: '0' }} placeholder="Repeat your password" required value={formData.confirm_password} onChange={handleChange} minLength={8} />
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" style={{ padding: '12px' }} disabled={loading}>
                        {loading ? 'Creating Account...' : 'Sign Up'}
                    </button>
                </form>

                <p className="text-center mt-8" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Already have an account? <Link href="/signin" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>Sign In</Link>
                </p>
            </div>
        </div>
    );
}

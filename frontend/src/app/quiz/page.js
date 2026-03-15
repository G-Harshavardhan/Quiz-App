'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function QuizPage() {
    const { user, logout, deleteAccount, loading } = useAuth();
    const router = useRouter();

    const [topic, setTopic] = useState('');
    const [numQuestions, setNumQuestions] = useState(5);
    const [difficulty, setDifficulty] = useState('Medium');
    const [loadingQuiz, setLoadingQuiz] = useState(false);
    const [history, setHistory] = useState([]);
    const [actionLoading, setActionLoading] = useState(null); // 'clear' or attemptId
    const [error, setError] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (user) {
            fetchHistory();
        }
    }, [user]);

    const handleDeleteAccount = async () => {
        if (!window.confirm('Are you sure you want to PERMANENTLY DELETE your account?\nThis will erase all your history and profile. This cannot be undone.')) {
            return;
        }

        setIsDeleting(true);
        try {
            await deleteAccount();
        } catch (err) {
            setError('Failed to delete account. Please try again.');
            setIsDeleting(false);
        }
    };

    const fetchHistory = async () => {
        try {
            const res = await api.get('/quizzes/history');
            setHistory(res.data);
        } catch (err) {
            // Silently handle history fetch failures
        }
    };

    const handleDeleteAttempt = async (e, attemptId) => {
        e.stopPropagation();
        if (!confirm('Are you sure you want to delete this result?')) return;

        setActionLoading(attemptId);
        try {
            await api.delete(`/quizzes/attempts/${attemptId}`);
            // Optimistically update UI
            setHistory(prev => prev.filter(a => a.id !== attemptId));
        } catch (err) {
            fetchHistory();
        } finally {
            setActionLoading(null);
        }
    };

    const handleClearHistory = async () => {
        if (!confirm('Are you sure you want to clear your entire history?')) return;

        setActionLoading('clear');
        try {
            await api.delete('/quizzes/history');
            setHistory([]);
        } catch (err) {
            fetchHistory();
        } finally {
            setActionLoading(null);
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!topic) {
            setError('Please enter a topic');
            return;
        }

        setError('');
        setLoadingQuiz(true);
        try {
            const res = await api.post('/quizzes/generate', {
                topic,
                num_questions: numQuestions,
                difficulty
            });
            // Redirect to take the quiz
            router.push(`/quiz/${res.data.id}/take`);
        } catch (err) {
            setError(err.response?.data?.error || 'Failed to generate quiz. AI might be busy, try again!');
            setLoadingQuiz(false);
        }
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-primary)' }}>Loading application data...</div>
            </div>
        );
    }

    if (!user) return null;

    return (
        <div style={{ minHeight: '100vh', padding: '1rem' }}>
            {/* Header */}
            <nav className="glass-panel" style={{ padding: '1.5rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderRadius: '0 0 20px 20px' }}>
                <h2 style={{ margin: 0 }}>QuizApp Dashboard</h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                    <span style={{ color: 'var(--text-secondary)' }} className="hide-mobile">
                        Welcome, <strong style={{ color: 'var(--text-primary)' }}>{user.display_name || user.username}</strong>
                    </span>
                    <button onClick={logout} className="btn btn-glass" style={{ padding: '8px 16px', fontSize: '0.9rem' }} disabled={isDeleting}>
                        Sign Out
                    </button>
                    <button
                        onClick={handleDeleteAccount}
                        className="btn"
                        disabled={isDeleting}
                        style={{
                            padding: '8px 16px',
                            fontSize: '0.8rem',
                            background: isDeleting ? 'rgba(255, 71, 87, 0.05)' : 'rgba(255, 71, 87, 0.1)',
                            border: '1px solid rgba(255, 71, 87, 0.3)',
                            color: '#ff4757',
                            marginLeft: '0.5rem',
                            opacity: isDeleting ? 0.6 : 1,
                            cursor: isDeleting ? 'not-allowed' : 'pointer'
                        }}
                    >
                        {isDeleting ? 'Deleting Account...' : 'Delete Account'}
                    </button>
                </div>
            </nav>

            <main className="animate-fade-in" style={{ maxWidth: '1000px', margin: '0 auto' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>

                    {/* Quiz Creation Form */}
                    <div className="glass-panel" style={{ padding: '2rem', height: '450px', display: 'flex', flexDirection: 'column' }}>
                        <h2 style={{ marginBottom: '2rem' }}>Create New Quiz</h2>
                        <form onSubmit={handleGenerate} style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                            <div className="form-group" style={{ marginBottom: '1.5rem' }}>
                                <label className="form-label">Quiz Topic</label>
                                <input
                                    type="text"
                                    className="glass-input"
                                    placeholder="e.g. Modern History, Python Programming..."
                                    value={topic}
                                    onChange={(e) => setTopic(e.target.value)}
                                    disabled={loadingQuiz}
                                />
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Questions</label>
                                    <select
                                        className="glass-input"
                                        value={numQuestions}
                                        onChange={(e) => setNumQuestions(e.target.value)}
                                        disabled={loadingQuiz}
                                    >
                                        {[5, 10, 15, 20].map(n => (
                                            <option key={n} value={n}>{n}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Difficulty</label>
                                    <select
                                        className="glass-input"
                                        value={difficulty}
                                        onChange={(e) => setDifficulty(e.target.value)}
                                        disabled={loadingQuiz}
                                    >
                                        <option value="Easy">Easy</option>
                                        <option value="Medium">Medium</option>
                                        <option value="Hard">Hard</option>
                                    </select>
                                </div>
                            </div>

                            {error && <div className="form-error" style={{ marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                            <button type="submit" className="btn btn-primary btn-block" style={{ padding: '12px', fontSize: '1.1rem' }} disabled={loadingQuiz}>
                                {loadingQuiz ? 'AI is generating...' : 'Generate AI Quiz'}
                            </button>
                        </form>
                    </div>

                    {/* History Panel */}
                    <div className="glass-panel" style={{ padding: '2rem', height: '450px', display: 'flex', flexDirection: 'column' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                            <h2 style={{ margin: 0 }}>Recent Activity</h2>
                            {history.length > 0 && (
                                <button
                                    className="btn-clear-all"
                                    style={{ padding: '8px 16px' }}
                                    onClick={handleClearHistory}
                                    disabled={actionLoading === 'clear'}
                                >
                                    {actionLoading === 'clear' ? 'Clearing...' : 'Clear All'}
                                </button>
                            )}
                        </div>
                        <div style={{ flex: 1, overflowY: 'auto', paddingRight: '8px', maxHeight: '300px' }}>
                            {history.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '3rem 0' }}>
                                    <span style={{ fontSize: '3rem', opacity: 0.2 }}>📋</span>
                                    <p style={{ color: 'var(--text-secondary)', marginTop: '1rem' }}>
                                        No quizzes taken yet.
                                    </p>
                                </div>
                            ) : (
                                history.map((attempt) => (
                                    <div
                                        key={attempt.id}
                                        className="history-item glass-card"
                                        onClick={() => router.push(`/quiz/${attempt.quiz.id}/results?attempt=${attempt.id}`)}
                                        style={{ cursor: 'pointer', marginBottom: '0.75rem', padding: '1rem' }}
                                    >
                                        <div className="history-info">
                                            <div className="history-topic">{attempt.quiz.topic}</div>
                                            <div className="history-meta">
                                                <span>{new Date(attempt.completed_at).toLocaleDateString()}</span>
                                                <span>• {attempt.quiz.num_questions} Qs</span>
                                                <span className={`difficulty-tag diff-${attempt.quiz.difficulty.toLowerCase()}`}>
                                                    {attempt.quiz.difficulty}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="history-actions">
                                            <div style={{ fontSize: '1.1rem', fontWeight: 'bold', color: attempt.score >= 70 ? '#2ecc71' : attempt.score >= 40 ? '#f1c40f' : '#e74c3c' }}>
                                                {attempt.score}%
                                            </div>
                                            <button
                                                className="btn-delete"
                                                onClick={(e) => handleDeleteAttempt(e, attempt.id)}
                                                disabled={actionLoading === attempt.id}
                                            >
                                                {actionLoading === attempt.id ? '...' : '🗑️'}
                                            </button>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}

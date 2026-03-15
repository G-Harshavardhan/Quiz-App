'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../utils/api';

export default function ResultsPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            fetchReview();
        }
    }, [id, authLoading, user]);

    const fetchReview = async () => {
        try {
            // Check if we have an attempt_id in the URL (from history)
            const urlParams = new URLSearchParams(window.location.search);
            const attemptId = urlParams.get('attempt');

            let endpoint = `/quizzes/${id}/review`;
            if (attemptId) {
                endpoint = `/quizzes/attempts/${attemptId}/review`;
            }

            const res = await api.get(endpoint);
            setData(res.data);
        } catch (err) {
            setError('Failed to load results review (Error: ' + (err.response?.status || 'Unknown') + ')');
        } finally {
            setLoading(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-primary)' }}>Loading your results...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="quiz-container text-center" style={{ marginTop: '10rem' }}>
                <div className="form-error">{error}</div>
                <button className="btn btn-glass mt-4" onClick={() => router.push('/quiz')}>Back to Dashboard</button>
            </div>
        );
    }

    if (!data) return null;

    const { attempt, review } = data;

    return (
        <div style={{ minHeight: '100vh', padding: '2rem' }}>
            <div className="quiz-container animate-fade-in" style={{ paddingTop: '3rem' }}>

                {/* Score Summary */}
                <div className="glass-panel text-center" style={{ padding: '3rem', marginBottom: '3rem' }}>
                    <h1 style={{ marginBottom: '2rem' }}>Quiz Results</h1>
                    <div className="score-circle" style={{
                        borderColor: attempt.score >= 70 ? '#2ecc71' : attempt.score >= 40 ? '#f1c40f' : '#e74c3c'
                    }}>
                        <span className="score-value">{attempt.score}%</span>
                    </div>
                    <h2 style={{ marginBottom: '1rem' }}>
                        {attempt.score >= 70 ? 'Way to go! Brilliant work!' :
                            attempt.score >= 40 ? 'Good effort! Keep learning.' :
                                'Tough one! Better luck next time.'}
                    </h2>
                    <p style={{ color: 'var(--text-secondary)' }}>
                        You completed the <strong>{review.topic}</strong> quiz.
                    </p>
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem', flexWrap: 'wrap' }}>
                        <button className="btn btn-primary" onClick={() => router.push('/quiz')}>
                            Dashboard
                        </button>
                        <button className="btn btn-glass" onClick={() => router.push(`/quiz/${id}/take`)}>
                            🔄 Retake Quiz
                        </button>
                        <button className="btn btn-glass" onClick={() => document.getElementById('review-section').scrollIntoView({ behavior: 'smooth' })}>
                            📝 Review Answers
                        </button>
                    </div>
                </div>

                {/* Review Section */}
                <h2 id="review-section" style={{ marginBottom: '2rem', paddingTop: '2rem' }}>Review Answers</h2>
                <div className="glass-panel" style={{ padding: '2rem' }}>
                    {review.questions.map((question, qIdx) => {
                        const userAnswer = attempt.user_answers.find(a => a.question === question.id);
                        return (
                            <div key={question.id} className="review-question">
                                <h3 style={{ marginBottom: '1.5rem', fontSize: '1.2rem' }}>
                                    {qIdx + 1}. {question.text}
                                </h3>
                                <div className="choices-grid">
                                    {question.choices.map((choice) => {
                                        let statusClass = '';
                                        const isUserSelected = userAnswer?.selected_choice === choice.id;
                                        const isCorrect = choice.is_correct;

                                        if (isCorrect) statusClass = 'correct';
                                        else if (isUserSelected && !isCorrect) statusClass = 'incorrect';

                                        return (
                                            <div
                                                key={choice.id}
                                                className={`choice-card ${statusClass}`}
                                                style={{ cursor: 'default' }}
                                            >
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span>{choice.text}</span>
                                                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                                        {isUserSelected && <span style={{ fontSize: '0.75rem', padding: '2px 6px', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>Your Choice</span>}
                                                        {statusClass === 'correct' && <span style={{ color: '#4CAF50', fontWeight: 'bold' }}>✓ Correct</span>}
                                                        {statusClass === 'incorrect' && <span style={{ color: '#F44336', fontWeight: 'bold' }}>✕ Wrong</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                <div className="text-center mt-8" style={{ paddingBottom: '2rem' }}>
                    <button className="btn btn-glass" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
                        Back to Top
                    </button>
                </div>
            </div>
        </div>
    );
}

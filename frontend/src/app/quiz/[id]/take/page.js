'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import api from '../../../../utils/api';

export default function TakeQuizPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user, loading: authLoading } = useAuth();

    const [quiz, setQuiz] = useState(null);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswers, setSelectedAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!authLoading && user) {
            fetchQuiz();
        }
    }, [id, authLoading, user]);

    const fetchQuiz = async () => {
        try {
            const res = await api.get(`/quizzes/${id}`);
            setQuiz(res.data);
        } catch (err) {
            setError('Failed to load quiz. It might not exist or you might not have permission.');
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (questionId, choiceId) => {
        setSelectedAnswers(prev => ({
            ...prev,
            [questionId]: choiceId
        }));
    };

    const handleNext = () => {
        if (currentIndex < quiz.questions.length - 1) {
            setCurrentIndex(prev => prev + 1);
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        }
    };

    const handleSubmit = async () => {
        setSubmitting(true);
        try {
            const res = await api.post(`/quizzes/${id}/submit`, {
                answers: selectedAnswers
            });
            router.push(`/quiz/${id}/results?attempt=${res.data.attempt_id}`);
        } catch (err) {
            setError('Failed to submit quiz. Please check your connection.');
            setSubmitting(false);
        }
    };

    if (loading || authLoading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ color: 'var(--text-primary)' }}>Loading quiz questions...</div>
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

    if (!quiz) return null;

    const currentQuestion = quiz.questions[currentIndex];
    const totalQuestions = quiz.questions.length;
    const progress = ((currentIndex + 1) / totalQuestions) * 100;

    return (
        <div style={{ minHeight: '100vh', padding: '1rem' }}>
            <div className="quiz-container animate-fade-in" style={{ padding: '0 1rem', paddingTop: '1.5rem' }}>

                {/* Compact Header */}
                <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.75rem',
                    background: 'rgba(255,255,255,0.03)',
                    padding: '0.6rem 1rem',
                    borderRadius: '10px',
                    border: '1px solid var(--glass-border)'
                }}>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Topic</span>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{quiz.topic}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Progress</span>
                        <span style={{ fontWeight: '600', fontSize: '0.95rem' }}>{currentIndex + 1} / {totalQuestions}</span>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', textAlign: 'right' }}>
                        <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Difficulty</span>
                        <span className={`diff-${quiz.difficulty.toLowerCase()}`} style={{ fontWeight: '600', fontSize: '0.95rem' }}>{quiz.difficulty}</span>
                    </div>
                </div>

                <div className="progress-container" style={{ marginBottom: '1.5rem', height: '6px' }}>
                    <div className="progress-bar" style={{ width: `${progress}%` }}></div>
                </div>

                <div className="question-card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.4rem', marginBottom: '1.5rem', lineHeight: '1.4' }}>{currentQuestion.text}</h3>

                    <div className="choices-grid">
                        {currentQuestion.choices.slice(0, 4).map((choice) => (
                            <button
                                key={choice.id}
                                className={`choice-card ${selectedAnswers[currentQuestion.id] === choice.id ? 'selected' : ''}`}
                                onClick={() => handleSelect(currentQuestion.id, choice.id)}
                                disabled={submitting}
                                style={{ padding: '1rem 1.25rem' }}
                            >
                                {choice.text}
                            </button>
                        ))}
                    </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <button
                        className="btn btn-glass"
                        onClick={handlePrev}
                        disabled={currentIndex === 0 || submitting}
                        style={{ padding: '12px 24px' }}
                    >
                        Previous
                    </button>

                    {currentIndex === totalQuestions - 1 ? (
                        <button
                            className="btn btn-primary"
                            onClick={handleSubmit}
                            disabled={submitting || !selectedAnswers[currentQuestion.id]}
                            style={{ padding: '12px 32px' }}
                        >
                            {submitting ? 'Evaluating...' : 'Finish Quiz'}
                        </button>
                    ) : (
                        <button
                            className="btn btn-primary"
                            onClick={handleNext}
                            disabled={!selectedAnswers[currentQuestion.id] || submitting}
                            style={{ padding: '12px 32px' }}
                        >
                            Next Question
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}

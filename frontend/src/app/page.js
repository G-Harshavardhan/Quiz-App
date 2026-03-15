'use client';

import Link from 'next/link';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const { isAuthenticated } = useAuth();

    const scrollToHero = () => {
        document.getElementById('hero').scrollIntoView({ behavior: 'smooth' });
    };

    return (
        <main>
            {/* Navbar segment */}
            <nav className="glass-nav" style={{ padding: '1rem 5%' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2 style={{ margin: 0 }}>QuizApp</h2>
                    <div>
                        {isAuthenticated ? (
                            <Link href="/quiz" className="btn btn-primary">Go to Dashboard</Link>
                        ) : (
                            <div style={{ display: 'flex', gap: '1rem' }}>
                                <Link href="/signin" className="btn btn-glass">Sign In</Link>
                                <Link href="/signup" className="btn btn-primary">Sign Up</Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            {/* Landing Section */}
            <section style={{
                minHeight: '100vh',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                padding: '0 5%',
                textAlign: 'center'
            }}>
                <div className="animate-fade-in" style={{ maxWidth: '800px' }}>
                    <h1 style={{ fontSize: '4rem', marginBottom: '1.5rem', background: 'linear-gradient(to right, #fff, #888)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                        Master Any Subject with QuizApp
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
                        Interactive quizzes designed to supercharge your learning. Dark, fast, and completely free.
                    </p>
                    <button onClick={scrollToHero} className="btn btn-glass" style={{ padding: '12px 32px', fontSize: '1.1rem' }}>
                        Learn More ↓
                    </button>
                </div>
            </section>

            {/* Hero / Features Section */}
            <section id="hero" style={{ minHeight: '100vh', padding: '100px 5%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <div className="animate-fade-in delay-1" style={{ textAlign: 'center', marginBottom: '4rem' }}>
                    <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>Everything You Need to Succeed</h2>
                    <p style={{ color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
                        Our platform provides seamless question tracking, instant feedback, and secure accounts.
                    </p>
                </div>

                <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    gap: '2rem',
                    width: '100%',
                    maxWidth: '1200px',
                    marginBottom: '5rem'
                }}>
                    {/* Feature 1 */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>⚡ Real-time Feedback</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Get instant results after answering. Know exactly what you missed and why.</p>
                    </div>
                    {/* Feature 2 */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🔒 Secure Accounts</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>Your progress is safely stored in our PostgreSQL database with JWT-backed session security.</p>
                    </div>
                    {/* Feature 3 */}
                    <div className="glass-panel" style={{ padding: '2rem' }}>
                        <h3 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🎨 Premium UI</h3>
                        <p style={{ color: 'var(--text-secondary)' }}>A stunning, glassmorphic dark theme built for focus and aesthetic pleasure.</p>
                    </div>
                </div>

                <div className="text-center animate-fade-in delay-2">
                    {!isAuthenticated && (
                        <Link href="/signup" className="btn btn-primary" style={{ padding: '16px 40px', fontSize: '1.2rem' }}>
                            Create Your Free Account Now
                        </Link>
                    )}
                </div>
            </section>
        </main>
    );
}

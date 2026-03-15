import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '../context/AuthContext';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata = {
    title: 'Quiz App | Learn & Ace',
    description: 'A modern full-stack quiz application built with Next.js and Django.',
    icons: {
        icon: [
            { url: '/logo.png' },
            { url: '/logo.png', sizes: '32x32', type: 'image/png' },
        ],
        apple: [
            { url: '/logo.png' },
        ],
    },
};

export default function RootLayout({ children }) {
    return (
        <html lang="en" className={inter.variable}>
            <body>
                <AuthProvider>
                    {children}
                </AuthProvider>
            </body>
        </html>
    );
}

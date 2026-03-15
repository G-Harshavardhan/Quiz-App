const nextConfig = {
    reactStrictMode: false,
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'https://quiz-app-production-72cb.up.railway.app/api/:path*'
            }
        ];
    }
};

module.exports = nextConfig;

import withPWA from "next-pwa";

const pwaConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});
const nextConfig = {
    /* config options here */
    reactCompiler: true,
    // Add turbopack configuration to resolve build error
    turbopack: {},
    // Note: Using default behavior (not 'export') to support dynamic routes
    // Capacitor will load from dev server during development
    // For production, you can either:
    // 1. Use 'output: export' and add generateStaticParams to all dynamic routes
    // 2. Or bundle with a backend API
    images: {
        unoptimized: true
    },
    // Proxy API requests to backend server (for development only)
    async rewrites() {
        return [
            {
                source: '/api/:path*',
                destination: 'http://localhost:5000/api/:path*'
            }
        ];
    },
    // Add security headers to handle COOP issues
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    {
                        key: 'Cross-Origin-Opener-Policy',
                        value: 'same-origin-allow-popups'
                    },
                    {
                        key: 'Cross-Origin-Embedder-Policy',
                        value: 'unsafe-none'
                    }
                ]
            }
        ];
    }
};
export default pwaConfig(nextConfig);

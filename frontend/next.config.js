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
    // Proxy API requests to backend server
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

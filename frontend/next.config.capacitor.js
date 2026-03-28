import withPWA from "next-pwa";

const pwaConfig = withPWA({
    dest: "public",
    disable: process.env.NODE_ENV === "development",
    register: true,
    skipWaiting: true,
});

// Production config for Capacitor static export
const nextConfig = {
    reactCompiler: true,
    turbopack: {},
    // Required for Capacitor - static export
    output: 'export',
    // Prevent image optimization for static export
    images: {
        unoptimized: true
    },
    // Exclude problematic routes for static export
    // These will need to be handled separately or converted to static
    async rewrites() {
        return [];
    },
    async headers() {
        return [];
    }
};

export default pwaConfig(nextConfig);

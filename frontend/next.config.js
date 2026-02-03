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
};
export default pwaConfig(nextConfig);

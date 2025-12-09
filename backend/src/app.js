"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const morgan_1 = __importDefault(require("morgan"));
const db_1 = __importDefault(require("./config/db"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const trackRoutes_1 = __importDefault(require("./routes/trackRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const upgradeRoutes_1 = __importDefault(require("./routes/upgradeRoutes"));
console.log('ROUTES IMPORTED');
console.log('APP FILE LOADED');
// Load env vars
dotenv_1.default.config();
// Connect to database
(0, db_1.default)();
const app = (0, express_1.default)();
console.log('APP CREATED');
// Add request logging middleware
app.use((_req, _res, next) => {
    console.log(`APP MIDDLEWARE - Incoming request: ${_req.method} ${_req.originalUrl}`);
    console.log('Headers:', _req.headers);
    next();
});
// Middleware
app.use((0, helmet_1.default)());
app.use((0, cors_1.default)());
app.use((0, morgan_1.default)('dev'));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Log routes registration
console.log('Registering routes...');
// Routes
app.use('/api/auth', authRoutes_1.default);
console.log('Auth routes registered');
app.use('/api/tracks', trackRoutes_1.default);
console.log('Tracks routes registered');
console.log('Registering user routes...');
app.use('/api/users', userRoutes_1.default);
console.log('Users routes registered');
app.use('/api/upgrade', upgradeRoutes_1.default);
console.log('Upgrade routes registered');
// Add detailed logging for admin routes
console.log('Attempting to register admin routes...');
try {
    app.use('/api/admin', adminRoutes_1.default);
    console.log('Admin routes registered successfully');
}
catch (error) {
    console.error('Error registering admin routes:', error);
}
// Health check
app.get('/health', (_req, res) => {
    console.log('HEALTH CHECK ROUTE HIT');
    res.status(200).json({ message: 'OK', timestamp: new Date().toISOString() });
});
// Simple test route
app.get('/test-direct', (_req, res) => {
    console.log('DIRECT TEST ROUTE HIT');
    res.json({ message: 'Direct test route working' });
});
// Error handler
app.use((err, _req, res, _next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode);
    res.json({
        message: err.message,
        stack: process.env['NODE_ENV'] === 'production' ? null : err.stack
    });
});
// 404 handler for unmatched routes
app.use((req, res) => {
    console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ message: 'Route not found' });
});
exports.default = app;
//# sourceMappingURL=app.js.map
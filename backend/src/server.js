"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const app_1 = __importDefault(require("./app"));
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();
    const PORT = process.env['PORT'] || 5000;
    
    app_1.default.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
};

startServer();
//# sourceMappingURL=server.js.map
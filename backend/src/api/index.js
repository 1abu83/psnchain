#!/usr/bin/env node

require('dotenv').config();
const PSNChainAPIServer = require('./server');

// Configuration
const PORT = process.env.API_PORT || 3001;
const NODE_ENV = process.env.NODE_ENV || 'development';

console.log('🔧 Starting PSNChain API Server...');
console.log(`📍 Environment: ${NODE_ENV}`);
console.log(`🌐 Port: ${PORT}`);

// Create and start server
const apiServer = new PSNChainAPIServer(PORT);
apiServer.start();

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});
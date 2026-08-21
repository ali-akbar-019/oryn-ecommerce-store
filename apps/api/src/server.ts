import { createApp } from './app.js';
import { env } from './config/env.js';

console.log('Creating app...');
const app = createApp();
console.log('App created, starting server...');

const server = app.listen(env.API_PORT, '0.0.0.0', () => {
  console.log(`ORYN API listening on :${env.API_PORT}`);
  console.log('Server address:', server.address());
});

server.on('error', (err) => {
  console.error('Server error:', err);
});

server.on('listening', () => {
  console.log('Server listening event fired');
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled rejection:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught exception:', err);
});
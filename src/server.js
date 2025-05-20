require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = [
  'PORT',
  'DB_URI',
  'JWT_SECRET',
  'JWT_EXPIRES'
];

for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    console.error(`❌ Required environment variable ${envVar} is missing`);
    process.exit(1);
  }
}

const app = require('./app');
const connectDB = require('./config/db');

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('❌ UNCAUGHT EXCEPTION:', err);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('❌ UNHANDLED REJECTION:', err);
  if (server) {
    server.close(() => process.exit(1));
  } else {
    process.exit(1);
  }
});

let server;
(async () => {
  try {
    await connectDB();
    server = app.listen(process.env.PORT || 5000, () =>
      console.log(`✅ Server running on port ${process.env.PORT}`)
    );
  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
})();

const mongoose = require('mongoose');

module.exports = () =>
  mongoose
    .connect(process.env.DB_URI)
    .then(() => console.log('✅ MongoDB Atlas connected'))
    .catch((err) => {
      console.error('❌ MongoDB connection failed:', err.message);
      process.exit(1);
    });

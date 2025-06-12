const express = require('express');
const morgan  = require('morgan');
const cors    = require('cors');
const helmet  = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const authRoutes = require('./routes/authRoutes');
const errorHandler = require('./middlewares/errorHandler');
const productRoutes = require('./routes/productRoutes');
const cartRoutes  = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const sellerRoutes = require('./routes/sellerRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// Security middleware
app.use(helmet());
app.use(cors());
app.use(compression());  // Add gzip compression
app.use(express.json({ limit: '10kb' })); // Limit body size

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

app.use(morgan('dev'));

// health-check
app.get('/api/v1/ping', (_req, res) =>
  res.status(200).json({ status: 'ok', time: new Date().toISOString() })
);

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/products', productRoutes);
app.use('/api/v1/cart',   cartRoutes);
app.use('/api/v1/orders', orderRoutes);
app.use('/api/v1/sellers', sellerRoutes);
app.use('/api/v1/users', userRoutes);

app.use(errorHandler);
module.exports = app;

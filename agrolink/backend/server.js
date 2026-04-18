require('dotenv').config()
const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

const app = express()
const PORT = process.env.PORT || 5000

// Security middleware
app.use(helmet())
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}))

// Rate limiting
const limiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 100, message: 'Too many requests' })
app.use('/api/', limiter)

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))
app.use(morgan('dev'))

// Routes
app.use('/api/auth', require('./routes/auth'))
app.use('/api/crops', require('./routes/crops'))
app.use('/api/orders', require('./routes/orders'))
app.use('/api/farms', require('./routes/farms'))
app.use('/api/inventory', require('./routes/inventory'))
app.use('/api/expenses', require('./routes/expenses'))
app.use('/api/weather', require('./routes/weather'))
app.use('/api/ai', require('./routes/ai'))
app.use('/api/admin', require('./routes/admin'))
app.use('/api/payments', require('./routes/payments'))
app.use('/api/chatbot', require('./routes/chatbot'))
app.use('/api/firebase-auth', require('./routes/firebase-auth'))
app.use('/api/soil', require('./routes/soil'))
app.use('/api/crop', require('./routes/crop-disease'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/uploads', require('express').static(require('path').join(__dirname, 'uploads')))

// Health check
app.get('/health', (req, res) => res.json({ status: 'OK', timestamp: new Date().toISOString() }))

// 404 handler
app.use((req, res) => res.status(404).json({ error: 'Route not found' }))

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' })
})

app.listen(PORT, () => {
  console.log(`🌾 AgroLink API running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV}`)
})

module.exports = app

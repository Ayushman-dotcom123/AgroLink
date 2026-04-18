const router = require('express').Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const db = require('../config/db')
const { auth } = require('../middleware/auth')

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, phone, role, village, district, state, farm_size, soil_type } = req.body
    if (!name || !email || !password || !role) return res.status(400).json({ error: 'Required fields missing' })
    const [existing] = await db.query('SELECT user_id FROM users WHERE email = ?', [email])
    if (existing.length) return res.status(409).json({ error: 'Email already registered' })
    const hashed = await bcrypt.hash(password, 12)
    const [result] = await db.query(
      'INSERT INTO users (name, email, password, phone, role, village, district, state) VALUES (?,?,?,?,?,?,?,?)',
      [name, email, hashed, phone, role, village, district, state]
    )
    const userId = result.insertId
    if (role === 'farmer') {
      await db.query(
        'INSERT INTO farmers (user_id, farm_size_acres, soil_type, is_approved) VALUES (?,?,?,?)',
        [userId, farm_size || 0, soil_type || '', false]
      )
    }
    const token = jwt.sign({ user_id: userId, email, role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    res.status(201).json({ message: 'Registration successful', token, user: { user_id: userId, name, email, role } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    if (!email || !password) return res.status(400).json({ error: 'Email and password required' })
    const [users] = await db.query('SELECT * FROM users WHERE email = ?', [email])
    if (!users.length) return res.status(401).json({ error: 'Invalid credentials' })
    const user = users[0]
    const valid = await bcrypt.compare(password, user.password)
    if (!valid) return res.status(401).json({ error: 'Invalid credentials' })
    const token = jwt.sign({ user_id: user.user_id, email: user.email, role: user.role }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN })
    const { password: _, ...safeUser } = user
    res.json({ token, user: safeUser })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/auth/me
router.get('/me', auth, async (req, res) => {
  try {
    const [users] = await db.query('SELECT user_id, name, email, phone, role, village, district, state, created_at FROM users WHERE user_id = ?', [req.user.user_id])
    if (!users.length) return res.status(404).json({ error: 'User not found' })
    res.json(users[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/auth/reset-password — for bcrypt users (change password with old password)
router.post('/reset-password', auth, async (req, res) => {
  try {
    const { current_password, new_password } = req.body
    if (!current_password || !new_password) return res.status(400).json({ error: 'Both passwords required' })
    if (new_password.length < 6) return res.status(400).json({ error: 'New password must be at least 6 characters' })
    const [users] = await db.query('SELECT * FROM users WHERE user_id = ?', [req.user.user_id])
    if (!users.length) return res.status(404).json({ error: 'User not found' })
    const user = users[0]
    if (!user.password) return res.status(400).json({ error: 'This account uses Google/Phone login. Use Firebase to reset password.' })
    const valid = await bcrypt.compare(current_password, user.password)
    if (!valid) return res.status(401).json({ error: 'Current password is incorrect' })
    const hashed = await bcrypt.hash(new_password, 12)
    await db.query('UPDATE users SET password = ? WHERE user_id = ?', [hashed, req.user.user_id])
    res.json({ success: true, message: 'Password updated successfully' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/auth/profile
router.put('/profile', auth, async (req, res) => {
  try {
    const { name, phone, village, district, state } = req.body
    await db.query(
      'UPDATE users SET name = ?, phone = ?, village = ?, district = ?, state = ? WHERE user_id = ?',
      [name, phone || null, village || null, district || null, state || null, req.user.user_id]
    )
    const [rows] = await db.query(
      'SELECT user_id, name, email, phone, role, village, district, state FROM users WHERE user_id = ?',
      [req.user.user_id]
    )
    res.json({ success: true, user: rows[0] })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

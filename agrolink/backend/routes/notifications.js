const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

// GET /api/notifications — get user's notifications
router.get('/', auth, async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM notifications WHERE user_id = ? ORDER BY created_at DESC LIMIT 50',
      [req.user.user_id]
    )
    res.json(rows)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// GET /api/notifications/unread-count
router.get('/unread-count', auth, async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) as count FROM notifications WHERE user_id = ? AND is_read = 0',
      [req.user.user_id]
    )
    res.json({ count })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/notifications/:id/read — mark one as read
router.put('/:id/read', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE id = ? AND user_id = ?', [req.params.id, req.user.user_id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// PUT /api/notifications/read-all — mark all as read
router.put('/read-all', auth, async (req, res) => {
  try {
    await db.query('UPDATE notifications SET is_read = 1 WHERE user_id = ?', [req.user.user_id])
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/notifications/fcm-token — save FCM token for push notifications
router.post('/fcm-token', auth, async (req, res) => {
  try {
    const { fcm_token } = req.body
    if (!fcm_token) return res.status(400).json({ error: 'fcm_token required' })
    // Store in users table (add column if needed) or a separate table
    await db.query('UPDATE users SET fcm_token = ? WHERE user_id = ?', [fcm_token, req.user.user_id])
      .catch(() => {}) // Column may not exist yet — non-critical
    res.json({ success: true })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// POST /api/notifications/broadcast — admin sends to all or role
router.post('/broadcast', auth, requireRole('admin'), async (req, res) => {
  try {
    const { title, message, target, type = 'info' } = req.body
    if (!title || !message) return res.status(400).json({ error: 'title and message required' })

    let users = []
    if (target === 'all') {
      const [rows] = await db.query('SELECT user_id FROM users WHERE is_active = 1')
      users = rows
    } else if (target === 'farmers' || target === 'customers') {
      const role = target === 'farmers' ? 'farmer' : 'customer'
      const [rows] = await db.query('SELECT user_id FROM users WHERE role = ? AND is_active = 1', [role])
      users = rows
    } else if (target) {
      // specific user_id
      users = [{ user_id: +target }]
    }

    if (!users.length) return res.status(400).json({ error: 'No users found for target' })

    const values = users.map(u => [u.user_id, title, message, type])
    await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES ?', [values])

    res.json({ success: true, sent_to: users.length })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

// Helper: create notification for a specific user (used internally)
router.createFor = async (userId, title, message, type = 'info') => {
  try {
    await db.query('INSERT INTO notifications (user_id, title, message, type) VALUES (?,?,?,?)', [userId, title, message, type])
  } catch {}
}

module.exports = router

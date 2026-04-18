const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

const adminOnly = [auth, requireRole('admin')]

router.get('/farmers', ...adminOnly, async (req, res) => {
  try {
    const [farmers] = await db.query(
      `SELECT u.*, f.farm_size_acres, f.soil_type, f.is_approved
       FROM users u JOIN farmers f ON u.user_id = f.user_id WHERE u.role = 'farmer' ORDER BY u.created_at DESC`
    )
    res.json(farmers)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/farmers/:id/approve', ...adminOnly, async (req, res) => {
  try {
    await db.query('UPDATE farmers SET is_approved = 1 WHERE user_id = ?', [req.params.id])
    res.json({ message: 'Farmer approved' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/farmers/:id', ...adminOnly, async (req, res) => {
  try {
    await db.query('DELETE FROM users WHERE user_id = ?', [req.params.id])
    res.json({ message: 'Farmer removed' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/orders', ...adminOnly, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.customer_id = u.user_id ORDER BY o.created_at DESC LIMIT 100`
    )
    res.json(orders)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/stats', ...adminOnly, async (req, res) => {
  try {
    const [[{ total_farmers }]] = await db.query("SELECT COUNT(*) as total_farmers FROM users WHERE role='farmer'")
    const [[{ total_customers }]] = await db.query("SELECT COUNT(*) as total_customers FROM users WHERE role='customer'")
    const [[{ total_orders }]] = await db.query('SELECT COUNT(*) as total_orders FROM orders')
    const [[{ total_revenue }]] = await db.query("SELECT COALESCE(SUM(total_amount),0) as total_revenue FROM orders WHERE status='Delivered'")
    const [[{ total_crops }]] = await db.query('SELECT COUNT(*) as total_crops FROM crops WHERE is_available=1')
    res.json({ total_farmers, total_customers, total_orders, total_revenue, total_crops })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/notifications', ...adminOnly, async (req, res) => {
  try {
    const { message, target } = req.body
    // In production: integrate with FCM/SMS/email
    res.json({ message: 'Notification queued', target, content: message })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router

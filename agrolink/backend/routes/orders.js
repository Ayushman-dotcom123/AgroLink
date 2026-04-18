const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

// POST /api/orders - place order
router.post('/', auth, async (req, res) => {
  const conn = await db.getConnection()
  try {
    await conn.beginTransaction()
    const { items, delivery_address, payment_method } = req.body
    if (!items?.length) return res.status(400).json({ error: 'No items in order' })
    let total = 0
    for (const item of items) {
      const [crops] = await conn.query('SELECT * FROM crops WHERE crop_id = ? AND is_available = 1', [item.crop_id])
      if (!crops.length) throw new Error(`Crop ${item.crop_id} not available`)
      if (crops[0].quantity_kg < item.qty) throw new Error(`Insufficient stock for ${crops[0].name}`)
      total += crops[0].price_per_kg * item.qty
    }
    const [orderResult] = await conn.query(
      'INSERT INTO orders (customer_id, total_amount, delivery_address, payment_method, status) VALUES (?,?,?,?,?)',
      [req.user.user_id, total, JSON.stringify(delivery_address), payment_method || 'razorpay', 'Pending']
    )
    const orderId = orderResult.insertId
    for (const item of items) {
      const [crops] = await conn.query('SELECT * FROM crops WHERE crop_id = ?', [item.crop_id])
      await conn.query(
        'INSERT INTO order_items (order_id, crop_id, farmer_id, quantity_kg, price_per_kg) VALUES (?,?,?,?,?)',
        [orderId, item.crop_id, crops[0].farmer_id, item.qty, crops[0].price_per_kg]
      )
      await conn.query('UPDATE crops SET quantity_kg = quantity_kg - ? WHERE crop_id = ?', [item.qty, item.crop_id])
    }
    await conn.commit()
    res.status(201).json({ message: 'Order placed', order_id: orderId, total })
  } catch (err) {
    await conn.rollback()
    res.status(500).json({ error: err.message })
  } finally {
    conn.release()
  }
})

// GET /api/orders/my/orders - customer orders
router.get('/my/orders', auth, async (req, res) => {
  try {
    const [orders] = await db.query(
      `SELECT o.*, GROUP_CONCAT(c.name SEPARATOR ', ') as crops
       FROM orders o LEFT JOIN order_items oi ON o.order_id = oi.order_id
       LEFT JOIN crops c ON oi.crop_id = c.crop_id
       WHERE o.customer_id = ? GROUP BY o.order_id ORDER BY o.created_at DESC`,
      [req.user.user_id]
    )
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders - farmer's incoming orders
router.get('/', auth, requireRole('farmer', 'admin'), async (req, res) => {
  try {
    const query = req.user.role === 'admin'
      ? 'SELECT o.*, u.name as customer_name FROM orders o JOIN users u ON o.customer_id = u.user_id ORDER BY o.created_at DESC'
      : `SELECT DISTINCT o.*, u.name as customer_name FROM orders o
         JOIN order_items oi ON o.order_id = oi.order_id
         JOIN users u ON o.customer_id = u.user_id
         WHERE oi.farmer_id = ? ORDER BY o.created_at DESC`
    const params = req.user.role === 'admin' ? [] : [req.user.user_id]
    const [orders] = await db.query(query, params)
    res.json(orders)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/orders/:id
router.get('/:id', auth, async (req, res) => {
  try {
    const [orders] = await db.query('SELECT * FROM orders WHERE order_id = ?', [req.params.id])
    if (!orders.length) return res.status(404).json({ error: 'Order not found' })
    const [items] = await db.query(
      'SELECT oi.*, c.name as crop_name, u.name as farmer_name FROM order_items oi JOIN crops c ON oi.crop_id = c.crop_id JOIN users u ON oi.farmer_id = u.user_id WHERE oi.order_id = ?',
      [req.params.id]
    )
    res.json({ ...orders[0], items })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/orders/:id/status
router.put('/:id/status', auth, requireRole('farmer', 'admin'), async (req, res) => {
  try {
    const { status } = req.body
    const validStatuses = ['Pending', 'Confirmed', 'Packed', 'Out for Delivery', 'Delivered', 'Cancelled']
    if (!validStatuses.includes(status)) return res.status(400).json({ error: 'Invalid status' })
    await db.query('UPDATE orders SET status = ? WHERE order_id = ?', [status, req.params.id])

    // Notify the customer about their order status change
    try {
      const [orders] = await db.query('SELECT customer_id FROM orders WHERE order_id = ?', [req.params.id])
      if (orders.length) {
        const msgs = {
          'Confirmed':        'Your order has been confirmed by the farmer.',
          'Packed':           'Your order has been packed and is ready for dispatch.',
          'Out for Delivery': 'Your order is out for delivery!',
          'Delivered':        'Your order has been delivered. Thank you for shopping with AgroLink!',
          'Cancelled':        'Your order has been cancelled.',
        }
        if (msgs[status]) {
          await db.query(
            'INSERT INTO notifications (user_id, title, message, type) VALUES (?, ?, ?, ?)',
            [orders[0].customer_id, `Order #${req.params.id} — ${status}`, msgs[status], status === 'Delivered' ? 'success' : status === 'Cancelled' ? 'warning' : 'order']
          )
        }
      }
    } catch (_) { /* notification failure is non-critical */ }

    res.json({ message: 'Order status updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

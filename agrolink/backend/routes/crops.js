const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

// GET /api/crops - public marketplace listing
router.get('/', async (req, res) => {
  try {
    const { category, state, is_organic, search, sort, page = 1, limit = 20 } = req.query
    let query = `SELECT c.*, u.name as farmer_name, u.village, u.district, u.state
                 FROM crops c JOIN users u ON c.farmer_id = u.user_id
                 WHERE c.is_available = 1`
    const params = []
    if (category) { query += ' AND c.category = ?'; params.push(category) }
    if (state) { query += ' AND u.state = ?'; params.push(state) }
    if (is_organic !== undefined) { query += ' AND c.is_organic = ?'; params.push(is_organic === 'true' ? 1 : 0) }
    if (search) { query += ' AND (c.name LIKE ? OR u.name LIKE ?)'; params.push(`%${search}%`, `%${search}%`) }
    if (sort === 'price-asc') query += ' ORDER BY c.price_per_kg ASC'
    else if (sort === 'price-desc') query += ' ORDER BY c.price_per_kg DESC'
    else query += ' ORDER BY c.created_at DESC'
    const offset = (page - 1) * limit
    query += ` LIMIT ? OFFSET ?`
    params.push(+limit, +offset)
    const [crops] = await db.query(query, params)
    res.json(crops)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/crops/my/listings - farmer's own listings
router.get('/my/listings', auth, requireRole('farmer'), async (req, res) => {
  try {
    const [crops] = await db.query('SELECT * FROM crops WHERE farmer_id = ? ORDER BY created_at DESC', [req.user.user_id])
    res.json(crops)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// GET /api/crops/:id
router.get('/:id', async (req, res) => {
  try {
    const [crops] = await db.query(
      `SELECT c.*, u.name as farmer_name, u.village, u.district, u.state, u.phone as farmer_phone
       FROM crops c JOIN users u ON c.farmer_id = u.user_id WHERE c.crop_id = ?`,
      [req.params.id]
    )
    if (!crops.length) return res.status(404).json({ error: 'Crop not found' })
    res.json(crops[0])
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// POST /api/crops - create listing
router.post('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { name, category, price_per_kg, quantity_kg, is_organic, harvest_date, sowing_date, season, description, min_order_kg } = req.body
    if (!name || !category || !price_per_kg || !quantity_kg) return res.status(400).json({ error: 'Required fields missing' })
    const [result] = await db.query(
      `INSERT INTO crops (farmer_id, name, category, price_per_kg, quantity_kg, is_organic, harvest_date, sowing_date, season, description, min_order_kg)
       VALUES (?,?,?,?,?,?,?,?,?,?,?)`,
      [req.user.user_id, name, category, price_per_kg, quantity_kg, is_organic || false, harvest_date, sowing_date, season, description, min_order_kg || 1]
    )
    res.status(201).json({ message: 'Crop listed successfully', crop_id: result.insertId })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// PUT /api/crops/:id
router.put('/:id', auth, requireRole('farmer'), async (req, res) => {
  try {
    const [crops] = await db.query('SELECT * FROM crops WHERE crop_id = ? AND farmer_id = ?', [req.params.id, req.user.user_id])
    if (!crops.length) return res.status(404).json({ error: 'Crop not found or unauthorized' })
    const { name, category, price_per_kg, quantity_kg, is_organic, harvest_date, description, is_available } = req.body
    await db.query(
      'UPDATE crops SET name=?, category=?, price_per_kg=?, quantity_kg=?, is_organic=?, harvest_date=?, description=?, is_available=? WHERE crop_id=?',
      [name, category, price_per_kg, quantity_kg, is_organic, harvest_date, description, is_available, req.params.id]
    )
    res.json({ message: 'Crop updated' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

// DELETE /api/crops/:id
router.delete('/:id', auth, requireRole('farmer', 'admin'), async (req, res) => {
  try {
    await db.query('DELETE FROM crops WHERE crop_id = ? AND (farmer_id = ? OR ? = "admin")', [req.params.id, req.user.user_id, req.user.role])
    res.json({ message: 'Crop removed' })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

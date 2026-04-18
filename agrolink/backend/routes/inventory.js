const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

router.get('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const [items] = await db.query('SELECT * FROM inventory WHERE farmer_id = ? ORDER BY category, name', [req.user.user_id])
    res.json(items)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { name, category, quantity, unit, min_stock, cost_per_unit } = req.body
    if (!name || !category || quantity === undefined) return res.status(400).json({ error: 'Required fields missing' })
    const [result] = await db.query(
      'INSERT INTO inventory (farmer_id, name, category, quantity, unit, min_stock, cost_per_unit) VALUES (?,?,?,?,?,?,?)',
      [req.user.user_id, name, category, quantity, unit, min_stock || 0, cost_per_unit || 0]
    )
    res.status(201).json({ message: 'Item added', inventory_id: result.insertId })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { name, category, quantity, unit, min_stock, cost_per_unit } = req.body
    await db.query(
      'UPDATE inventory SET name=?, category=?, quantity=?, unit=?, min_stock=?, cost_per_unit=? WHERE inventory_id=? AND farmer_id=?',
      [name, category, quantity, unit, min_stock, cost_per_unit, req.params.id, req.user.user_id]
    )
    res.json({ message: 'Item updated' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', auth, requireRole('farmer'), async (req, res) => {
  try {
    await db.query('DELETE FROM inventory WHERE inventory_id=? AND farmer_id=?', [req.params.id, req.user.user_id])
    res.json({ message: 'Item deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router

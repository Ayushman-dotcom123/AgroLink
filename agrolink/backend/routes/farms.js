const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

router.get('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const [farms] = await db.query('SELECT * FROM farms WHERE farmer_id = ? ORDER BY created_at DESC', [req.user.user_id])
    res.json(farms)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { name, village, district, state, soil_type, size_acres } = req.body
    if (!name || !village || !state) return res.status(400).json({ error: 'Required fields missing' })
    const [result] = await db.query(
      'INSERT INTO farms (farmer_id, name, village, district, state, soil_type, size_acres) VALUES (?,?,?,?,?,?,?)',
      [req.user.user_id, name, village, district, state, soil_type, size_acres]
    )
    res.status(201).json({ message: 'Farm added', farm_id: result.insertId })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.put('/:id', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { name, village, district, state, soil_type, size_acres } = req.body
    await db.query(
      'UPDATE farms SET name=?, village=?, district=?, state=?, soil_type=?, size_acres=? WHERE farm_id=? AND farmer_id=?',
      [name, village, district, state, soil_type, size_acres, req.params.id, req.user.user_id]
    )
    res.json({ message: 'Farm updated' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.delete('/:id', auth, requireRole('farmer'), async (req, res) => {
  try {
    await db.query('DELETE FROM farms WHERE farm_id=? AND farmer_id=?', [req.params.id, req.user.user_id])
    res.json({ message: 'Farm deleted' })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router

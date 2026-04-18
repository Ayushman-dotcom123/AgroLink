const router = require('express').Router()
const db = require('../config/db')
const { auth, requireRole } = require('../middleware/auth')

router.get('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { month, year, type } = req.query
    let query = 'SELECT * FROM expenses WHERE farmer_id = ?'
    const params = [req.user.user_id]
    if (month && year) { query += ' AND MONTH(date) = ? AND YEAR(date) = ?'; params.push(month, year) }
    if (type) { query += ' AND type = ?'; params.push(type) }
    query += ' ORDER BY date DESC'
    const [records] = await db.query(query, params)
    res.json(records)
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.post('/', auth, requireRole('farmer'), async (req, res) => {
  try {
    const { date, category, description, amount, type } = req.body
    if (!date || !amount || !type) return res.status(400).json({ error: 'Required fields missing' })
    const [result] = await db.query(
      'INSERT INTO expenses (farmer_id, date, category, description, amount, type) VALUES (?,?,?,?,?,?)',
      [req.user.user_id, date, category, description, amount, type]
    )
    res.status(201).json({ message: 'Record added', expense_id: result.insertId })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

router.get('/summary', auth, requireRole('farmer'), async (req, res) => {
  try {
    const [summary] = await db.query(
      `SELECT type, SUM(amount) as total, MONTH(date) as month, YEAR(date) as year
       FROM expenses WHERE farmer_id = ? GROUP BY type, MONTH(date), YEAR(date) ORDER BY year DESC, month DESC`,
      [req.user.user_id]
    )
    const totalIncome = summary.filter(s => s.type === 'income').reduce((a, s) => a + +s.total, 0)
    const totalExpense = summary.filter(s => s.type === 'expense').reduce((a, s) => a + +s.total, 0)
    res.json({ summary, totalIncome, totalExpense, profit: totalIncome - totalExpense })
  } catch (err) { res.status(500).json({ error: err.message }) }
})

module.exports = router

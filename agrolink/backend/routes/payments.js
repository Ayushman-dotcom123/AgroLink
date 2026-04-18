const router = require('express').Router()
const { auth } = require('../middleware/auth')

// Razorpay integration
let Razorpay
try { Razorpay = require('razorpay') } catch (e) {}

router.post('/create-order', auth, async (req, res) => {
  try {
    const { amount } = req.body // amount in paise
    if (!process.env.RAZORPAY_KEY_ID || !Razorpay) {
      // Mock response for development
      return res.json({ id: `order_mock_${Date.now()}`, amount, currency: 'INR', status: 'created' })
    }
    const razorpay = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET })
    const order = await razorpay.orders.create({ amount: amount * 100, currency: 'INR', receipt: `receipt_${Date.now()}` })
    res.json(order)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

router.post('/verify', auth, async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body
    const crypto = require('crypto')
    const sign = razorpay_order_id + '|' + razorpay_payment_id
    const expected = crypto.createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'secret').update(sign).digest('hex')
    if (expected === razorpay_signature) {
      res.json({ verified: true, payment_id: razorpay_payment_id })
    } else {
      res.status(400).json({ verified: false, error: 'Payment verification failed' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

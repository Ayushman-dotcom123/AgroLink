const rateLimit = require('express-rate-limit')

const chatbotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  message: { error: 'Too many messages. Please wait a minute.' },
  standardHeaders: true,
  legacyHeaders: false,
})

const express = require('express')
const router = express.Router()
const db = require('../config/db')

// ── Agriculture keyword list ──────────────────────────────────────────────────
const AGRI_KEYWORDS = [
  'crop','crops','soil','fertilizer','fertilizers','farm','farming','farmer','farmers',
  'pest','pests','pesticide','harvest','harvesting','irrigation','seed','seeds','weather',
  'rain','rainfall','temperature','yield','inventory','expense','profit','market','price',
  'tractor','agriculture','agricultural','plant','plants','grow','growing','cultivation',
  'cultivate','manure','compost','organic','inorganic','npk','urea','dap','potash',
  'wheat','rice','maize','corn','cotton','sugarcane','potato','tomato','onion','garlic',
  'soybean','groundnut','mustard','sunflower','barley','millet','sorghum','jowar','bajra',
  'rabi','kharif','zaid','season','monsoon','drought','flood','disease','blight','fungus',
  'insect','worm','aphid','neem','spray','drip','sprinkler','canal','borewell','groundwater',
  'storage','warehouse','cold storage','msp','subsidy','scheme','government','loan','kisan',
  'pmfby','fasal','bima','soil health','ph','nitrogen','phosphorus','potassium','micronutrient',
  'pruning','thinning','transplant','nursery','greenhouse','polyhouse','mulching','intercrop',
  'rotation','fallow','weed','herbicide','fungicide','insecticide','bio','vermicompost',
  'dryland','wetland','paddy','field','acre','hectare','quintal','mandi','agri','agro',
]

function isAgricultureQuery(text) {
  const lower = text.toLowerCase()
  return AGRI_KEYWORDS.some(kw => lower.includes(kw))
}

const RESTRICTION_MSGS = [
  'I am AgroLink Agriculture Assistant. I can only answer farming and agriculture related questions such as crops, soil, fertilizer, pests, irrigation, weather, and farm management.',
  'I can only answer agriculture and farming related questions. Please ask about crops, soil, fertilizer, weather, or farming.',
  'I am an agriculture assistant chatbot and cannot answer non-farming questions. Try asking about crops, pests, irrigation, or soil health.',
]

function getRestrictionMsg() {
  return RESTRICTION_MSGS[Math.floor(Math.random() * RESTRICTION_MSGS.length)]
}

// Simple NLP: tokenize and score against training data
function scoreMatch(query, question) {
  const qTokens = query.toLowerCase().split(/\W+/).filter(Boolean)
  const tTokens = question.toLowerCase().split(/\W+/).filter(Boolean)
  let score = 0
  for (const qt of qTokens) {
    if (qt.length < 3) continue
    for (const tt of tTokens) {
      if (tt === qt) score += 2
      else if (tt.includes(qt) || qt.includes(tt)) score += 1
    }
  }
  return score
}

// ── POST /api/chatbot/message ─────────────────────────────────────────────────
router.post('/message', chatbotLimiter, async (req, res) => {
  const { message } = req.body
  if (!message || !message.trim()) return res.status(400).json({ error: 'Message required' })

  const userMsg = message.trim()
  let botResponse = ''

  try {
    // Step 1: classify query
    if (!isAgricultureQuery(userMsg)) {
      botResponse = getRestrictionMsg()
    } else {
      // Step 2: search training data
      let rows = []
      try {
        ;[rows] = await db.query('SELECT * FROM chatbot_training ORDER BY id DESC')
      } catch (_) {
        rows = []
      }

      let bestMatch = null
      let bestScore = 0

      for (const row of rows) {
        const score = scoreMatch(userMsg, row.question)
        if (score > bestScore) {
          bestScore = score
          bestMatch = row
        }
      }

      if (bestMatch && bestScore >= 2) {
        botResponse = bestMatch.answer
      } else {
        botResponse = "I am still learning. Please contact AgroLink support or try another agriculture question."
      }
    }

    // Step 3: log the conversation
    try {
      await db.query(
        'INSERT INTO chatbot_logs (user_message, bot_response) VALUES (?, ?)',
        [userMsg, botResponse]
      )
    } catch (_) { /* log failure is non-critical */ }

    res.json({ response: botResponse })
  } catch (err) {
    console.error('Chatbot error:', err)
    res.status(500).json({ error: 'Chatbot service error' })
  }
})

// ── POST /api/chatbot/train ───────────────────────────────────────────────────
router.post('/train', async (req, res) => {
  const { question, answer, category } = req.body
  if (!question || !answer || !category) {
    return res.status(400).json({ error: 'question, answer, and category are required' })
  }
  try {
    const [result] = await db.query(
      'INSERT INTO chatbot_training (question, answer, category) VALUES (?, ?, ?)',
      [question.trim(), answer.trim(), category.trim()]
    )
    res.json({ success: true, id: result.insertId })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to save training data' })
  }
})

// ── GET /api/chatbot/training ─────────────────────────────────────────────────
router.get('/training', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_training ORDER BY id DESC')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch training data' })
  }
})

// ── DELETE /api/chatbot/training/:id ─────────────────────────────────────────
router.delete('/training/:id', async (req, res) => {
  try {
    await db.query('DELETE FROM chatbot_training WHERE id = ?', [req.params.id])
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete' })
  }
})

// ── GET /api/chatbot/logs ─────────────────────────────────────────────────────
router.get('/logs', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_logs ORDER BY timestamp DESC LIMIT 200')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch logs' })
  }
})

// ── GET /api/chatbot/categories ───────────────────────────────────────────────
router.get('/categories', async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM chatbot_categories ORDER BY category_name')
    res.json(rows)
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch categories' })
  }
})

module.exports = router

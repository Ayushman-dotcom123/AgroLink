const router = require('express').Router()
const { auth } = require('../middleware/auth')

// Rule-based AI recommendation engine
function recommend({ soil_type, season, state, rainfall, temperature }) {
  const recs = []
  if (soil_type === 'Alluvial' && season === 'Rabi') recs.push({ crop: 'Wheat', confidence: 95, reason: 'Alluvial soil is ideal for wheat in Rabi season' })
  if (soil_type === 'Alluvial' && season === 'Kharif') recs.push({ crop: 'Rice', confidence: 92, reason: 'Alluvial soil with Kharif rains is perfect for paddy' })
  if (soil_type === 'Black' && season === 'Kharif') recs.push({ crop: 'Cotton', confidence: 90, reason: 'Black soil retains moisture, ideal for cotton' })
  if (soil_type === 'Black') recs.push({ crop: 'Soybean', confidence: 85, reason: 'Black soil is rich in calcium, suitable for soybean' })
  if (soil_type === 'Red') recs.push({ crop: 'Groundnut', confidence: 88, reason: 'Red soil with good drainage is excellent for groundnut' })
  if (soil_type === 'Sandy') recs.push({ crop: 'Bajra', confidence: 87, reason: 'Sandy soil is ideal for drought-resistant bajra' })
  if (soil_type === 'Loamy') recs.push({ crop: 'Vegetables', confidence: 93, reason: 'Loamy soil is versatile for vegetable farming' })
  if (soil_type === 'Clay') recs.push({ crop: 'Sugarcane', confidence: 86, reason: 'Clay soil retains water, suitable for sugarcane' })
  if (rainfall === 'high') recs.push({ crop: 'Jute', confidence: 80, reason: 'High rainfall areas are suitable for jute' })
  if (rainfall === 'low') recs.push({ crop: 'Jowar', confidence: 85, reason: 'Drought-tolerant crop for low rainfall regions' })
  if (temperature === 'cold') recs.push({ crop: 'Peas', confidence: 88, reason: 'Cool temperatures are ideal for pea cultivation' })
  if (temperature === 'hot') recs.push({ crop: 'Maize', confidence: 84, reason: 'Maize thrives in warm temperatures' })
  if (state === 'Punjab' || state === 'Haryana') recs.push({ crop: 'Wheat + Rice Rotation', confidence: 96, reason: 'Traditional profitable rotation for this region' })
  if (state === 'Maharashtra') recs.push({ crop: 'Onion', confidence: 89, reason: 'Maharashtra is India\'s largest onion producer' })
  const seen = new Set()
  return recs.filter(r => { if (seen.has(r.crop)) return false; seen.add(r.crop); return true })
    .sort((a, b) => b.confidence - a.confidence).slice(0, 5)
}

router.post('/recommend', auth, (req, res) => {
  try {
    const { soil_type, season, state, rainfall, temperature, farm_size } = req.body
    if (!soil_type && !season && !state) return res.status(400).json({ error: 'Provide at least soil_type, season, or state' })
    const recommendations = recommend({ soil_type, season, state, rainfall, temperature })
    res.json({ recommendations, input: { soil_type, season, state, rainfall, temperature, farm_size } })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

module.exports = router

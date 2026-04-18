const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// Ensure uploads dir exists
const uploadDir = path.join(__dirname, '../uploads/soil')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `soil_${Date.now()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const MOCK_RESULTS = [
  { soilType: 'Loamy Soil', ph: 6.5, nitrogen: 'Medium', phosphorus: 'High', potassium: 'Medium', crops: ['Wheat', 'Maize', 'Vegetables', 'Soybean'], fertilizer: 'NPK 10-26-26 + Organic Compost', irrigation: 'Moderate irrigation — 2-3 times per week', confidence: 87 },
  { soilType: 'Alluvial Soil', ph: 7.1, nitrogen: 'High', phosphorus: 'Medium', potassium: 'High', crops: ['Rice', 'Wheat', 'Sugarcane', 'Cotton'], fertilizer: 'Urea + DAP at sowing time', irrigation: 'Regular irrigation — flood or drip method', confidence: 91 },
  { soilType: 'Black Soil', ph: 7.8, nitrogen: 'Low', phosphorus: 'Medium', potassium: 'High', crops: ['Cotton', 'Soybean', 'Jowar', 'Sunflower'], fertilizer: 'Nitrogen-rich fertilizer + Zinc Sulfate', irrigation: 'Less irrigation needed — retains moisture well', confidence: 83 },
  { soilType: 'Red Soil', ph: 5.8, nitrogen: 'Low', phosphorus: 'Low', potassium: 'Medium', crops: ['Groundnut', 'Millets', 'Tobacco', 'Potato'], fertilizer: 'Lime + NPK + Organic Manure', irrigation: 'Frequent light irrigation recommended', confidence: 79 },
]

// POST /api/soil/analyze
router.post('/analyze', upload.single('image'), (req, res) => {
  const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
  const imageUrl = req.file ? `/uploads/soil/${req.file.filename}` : null
  res.json({ success: true, imageUrl, result, analyzedAt: new Date().toISOString() })
})

module.exports = router

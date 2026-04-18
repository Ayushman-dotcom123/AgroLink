const router = require('express').Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')

const uploadDir = path.join(__dirname, '../uploads/crop-disease')
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true })

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => cb(null, `disease_${Date.now()}${path.extname(file.originalname)}`),
})
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } })

const MOCK_RESULTS = [
  { crop: 'Tomato', disease: 'Leaf Spot', severity: 'Medium', cause: 'Fungal infection (Alternaria solani)', treatment: 'Apply Mancozeb or Chlorothalonil fungicide spray every 7 days', pesticide: 'Mancozeb 75% WP', prevention: 'Avoid overhead irrigation, ensure proper plant spacing, remove infected leaves', confidence: 88 },
  { crop: 'Wheat', disease: 'Yellow Rust', severity: 'High', cause: 'Fungal pathogen (Puccinia striiformis)', treatment: 'Spray Propiconazole 25% EC at first sign of infection', pesticide: 'Propiconazole 25% EC', prevention: 'Use rust-resistant varieties, apply fungicide preventively in humid conditions', confidence: 92 },
  { crop: 'Rice', disease: 'Blast Disease', severity: 'High', cause: 'Fungal infection (Magnaporthe oryzae)', treatment: 'Apply Tricyclazole or Isoprothiolane fungicide immediately', pesticide: 'Tricyclazole 75% WP', prevention: 'Avoid excess nitrogen, maintain proper water level, use resistant varieties', confidence: 85 },
  { crop: 'Potato', disease: 'Late Blight', severity: 'Severe', cause: 'Oomycete pathogen (Phytophthora infestans)', treatment: 'Apply Metalaxyl + Mancozeb combination spray', pesticide: 'Metalaxyl 8% + Mancozeb 64% WP', prevention: 'Avoid waterlogging, use certified disease-free seed tubers, ensure good drainage', confidence: 90 },
  { crop: 'Cotton', disease: 'Leaf Curl Virus', severity: 'Medium', cause: 'Viral infection transmitted by whiteflies', treatment: 'Control whitefly population with Imidacloprid spray', pesticide: 'Imidacloprid 17.8% SL', prevention: 'Use virus-resistant varieties, control whitefly early, remove infected plants', confidence: 78 },
]

// POST /api/crop/disease-detect
router.post('/disease-detect', upload.single('image'), (req, res) => {
  const result = MOCK_RESULTS[Math.floor(Math.random() * MOCK_RESULTS.length)]
  const imageUrl = req.file ? `/uploads/crop-disease/${req.file.filename}` : null
  res.json({ success: true, imageUrl, result, analyzedAt: new Date().toISOString() })
})

module.exports = router

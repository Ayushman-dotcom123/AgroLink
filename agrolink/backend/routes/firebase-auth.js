const router = require('express').Router()
const jwt = require('jsonwebtoken')
const admin = require('../config/firebase-admin')
const db = require('../config/db')

/**
 * POST /api/firebase-auth/verify
 * Receives a Firebase ID token from the frontend.
 * Verifies it, upserts the user in MySQL, returns our own JWT + user profile.
 */
router.post('/verify', async (req, res) => {
  const { idToken, role, village, district, state, farm_size, soil_type } = req.body
  if (!idToken) return res.status(400).json({ error: 'idToken required' })

  try {
    // 1. Verify Firebase token
    const decoded = await admin.auth().verifyIdToken(idToken)
    const { uid, email, name, phone_number, picture } = decoded

    // 2. Upsert user in MySQL (create if first login, update if returning)
    let user
    try {
      const [rows] = await db.query('SELECT * FROM users WHERE firebase_uid = ?', [uid])

      if (rows.length) {
        // Returning user — update last seen
        user = rows[0]
        await db.query('UPDATE users SET updated_at = NOW() WHERE user_id = ?', [user.user_id])
      } else {
        // New user — insert into MySQL with profile fields
        const assignedRole = role || 'customer'
        const [result] = await db.query(
          `INSERT INTO users (firebase_uid, name, email, phone, role, profile_image, village, district, state, is_active)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          [uid, name || email?.split('@')[0] || 'User', email || null, phone_number || null,
           assignedRole, picture || null, village || null, district || null, state || null]
        )
        const [newRows] = await db.query('SELECT * FROM users WHERE user_id = ?', [result.insertId])
        user = newRows[0]

        // If farmer, create farmers record too
        if (assignedRole === 'farmer') {
          await db.query(
            'INSERT INTO farmers (user_id, farm_size_acres, soil_type, is_approved) VALUES (?, ?, ?, 0)',
            [user.user_id, farm_size || 0, soil_type || '']
          )
        }
      }
    } catch (dbErr) {
      // MySQL offline — create a temporary in-memory user object so auth still works
      console.warn('MySQL offline, using Firebase profile only:', dbErr.message)
      user = {
        user_id: uid,
        name: name || email?.split('@')[0] || 'User',
        email: email || null,
        phone: phone_number || null,
        role: role || 'customer',
        profile_image: picture || null,
        village: village || null,
        district: district || null,
        state: state || null,
        firebase_uid: uid,
      }
    }

    // 3. Issue our own JWT
    const token = jwt.sign(
      { user_id: user.user_id, email: user.email, role: user.role, firebase_uid: uid },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    )

    const { password: _, ...safeUser } = user

    res.json({ token, user: safeUser })
  } catch (err) {
    console.error('Firebase token verification failed:', err.message)
    res.status(401).json({ error: 'Invalid or expired Firebase token' })
  }
})

module.exports = router

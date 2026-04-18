const router = require('express').Router()
const axios = require('axios')

// Fallback mock data for when API key is not yet active or unavailable
const MOCK = {
  temp: 24, feels_like: 22, humidity: 65, wind: 14,
  description: 'Partly Cloudy', rain_chance: 20, uv: 4, visibility: 10,
  advisories: ['Weather conditions are favorable for farming today'],
}

router.get('/', async (req, res) => {
  const { city = 'Delhi' } = req.query
  const apiKey = process.env.OPENWEATHER_API_KEY

  if (!apiKey) {
    return res.json({ ...MOCK, city, _source: 'mock' })
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)},IN&appid=${apiKey}&units=metric`
    const { data } = await axios.get(url)

    const advisories = []
    if (data.rain) advisories.push('Rain detected – delay pesticide application')
    if (data.main.humidity > 80) advisories.push('High humidity – monitor for fungal diseases')
    if (data.wind.speed * 3.6 > 30) advisories.push('Strong winds – avoid spraying operations')
    if (data.main.temp > 35) advisories.push('Heat wave – increase irrigation frequency')
    if (data.main.temp < 5) advisories.push('Cold wave – protect sensitive crops')
    if (!advisories.length) advisories.push('Weather conditions are favorable for farming today')

    res.json({
      city: data.name,
      temp: Math.round(data.main.temp),
      feels_like: Math.round(data.main.feels_like),
      humidity: data.main.humidity,
      wind: Math.round(data.wind.speed * 3.6),
      description: data.weather[0].description,
      rain_chance: data.clouds?.all || 0,
      uv: 4, // OWM free tier doesn't include UV in current weather
      visibility: Math.round((data.visibility || 10000) / 1000),
      advisories,
      _source: 'live',
    })
  } catch (err) {
    const status = err.response?.status
    // 401 = key not yet active, 404 = city not found — return mock with city name
    console.error(`Weather API error (${status}):`, err.message)
    res.json({
      ...MOCK,
      city,
      _source: 'mock',
      _note: status === 401
        ? 'API key not yet active (can take up to 2 hours after creation)'
        : status === 404
        ? 'City not found, showing estimated data'
        : 'Weather service temporarily unavailable',
    })
  }
})

module.exports = router

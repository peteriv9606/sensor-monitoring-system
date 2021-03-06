const express = require('express')
const router = express.Router()
const db = require('../db')
const io = require("socket.io-client");

router.get("/sensors", (req, res, next) => {
  console.log("GET /api/sensors")
  var query = "SELECT * FROM sensors"
  var params = []
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message })
    }
    return res.status(200).json({ count: rows.length, requested_at: Date.now(), data: rows })
  })
})

router.get("/sensors/:id", (req, res, next) => {
  console.log(`GET /api/sensors/${req.params.id}`)
  var query = `
    SELECT sensors.sensor_id, sensors.name, sensors.isActive, data.temperature, data.humidity, data.created_at
    FROM sensors 
    INNER JOIN data 
    ON sensors.sensor_id = data.sensor_id
    WHERE sensors.sensor_id = ?
  `
  var params = [req.params.id]
  db.all(query, params, (err, rows) => {
    if (err) {
      return res.status(400).json({ "error": err.message })
    }
    if (rows && rows.length !== 0) {
      let results = []
      rows.forEach(el => {
        results.push({
          temperature: el.temperature,
          humidity: el.humidity,
          created_at: el.created_at
        })
      })
      return res.status(200).json({
        sensor_id: rows[0].sensor_id,
        name: rows[0].name,
        isActive: rows[0].isActive,
        count: rows.length,
        requested_at: Date.now(),
        data: results
      })
    }
    return res.sendStatus(404)
  })
})

router.put('/sensors/:id', (req, res) => {
  console.log(`PUT /api/sensors/${req.params.id}`)

  let query = `SELECT * FROM sensors WHERE sensor_id=?`
  db.get(query, [req.params.id], (err, sensor) => {
    if (err) return res.sendStatus(400)
    db.run(`UPDATE sensors SET isActive = ? WHERE sensor_id = ?`,
      [!Boolean(sensor.isActive), req.params.id], (err) => {
        if (err) return res.sendStatus(400)
        const socket = io.connect(`http://localhost:4000/sensors/${req.params.id}/data/`, {
          reconnection: false
        })
        socket.on('connect', () => {
          socket.emit('sensorStatusUpdate', { id: req.params.id, isActive: !sensor.isActive })
          socket.disconnect()
        })
        return res.status(200).json({'id': req.params.id, 'isActive': !sensor.isActive })
      })
  })
})

module.exports = router
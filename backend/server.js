const express = require("express")
const cors = require('cors')
const db = require("./db.js")
const { createServer } = require("http")
const { Server } = require("socket.io");

const app = express()

app.use(express.urlencoded({ extended: false }))
app.use(express.json())
app.use(cors())

const httpServer = createServer(app)
  .listen(4000, () => {
    console.log('Server running on port 4000')
  });

const socket_server = new Server(httpServer, {
  transports: ['websocket', 'polling'],
  cors: {
    origin: "http://localhost:3000"
  }
});

const sensorNamespace = socket_server.of(new RegExp('sensors\/[0-9A-z]+\/data\/$'))

sensorNamespace.on('connection', (socket) => {
  console.log(`someone connected to server.. socket id: ${socket.id}`)
  console.log('emitting to client...')

  socket.on('sensorInit', (data) => {
    console.log(`sensor init on socket id: ${socket.id}`)
    // init sensor into db and set active status to 1 (true)
    db.run(`
    INSERT INTO sensors (sensor_id, name, isActive, onSocket) 
    VALUES (?, ?, ?, ?)
    ON CONFLICT(sensor_id) 
    DO UPDATE SET isActive=excluded.isActive, onSocket=excluded.onSocket
    `, [data.id, data.name, 1, socket.id], (err) => {
      if (err) {
        // sensor already in DB
      } else {
        db.all("SELECT * FROM sensors", [], (err, rows) => {
          if (!err) {
            socket.broadcast.emit('web_sensorStatusUpdate', rows)
          }
        })
      }
    })
  })

  // listen for incoming data from sensors
  socket.on('sensorDataUpdate', (data) => {
    console.log(`data received for sensor '${data?.id}'`, data)
    // check if sensor is active and only then
    // persist data to db and emit to client
    let query = `SELECT * FROM sensors WHERE sensor_id=?`
    let params = [data.id]
    db.get(query, params, (err, sensor) => {
      if (!err) {
        if (sensor?.isActive) {
          let insert_data = [data.id, data.temperature, data.humidity, Date.now()]
          // persist data into db & emit to client
          db.run(`INSERT INTO 
                  data (sensor_id, temperature, humidity, created_at) 
                  VALUES (?, ?, ?, ?)
          `, [insert_data[0], insert_data[1], insert_data[2], insert_data[3]], (err) => {
              if (!err) {
                // inserted into db
                // and send to clients if any
                socket.broadcast.emit('web_getSensorsData', {
                  id: insert_data[0],
                  temperature: insert_data[1],
                  humidity: insert_data[2],
                  created_at: insert_data[3]
                })
              }
            })
        }
      }
    })
  })

  socket.on('sensorStatusUpdate', (data) => {
    console.log("sensorStatusUpdate", data)
    db.all("SELECT * FROM sensors", [], (err, rows) => {
      if (!err) {
        socket.broadcast.emit('web_sensorStatusUpdate', rows)
      }
    })
  })

  socket.on('disconnect', () => {
    console.log(`socket closed id: ${socket.id}`)
    // remove socketId from DB and switch isActive to false
    // if socket is in db (if regular client disconnects, nothing will execute)

    db.run(`
    UPDATE sensors
    SET isActive = 0, onSocket = ''
    WHERE onSocket = ?;
    `, [socket.id], (err) => {
      if (!err) {
        db.all("SELECT * FROM sensors", [], (err, rows) => {
          if (!err) {
            socket.broadcast.emit('web_sensorStatusUpdate', rows)
          }
        })
      }
    })
  })
})

// ************************ regular endpoints ************************

app.get("/", (req, res, next) => {
  res.json({ "API_Message": "Use '/api' prefix for access to sensor endpoints" })
})

var sensors = require('./routes/sensors')

app.use('/api', sensors)

// Default response for any other request
app.use(function (req, res) {
  res.sendStatus(404)
})
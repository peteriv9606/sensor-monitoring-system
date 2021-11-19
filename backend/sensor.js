const io = require("socket.io-client");

// get data from process.argv 
const id = process.argv[2] || undefined
const name = process.argv[3] || undefined

const socket = io.connect(`http://localhost:4000/sensors/${id}/data/`, {
  reconnection: false
});

socket.on('connect', () => {
  console.log(`Sensor id: ${id} | '${name}' - connected to ws server`);

  socket.emit('sensorInit', { id, name })

  socket.emit('sensorDataUpdate', {
    id,
    temperature: Math.floor(Math.random() * (50 - 40) + 40),
    humidity: Math.floor(Math.random() * (10 - 0) + 0)
  });

  setInterval(() => {
    // simulate changes in temperature of sensor
    socket.emit('sensorDataUpdate', {
      id,
      temperature: Math.floor(Math.random() * (50 - 40) + 40),
      humidity: Math.floor(Math.random() * (10 - 0) + 0)
    });
  }, 5000);
})



socket.on('disconnect', () => {
  console.log('Socket closed')
  process.exit()
})



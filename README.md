# sensor-monitoring-system

## Let's build and run this:

1. Clone repo
2. cd to frontend and install using ```> yarn install```
3. cd to backend and install using ```> yarn install```

## Backend

1. To start the server...

Once in backend directory, after using ```> yarn install``` to install node modules, run ```> yarn start``` to run the server. 
Server should be running on (http://localhost:4000)[http://localhost:4000].

I have provided some sensor data within db.sqlite3 for 2 sensors:
    
    - #1 sensor_id: 200, sensor_name: Sensor 200
    - #2 sensor_id: 5538ABCD sensor_name: Sensor 5538ABCD


2. Run sensor

```> node sensor.js <sensor_id> <sensor_name>``` initiates a new instance of a sensor, connects to the server using Socket.io, and starts emitting randomly generated data.

examples:

 ```> node sensor.js 200 'Sensor 200'``` - Starts a sensor with id of 200 and a name of Sensor 200. 
 
 ```> node sensor.js 5538ABCD 'Sensor 5538ABCD'``` - Starts a sensor with id of 5538ABCD and a name of Sensor 5538ABCD.
 

### Routes

Server provides 2 types of routes:

#### Regular Endpoints:
    
    - GET http://localhost:4000/api/sensors/ - retrieves data for all sensors (both active and inactive)
    - GET http://localhost:4000/api/sensors/:id - retrieves data for a single sensor (id, name, isActive, data (the randomly generated data from the sensor))
    - PUT http://localhost:4000/api/sensors/:id - toggles the sensor's isActive state
  
#### WebSocket:
  
    - http://localhost:4000/sensors/:id/data - a websocket to a single sensor
     
Once connected as a client using this websocket, (if the sensor is up and running) you can listen for two events:
    
    - web_sensorStatusUpdate - all current sensor statuses from db (active/inactive) 
    - web_getSensorsData - the randomly generated data from this particular sensor
     
## Frontend

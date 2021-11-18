import { useEffect, useState } from "react"
import { io } from "socket.io-client";
import router from 'next/router'
import { FiPower } from 'react-icons/fi'
import { Line } from 'react-chartjs-2';
import moment from 'moment';

import styles from '../../styles/singleSensor.module.scss'

export async function getServerSideProps(ctx) {
  const ctx_sensor = await fetch(`http://localhost:4000/api/sensors/${ctx.query.id}`).then(res => res.json())

  return ({
    props: {
      ctx_sensor
    }
  })
}

const NUMBER_OF_CHART_ITEMS = 10; // show last 20 items from sensor data

export default function SingleSensor({ ctx_sensor }) {
  const [sensor, setSensor] = useState(ctx_sensor)
  const [socket, setSocket] = useState()
  const [liveData, setLiveData] = useState()

  const [labelsLiveData, setLabelsLiveData] = useState([])
  const [tempLiveData, setTempLiveData] = useState([])
  const [humLiveData, setHumLiveData] = useState([])

  useEffect(() => {
    //console.log(sensor)
    if (sensor) {
      if (sensor?.data?.length > 0) {
        const labels = [];
        const humData = [];
        const tempData = [];
        sensor.data.forEach((data) => {
          labels.push(moment(data.created_at).format('MMM Do HH:mm:ss'));
          tempData.push(data.temperature);
          humData.push(data.humidity);
        })

        setLabelsLiveData(labels);
        setTempLiveData(tempData);
        setHumLiveData(humData);
      }
      // establish connection on component mounting
      handleSocketConnect(sensor.sensor_id);

      // component will unmount
      return () => {
        handleSocketDisconnect();
      }
    }
  }, [])

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        console.log("Web client connected to ws server!")

        socket.on('web_getSensorsData', (newSensordata) => {
          // update components state
          const newLabels = labelsLiveData;

          newLabels.push(moment(newSensordata.created_at).format('MMM Do HH:mm:ss'))
          setLabelsLiveData([...newLabels]);
          // for temp
          const newTempData = tempLiveData;
          newTempData.push(newSensordata.temperature)
          setTempLiveData([...newTempData]);
          // for hum
          const newHumidityData = humLiveData;
          newHumidityData.push(newSensordata.humidity)
          setHumLiveData([...newHumidityData]);

          setLiveData(newSensordata)
        })

        socket.on('web_sensorStatusUpdate', (data) => {
          console.log('SensorStatusUpdate', data)
          let sen = data.filter(sen => sen.sensor_id == router.query.id)
          if(sen.lenght !== 0){
            setSensor({
              ...sensor,
              isActive: Boolean(sen[0].isActive)
            })
          }
        })
      })

      socket.on("disconnect", () => {
        console.log(`Disconnected...`)
      })
    }
  }, [socket])

  const handleSocketConnect = (id) => {
    // connect to single sensor
    const conn = io(`http://localhost:4000/sensors/${id}/data/`, {
      reconnection: false
    })
    setSocket(conn)
  }

  const handleSocketDisconnect = () => {
    socket?.disconnect()
  }

  const handleSensorStatus = async () => {
    const res = await fetch(`http://localhost:4000/api/sensors/${sensor.sensor_id}`, { method: "PUT" })
    console.log(res.data)
  }

  const lineData = {
    labels: labelsLiveData.slice(1).slice(-NUMBER_OF_CHART_ITEMS),
    datasets: [
      {
        label: 'Temperature',
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        fill: false,
        data: tempLiveData.slice(1).slice(-NUMBER_OF_CHART_ITEMS)
      },
      {
        label: 'Humidity',
        backgroundColor: '#4BC0C0',
        borderColor: '#4BC0C0',
        fill: false,
        data: humLiveData.slice(1).slice(-NUMBER_OF_CHART_ITEMS)
      }
    ],
  }

  return (
    <div className={'Shell'}>
      <div className={styles.Content_wrapper}>
        <h1>Sensor Details:</h1>
        <div className={styles.Sensor_details}>
          <h2>ID: {sensor.sensor_id}</h2>
          <h2>Name: {sensor.name}</h2>
          <FiPower
            className={`${styles.Power} ${sensor?.isActive ? styles.On : styles.Off}`}
            title={sensor?.isActive ? 'Turn Off' : 'Turn On'}
            onClick={handleSensorStatus} />
        </div>
        <h1>Live Readings:</h1>
        {
          sensor.isActive ?
            <div className={styles.Readings}>
              <span>Temperature : {liveData?.temperature}°</span>
              <span>Humidity : {liveData?.humidity}%</span>
            </div>
            :
            <div className={`${styles.Readings} ${styles.Inactive}`}>
              <h1>Sensor is Inactive</h1>
            </div>
        }
      </div>
      <div className={`${styles.Content_wrapper} ${styles.Charts_wrapper}`}>
        <h1>Chart</h1>
        <Line
          data={{ ...lineData }}
          options={{
            plugins: {
              title: {
                display: true,
                text: `Live Data for sensor id: ${sensor.sensor_id}`
              }
            },
            scales: {
              x: {
                min: 0,
                max: 100,
              },
              y: {
                min: 0,
                max: 60,
              }
            },
            responsive: true,
            
          }}
          width={400}
          height={200}
        /> 
      </div>

    </div>)
}


import Head from 'next/head'
import styles from '../../styles/singleSensor.module.scss'
import { useEffect, useState } from "react"
import { io } from "socket.io-client";
import Layout from "../../components/layout";
import router from 'next/router'
import moment from 'moment';
import Log from "../../components/log";
import Graph from "../../components/graph";
import SensorDetails from "../../components/sensorDetails";

export async function getServerSideProps(ctx) {
  const ctx_sensor = await fetch(`http://localhost:4000/api/sensors/${ctx.query.id}`).then(res => res.json())

  return ({
    props: {
      ctx_sensor
    }
  })
}

const NUMBER_OF_CHART_ITEMS = 10; // show last 20 items from sensor data
// TODO: maybe make this a user selection?

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
        sensor.data.map(data => {
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
          newLabels.unshift(moment(newSensordata.created_at).format('MMM Do HH:mm:ss'))
          setLabelsLiveData([...newLabels]);
          // for temp
          const newTempData = tempLiveData;
          newTempData.unshift(newSensordata.temperature)
          setTempLiveData([...newTempData]);
          // for hum
          const newHumidityData = humLiveData;
          newHumidityData.unshift(newSensordata.humidity)
          setHumLiveData([...newHumidityData]);

          setLiveData(newSensordata)
        })

        socket.on('web_sensorStatusUpdate', (data) => {
          console.log('SensorStatusUpdate', data)
          let sen = data.filter(sen => sen.sensor_id == router.query.id)
          if (sen.lenght !== 0) {
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
    return () => {
      handleSocketDisconnect()
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

  const handleSensorStatus = () => {
    fetch(`http://localhost:4000/api/sensors/${sensor.sensor_id}`, { method: "PUT" })

  }

  const handleRefresh = async () => {
    const newData = await fetch(`http://localhost:4000/api/sensors/${sensor.sensor_id}`).then(res => res.json())
    setSensor(newData)
  }

  const lineData = {
    labels: labelsLiveData.slice(0, NUMBER_OF_CHART_ITEMS).reverse(),
    datasets: [
      {
        label: 'Temperature',
        backgroundColor: '#FF6384',
        borderColor: '#FF6384',
        fill: false,
        data: tempLiveData.slice(0, NUMBER_OF_CHART_ITEMS).reverse()
      },
      {
        label: 'Humidity',
        backgroundColor: '#4BC0C0',
        borderColor: '#4BC0C0',
        fill: false,
        data: humLiveData.slice(0, NUMBER_OF_CHART_ITEMS).reverse()
      }
    ],
  }

  return (
    <Layout>
      <Head>
        <title>{sensor?.name} | Details</title>
        <meta name="description" content={`${sensor?.name} | Details`} />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.Wrapper}>
        <div className={'Shell'}>
          <div className={styles.Inner}>
            <div className={styles.Details}>
              <SensorDetails
                sensor={sensor}
                handleSensorStatus={handleSensorStatus}
                liveData={liveData} />
              <Log
                sensor={sensor}
                handleRefresh={handleRefresh} />
            </div>
            <Graph lineData={lineData} />
          </div>
        </div>
      </div>
    </Layout>
  )
}


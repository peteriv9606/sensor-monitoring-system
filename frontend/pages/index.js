import Head from 'next/head'
import styles from '../styles/index.module.scss'
import { useEffect, useState } from 'react';
import { io } from "socket.io-client";
import Layout from '../components/layout';
import { MdRefresh } from 'react-icons/md'

export const getServerSideProps = async () => {
  var sensorsSSR = null
  try {
    sensorsSSR = await fetch('http://localhost:4000/api/sensors').then(res => res.json())
  } catch (error) { }
  return (
    {
      props: {
        sensorsSSR
      }
    }
  )
}

export default function Home({ sensorsSSR }) {
  const [sensorsData, setSensorsData] = useState(sensorsSSR || undefined)

  useEffect(() => {
    let sensors = sensorsData?.data

    if (sensors) {
      sensors.map((sensor) => {
        const conn = io(`http://localhost:4000/sensors/${sensor.sensor_id}/data/`, {
          reconnection: false
        })
        conn.on('connect', () => {
          console.log("Web client connected to ws server! Sensor ID: ", sensor.sensor_id)

          conn.on('web_sensorStatusUpdate', (sdata) => {
            console.log('SensorStatusUpdate', sdata)

            setSensorsData({
              ...sensorsData,
              requested_at: new Date().toISOString(),
              data: sdata
            })
          })
        })

        conn.on("disconnect", () => {
          console.log(`Disconnected...`)
        })
      })
    }
  }, [])

  useEffect(() => {
    console.log('sensorsData: ', sensorsData)
  }, [sensorsData])

  const refreshData = async () => {
    const res = await fetch('http://localhost:4000/api/sensors').then(res => res.json())
    setSensorsData(res)
  }

  return (
    <Layout>
      <Head>
        <title>Sensor Monitoring System</title>
        <meta name="description" content="Sensor monitoring system" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <div className={styles.Wrapper}>
        <div className={"Shell"}>
          <div className={styles.Inner}>
            {
              sensorsData ?
                <div className={styles.Sensors_wrapper}>
                  <h1>Sensor Monitoring System</h1>
                  <div className={styles.Sensors_head}>
                    <p>Total: {sensorsData.count}</p>
                    <p>Last updated: {new Date(sensorsData.requested_at).toLocaleString()}</p>
                    <button onClick={refreshData}><MdRefresh /></button>
                  </div>
                  <div className={styles.Sensors_content}>
                    <h2>Status/ID/Name</h2>
                    {
                      sensorsData.data.map((sensor) =>
                        <a key={sensor.sensor_id} className={styles.Sensor} href={`/sensor/${sensor.sensor_id}`}>
                          <span
                            className={`${styles.Sensor_status} ${sensor.isActive ? styles.Enabled : styles.Disabled}`}
                            title={sensor.isActive ? 'Active' : 'Inactive'}></span>
                          <p>{sensor.sensor_id}</p>
                          <p>{sensor.name}</p>
                        </a>
                      )
                    }
                  </div>
                </div>
                : <div className={styles.Sensors_wrapper}>
                  <h1>Sensor Monitoring System</h1>
                  <h1>Server not running</h1>
                </div>
            }
          </div>
        </div>
      </div>
    </Layout>
  )
}

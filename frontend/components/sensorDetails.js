import styles from '../styles/sensorDetails.module.scss'
import { FiPower } from 'react-icons/fi'

export default function SensorDetails({ sensor, handleSensorStatus, liveData }) {
  return (
    <div className={'Content_wrapper'}>
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
  )
}
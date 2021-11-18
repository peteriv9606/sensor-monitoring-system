import styles from '../styles/log.module.scss'
import moment from "moment"
import { MdRefresh } from "react-icons/md"

export default function Log({ sensor, handleRefresh }) {
  return (
    <div className={`${'Content_wrapper'} ${styles.Wrapper}`}>
      <div className={styles.Overlay}>
        <div>
          <h1>Sensor Data Log</h1>
          <p>Updated: {moment(sensor?.requested_at).format('MMM Do YYYY HH:mm:ss')}</p>
        </div>
        <div>
          <button onClick={handleRefresh}><MdRefresh /></button>
        </div>
      </div>

      <span>
        {
          sensor?.data?.sort((curr_el, next_el) => {
            // sort by date (order - newest first)
            if (curr_el.created_at > next_el.created_at) return -1
          }).map((line, index) =>
            <p key={index}>Temperature: {line.temperature}° | Humidity: {line.humidity}% | Logged: {moment(line.created_at).format('MMM Do YYYY HH:mm:ss')}</p>
          )
        }
      </span>
    </div>)
}
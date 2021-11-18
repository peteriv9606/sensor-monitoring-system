import { useEffect, useState } from "react"

export async function getServerSideProps(ctx){
  const ctx_sensor = await fetch(`http://localhost:4000/api/sensors/${ctx.query.slug}`).then(res=>res.json())

  return({
    props:{
      ctx_sensor
    }
  })
}

export default function SingleSensor({ctx_sensor}){
  const [sensor, setSensor] = useState(ctx_sensor)
  useEffect(() => {
    console.log(sensor)

  }, [])
  return(
  <div className={'Shell'}>
    <h1>Data for sensor id: '{sensor.sensor_id}'</h1>
  </div>)
}
import { Line } from 'react-chartjs-2';

export default function Graph({ lineData }) {
  return (
    <div className={'Content_wrapper'}>
      <h1>Live Data</h1>
      <Line
        data={{ ...lineData }}
        options={{
          scales: {
            x: { min: 0, max: 100 },
            y: { min: 0, max: 60 }
          }
        }}
        width={400}
        height={200}
      />
    </div>
  )
}
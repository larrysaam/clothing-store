import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
)

const RevenueChart = ({ data }) => {
  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Monthly Revenue',
      },
    },
  }

  const chartData = {
    labels: data.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: data.map(item => item.revenue),
        borderColor: 'rgb(75, 85, 99)',
        backgroundColor: 'rgba(75, 85, 99, 0.5)',
      },
    ],
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <Line options={options} data={chartData} />
    </div>
  )
}

export default RevenueChart
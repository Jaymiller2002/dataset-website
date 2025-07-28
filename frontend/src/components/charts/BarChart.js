import React from 'react';
import { Bar } from 'react-chartjs-2';

const BarChart = ({ data }) => {
  const ratingCounts = data.reduce((acc, row) => {
    const rating = row.rating || 'Unknown';
    acc[rating] = (acc[rating] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(ratingCounts),
    datasets: [
      {
        label: 'Number of Reviews',
        data: Object.values(ratingCounts),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reviews by Rating',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1,
        },
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default BarChart; 
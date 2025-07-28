import React from 'react';
import { Line } from 'react-chartjs-2';

const TimelineChart = ({ data }) => {
  const monthlyData = data.reduce((acc, row) => {
    const date = row.date || row.dates;
    if (date) {
      const month = new Date(date).toLocaleDateString('en-US', { year: 'numeric', month: 'short' });
      acc[month] = (acc[month] || 0) + 1;
    }
    return acc;
  }, {});

  const sortedMonths = Object.keys(monthlyData).sort((a, b) => {
    return new Date(a) - new Date(b);
  });

  const chartData = {
    labels: sortedMonths,
    datasets: [
      {
        label: 'Reviews per Month',
        data: sortedMonths.map(month => monthlyData[month]),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.1,
        fill: false,
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
        text: 'Reviews Timeline',
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

  return <Line data={chartData} options={options} />;
};

export default TimelineChart; 
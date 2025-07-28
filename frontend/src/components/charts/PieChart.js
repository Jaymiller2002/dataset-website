import React from 'react';
import { Pie } from 'react-chartjs-2';

const PieChart = ({ data }) => {
  const placeCounts = data.reduce((acc, row) => {
    const place = row.place || 'Unknown';
    acc[place] = (acc[place] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(placeCounts),
    datasets: [
      {
        data: Object.values(placeCounts),
        backgroundColor: [
          '#FF6384',
          '#36A2EB',
          '#FFCE56',
          '#4BC0C0',
          '#9966FF',
          '#FF9F40',
          '#FF6384',
          '#C9CBCF',
        ],
        borderWidth: 2,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right',
      },
      title: {
        display: true,
        text: 'Reviews by Place',
      },
    },
  };

  return <Pie data={chartData} options={options} />;
};

export default PieChart; 
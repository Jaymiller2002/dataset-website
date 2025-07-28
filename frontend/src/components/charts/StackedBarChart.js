import React from 'react';
import { Bar } from 'react-chartjs-2';

const StackedBarChart = ({ data }) => {
  const placeRatingData = data.reduce((acc, row) => {
    const place = row.place || 'Unknown';
    const rating = row.rating || 'Unknown';
    if (!acc[place]) acc[place] = {};
    acc[place][rating] = (acc[place][rating] || 0) + 1;
    return acc;
  }, {});

  const ratings = [...new Set(data.map(row => row.rating).filter(Boolean))].sort();
  const places = Object.keys(placeRatingData);

  const datasets = ratings.map((rating, index) => ({
    label: `${rating} Stars`,
    data: places.map(place => placeRatingData[place][rating] || 0),
    backgroundColor: `hsl(${index * 60}, 70%, 60%)`,
    borderColor: `hsl(${index * 60}, 70%, 40%)`,
    borderWidth: 1,
  }));

  const chartData = {
    labels: places,
    datasets,
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Reviews by Place and Rating',
      },
    },
    scales: {
      x: {
        stacked: true,
      },
      y: {
        stacked: true,
        beginAtZero: true,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default StackedBarChart; 
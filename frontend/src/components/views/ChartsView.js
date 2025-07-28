import React from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement,
} from 'chart.js';
import { Bar, Pie, Line } from 'react-chartjs-2';
import BarChart from '../charts/BarChart';
import StackedBarChart from '../charts/StackedBarChart';
import TimelineChart from '../charts/TimelineChart';
import PieChart from '../charts/PieChart';
import WordCloudChart from '../charts/WordCloudChart';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  PointElement,
  LineElement
);

const ChartsView = ({ selectedChart, filteredData }) => {
  return (
    <div className="charts-container">
      <div className="chart-wrapper">
        {selectedChart === 'bar' && <BarChart data={filteredData} />}
        {selectedChart === 'stacked' && <StackedBarChart data={filteredData} />}
        {selectedChart === 'timeline' && <TimelineChart data={filteredData} />}
        {selectedChart === 'pie' && <PieChart data={filteredData} />}
        {selectedChart === 'wordcloud' && <WordCloudChart data={filteredData} />}
      </div>
    </div>
  );
};

export default ChartsView; 
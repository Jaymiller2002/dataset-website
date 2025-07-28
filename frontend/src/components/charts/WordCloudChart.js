import React, { useState, useEffect } from 'react';
import cloud from 'd3-cloud';
import { processTextForWordCloud } from '../../utils/textProcessing';

const WordCloudChart = ({ data }) => {
  const [wordCloudSvg, setWordCloudSvg] = useState('');

  useEffect(() => {
    // Check if data exists and has content
    if (!data || !Array.isArray(data) || data.length === 0) {
      return;
    }

    // Extract text from reviews and message threads
    const allText = data.reduce((text, row) => {
      if (!row) return text;
      const reviewText = row.review_text || '';
      const messageThread = row.message_thread || '';
      const subject = row.subject || '';
      const place = row.place || '';
      return text + ' ' + reviewText + ' ' + messageThread + ' ' + subject + ' ' + place;
    }, '');

    // Check if we have any text content
    if (!allText.trim()) {
      return;
    }

    // Process text for word cloud
    const words = processTextForWordCloud(allText);

    // Convert to word cloud format
    const wordCloudData = Object.entries(words)
      .map(([text, value]) => ({ text, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 50); // Top 50 words

    // Check if we have any words after filtering
    if (wordCloudData.length === 0) {
      return;
    }

    // Create word cloud using d3-cloud
    const layout = cloud()
      .size([600, 400])
      .words(wordCloudData.map(d => ({
        text: d.text,
        size: Math.max(10, Math.min(60, d.value * 3))
      })))
      .padding(5)
      .rotate(() => ~~(Math.random() * 2) * 90)
      .fontSize(d => d.size)
      .on("end", draw);

    layout.start();

    function draw(words) {
      const colors = ['#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF', '#FF9F40'];
      
      const svg = `
        <svg width="600" height="400" xmlns="http://www.w3.org/2000/svg">
          <g transform="translate(300,200)">
            ${words.map((word, i) => `
              <text
                text-anchor="middle"
                style="font-size: ${word.size}px; font-family: Arial; fill: ${colors[i % colors.length]};"
                transform="translate(${word.x},${word.y})rotate(${word.rotate})"
              >
                ${word.text}
              </text>
            `).join('')}
          </g>
        </svg>
      `;
      
      setWordCloudSvg(svg);
    }
  }, [data]);

  // Check if data exists and has content
  if (!data || !Array.isArray(data) || data.length === 0) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>No data available for word cloud</p>
      </div>
    );
  }

  if (!wordCloudSvg) {
    return (
      <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Generating word cloud...</p>
      </div>
    );
  }

  return (
    <div style={{ height: '400px', width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div dangerouslySetInnerHTML={{ __html: wordCloudSvg }} />
    </div>
  );
};

export default WordCloudChart; 
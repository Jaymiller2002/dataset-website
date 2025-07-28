import React from 'react';
import { filterMessageThread } from '../../utils/textProcessing';

const BubbleView = ({ currentItems, displayColumns, getBubbleColor, getBubbleTextColor }) => {
  return (
    <div className="bubble-grid">
      {currentItems.map((row, index) => (
        <div 
          key={index} 
          className="data-bubble"
          style={{
            backgroundColor: getBubbleColor(row.rating),
            color: getBubbleTextColor(row.rating)
          }}
        >
          <div className="bubble-header">
            <h3>{row.customer_name}</h3>
            <div className="rating-badge">{row.rating}⭐</div>
          </div>
          <div className="bubble-content">
            {displayColumns.map((column) => {
              if (column === 'customer_name' || column === 'rating') return null;
              if (column === 'review_link' && row[column]) {
                return (
                  <p key={column}>
                    <strong>Review Link:</strong>{' '}
                    <a 
                      href={row[column]} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="review-link-btn"
                    >
                      View Review
                    </a>
                  </p>
                );
              }
              if (column === 'has_suggestion') {
                return (
                  <p key={column}><strong>Has Suggestion:</strong> {row[column] ? 'Yes' : 'No'}</p>
                );
              }
              return row[column] ? (
                <p key={column}><strong>{column.charAt(0).toUpperCase() + column.slice(1)}:</strong> {column === 'message_thread' ? filterMessageThread(row[column]) : row[column]}</p>
              ) : null;
            })}
          </div>
        </div>
      ))}
    </div>
  );
};

export default BubbleView; 
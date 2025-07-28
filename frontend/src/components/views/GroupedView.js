import React from 'react';
import { filterMessageThread } from '../../utils/textProcessing';

const GroupedView = ({ reviewsByCustomer, displayColumns, isReviewByCustomer }) => {
  return (
    <div className="grouped-reviews">
      {Object.entries(reviewsByCustomer)
        .filter(([customer]) => customer !== 'Unknown')
        .map(([customer, reviews]) => (
          <div key={customer} className="customer-group">
            <h3>{customer} ({reviews.filter(isReviewByCustomer).length} review{reviews.length > 1 ? 's' : ''})</h3>
            <ul>
              {reviews
                .filter(isReviewByCustomer)
                .map((review, idx) => (
                  <li key={idx}>
                    {displayColumns.map((column) => {
                      if (column === 'customer_name') return null;
                      if (column === 'review_link' && review[column]) {
                        return (
                          <span key={column} style={{ marginLeft: 8 }}>
                            <a 
                              href={review[column]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="review-link-btn"
                            >
                              View Review
                            </a>
                          </span>
                        );
                      }
                      if (column === 'has_suggestion') {
                        return (
                          <span key={column} style={{ marginLeft: 8 }}>
                            <strong>Has Suggestion:</strong> {review[column] ? 'Yes' : 'No'}
                          </span>
                        );
                      }
                      return review[column] ? (
                        <span key={column} style={{ marginLeft: 8 }}>
                          <strong>{column.charAt(0).toUpperCase() + column.slice(1)}:</strong> {review[column]}
                        </span>
                      ) : null;
                    })}
                  </li>
                ))}
            </ul>
          </div>
        ))}
    </div>
  );
};

export default GroupedView; 
import React, { useState, useEffect } from 'react';
import './DataTable.css';

function filterMessageThread(messageThread) {
  if (!messageThread) return '';
  const lines = messageThread.split(/\n|---/);
  const boilerplatePatterns = [
    /^[A-Z ]+RATED THEIR STAY \d STARS!?$/i,
    /to find tips and tricks from hosts around the world/i,
    /had great things to say about their stay/i,
    /read on for a snapshot/i,
    /now that you and your guest have both written reviews/i,
    /we've posted them to your airbnb profiles/i,
    /keep hosting 5-star stays/i,
    /get more 5-star reviews/i,
    /add details guests will love/i,
    /connect with other hosts/i,
    /visit the airbnb community center/i,
    /airbnb, inc\./i,
    /10 min read/i,
    /6 min read/i,
  ];
  const filtered = lines
    .map(line => line.trim())
    .filter(line =>
      line.length > 0 &&
      !boilerplatePatterns.some(pattern => pattern.test(line))
    );
  return filtered.join(' ');
}

const DataTable = ({ data }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => Number(localStorage.getItem('currentPage')) || 1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'table');
  const [showOnlyPositiveWithSuggestion, setShowOnlyPositiveWithSuggestion] = useState(() => localStorage.getItem('showOnlyPositiveWithSuggestion') === 'true');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    if (data && data.length > 0) {
      const sorted = [...data].sort((a, b) => (b.has_suggestion === true) - (a.has_suggestion === true));
      const keyFields = ['customer_name', 'rating', 'place', 'review_text', 'dates'];
      const filtered = sorted.filter(row =>
        keyFields.every(field => {
          const value = row[field];
          return value !== null && value !== undefined && value.toString().trim() !== '';
        })
      );

      // Apply search filter
      const searched = filtered.filter(row => {
        const combinedValues = [
          row.customer_name,
          row.subject,
          row.place,
          row.review_text,
          row.message_thread,
        ]
          .join(' ')
          .toLowerCase();
        return combinedValues.includes(searchQuery.toLowerCase());
      });

      setFilteredData(searched);
      setCurrentPage(1);
    } else {
      setFilteredData([]);
    }
  }, [data, searchQuery]);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const sortedFilteredData = [...filteredData].sort((a, b) => (b.has_suggestion === true) - (a.has_suggestion === true));
  const currentItems = sortedFilteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  const getBubbleColor = (rating) => {
    const num = parseInt(rating);
    if (num >= 5) return '#4CAF50';
    if (num >= 4) return '#8BC34A';
    if (num >= 3) return '#FFC107';
    if (num >= 2) return '#FF9800';
    return '#F44336';
  };

  const getBubbleTextColor = (rating) => {
    return '#ffffff';
  };

  const reviewsByCustomer = data.reduce((acc, row) => {
    const name = row.customer_name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(row);
    return acc;
  }, {});

  function isReviewByCustomer(review) {
    const link = (review.review_link || '').toLowerCase();
    return !(link.includes('/hosting/reviews/') && link.includes('/edit'));
  }

  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    localStorage.setItem('viewMode', viewMode);
  }, [viewMode]);
  useEffect(() => {
    localStorage.setItem('currentPage', currentPage);
  }, [currentPage]);
  useEffect(() => {
    localStorage.setItem('showOnlyPositiveWithSuggestion', showOnlyPositiveWithSuggestion);
  }, [showOnlyPositiveWithSuggestion]);

  if (!data || data.length === 0) {
    return <div className="no-data">No data available</div>;
  }

  if (filteredData.length === 0) {
    return (
      <div className="no-data">
        <p>No rows found with all required fields (customer_name, rating, place, review_text, dates) or search keyword.</p>
        <p>Showing {data.length} total rows, but none matched the filter.</p>
      </div>
    );
  }

  const displayColumns = [
    'subject',
    'customer_name',
    'rating',
    'place',
    'review_link',
    'dates',
    'message_thread',
  ];

  return (
    <div className="data-table-container">
      <div className="table-info">
        <p>Showing {filteredData.length} rows with complete data (filtered from {data.length} total rows)</p>
      </div>

      {/* View Toggle Buttons */}
      <div className="view-toggle">
        <button 
          className={`toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')}
        >
          📊 Table View
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'bubble' ? 'active' : ''}`}
          onClick={() => setViewMode('bubble')}
        >
          🫧 Bubble View
        </button>
        <button 
          className={`toggle-btn ${viewMode === 'grouped' ? 'active' : ''}`}
          onClick={() => setViewMode('grouped')}
        >
          👥 Grouped by Customer
        </button>
      </div>

      {/* 🔍 Search Input */}
      <div className="search-bar">
        <input
          type="text"
          placeholder="🔍 Search by customer, subject, place, or review..."
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            setCurrentPage(1);
          }}
          className="search-input"
        />
      </div>

      {/* View Logic */}
      {viewMode === 'grouped' ? (
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
      ) : viewMode === 'table' ? (
        <div className="table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {displayColumns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={index}>
                  {displayColumns.map((column) => (
                    <td key={column}>
                      {column === 'review_link' && row[column] 
                        ? (
                            <a 
                              href={row[column]} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="review-link-btn"
                            >
                              View Review
                            </a>
                          )
                        : column === 'has_suggestion'
                          ? (row[column] ? 'Yes' : 'No')
                          : (column === 'message_thread' && row[column] !== null && row[column] !== undefined
                              ? filterMessageThread(row[column])
                              : (row[column] !== null && row[column] !== undefined 
                                  ? row[column].toString() 
                                  : ''))}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
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
      )}

      {viewMode !== 'grouped' && totalPages > 1 && (
        <div className="pagination">
          <button 
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="pagination-btn"
          >
            Previous
          </button>
          
          <span className="page-info">
            Page {currentPage} of {totalPages}
          </span>
          
          <button 
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default DataTable; 
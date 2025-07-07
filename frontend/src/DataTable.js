import React, { useState, useEffect } from 'react';
import './DataTable.css';

const DataTable = ({ data }) => {
  const [filteredData, setFilteredData] = useState([]);
  const [currentPage, setCurrentPage] = useState(() => Number(localStorage.getItem('currentPage')) || 1);
  const [itemsPerPage] = useState(10);
  const [viewMode, setViewMode] = useState(() => localStorage.getItem('viewMode') || 'table'); // 'table', 'bubble', or 'grouped'
  const [showOnlyPositiveWithSuggestion, setShowOnlyPositiveWithSuggestion] = useState(() => localStorage.getItem('showOnlyPositiveWithSuggestion') === 'true');

  useEffect(() => {
    if (data && data.length > 0) {
      // Filter data to show only rows where all key fields are present
      const keyFields = ['customer_name', 'rating', 'place', 'review_text', 'dates'];
      const filtered = data.filter(row => {
        return keyFields.every(field => {
          const value = row[field];
          return value !== null && value !== undefined && value !== '' && value.toString().trim() !== '';
        });
      });
      setFilteredData(filtered);
      setCurrentPage(1); // Reset to first page when data changes
    } else {
      setFilteredData([]);
    }
  }, [data]);

  // Calculate pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Rating-based color functions
  const getBubbleColor = (rating) => {
    const num = parseInt(rating);
    if (num >= 5) return '#4CAF50'; // Bright green for 5-star
    if (num >= 4) return '#8BC34A'; // Light green for 4-star
    if (num >= 3) return '#FFC107'; // Yellow for 3-star
    if (num >= 2) return '#FF9800'; // Orange for 2-star
    return '#F44336'; // Red for 1-star
  };

  const getBubbleTextColor = (rating) => {
    const num = parseInt(rating);
    return num >= 3 ? '#ffffff' : '#ffffff'; // White text for contrast
  };

  // Group reviews by customer_name
  const reviewsByCustomer = data.reduce((acc, row) => {
    const name = row.customer_name || 'Unknown';
    if (!acc[name]) acc[name] = [];
    acc[name].push(row);
    return acc;
  }, {});

  function isReviewByCustomer(review) {
    const link = (review.review_link || '').toLowerCase();
    // Exclude if the link contains '/hosting/reviews/' and '/edit'
    if (link.includes('/hosting/reviews/') && link.includes('/edit')) {
      return false;
    }
    return true;
  }

  useEffect(() => {
    // Warn before reload/leave
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  // Persist state to localStorage
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
        <p>No rows found with all required fields (customer_name, rating, place, review_text, dates).</p>
        <p>Showing {data.length} total rows, but none have complete information.</p>
      </div>
    );
  }

  // Get all columns except 'body'
  const allColumns = Object.keys(currentItems[0] || {});
  const columns = allColumns.filter(col => col !== 'body' && col !== 'review_text');

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
      
      {/* Conditional Rendering based on viewMode */}
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
                        {review.review_link ? (
                          <a 
                            href={review.review_link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="review-link-btn"
                          >
                            View Review
                          </a>
                        ) : <i>No review link</i>}
                        {review.rating && (
                          <span style={{ marginLeft: 8 }}>
                            <strong>Rating:</strong> {review.rating}⭐
                          </span>
                        )}
                        {review.place && (
                          <span style={{ marginLeft: 8 }}>
                            <strong>Place:</strong> {review.place}
                          </span>
                        )}
                        {review.dates && (
                          <span style={{ marginLeft: 8 }}>
                            <strong>Dates:</strong> {review.dates}
                          </span>
                        )}
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
                {columns.map((column) => (
                  <th key={column}>{column}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentItems.map((row, index) => (
                <tr key={index}>
                  {columns.map((column) => (
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
                        : (row[column] !== null && row[column] !== undefined 
                            ? row[column].toString() 
                            : '')}
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
                <p><strong>Place:</strong> {row.place}</p>
                <p><strong>Dates:</strong> {row.dates}</p>
                {row.review_link ? (
                  <p>
                    <strong>Review Link:</strong>{' '}
                    <a 
                      href={row.review_link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="review-link-btn"
                    >
                      View Review
                    </a>
                  </p>
                ) : null}
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
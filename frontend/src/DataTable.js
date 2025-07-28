import React, { useState, useEffect } from 'react';
import './DataTable.css';

// Import components
import TableView from './components/views/TableView';
import BubbleView from './components/views/BubbleView';
import GroupedView from './components/views/GroupedView';
import ChartsView from './components/views/ChartsView';

// Import utilities
import { useDataFiltering, useLocalStorage, usePagination } from './utils/hooks';

const DataTable = ({ data }) => {
  // State management
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useLocalStorage('viewMode', 'table');
  const [selectedChart, setSelectedChart] = useState('bar');
  const [showOnlyPositiveWithSuggestion, setShowOnlyPositiveWithSuggestion] = useLocalStorage('showOnlyPositiveWithSuggestion', false);

  // Custom hooks
  const filteredData = useDataFiltering(data, searchQuery);
  const { currentItems, currentPage, totalPages, handlePageChange, setCurrentPage } = usePagination(filteredData);

  // Utility functions
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

  // Effects
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, setCurrentPage]);

  // Early returns
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
        <button 
          className={`toggle-btn ${viewMode === 'charts' ? 'active' : ''}`}
          onClick={() => setViewMode('charts')}
        >
          📈 Charts View
        </button>
      </div>

      {/* Chart Selection (only show when in charts view) */}
      {viewMode === 'charts' && (
        <div className="chart-selection">
          <button 
            className={`chart-btn ${selectedChart === 'bar' ? 'active' : ''}`}
            onClick={() => setSelectedChart('bar')}
          >
            📊 Bar Chart
          </button>
          <button 
            className={`chart-btn ${selectedChart === 'stacked' ? 'active' : ''}`}
            onClick={() => setSelectedChart('stacked')}
          >
            📊 Stacked Bar
          </button>
          <button 
            className={`chart-btn ${selectedChart === 'timeline' ? 'active' : ''}`}
            onClick={() => setSelectedChart('timeline')}
          >
            📈 Timeline
          </button>
          <button 
            className={`chart-btn ${selectedChart === 'pie' ? 'active' : ''}`}
            onClick={() => setSelectedChart('pie')}
          >
            🥧 Pie Chart
          </button>
          <button 
            className={`chart-btn ${selectedChart === 'wordcloud' ? 'active' : ''}`}
            onClick={() => setSelectedChart('wordcloud')}
          >
            ☁️ Word Cloud
          </button>
        </div>
      )}

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
      {viewMode === 'charts' ? (
        <ChartsView selectedChart={selectedChart} filteredData={filteredData} />
      ) : viewMode === 'grouped' ? (
        <GroupedView 
          reviewsByCustomer={reviewsByCustomer} 
          displayColumns={displayColumns} 
          isReviewByCustomer={isReviewByCustomer} 
        />
      ) : viewMode === 'table' ? (
        <TableView currentItems={currentItems} displayColumns={displayColumns} />
      ) : (
        <BubbleView 
          currentItems={currentItems} 
          displayColumns={displayColumns}
          getBubbleColor={getBubbleColor}
          getBubbleTextColor={getBubbleTextColor}
        />
      )}

      {/* Pagination */}
      {viewMode !== 'grouped' && viewMode !== 'charts' && totalPages > 1 && (
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
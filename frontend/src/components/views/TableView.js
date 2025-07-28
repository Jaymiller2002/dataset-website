import React from 'react';
import { filterMessageThread } from '../../utils/textProcessing';

const TableView = ({ currentItems, displayColumns }) => {
  return (
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
  );
};

export default TableView; 
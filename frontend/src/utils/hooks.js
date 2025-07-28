import { useState, useEffect } from 'react';

export const useDataFiltering = (data, searchQuery) => {
  const [filteredData, setFilteredData] = useState([]);

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
    } else {
      setFilteredData([]);
    }
  }, [data, searchQuery]);

  return filteredData;
};

export const useLocalStorage = (key, initialValue) => {
  const [value, setValue] = useState(() => {
    const stored = localStorage.getItem(key);
    if (stored === null) return initialValue;
    
    try {
      return JSON.parse(stored);
    } catch (error) {
      // If stored value is not valid JSON, return it as a string
      return stored;
    }
  });

  useEffect(() => {
    if (typeof value === 'string') {
      localStorage.setItem(key, value);
    } else {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }, [key, value]);

  return [value, setValue];
};

export const usePagination = (filteredData, itemsPerPage = 10) => {
  const [currentPage, setCurrentPage] = useState(1);

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  return {
    currentItems,
    currentPage,
    totalPages,
    handlePageChange,
    setCurrentPage
  };
}; 
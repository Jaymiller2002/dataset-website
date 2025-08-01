import React, { useState } from 'react';
import DataTable from './DataTable';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setLoading(true);
    setError(null);
    setData([]);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('http://127.0.0.1:5000/api/upload', {
        method: 'POST',
        body: formData,
      });
      const result = await res.json();
      if (result.error) {
        setError(result.error);
      } else {
        setData(result);
      }
    } catch (err) {
      setError(err.toString());
    }
    setLoading(false);
  };

  return (
    <div className="App">
      <h1>Parsed Dataset Viewer</h1>
      
      <div className="file-upload-container">
        <input 
          type="file" 
          id="file-input"
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.json,.parquet,.pkl,.pickle,.mbox"
          className="file-input"
        />
        <label htmlFor="file-input" className="file-input-label">
          📁 Choose File to Upload
        </label>
      </div>
      
      {loading && <div className="loading"> Loading and processing your data...</div>}
      {error && <div className="error">❌ Error: {error}</div>}
      
      <DataTable data={data} />
    </div>
  );
}

export default App;

import React, { useState } from 'react';
import DataTable from './DataTable';

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
    <div style={{padding: 24, textAlign: 'center'}}>
      <h1>Parsed Dataset Viewer</h1>
      <div style={{marginBottom: 20}}>
        <input 
          type="file" 
          onChange={handleFileChange}
          accept=".csv,.xlsx,.xls,.json,.parquet,.pkl,.pickle,.mbox"
        />
      </div>
      
      {loading && <div>Loading...</div>}
      {error && <div style={{color: 'red', marginBottom: 20}}>Error: {error}</div>}
      
      <DataTable data={data} />
    </div>
  );
}

export default App;

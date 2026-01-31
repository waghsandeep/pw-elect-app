import React, { useState } from "react";
import Papa from "papaparse";

function App() {
  const [file1Data, setFile1Data] = useState([]);
  const [file2Data, setFile2Data] = useState([]);
  const [matchedData, setMatchedData] = useState([]);

  // Parse CSV
  const parseCSV = (file, setData) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (result) => {
        const cleaned = result.data.map(row => {
          const obj = {};
          Object.keys(row).forEach(key => {
            obj[key.trim()] = row[key]?.toString().trim();
          });
          return obj;
        });
        setData(cleaned);
      }
    });
  };

  // Match logic
  const matchRecords = () => {
    if (!file1Data.length || !file2Data.length) {
      alert("Please upload both files");
      return;
    }

    // SERIAL_NO_IN_BOOTH from File 1
    const serialSet = new Set(
      file1Data.map(row => row.SERIAL_NO_IN_BOOTH)
    );

    // Match against SERIAL_NO in File 2
    const matched = file2Data.filter(row =>
      serialSet.has(row.SERIAL_NO)
    );

    setMatchedData(matched);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Match SERIAL_NO_IN_BOOTH → SERIAL_NO</h2>

      <div>
        <label>Upload File 1: </label>
        <input
          type="file"
          accept=".csv"
          onChange={e => parseCSV(e.target.files[0], setFile1Data)}
        />
      </div>

      <br />

      <div>
        <label>Upload File 2: </label>
        <input
          type="file"
          accept=".csv"
          onChange={e => parseCSV(e.target.files[0], setFile2Data)}
        />
      </div>

      <br />

      <button onClick={matchRecords}>
        Show Only Matched Records
      </button>

      <h3>Matched Records: {matchedData.length}</h3>

      {matchedData.length > 0 && (
        <div style={{ overflowX: "auto" }}>
          <table border="1" cellPadding="6">
            <thead>
              <tr>
                {Object.keys(matchedData[0]).map(col => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matchedData.map((row, i) => (
                <tr key={i}>
                  {Object.values(row).map((val, j) => (
                    <td key={j}>{val}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;
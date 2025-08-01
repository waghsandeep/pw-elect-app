import React, { useState } from 'react';
import Papa from 'papaparse';

const CSVReader = () => {
  const [groupedData, setGroupedData] = useState({});

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Use PapaParse to parse the CSV file
    Papa.parse(file, {
      complete: (result) => {
        const data = result.data;

        // Group data by 'E_LAST_NAME'
        const grouped = groupByLastName(data);

        setGroupedData(grouped);
      },
      header: true, // Assuming the CSV has headers
    });
  };

  const groupByLastName = (data) => {
    return data.reduce((acc, record) => {
      const lastName = record['E_LAST_NAME'];

      // If the last name doesn't exist in the accumulator, add it
      if (!acc[lastName]) {
        acc[lastName] = [];
      }

      // Push the current record into the corresponding last name group
      acc[lastName].push(record);
      return acc;
    }, {});
  };

  const renderGroupedData = () => {
    return Object.keys(groupedData).map((lastName) => (
      <div key={lastName}>
        <h3>{lastName}</h3>
        <ul>
          {groupedData[lastName].map((record, index) => (
            <li key={index}>
              <p><strong>Name:</strong> {record['E_FULLNAME']}</p>
              <p><strong>Age:</strong> {record['AGE']}</p>
              <p><strong>Mobile No:</strong> {record['MOBILE_NO1']}</p>
              <p><strong>Address:</strong> {record['L_ADDRESS']}</p>
            </li>
          ))}
        </ul>
      </div>
    ));
  };

  return (
    <div>
      <h1>CSV Reader - Group By Last Name</h1>
      <input type="file" accept=".csv" onChange={handleFileUpload} />
      <div>
        {Object.keys(groupedData).length > 0 ? renderGroupedData() : <p>Upload a CSV file to see grouped data.</p>}
      </div>
    </div>
  );
};

export default CSVReader;
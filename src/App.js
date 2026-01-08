import React, { useState, useEffect } from 'react';
import Papa from 'papaparse';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import './App.css';

const CSVTable = () => {
  const [csvData, setCsvData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Columns to ignore
  const columnsToIgnore = [
    'AC_NUMBER',
    'PART_NUMBER',
    'SERIAL_NO_IN_PART',
    'SERIAL_NO_IN_WARD',
    'AGE'
  ];

  // Fetch CSV
  useEffect(() => {
    const fetchCSVData = async () => {
      try {
        const response = await fetch(
          `${process.env.PUBLIC_URL}/pawane gaon ward list csv.csv`
        );
        const csvText = await response.text();

        Papa.parse(csvText, {
          complete: (result) => {
            const data = result.data;
            const headerRow = data[0];

            const filteredHeaders = headerRow.filter(
              (h) => !columnsToIgnore.includes(h)
            );

            const filteredData = data.slice(1).map((row) =>
              row.filter(
                (_, index) => !columnsToIgnore.includes(headerRow[index])
              )
            );

            setHeaders(filteredHeaders);
            setCsvData(filteredData);
          },
          header: false,
        });
      } catch (error) {
        console.error('Error fetching CSV:', error);
      }
    };

    fetchCSVData();
  }, []);

  // Search
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
  };

  // Filter data
  const filteredData = csvData.filter((row) => {
    if (!searchQuery) return true;

    const queryWords = searchQuery.toLowerCase().split(' ').filter(Boolean);

    const searchableValues = [
      row[headers.indexOf('VOTER_FULL_NAME')],
      row[headers.indexOf('FULLNAME_MARATHI')],
      row[headers.indexOf('EPIC_NO')],
    ].filter(Boolean);

    return queryWords.every((word) =>
      searchableValues.some((value) =>
        value.toLowerCase().includes(word)
      )
    );
  });

  // Sort data
  const sortedData = [...filteredData]
    .sort((a, b) => {
      const srA = parseInt(a[headers.indexOf('SERIAL_NO')], 10);
      const srB = parseInt(b[headers.indexOf('SERIAL_NO')], 10);
      return srA - srB;
    })
    .sort((a, b) => {
      const ageA = parseInt(a[headers.indexOf('AGE')], 10);
      const ageB = parseInt(b[headers.indexOf('AGE')], 10);
      if (!isNaN(ageA) && !isNaN(ageB)) {
        return ageB - ageA;
      }
      return 0;
    });

  // Print PDF
  const handlePrintPDF = () => {
    const doc = new jsPDF('l', 'pt', 'a4');

    doc.setFontSize(12);
    doc.text('Pawane Gaon - Search Result', 40, 30);
    doc.text(`Total Records: ${sortedData.length}`, 40, 50);

    const voterNameIndex = headers.indexOf('VOTER_FULL_NAME');
    const marathiNameIndex = headers.indexOf('FULLNAME_MARATHI');
    const boothAddressIndex = headers.indexOf('BOOTH_ADDRESS');

    doc.autoTable({
      startY: 70,
      head: [headers],
      body: sortedData,

      styles: {
        fontSize: 7,
        cellPadding: 3,
        overflow: 'linebreak',
        valign: 'middle',
      },

      columnStyles: {
        [voterNameIndex]: {
          cellWidth: 150,
        },
        [marathiNameIndex]: {
          cellWidth: 150,
        },
        [boothAddressIndex]: {
          cellWidth: 200, // ✅ Address needs more space
        },
      },

      headStyles: {
        fillColor: [22, 160, 133],
        fontStyle: 'bold',
      },

      margin: { left: 20, right: 20 },
      tableWidth: 'auto',
    });

    doc.save('pawane_search_result.pdf');
  };

  return (
    <div className="container">
      <div className="search-container">
        <input
          type="text"
          placeholder="Search by Full Name or EPIC_NO"
          value={searchQuery}
          onChange={handleSearchChange}
          className="search-input"
        />

        <div className="result-count">
          <span>{sortedData.length} results found</span>
        </div>
      </div>



      {/* Table */}
      {csvData.length > 0 && (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                {headers.map((header, index) => (
                  <th key={index}>{header}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sortedData.length > 0 ? (
                sortedData.map((row, rowIndex) => (
                  <tr key={rowIndex}>
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex}>{cell}</td>
                    ))}
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={headers.length}>No results found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default CSVTable;

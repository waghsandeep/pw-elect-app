import React, { useState } from "react";
import Papa from "papaparse";

export default function VoterCsvMerger() {
  const [dataCsv, setDataCsv] = useState(null);
  const [wardCsv, setWardCsv] = useState(null);
  const [outputUrl, setOutputUrl] = useState(null);

  const parseFile = (file, setter) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => setter(results.data),
    });
  };

  const mergeCsv = () => {
    if (!dataCsv || !wardCsv) {
      alert("Please upload both CSV files");
      return;
    }

    const dataMap = {};
    dataCsv.forEach((row) => {
      dataMap[row.VCARDID] = row;
    });

    const finalData = wardCsv.map((row) => {
      const matched = dataMap[row.EPIC_NO];

      return {
        EPIC_NO: row.EPIC_NO,
        L_FULLNAME: matched?.L_FULLNAME || row.FULLNAME_MARATHI || "",
        E_FULLNAME: matched?.E_FULLNAME || row.VOTER_FULL_NAME || "",
        E_FIRST_NAME: matched?.E_FIRST_NAME || "",
        E_MIDDLE_NAME: matched?.E_MIDDLE_NAME || "",
        E_LAST_NAME: matched?.E_LAST_NAME || "",
        SEX: matched?.SEX || "",
        AGE:  parseInt(matched?.AGE) + 2 || "",
        BOOTH_NO: row.BOOTH_NO,
        SERIAL_NO: row.SERIAL_NO,
        BOOTH_ADDRESS: row.BOOTH_ADDRESS,
      };
    });

    const csv = Papa.unparse(finalData);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    setOutputUrl(url);
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Voter CSV Merger</h1>

      <div className="space-y-4">
        <div>
          <label className="block font-semibold">Upload data.csv</label>
          <input type="file" accept=".csv" onChange={(e) => parseFile(e.target.files[0], setDataCsv)} />
        </div>

        <div>
          <label className="block font-semibold">Upload pawane gaon ward list csv.csv</label>
          <input type="file" accept=".csv" onChange={(e) => parseFile(e.target.files[0], setWardCsv)} />
        </div>

        <button
          onClick={mergeCsv}
          className="bg-blue-600 text-white px-4 py-2 rounded-xl"
        >
          Generate Final CSV
        </button>

        {outputUrl && (
          <a
            href={outputUrl}
            download="final_merged_complete_voter_data.csv"
            className="block text-green-700 font-semibold"
          >
            Download Final CSV
          </a>
        )}
      </div>
    </div>
  );
}

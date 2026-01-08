import React, { useState } from "react";
import Papa from "papaparse";

const FamilyHierarchyTable = () => {
  const [rows, setRows] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // ✅ Generate 10-digit mobile starting with 7, 8, or 9
  const generateRandomMobile = () => {
    const startDigit = ["7", "8", "9"][Math.floor(Math.random() * 3)];
    let number = startDigit;
    for (let i = 0; i < 9; i++) {
      number += Math.floor(Math.random() * 10);
    }
    return number;
  };

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: function (results) {
        try {
          const data = results.data;
          processFamilies(data);
        } catch (err) {
          console.error(err);
          setError("Error processing the file");
        } finally {
          setLoading(false);
        }
      },
      error: function () {
        setError("Failed to parse CSV");
        setLoading(false);
      },
    });
  };

  const getFullName = (p) =>

    p.E_FULLNAME ||
    `${p.E_FIRST_NAME || ""} ${p.E_MIDDLE_NAME || ""} ${p.E_LAST_NAME || ""}`.trim();

  const normalizeKey = (first, last) =>
    `${(first || "").trim().toLowerCase()} ${(last || "").trim().toLowerCase()}`;

  const processFamilies = (data) => {
    const heads = new Map();
    const firstLevelGroups = new Map();

    // Identify family heads
    data.forEach((p) => {
      const first = p.E_FIRST_NAME?.trim();
      const last = p.E_LAST_NAME?.trim();
      if (first && last) {
        const key = normalizeKey(first, last);
        heads.set(key, p);
      }
    });

    // Group by middle + last name with fuzzy matching
    data.forEach((p) => {
      if (!p.E_MIDDLE_NAME || !p.E_LAST_NAME) return;

      const middle = p.E_MIDDLE_NAME.trim().toLowerCase();
      const last = p.E_LAST_NAME.trim().toLowerCase();

      let matchedKey = null;

      for (let existingKey of firstLevelGroups.keys()) {
        const [existingMid, existingLast] = existingKey.split(" ");
        if (
          existingLast === last &&
          existingMid &&
          middle &&
          (existingMid.startsWith(middle.slice(0, 5)) ||
            middle.startsWith(existingMid.slice(0, 5)))
        ) {
          matchedKey = existingKey;
          break;
        }
      }

      const key = matchedKey || `${middle} ${last}`;
      if (!firstLevelGroups.has(key)) firstLevelGroups.set(key, []);
      firstLevelGroups.get(key).push(p);
    });

    const finalRows = [];

    heads.forEach((head, key) => {
      const [firstName, lastName] = key.split(" ");
      const firstLevelKey = `${firstName} ${lastName}`;
      const firstLevelMembers = firstLevelGroups.get(firstLevelKey) || [];
      const familyMembers = [head, ...firstLevelMembers];

      firstLevelMembers.forEach((member) => {
        const memberKey = normalizeKey(member.E_FIRST_NAME, member.E_LAST_NAME);
        const secondLevel = firstLevelGroups.get(memberKey) || [];
        familyMembers.push(...secondLevel);
      });

      const uniqueFamily = Array.from(
        new Map(familyMembers.map((p) => [p.VCARDID, p])).values()
      );

      if (uniqueFamily.length >= 6 && uniqueFamily.length <= 15) {
        uniqueFamily.sort((a, b) => (parseInt(b.AGE) || 0) - (parseInt(a.AGE) || 0));
        uniqueFamily.forEach((person) => {
          finalRows.push({
            isDivider: false,
            ...person,
            MOBILE: person.MOBILE?.trim() || generateRandomMobile(),
          });
        });
        finalRows.push({ isDivider: true }); // Add divider
      }
    });

    setRows(finalRows);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Family Hierarchy Table</h2>
      <input type="file" accept=".csv" onChange={handleCSVUpload} />
      {loading && <p>Processing file...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {rows.length > 0 && (
        <table
          border="1"
          cellPadding="6"
          style={{ borderCollapse: "collapse", marginTop: "0.5rem", width: "100%" }}
        >
          <thead style={{ background: "#f0f0f0" }}>
            <tr>
              <th>VCARDID</th>
              <th>Part</th>
              <th>Sr.No</th>
              <th>SEX</th>
              <th>AGE</th>
              <th>L_FULLNAME</th>
              <th>E_FULLNAME</th>
              <th>MOBILE</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) =>
              row.isDivider ? (
                <tr key={`divider-${idx}`}>
                  <td colSpan="6" style={{ height: "20px", background: "transparent" }} />
                </tr>
              ) : (
                <tr key={idx}>
                  <td>{row.VCARDID}</td>
                  <td>{row.PART_NO}</td>
                  <td>{row.SRNO}</td>
                  <td>{row.SEX}</td>
                  <td>{row.AGE}</td>
                  <td>{row.L_FULLNAME}</td>
                  <td>{getFullName(row)}</td>
                  <td>{row.MOBILE}</td>
                </tr>
              )
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default FamilyHierarchyTable;

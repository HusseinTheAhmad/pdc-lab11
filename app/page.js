'use client';
import { useState, useEffect } from 'react';

export default function Home() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Handling the Search Action
  const handleSearch = async () => {
    const response = await fetch(`/api/search?q=${encodeURIComponent(query)}`);
    const data = await response.json();
    setResults(data);
    setSuggestions([]); // Clearing suggestions after search
  };

  // Fetching Suggestions from the Backend
  const fetchSuggestions = async (input) => {
    if (!input) return;

    const match = input.match(/^(\w+:)(.*)$/);  // Matching prefix like "category:, "author__:", etc.

    if (match) {
      const prefix = match[1];  // getting prefix like "category:", "author__:", etc.
      const searchText = match[2].toLowerCase();  // The part after ":" for filtering

      const res = await fetch(`/api/suggest?q=${encodeURIComponent(prefix)}&searchText=${encodeURIComponent(searchText)}`);
      const data = await res.json();

      // Filter out invalid suggestions and zeroes from all fields
      const filteredSuggestions = data
        .map(s => String(s).trim())  // Convert all suggestions to strings and trim spaces
        .filter(s => s && s !== "0" && s!=="2" && s.toLowerCase().includes(searchText)); // Remove zeroes from all fields

      setSuggestions(filteredSuggestions);
    }
    
    else {
      setSuggestions([]);  // Clearing suggestions if no valid prefix is found
    }

  };

  // Triggering the suggestion fetch when query changes
  useEffect(() => {
    fetchSuggestions(query);
  }, [query]);

  return (
    <div className="p-8 space-y-6">

      <h1 className="text-2xl font-bold">Solr Search Interface</h1>

      {/* Displaying the search box and button */}
      <div className="flex gap-2">

        <input
          list="suggestions"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stuff..."
          className="border p-2 w-full max-w-md"
        />

        <datalist id="suggestions">
          {suggestions.map((s, idx) => (
            <option key={idx} value={s} />
          ))}
        </datalist>

        <button
          onClick={handleSearch}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Search
        </button>
      </div>

      {/* Showing suggestions as a dropdown list */}
      {suggestions.length > 0 && (
        <ul className="border p-2 w-full max-w-md bg-white shadow-md absolute z-10">
          {suggestions.map((sug, idx) => (
            <li
              key={idx}
              onClick={() => {
                // Retaining the prefix and updating the query with the suggestion value
                const match = query.match(/^(\w+:)(.*)$/);
                if (match) {
                  const newQuery = match[1] + sug; // Keeping prefix and replacing value after ":"
                  setQuery(newQuery);
                }
                setSuggestions([]); // Clearing suggestions after selection
              }}
              className="p-2 hover:bg-gray-100 cursor-pointer text-black"
            >
              {sug}
            </li>
          ))}
        </ul>
      )}

      {/* Displaying search results in a table */}
      {results.length > 0 && (
        <table className="w-full text-left border mt-4">
          <thead>
            <tr className="bg-100">      
              {Object.keys(results[0])
                .filter((key) => key !== '_version_')      // excluding _version_ field
                .map((key) => (
                <th key={key} className="p-2 border">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {results.map((doc, idx) => (
              <tr key={idx}>
                {Object.entries(doc)
                  .filter(([key]) => key !== '_version_')   // excluding _version_ field
                  .map(([key, value], i) => (
                  <td key={i} className="p-2 border">
                    {Array.isArray(value) ? value.join(', ') : value.toString()}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

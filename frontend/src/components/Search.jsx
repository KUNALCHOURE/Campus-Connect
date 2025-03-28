import React, { useState } from 'react';
import api from '../services/api';
import Flowchart from './Flowchart';

function Search() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState([]);
  const [on, setOn] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const generatemap = async () => {
    if (!input.trim()) {
      alert('Input cannot be empty');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/roadmap/generate', {
        topic: input.trim()
      });

      if (response.data.success) {
        setOutput(response.data.data);
        setOn(true);
      } else {
        alert('Failed to generate roadmap. Please try again.');
      }
    } catch (error) {
      console.error('Error generating roadmap:', error);
      alert('An error occurred while generating the roadmap. Please try again.');
      setOn(false);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to print the page
  const printPage = () => {
    alert('Please enable "More settings > Options > Background Graphics" in the print settings for a better PDF experience.');
    window.print(); // This triggers the print dialog (allows saving as PDF)
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#06141D] font-sans">
      <h1 className="text-5xl text-white mb-8 animate-fade-in mt-10">Roadmap Generator</h1>
      <div className='flex flex-row gap-4'>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Enter topic to get a roadmap"
          className="p-3 text-lg rounded-lg w-80 max-w-full shadow-md bg-transparent text-white border border-white focus:outline-none focus:shadow-lg transition-shadow"
        />
        <button
          onClick={generatemap}
          disabled={isLoading}
          className={`px-4 py-2 text-lg text-white rounded-lg border border-white transition-colors ${
            isLoading 
              ? 'opacity-50 cursor-not-allowed'
              : 'hover:text-[#06141D] hover:bg-white'
          }`}
        >
          {isLoading ? 'Generating...' : 'Generate Roadmap'}
        </button>
      </div>
      
      {on && output && <Flowchart map={output} />}

      {/* Button to trigger the print dialog */}
      {on && output && (
        <button
          onClick={printPage}
          className="mt-8 px-4 py-2 text-lg text-white bg-blue-600 rounded-lg hover:bg-blue-800 transition-colors"
        >
          Save as PDF
        </button>
      )}
    </div>
  );
}

export default Search;
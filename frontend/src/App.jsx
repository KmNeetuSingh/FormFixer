import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { HiClipboard, HiCheck } from 'react-icons/hi';

const TOAST_OPTIONS = {
  position: 'top-right',
  autoClose: 2000,
  hideProgressBar: true,
  theme: 'dark',
};

const CopyButton = ({ text, label, onCopyStateChange }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success(`${label} copied to clipboard!`, TOAST_OPTIONS);
      onCopyStateChange?.(true);
      setTimeout(() => {
        setCopied(false);
        onCopyStateChange?.(false);
      }, 2000);
    } catch {
      toast.error('Copy failed!', { position: 'top-right' });
    }
  };

  return (
    <button
      onClick={handleCopy}
      aria-label={`Copy ${label}`}
      title={`Copy ${label}`}
      className="text-gray-300 hover:text-green-400 focus:outline-none focus:ring-2 focus:ring-green-400 p-1 rounded transition-colors duration-200"
    >
      {copied ? (
        <HiCheck className="text-green-400 text-xl animate-ping-slow" />
      ) : (
        <HiClipboard className="text-xl" />
      )}
    </button>
  );
};

function App() {
  const [html, setHtml] = useState('');
  const [fileName, setFileName] = useState('');
  const [report, setReport] = useState([]);
  const [schema, setSchema] = useState(null);
  const [violations, setViolations] = useState([]);

  const [loading, setLoading] = useState({
    analyze: false,
    schema: false,
    accessibility: false,
  });

  useEffect(() => {
    document.body.style.backgroundColor = '#0f172a';
    document.body.style.color = '#e0e0e0';
    return () => {
      document.body.style.backgroundColor = null;
      document.body.style.color = null;
    };
  }, []);

  // New handler for file input change
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.html') && !file.name.endsWith('.htm')) {
      toast.error('Please upload a valid HTML file.', TOAST_OPTIONS);
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      setHtml(event.target.result);
      setFileName(file.name);
      // Clear previous results when new file loaded
      setReport([]);
      setSchema(null);
      setViolations([]);
    };
    reader.onerror = () => {
      toast.error('Failed to read file', TOAST_OPTIONS);
    };

    reader.readAsText(file);
  };

  const analyzeForm = async () => {
    if (!html) {
      toast.error('No HTML content to analyze.', TOAST_OPTIONS);
      return;
    }
    setLoading((prev) => ({ ...prev, analyze: true }));
    try {
      const res = await axios.post('http://localhost:5000/api/analyze', { html });
      setReport(res.data.report);
    } catch (err) {
      toast.error(`Failed to analyze form${err?.message ? `: ${err.message}` : ''}`, {
        position: 'top-right',
      });
    } finally {
      setLoading((prev) => ({ ...prev, analyze: false }));
    }
  };

  const generateSchema = async () => {
    if (!html) {
      toast.error('No HTML content to generate schema.', TOAST_OPTIONS);
      return;
    }
    setLoading((prev) => ({ ...prev, schema: true }));
    try {
      const res = await axios.post('http://localhost:5000/api/schema', { html });
      setSchema(res.data.schema);
    } catch (err) {
      toast.error(`Failed to generate schema${err?.message ? `: ${err.message}` : ''}`, {
        position: 'top-right',
      });
    } finally {
      setLoading((prev) => ({ ...prev, schema: false }));
    }
  };

  const checkAccessibility = async () => {
    if (!html) {
      toast.error('No HTML content to check accessibility.', TOAST_OPTIONS);
      return;
    }
    setLoading((prev) => ({ ...prev, accessibility: true }));
    try {
      const res = await axios.post('http://localhost:5000/api/accessibility', { html });
      setViolations(res.data.violations);
    } catch (err) {
      toast.error(`Failed to check accessibility${err?.message ? `: ${err.message}` : ''}`, {
        position: 'top-right',
      });
    } finally {
      setLoading((prev) => ({ ...prev, accessibility: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-8 bg-[#0f172a] text-gray-100 min-h-screen font-sans">
      <ToastContainer />

      <h1 className="text-4xl font-extrabold mb-8 text-blue-400 flex items-center gap-3">
        🛠️ FormFixer
      </h1>

      {/* File Upload Input */}
      <label
        htmlFor="htmlFile"
        className="block mb-4 cursor-pointer rounded border border-gray-700 bg-[#1e293b] p-4 text-center text-gray-300 hover:bg-[#334155] transition"
      >
        {fileName ? `Loaded: ${fileName}` : 'Click to upload your HTML file'}
      </label>
      <input
        id="htmlFile"
        type="file"
        accept=".html,.htm"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex flex-wrap gap-4 mb-10">
        <button
          onClick={analyzeForm}
          disabled={loading.analyze || !html}
          aria-busy={loading.analyze}
          className={`flex-1 min-w-[120px] py-3 rounded text-white font-semibold transition
            ${loading.analyze || !html ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500'}
          `}
        >
          {loading.analyze ? 'Analyzing...' : 'Analyze'}
        </button>
        <button
          onClick={generateSchema}
          disabled={loading.schema || !html}
          aria-busy={loading.schema}
          className={`flex-1 min-w-[120px] py-3 rounded text-white font-semibold transition
            ${loading.schema || !html ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500'}
          `}
        >
          {loading.schema ? 'Generating...' : 'Generate Schema'}
        </button>
        <button
          onClick={checkAccessibility}
          disabled={loading.accessibility || !html}
          aria-busy={loading.accessibility}
          className={`flex-1 min-w-[120px] py-3 rounded text-white font-semibold transition
            ${loading.accessibility || !html ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-600'}
          `}
        >
          {loading.accessibility ? 'Checking...' : 'Accessibility'}
        </button>
      </div>

      {(report.length > 0 || schema || violations.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {report.length > 0 && (
            <section className="bg-[#1e293b] border border-gray-700 rounded p-6 shadow-lg">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-yellow-300">🔍 Issues</h2>
              </div>
              <ul className="list-disc pl-6 space-y-1 text-sm max-h-60 overflow-y-auto">
                {report.map((r, idx) => (
                  <li
                    key={idx}
                    className={r.type === 'error' ? 'text-red-400' : 'text-yellow-400'}
                  >
                    {r.message}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {schema && (
            <section className="bg-[#1e293b] border border-gray-700 rounded p-6 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-green-300">🧩 J
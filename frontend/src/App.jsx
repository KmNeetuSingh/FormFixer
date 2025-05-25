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
  const [report, setReport] = useState([]);
  const [schema, setSchema] = useState(null);
  const [violations, setViolations] = useState([]);
  const [fixedHtml, setFixedHtml] = useState('');  // <-- New state for fixed HTML

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

  const analyzeForm = async () => {
    setLoading((prev) => ({ ...prev, analyze: true }));
    try {
      const res = await axios.post('http://localhost:5000/api/analyze', { html });
      setReport(res.data.report || []);
      setFixedHtml(res.data.fixedHtml || '');   // <-- Set fixedHtml here
    } catch (err) {
      toast.error(`Failed to analyze form${err?.message ? `: ${err.message}` : ''}`, {
        position: 'top-right',
      });
    } finally {
      setLoading((prev) => ({ ...prev, analyze: false }));
    }
  };

  const generateSchema = async () => {
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

      <textarea
        className="w-full h-56 p-4 mb-6 rounded border border-gray-700 bg-[#1e293b] text-gray-100 placeholder-gray-400 resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
        placeholder="Paste your HTML form here..."
        value={html}
        onChange={(e) => setHtml(e.target.value)}
        spellCheck={false}
      />

      <div className="flex flex-wrap gap-4 mb-10">
        <button
          onClick={analyzeForm}
          disabled={loading.analyze}
          aria-busy={loading.analyze}
          className={`flex-1 min-w-[120px] py-3 rounded text-white font-semibold transition
            ${loading.analyze ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-500'}
          `}
        >
          {loading.analyze ? 'Analyzing...' : 'Analyze'}
        </button>
        <button
          onClick={generateSchema}
          disabled={loading.schema}
          aria-busy={loading.schema}
          className={`flex-1 min-w-[120px] py-3 rounded text-white font-semibold transition
            ${loading.schema ? 'bg-green-400 cursor-not-allowed' : 'bg-green-600 hover:bg-green-700 focus:ring-4 focus:ring-green-500'}
          `}
        >
          {loading.schema ? 'Generating...' : 'Generate Schema'}
        </button>
        <button
          onClick={checkAccessibility}
          disabled={loading.accessibility}
          aria-busy={loading.accessibility}
          className={`flex-1 min-w-[120px] py-3 rounded text-white font-semibold transition
            ${loading.accessibility ? 'bg-purple-400 cursor-not-allowed' : 'bg-purple-700 hover:bg-purple-800 focus:ring-4 focus:ring-purple-600'}
          `}
        >
          {loading.accessibility ? 'Checking...' : 'Accessibility'}
        </button>
      </div>

      {(report.length > 0 || schema || violations.length > 0 || fixedHtml) && (
        <div className="space-y-10">
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

          {fixedHtml && (
            <section className="bg-[#1e293b] border border-gray-700 rounded p-6 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-cyan-400">🛠️ Fixed HTML</h2>
                <CopyButton text={fixedHtml} label="Fixed HTML" />
              </div>
              <pre
                className="overflow-x-auto max-h-64 text-sm bg-[#111827] p-4 rounded border border-gray-600 whitespace-pre-wrap"
              >
                {fixedHtml}
              </pre>
            </section>
          )}

          {schema && (
            <section className="bg-[#1e293b] border border-gray-700 rounded p-6 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-green-300">🧩 JSON Schema</h2>
                <CopyButton text={JSON.stringify(schema, null, 2)} label="JSON Schema" />
              </div>
              <pre
                className="overflow-x-auto max-h-64 text-sm bg-[#111827] p-4 rounded border border-gray-600 whitespace-pre-wrap"
              >
                {JSON.stringify(schema, null, 2)}
              </pre>
            </section>
          )}

          {violations.length > 0 && (
            <section className="bg-[#1e293b] border border-gray-700 rounded p-6 shadow-lg">
              <div className="flex justify-between items-center mb-3">
                <h2 className="text-xl font-semibold text-purple-300">♿ Accessibility Issues</h2>
                <CopyButton
                  text={violations.map((v) => v.description).join('\n')}
                  label="Accessibility Issues"
                />
              </div>
              <ul className="list-disc pl-6 space-y-1 text-sm text-orange-300 max-h-60 overflow-y-auto">
                {violations.map((v, idx) => (
                  <li key={idx}>{v.description}</li>
                ))}
              </ul>
            </section>
          )}
        </div>
      )}
    </div>
  );
}

export default App;

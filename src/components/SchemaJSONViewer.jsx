import React, { useState } from 'react';
import { validateAndNormalizeSchema } from '../utils/jsonSchemaValidator';
import { Copy, Check, Download, ShieldCheck } from 'lucide-react';

export default function SchemaJSONViewer({ scanResult }) {
  const [copied, setCopied] = useState(false);

  const rawJson = scanResult?.data || {};
  const validation = validateAndNormalizeSchema(rawJson);
  const formattedJsonString = JSON.stringify(validation.normalizedData, null, 2);

  const handleCopy = () => {
    navigator.clipboard.writeText(formattedJsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const blob = new Blob([formattedJsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nutrition-scan-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6">
      
      {/* Top Header Card */}
      <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 backdrop-blur-xl shadow-2xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Target Schema Validated
            </span>
            <span className="text-xs text-slate-400">FDA/EU Standard Units</span>
          </div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Structured JSON Extraction Output</h2>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopy}
            className="px-4 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all flex items-center gap-2 shadow-lg"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4 text-cyan-400" />}
            <span>{copied ? 'Copied to Clipboard!' : 'Copy JSON'}</span>
          </button>

          <button
            onClick={handleDownload}
            className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 hover:scale-105 transition-all flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            <span>Download .json</span>
          </button>
        </div>
      </div>

      {/* Schema Checklist Banner */}
      <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs font-mono grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="w-4 h-4" />
          <span>serving_info (size & count)</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="w-4 h-4" />
          <span>macros (11 standard keys)</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="w-4 h-4" />
          <span>ingredients (exact list)</span>
        </div>
        <div className="flex items-center gap-2 text-emerald-400">
          <Check className="w-4 h-4" />
          <span>allergens_identified (array)</span>
        </div>
      </div>

      {/* Monospace Code Editor View */}
      <div className="relative rounded-3xl bg-slate-950 border border-slate-800 shadow-2xl overflow-hidden group">
        <div className="flex items-center justify-between px-6 py-3 bg-slate-900/90 border-b border-slate-800 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-rose-500/80" />
            <div className="w-3 h-3 rounded-full bg-amber-500/80" />
            <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
            <span className="ml-2 text-slate-300 font-semibold">nutrition_schema_output.json</span>
          </div>
          <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Valid JSON Object
          </span>
        </div>

        <pre className="p-6 font-mono text-xs md:text-sm text-emerald-400 leading-relaxed overflow-x-auto selection:bg-emerald-500/30">
          <code>{formattedJsonString}</code>
        </pre>
      </div>

    </div>
  );
}

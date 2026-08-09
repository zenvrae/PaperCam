'use client';

import React, { useState } from 'react';
import { Download, FileText, Search, BookOpen, ExternalLink, ShieldCheck } from 'lucide-react';

export default function StudyMaterialsPage() {
  const [searchQuery, setSearchQuery] = useState('');

  const materials = [
    {
      id: 1,
      title: 'Indian Constitution & Fundamental Rights (Handwritten Reference Notes)',
      subject: 'Polity',
      file_size: '4.8 MB',
      downloads: 4820,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 2,
      title: 'Kerala History Renaissance Movement & Social Reformers (Complete Timeline)',
      subject: 'Kerala History',
      file_size: '6.2 MB',
      downloads: 8940,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 3,
      title: 'Quantitative Aptitude Formula Sheet & Short Tricks for LDC 2024',
      subject: 'Mathematics',
      file_size: '3.1 MB',
      downloads: 6210,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    },
    {
      id: 4,
      title: 'English Grammar Rules & Common Errors in Kerala PSC Papers',
      subject: 'English',
      file_size: '2.5 MB',
      downloads: 3450,
      url: 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf'
    }
  ];

  const filteredMaterials = materials.filter(m =>
    m.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">PSC Reference Vault</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Downloadable Study Materials (PDF)
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Subject-wise reference notes, handwritten PSC summaries, and formula sheets.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search PDF notes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#131929] border border-[#1e293b] rounded-xl text-xs text-slate-200 focus:outline-none focus:border-amber-400"
          />
        </div>
      </div>

      {/* Material Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {filteredMaterials.map((pdf) => (
          <div key={pdf.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg hover:border-[#334155] transition-all flex flex-col justify-between">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span className="px-2.5 py-0.5 rounded bg-[#0b0f19] text-amber-400 border border-[#1e293b] font-bold">
                  {pdf.subject}
                </span>
                <span>{pdf.file_size} • {pdf.downloads.toLocaleString()} Downloads</span>
              </div>

              <h3 className="font-extrabold text-white text-base font-sans leading-snug">
                {pdf.title}
              </h3>
            </div>

            <div className="pt-3 border-t border-[#1e293b] flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Syllabus Material
              </span>
              <a
                href={pdf.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-2 shadow-md transition-colors"
              >
                <Download className="w-4 h-4 text-slate-950" />
                <span>Download PDF</span>
              </a>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import { Download, Search, ShieldCheck, FileX, BookOpen } from 'lucide-react';
import { apiClient } from '@/lib/api-client';

interface StudyMaterial {
  id: number | string;
  title: string;
  subject: string;
  file_size?: string;
  downloads?: number;
  url: string;
}

export default function StudyMaterialsPage() {
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    async function loadMaterials() {
      try {
        const courses = await apiClient.getCourses();
        const extracted: StudyMaterial[] = [];

        courses.forEach(c => {
          if (c.curriculum) {
            c.curriculum.forEach(m => {
              if (m.lessons) {
                m.lessons.forEach(l => {
                  if (l.pdf_url) {
                    extracted.push({
                      id: l.id,
                      title: l.pdf_title || l.title,
                      subject: c.category || m.title || 'General Studies',
                      url: l.pdf_url
                    });
                  }
                });
              }
            });
          }
        });

        setMaterials(extracted);
      } finally {
        setIsLoading(false);
      }
    }
    loadMaterials();
  }, []);

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
            Subject-wise reference notes, handwritten PSC summaries, and formula sheets from backend curriculum.
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

      {isLoading ? (
        <div className="p-12 text-center text-xs text-slate-400">Fetching live study materials...</div>
      ) : filteredMaterials.length === 0 ? (
        <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-12 text-center space-y-3 shadow-lg">
          <FileX className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="text-lg font-bold text-white font-sans">No Study Materials Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-sans">
            {searchQuery ? 'No PDF materials match your search criteria.' : 'PDF reference materials published in your backend courses will appear here.'}
          </p>
        </div>
      ) : (
        /* Material Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredMaterials.map((pdf) => (
            <div key={pdf.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl p-6 space-y-4 shadow-lg hover:border-[#334155] transition-all flex flex-col justify-between">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span className="px-2.5 py-0.5 rounded bg-[#0b0f19] text-amber-400 border border-[#1e293b] font-bold">
                    {pdf.subject}
                  </span>
                  <span>Verified PDF Note</span>
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
      )}

    </div>
  );
}

'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Course } from '@/types';
import { apiClient } from '@/lib/api-client';
import { Search, ChevronDown, ChevronLeft, ChevronRight, Clock, Users, BookOpen } from 'lucide-react';

export default function CourseCatalogPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All Levels');

  useEffect(() => {
    async function loadCourses() {
      try {
        const data = await apiClient.getCourses();
        setCourses(data);
      } finally {
        setIsLoading(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = courses.filter(c => {
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All Levels' || c.difficulty === selectedDifficulty;
    return matchesCategory && matchesDifficulty;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Header Banner */}
      <div className="space-y-2 border-b border-[#1e293b] pb-6">
        <h1 className="text-4xl font-extrabold text-white tracking-tight font-sans">
          Course Catalog
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
          Explore our comprehensive range of specialized courses designed for administrative and academic excellence. Filter by category or difficulty to find your ideal learning path.
        </p>
      </div>

      {/* Main Catalog Content */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Filter Sidebar (3 Cols) */}
        <aside className="lg:col-span-3 space-y-6">
          
          {/* Category Checkboxes */}
          <div className="space-y-3">
            <h3 className="font-extrabold text-sm text-white border-b border-[#1e293b] pb-2">
              Categories
            </h3>
            <div className="space-y-2 text-xs font-mono-code text-slate-300">
              {['All', 'Degree Level', '10th/12th Level', 'Special Topics', 'Language Proficiency'].map(catName => (
                <label key={catName} className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={selectedCategory === catName}
                    onChange={() => setSelectedCategory(catName)}
                    className="rounded border-[#334155] bg-[#131929] text-amber-400 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>{catName}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Difficulty Radio */}
          <div className="space-y-3 pt-2">
            <h3 className="font-extrabold text-sm text-white border-b border-[#1e293b] pb-2">
              Difficulty Level
            </h3>
            <div className="space-y-2 text-xs font-mono-code text-slate-300">
              {['All Levels', 'Beginner', 'Intermediate', 'Advanced'].map(diff => (
                <label key={diff} className="flex items-center gap-2.5 cursor-pointer hover:text-white">
                  <input
                    type="radio"
                    name="difficulty"
                    checked={selectedDifficulty === diff}
                    onChange={() => setSelectedDifficulty(diff)}
                    className="border-[#334155] bg-[#131929] text-amber-400 focus:ring-amber-400 cursor-pointer"
                  />
                  <span>{diff}</span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Right Course Grid (9 Cols) */}
        <div className="lg:col-span-9 space-y-6">
          
          {/* Sort Header */}
          <div className="flex items-center justify-between text-xs font-mono-code text-slate-300">
            <div>
              Showing {filteredCourses.length} results for <span className="font-bold text-white">"{selectedCategory}"</span>
            </div>
            <div className="flex items-center gap-2">
              <button className="flex items-center gap-1.5 px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-xl text-slate-200">
                <span>Most Popular</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>
            </div>
          </div>

          {/* Cards Grid */}
          {isLoading ? (
            <div className="p-12 text-center text-xs font-mono-code text-slate-400">
              Fetching live courses from WordPress backend...
            </div>
          ) : filteredCourses.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredCourses.map(item => (
                <div key={item.id} className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden flex flex-col justify-between hover:border-[#334155] transition-all shadow-md group">
                  
                  <div>
                    {/* Thumbnail Image */}
                    <div className="relative h-44 w-full bg-[#0b0f19] overflow-hidden">
                      <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85" />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#131929] via-transparent to-transparent" />
                      
                      <span className="absolute top-3 left-3 px-2.5 py-1 bg-[#0b0f19]/80 backdrop-blur-xs text-slate-200 rounded-md text-[10px] font-mono-code border border-[#1e293b]">
                        {item.category}
                      </span>
                    </div>

                    {/* Body Content */}
                    <div className="p-4 space-y-2">
                      <h3 className="font-extrabold text-white text-base line-clamp-2 leading-snug">
                        {item.title}
                      </h3>
                      <p className="text-xs text-slate-400 line-clamp-2 font-sans">
                        {item.short_description || item.description}
                      </p>
                    </div>
                  </div>

                  {/* Footer Badges & Button */}
                  <div className="p-4 pt-0 space-y-3">
                    <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-400 border-t border-[#1e293b] pt-3">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        {item.duration}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="w-3 h-3 text-slate-400" />
                        {(item.total_students || 1240).toLocaleString()} Enrolled
                      </span>
                    </div>

                    <Link href={`/courses/${item.slug}`}>
                      <button className="w-full py-2 bg-transparent hover:bg-[#1e293b] text-slate-200 border border-[#1e293b] font-mono-code text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                        <span>View Syllabus</span>
                        <span>→</span>
                      </button>
                    </Link>
                  </div>

                </div>
              ))}
            </div>
          ) : (
            <div className="p-12 bg-[#131929] border border-[#1e293b] rounded-2xl text-center text-xs font-mono-code text-slate-400 space-y-2">
              <BookOpen className="w-8 h-8 text-amber-400 mx-auto" />
              <p>No courses found in this category.</p>
            </div>
          )}

          {/* Pagination */}
          <div className="flex items-center justify-end gap-1.5 pt-4 text-xs font-mono-code">
            <button className="p-2 bg-[#131929] border border-[#1e293b] rounded-lg text-slate-400 hover:text-white">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button className="px-3 py-1.5 bg-amber-400 text-slate-950 font-bold rounded-lg">1</button>
            <button className="p-2 bg-[#131929] border border-[#1e293b] rounded-lg text-slate-400 hover:text-white">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>

      </div>

    </div>
  );
}

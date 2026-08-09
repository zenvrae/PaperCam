'use client';

import React, { useEffect, useState } from 'react';
import { Course, Lesson, Module } from '@/types';
import { apiClient } from '@/lib/api-client';
import { 
  PlusCircle, 
  Trash2, 
  Edit, 
  Video, 
  FileText, 
  CheckCircle, 
  X, 
  BookOpen, 
  Clock, 
  Search,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';

export default function AdminCourseManagerPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  // Form Fields
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Degree Level');
  const [price, setPrice] = useState('999');
  const [salePrice, setSalePrice] = useState('499');
  const [thumbnail, setThumbnail] = useState('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');
  const [description, setDescription] = useState('');
  
  // Lesson Fields inside Modal
  const [lessonTitle, setLessonTitle] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [duration, setDuration] = useState('45 mins');
  const [isFreePreview, setIsFreePreview] = useState(true);

  useEffect(() => {
    async function fetchCourses() {
      try {
        const data = await apiClient.getCourses();
        setCourses(data);
      } finally {
        setIsLoading(false);
      }
    }
    fetchCourses();
  }, []);

  const handleOpenCreateModal = () => {
    setEditingCourse(null);
    setTitle('');
    setCategory('Degree Level');
    setPrice('999');
    setSalePrice('499');
    setThumbnail('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80');
    setDescription('Targeted Kerala PSC preparation course.');
    setIsModalOpen(true);
  };

  const handleSaveCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newLessons: Lesson[] = lessonTitle.trim() ? [
      {
        id: Date.now() + 1,
        module_id: Date.now(),
        course_id: Date.now(),
        title: lessonTitle,
        slug: 'lesson-' + Date.now(),
        content_type: 'VIDEO',
        duration,
        is_free_preview: isFreePreview,
        youtube_url: youtubeUrl || 'https://www.youtube.com/watch?v=uToFyZj_Kk8',
        description: 'Lesson added via Admin Portal.',
        order: 1
      }
    ] : [];

    const created = await apiClient.createCourse({
      title,
      category,
      price: parseFloat(price) || 999,
      sale_price: parseFloat(salePrice) || 499,
      thumbnail,
      description,
      curriculum: [
        {
          id: Date.now(),
          course_id: Date.now(),
          title: 'Module 1: Primary Syllabus',
          order: 1,
          lessons: newLessons.length > 0 ? newLessons : [
            {
              id: Date.now() + 2,
              module_id: Date.now(),
              course_id: Date.now(),
              title: 'Lesson 1: Introduction & Exam Strategy',
              slug: 'intro-lesson',
              content_type: 'VIDEO',
              duration: '35 mins',
              is_free_preview: true,
              youtube_url: 'https://www.youtube.com/watch?v=uToFyZj_Kk8',
              description: 'Introductory session for syllabus overview.',
              order: 1
            }
          ]
        }
      ]
    });

    setCourses(prev => [created, ...prev]);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">CMS Module</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Course Catalog Management
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Create, edit, and publish courses with YouTube video streams and PDF study notes.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="px-5 py-2.5 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-2 shadow-md transition-colors cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 fill-slate-950 text-amber-400" />
          <span>+ Create New Course</span>
        </button>
      </div>

      {/* Courses List Table */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl overflow-hidden shadow-xl">
        <div className="p-4 border-b border-[#1e293b] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-amber-400" />
            <h3 className="font-bold text-sm text-white font-sans">Published &amp; Draft Courses ({courses.length})</h3>
          </div>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-xs text-slate-400">Loading courses...</div>
        ) : (
          <div className="divide-y divide-[#1e293b]/60 overflow-x-auto">
            {courses.map((c) => {
              const lessonCount = c.curriculum ? c.curriculum.reduce((acc, m) => acc + m.lessons.length, 0) : 0;
              return (
                <div key={c.id} className="p-4 sm:p-5 flex items-center justify-between gap-4 hover:bg-[#1e293b]/30 transition-colors">
                  
                  <div className="flex items-center gap-4 min-w-0">
                    <img src={c.thumbnail} alt={c.title} className="w-14 h-14 rounded-xl object-cover border border-[#1e293b] shrink-0" />
                    <div className="min-w-0 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-[#0b0f19] border border-[#1e293b] text-[10px] text-slate-300">
                          {c.category}
                        </span>
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold">
                          {c.status.toUpperCase()}
                        </span>
                      </div>
                      <h4 className="font-bold text-white text-sm font-sans truncate">{c.title}</h4>
                      <p className="text-xs text-slate-400">
                        {lessonCount} Lessons • ₹{c.sale_price || c.price} (Regular ₹{c.price})
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingCourse(c);
                        setTitle(c.title);
                        setCategory(c.category);
                        setPrice(String(c.price));
                        setSalePrice(String(c.sale_price || c.price));
                        setThumbnail(c.thumbnail);
                        setDescription(c.description);
                        setIsModalOpen(true);
                      }}
                      className="px-3 py-1.5 bg-[#1e293b] hover:bg-[#334155] text-slate-200 rounded-lg text-xs font-bold transition-colors flex items-center gap-1"
                    >
                      <Edit className="w-3.5 h-3.5 text-amber-400" /> Edit
                    </button>

                    <button
                      onClick={() => setCourses(prev => prev.filter(item => item.id !== c.id))}
                      className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Course Creator & Editor Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-8 space-y-6 shadow-2xl relative">
            
            <div className="flex items-center justify-between border-b border-[#1e293b] pb-4">
              <h3 className="text-xl font-bold text-white font-sans">
                {editingCourse ? 'Edit Course Details' : 'Create New PSC Course'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveCourse} className="space-y-4 text-xs">
              
              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Course Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kerala PSC Degree Level Master Course 2026"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                  >
                    <option value="Degree Level">Degree Level</option>
                    <option value="10th/12th Level">10th/12th Level</option>
                    <option value="Special Topics">Special Topics</option>
                    <option value="Language Proficiency">Language Proficiency</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Regular Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-slate-300 font-bold">Offer Sale Price (₹)</label>
                  <input
                    type="number"
                    value={salePrice}
                    onChange={(e) => setSalePrice(e.target.value)}
                    className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Thumbnail Image URL</label>
                <input
                  type="text"
                  value={thumbnail}
                  onChange={(e) => setThumbnail(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-bold">Course Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              {/* Add Initial Lesson Section */}
              <div className="p-4 bg-[#0b0f19] border border-[#1e293b] rounded-2xl space-y-3">
                <h4 className="font-bold text-amber-400 flex items-center gap-1.5">
                  <Video className="w-4 h-4" /> Initial Lesson Stream Setup
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <input
                    type="text"
                    placeholder="Lesson Title (e.g. Fundamental Rights)"
                    value={lessonTitle}
                    onChange={(e) => setLessonTitle(e.target.value)}
                    className="px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-lg text-white"
                  />
                  <input
                    type="text"
                    placeholder="YouTube Video URL"
                    value={youtubeUrl}
                    onChange={(e) => setYoutubeUrl(e.target.value)}
                    className="px-3 py-1.5 bg-[#131929] border border-[#1e293b] rounded-lg text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-[#1e293b]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-[#1e293b] text-slate-300 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold rounded-xl shadow-md transition-colors"
                >
                  Save Course
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}

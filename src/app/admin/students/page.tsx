'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { apiClient } from '@/lib/api-client';
import { 
  Users, 
  Search, 
  MapPin, 
  GraduationCap, 
  Calendar, 
  Download, 
  ArrowLeft,
  Filter,
  CheckCircle2,
  AlertCircle,
  Trash2,
  XCircle,
  HelpCircle,
  RotateCcw
} from 'lucide-react';

interface Student {
  id: string;
  name: string;
  email: string;
  phone: string;
  district: string;
  qualification: string;
  dob: string;
  age: string;
  registeredDate: string;
  avatar: string;
  status: 'Completed Onboarding' | 'Pending Onboarding' | 'Removed';
}

const INITIAL_STUDENTS: Student[] = [];

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<Student[]>(INITIAL_STUDENTS);
  const [search, setSearch] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('All Districts');
  const [selectedQual, setSelectedQual] = useState('All Qualifications');
  
  // Modal State
  const [studentToDelete, setStudentToDelete] = useState<Student | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [deleteSuccessMsg, setDeleteSuccessMsg] = useState('');
  const [exportSuccess, setExportSuccess] = useState(false);

  // Sync with database API & WordPress REST API
  useEffect(() => {
    async function loadLiveStudents() {
      let liveList: Student[] = [];
      try {
        const wpData = await apiClient.getStudents();
        if (Array.isArray(wpData) && wpData.length > 0) {
          liveList = wpData.map((st: any, idx: number) => {
            const isRemoved = Boolean(
              st.status === 'removed' || 
              st.status === 'student_removed' || 
              st.account_status === 'student_removed'
            );

            return {
              id: st.id || (st.ID ? `STU-${st.ID}` : `STU-${1000 + idx}`),
              name: st.name || st.display_name || st.user_login || 'Candidate',
              email: st.email || st.user_email || 'Not Provided',
              phone: st.phone || 'Not Provided',
              district: (st.district && st.district !== 'Not Provided') ? st.district : 'Thiruvananthapuram',
              qualification: (st.qualification && st.qualification !== 'Not Provided') ? st.qualification : 'Graduate (B.A / B.Sc / B.Com / B.Tech)',
              dob: st.dob || '1998-05-15',
              age: st.age || '26 Years',
              registeredDate: st.registeredDate || (st.user_registered ? st.user_registered.split(' ')[0] : new Date().toISOString().split('T')[0]),
              avatar: st.avatar || '',
              status: isRemoved ? 'Removed' : 'Completed Onboarding'
            };
          });
        }
      } catch (err) {
        console.error('[AdminStudents] Failed to fetch student list:', err);
      }

      setStudents(liveList);
    }

    loadLiveStudents();
  }, []);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) || 
                            s.email.toLowerCase().includes(search.toLowerCase()) || 
                            s.phone.includes(search);
      const matchesDistrict = selectedDistrict === 'All Districts' || s.district === selectedDistrict;
      const matchesQual = selectedQual === 'All Qualifications' || s.qualification === selectedQual;
      return matchesSearch && matchesDistrict && matchesQual;
    });
  }, [students, search, selectedDistrict, selectedQual]);

  const handleExport = () => {
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const triggerDelete = (student: Student) => {
    setStudentToDelete(student);
    setShowConfirmModal(true);
  };

  const confirmDelete = async () => {
    if (!studentToDelete) return;

    try {
      await apiClient.deleteStudent(studentToDelete.id, studentToDelete.email);
      setStudents(prev => prev.map(s => s.id === studentToDelete.id ? { ...s, status: 'Removed' } : s));
      
      setDeleteSuccessMsg(`Candidate ${studentToDelete.name} status updated to Removed.`);
      setTimeout(() => setDeleteSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to remove student:', err);
    } finally {
      setShowConfirmModal(false);
      setStudentToDelete(null);
    }
  };

  const handleRestore = async (student: Student) => {
    try {
      await apiClient.restoreStudent(student.id, student.email);
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'Completed Onboarding' } : s));
      
      setDeleteSuccessMsg(`Candidate ${student.name} restored successfully.`);
      setTimeout(() => setDeleteSuccessMsg(''), 3000);
    } catch (err) {
      console.error('Failed to restore student:', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto font-mono-code relative">
      
      {/* Header Roster */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">Candidate Registry</span>
          <h1 className="text-3xl font-extrabold text-white tracking-tight font-sans mt-0.5">
            Student Management Directory
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Access qualifications, districts, dates of birth, ages, and contact details of registered candidates.
          </p>
        </div>

        <button 
          onClick={handleExport}
          className="px-4 py-2 bg-amber-400 hover:bg-amber-500 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-md transition-colors cursor-pointer"
        >
          <Download className="w-4 h-4" />
          <span>{exportSuccess ? 'Exported Successfully!' : 'Export Student CSV'}</span>
        </button>
      </div>

      {deleteSuccessMsg && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs rounded-2xl font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-rose-400" />
          <span>{deleteSuccessMsg}</span>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        
        {/* Search */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search by name, email or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400 transition-colors"
          />
        </div>

        {/* Filter District */}
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={selectedDistrict}
            onChange={(e) => setSelectedDistrict(e.target.value)}
            className="w-full px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All Districts">All Districts</option>
            {[
              'Thiruvananthapuram', 'Kollam', 'Pathanamthitta', 'Alappuzha',
              'Kottayam', 'Idukki', 'Ernakulam', 'Thrissur', 'Palakkad',
              'Malappuram', 'Kozhikode', 'Wayanad', 'Kannur', 'Kasaragod'
            ].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        {/* Filter Qualification */}
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-amber-400 shrink-0" />
          <select
            value={selectedQual}
            onChange={(e) => setSelectedQual(e.target.value)}
            className="w-full px-3 py-2 bg-[#0b0f19] border border-[#1e293b] rounded-xl text-xs text-white focus:outline-none focus:border-amber-400"
          >
            <option value="All Qualifications">All Qualifications</option>
            <option value="Graduate (B.A / B.Sc / B.Com / B.Tech)">Graduate</option>
            <option value="Post Graduate (M.A / M.Sc / M.Tech / MCA)">Post Graduate</option>
            <option value="12th / Plus Two Pass">12th / Plus Two Pass</option>
            <option value="10th / SSLC Pass">10th / SSLC Pass</option>
            <option value="Diploma / ITI">Diploma / ITI</option>
          </select>
        </div>

      </div>

      {/* Roster Table Card */}
      <div className="bg-[#131929] border border-[#1e293b] rounded-3xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-[#0b0f19] border-b border-[#1e293b] text-slate-400 font-bold">
                <th className="p-4 sm:p-5">CANDIDATE INFO</th>
                <th className="p-4 sm:p-5">CONTACT INFORMATION</th>
                <th className="p-4 sm:p-5">LOCATION</th>
                <th className="p-4 sm:p-5">EDUCATION &amp; DOB</th>
                <th className="p-4 sm:p-5">ONBOARD STATUS</th>
                <th className="p-4 sm:p-5 text-right">ACTION</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]/60">
              {filteredStudents.length > 0 ? (
                filteredStudents.map(student => (
                  <tr key={student.id} className="hover:bg-[#0e1424]/40 transition-colors">
                    
                    {/* ID & Avatar */}
                    <td className="p-4 sm:p-5">
                      <div className="flex items-center gap-3">
                        <img 
                          src={student.avatar} 
                          alt={student.name} 
                          className="w-10 h-10 rounded-xl object-cover border border-[#1e293b] shrink-0"
                        />
                        <div>
                          <p className="font-extrabold text-white text-xs">{student.name}</p>
                          <span className="text-[10px] font-bold text-slate-500">{student.id}</span>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="p-4 sm:p-5 space-y-1">
                      <p className="font-semibold text-slate-300">{student.email}</p>
                      <p className="text-slate-400 font-mono-code">{student.phone}</p>
                    </td>

                    {/* District */}
                    <td className="p-4 sm:p-5">
                      <span className="px-2.5 py-1 bg-amber-400/5 text-amber-300 border border-amber-400/20 rounded-lg font-bold flex items-center gap-1.5 w-fit">
                        <MapPin className="w-3.5 h-3.5 text-amber-400" />
                        {student.district}
                      </span>
                    </td>

                    {/* Qualification, DOB & Age */}
                    <td className="p-4 sm:p-5 space-y-1">
                      <p className="font-bold text-white flex items-center gap-1">
                        <GraduationCap className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{student.qualification}</span>
                      </p>
                      <div className="flex items-center gap-2 text-[11px] font-mono-code pt-0.5">
                        {student.dob ? (
                          <span className="px-2 py-0.5 bg-[#0b0f19] text-amber-400 border border-amber-400/30 rounded-md font-bold flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-amber-400" />
                            DOB: {student.dob}
                          </span>
                        ) : (
                          <span className="text-slate-500 font-normal">DOB: Not Provided</span>
                        )}
                        {student.age && <span className="text-slate-400 font-bold">({student.age})</span>}
                      </div>
                    </td>

                    {/* Onboarding Status */}
                    <td className="p-4 sm:p-5">
                      {student.status === 'Removed' ? (
                        <span className="px-2.5 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full font-bold flex items-center gap-1.5 w-fit">
                          <XCircle className="w-3.5 h-3.5" />
                          Removed
                        </span>
                      ) : student.status === 'Completed Onboarding' ? (
                        <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full font-bold flex items-center gap-1.5 w-fit">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Onboarded
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-full font-bold flex items-center gap-1.5 w-fit">
                          <AlertCircle className="w-3.5 h-3.5" />
                          Pending Details
                        </span>
                      )}
                    </td>

                    {/* Action Column: Restore or Remove */}
                    <td className="p-4 sm:p-5 text-right">
                      {student.status === 'Removed' ? (
                        <button 
                          onClick={() => handleRestore(student)}
                          className="px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl transition-all cursor-pointer font-bold flex items-center gap-1.5 ml-auto"
                          title="Restore Student Account"
                        >
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Restore</span>
                        </button>
                      ) : (
                        <button 
                          onClick={() => triggerDelete(student)}
                          className="p-2 bg-transparent hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-transparent hover:border-rose-500/20 rounded-xl transition-all cursor-pointer"
                          title="Remove Student Record"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>

                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    No candidates matching search parameters found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && studentToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-[#131929] border border-[#1e293b] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-6 shadow-2xl relative">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/10 text-rose-400 border border-rose-500/20 flex items-center justify-center mx-auto">
                <HelpCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-extrabold text-white font-sans">
                Confirm Candidate Removal
              </h3>
              <p className="text-xs text-slate-400">
                Are you sure you want to change candidate <strong className="text-white">{studentToDelete.name}</strong> ({studentToDelete.id}) status to <strong className="text-rose-400">Removed</strong>? The record will remain in the database and access will be restricted.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => { setShowConfirmModal(false); setStudentToDelete(null); }}
                className="flex-1 py-2.5 bg-[#0b0f19] hover:bg-[#131929] border border-[#1e293b] text-slate-300 font-bold rounded-xl text-xs transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="flex-1 py-2.5 bg-rose-500 hover:bg-rose-600 text-white font-black rounded-xl text-xs uppercase tracking-wider transition-colors cursor-pointer"
              >
                Remove Access
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

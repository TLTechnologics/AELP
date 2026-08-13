'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  Filter, 
  ArrowUpDown, 
  ChevronLeft, 
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/services/api';

type StudentRecord = {
  id: string;
  name: string;
  email: string;
  avatar: string;
  class: string;
  listeningScore: number;
  readingScore: number;
  writingScore: number;
  speakingScore: number;
  overallScore: number;
  cefrLevel: string;
  group: string;
  attendance: number;
  status: 'Good' | 'Needs Improvement' | 'Critical';
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  show: { opacity: 1, y: 0, transition: { type: 'spring' as const, stiffness: 260, damping: 22 } }
};



export default function StudentManagement() {
  const router = useRouter();
  
  // Filters & Search State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClass, setSelectedClass] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [sortBy, setSortBy] = useState<'name' | 'score' | 'attendance'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const {
    data: dbStudents = [],
    isError,
    isLoading,
    refetch,
  } = useQuery<StudentRecord[], Error>({
    queryKey: ['teacherStudents'],
    queryFn: async () => {
      const res = await teacherService.getStudents();
      if (!Array.isArray(res.data)) {
        throw new Error('The student directory response was invalid.');
      }
      return res.data as StudentRecord[];
    },
    retry: 1,
  });

  const mockStudents = dbStudents;

  // Filter logic
  const filteredStudents = mockStudents.filter((student) => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.id.toLowerCase().includes(searchQuery.toLowerCase());
                          
    const matchesClass = selectedClass === 'All' || student.class === selectedClass;
    const matchesStatus = selectedStatus === 'All' || student.status === selectedStatus;
    
    return matchesSearch && matchesClass && matchesStatus;
  });

  // Sorting logic
  const sortedStudents = [...filteredStudents].sort((a, b) => {
    const multiplier = sortOrder === 'asc' ? 1 : -1;
    
    if (sortBy === 'name') {
      return a.name.localeCompare(b.name) * multiplier;
    } else if (sortBy === 'score') {
      return (a.overallScore - b.overallScore) * multiplier;
    } else if (sortBy === 'attendance') {
      return (a.attendance - b.attendance) * multiplier;
    }
    return 0;
  });

  // Pagination calculation
  const totalItems = sortedStudents.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedStudents = sortedStudents.slice(startIndex, startIndex + itemsPerPage);

  const toggleSort = (field: 'name' | 'score' | 'attendance') => {
    if (sortBy === field) {
      setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleRowClick = (id: string) => {
    router.push(`/teacher/students/${id}`);
  };

  return (
    <MainLayout>
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="show"
        className="space-y-8 pb-20"
      >
        {/* Header Row */}
        <motion.div variants={itemVariants} className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sm:gap-6">
          <div>
            <h2 className="text-sm sm:text-xl text-muted-foreground font-medium mb-1">Manage Cohorts & Learning Goals</h2>
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading break-words uppercase tracking-tight">
              Student <span className="highlight-yellow inline-block px-2">Directory</span>
            </h1>
          </div>
        </motion.div>

        {/* Search and Filters Bar */}
        <motion.div 
          variants={itemVariants}
          className="bg-white p-4 sm:p-6 rounded-2xl sm:rounded-[24px] border border-border/40 shadow-xs grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 items-center"
        >
          {/* Search bar */}
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-3 sm:top-3.5 w-4 h-4 sm:w-5 sm:h-5 text-muted-foreground" />
            <input 
              type="text" 
              placeholder="Search by student name, ID or email..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted border border-border/50 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 pl-10 sm:pl-12 pr-4 outline-none focus:border-brand-yellow focus:ring-2 focus:ring-brand-yellow/15 transition-all text-xs sm:text-sm font-medium text-brand-dark"
            />
          </div>

          {/* Semester Filter */}
          <div className="relative">
            <select 
              value={selectedClass}
              onChange={(e) => {
                setSelectedClass(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted border border-border/50 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-4 outline-none focus:border-brand-yellow font-bold text-xs sm:text-sm text-brand-dark cursor-pointer appearance-none"
            >
              <option value="All">All Semesters</option>
              <option value="Semester 1">Semester 1</option>
              <option value="Semester 2">Semester 2</option>
            </select>
            <Filter className="absolute right-3.5 top-3 sm:top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select 
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-muted border border-border/50 rounded-xl sm:rounded-2xl py-2.5 sm:py-3 px-3.5 sm:px-4 outline-none focus:border-brand-yellow font-bold text-xs sm:text-sm text-brand-dark cursor-pointer appearance-none"
            >
              <option value="All">All Statuses</option>
              <option value="Good">Good (Green)</option>
              <option value="Needs Improvement">Needs Improvement (Orange)</option>
              <option value="Critical">Critical (Red)</option>
            </select>
            <Filter className="absolute right-3.5 top-3 sm:top-4 w-3.5 h-3.5 sm:w-4 sm:h-4 text-muted-foreground pointer-events-none" />
          </div>
        </motion.div>

        {/* Directory Table */}
        <motion.div variants={itemVariants} className="bg-white rounded-2xl sm:rounded-[32px] shadow-xs border border-border/40 overflow-hidden">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-muted/50 border-b border-border/40 text-xs font-bold text-muted-foreground uppercase tracking-widest">
                  <th 
                    onClick={() => toggleSort('name')}
                    className="p-6 cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center gap-1">Student <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-6">Semester</th>
                  <th className="p-6 text-center">List.</th>
                  <th className="p-6 text-center">Read.</th>
                  <th className="p-6 text-center">Writ.</th>
                  <th className="p-6 text-center">Speak.</th>
                  <th 
                    onClick={() => toggleSort('score')}
                    className="p-6 text-center cursor-pointer hover:bg-muted/70 transition-colors"
                  >
                    <div className="flex items-center justify-center gap-1">Overall <ArrowUpDown className="w-3 h-3" /></div>
                  </th>
                  <th className="p-6">Group Category</th>
                  <th className="p-6 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30 text-sm font-medium text-brand-dark">
                {isLoading ? (
                  <tr>
                    <td colSpan={9} className="p-16 text-center text-sm font-medium text-muted-foreground">
                      Loading students…
                    </td>
                  </tr>
                ) : isError ? (
                  <tr>
                    <td colSpan={9} className="p-16 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <UserCheck className="w-12 h-12 text-red-500 mx-auto" />
                        <p className="font-heading text-2xl uppercase">Could not load students</p>
                        <p className="text-sm text-muted-foreground font-medium">
                          The server did not return the directory. Please try again.
                        </p>
                        <button
                          type="button"
                          onClick={() => refetch()}
                          className="rounded-xl bg-brand-dark px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-brand-dark/90"
                        >
                          Try again
                        </button>
                      </div>
                    </td>
                  </tr>
                ) : paginatedStudents.length > 0 ? (
                  paginatedStudents.map((student) => (
                    <tr 
                      key={student.id} 
                      onClick={() => handleRowClick(student.id)}
                      className="hover:bg-muted/30 cursor-pointer transition-colors group"
                    >
                      {/* Name Card */}
                      <td className="p-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-yellow text-brand-dark font-bold text-xs flex items-center justify-center border border-brand-dark/10 overflow-hidden group-hover:scale-105 transition-transform shrink-0">
                            <img src={student.avatar} alt={student.name} className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="font-bold group-hover:text-brand-yellow transition-colors">{student.name}</p>
                            <p className="text-xs text-muted-foreground font-medium">{student.id} • {student.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Semester */}
                      <td className="p-6">
                        <span className="font-bold text-xs uppercase tracking-wider bg-muted px-2.5 py-1 rounded-lg border border-border/30 whitespace-nowrap">
                          {student.class}
                        </span>
                      </td>

                      {/* LRWS Individual Scores */}
                      <td className="p-6 text-center text-muted-foreground font-bold">{student.listeningScore}%</td>
                      <td className="p-6 text-center text-muted-foreground font-bold">{student.readingScore}%</td>
                      <td className="p-6 text-center text-muted-foreground font-bold">{student.writingScore}%</td>
                      <td className="p-6 text-center text-muted-foreground font-bold">{student.speakingScore}%</td>

                      {/* Overall CEFR */}
                      <td className="p-6 text-center font-heading text-lg">
                        {student.overallScore}% <span className="text-xs font-bold text-muted-foreground uppercase">({student.cefrLevel})</span>
                      </td>

                      {/* Group */}
                      <td className="p-6">
                        <span className="text-xs bg-brand-muted text-brand-dark px-2.5 py-1 rounded-md border border-border/40">
                          {student.group}
                        </span>
                      </td>

                      {/* Status indicator */}
                      <td className="p-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          student.status === 'Good' 
                            ? 'bg-green-100 text-green-700' 
                            : student.status === 'Needs Improvement'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-red-100 text-red-700'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            student.status === 'Good' 
                              ? 'bg-green-600' 
                              : student.status === 'Needs Improvement'
                                ? 'bg-orange-600'
                                : 'bg-red-600'
                          }`} />
                          {student.status}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="p-16 text-center">
                      <div className="max-w-md mx-auto space-y-3">
                        <UserCheck className="w-12 h-12 text-muted-foreground mx-auto" />
                        <p className="font-heading text-2xl uppercase">No Students Found</p>
                        <p className="text-sm text-muted-foreground font-medium">Try broadening your search query or adjusting active filters.</p>
                      </div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 bg-muted/30 border-t border-border/40">
              <span className="text-xs font-bold text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, totalItems)} of {totalItems} students
              </span>
              
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="p-2 rounded-xl bg-white border border-border/50 hover:bg-muted text-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                {[...Array(totalPages)].map((_, idx) => (
                  <button 
                    key={idx} 
                    onClick={() => setCurrentPage(idx + 1)}
                    className={`w-8 h-8 rounded-xl font-bold text-xs flex items-center justify-center transition-colors ${
                      currentPage === idx + 1 
                        ? 'bg-brand-dark text-white shadow-sm' 
                        : 'bg-white border border-border/50 hover:bg-muted text-brand-dark'
                    }`}
                  >
                    {idx + 1}
                  </button>
                ))}
                <button 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-xl bg-white border border-border/50 hover:bg-muted text-brand-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </MainLayout>
  );
}

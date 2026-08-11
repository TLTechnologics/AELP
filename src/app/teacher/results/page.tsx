'use client';

import { useState } from 'react';
import { MainLayout } from '@/components/layout/main-layout';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { teacherService } from '@/services/api';
import { LiquidLoader } from '@/components/ui/liquid-loader';
import { AlertTriangle, Download, FileSpreadsheet, Search } from 'lucide-react';

export default function TeacherResults() {
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dbStudents = [], isLoading, isError } = useQuery({
    queryKey: ['teacherStudents'],
    queryFn: async () => {
      const res = await teacherService.getStudents();
      return res.data;
    }
  });

  const filteredStudents = dbStudents.filter((student: any) =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.class.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const downloadCSV = () => {
    // Define the headers
    const headers = [
      'ID', 
      'Name', 
      'Email', 
      'Class', 
      'Listening Score', 
      'Reading Score', 
      'Writing Score', 
      'Speaking Score', 
      'Overall Score', 
      'CEFR Level', 
      'Attendance (%)', 
      'Status'
    ];

    // Create CSV rows
    const rows = filteredStudents.map((student: any) => [
      student.id,
      `"${student.name}"`, // Quote strings to handle potential commas
      `"${student.email}"`,
      `"${student.class}"`,
      student.listeningScore || 0,
      student.readingScore || 0,
      student.writingScore || 0,
      student.speakingScore || 0,
      student.overallScore || 0,
      `"${student.cefrLevel || 'N/A'}"`,
      student.attendance || 0,
      `"${student.status || 'N/A'}"`
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map((row: any[]) => row.join(','))
    ].join('\n');

    // Create a Blob and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'student_results.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <LiquidLoader isLooping={true} />;
  }

  if (isError) {
    return (
      <MainLayout>
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <p className="text-xl font-heading text-gray-800">Cannot load students data</p>
          <button onClick={() => window.location.reload()} className="mt-4 px-4 py-2 bg-brand-dark text-white rounded-lg">Retry</button>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 22 }}
        className="space-y-8 pb-20"
      >
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-heading break-words uppercase tracking-tight">
              Class <span className="highlight-yellow inline-block px-2">Results</span>
            </h1>
            <p className="text-muted-foreground mt-2 font-medium">Export and analyze student performance.</p>
          </div>
          
          <button 
            onClick={downloadCSV}
            className="w-full sm:w-auto flex items-center justify-center gap-2 bg-brand-dark text-white px-5 py-3 rounded-2xl font-bold text-sm shadow-xs hover:bg-brand-dark/90 transition-all hover:scale-105 active:scale-95"
          >
            <Download className="w-4 h-4" /> Download CSV
          </button>
        </div>

        <div className="bg-white rounded-[32px] p-6 sm:p-8 border border-border/40 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row justify-between gap-4">
            <h2 className="font-heading text-2xl flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-brand-info" />
              Results Preview
            </h2>
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-muted/50 border border-border/50 rounded-2xl pl-10 pr-4 py-2.5 text-sm font-medium outline-none focus:border-brand-dark transition-colors"
              />
            </div>
          </div>

          <div className="overflow-x-auto custom-scrollbar pb-2">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b-2 border-border/60">
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Student Name</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider">Cohort</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Reading</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Writing</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Speaking</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Listening</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">Overall</th>
                  <th className="p-4 text-xs font-bold text-muted-foreground uppercase tracking-wider text-center">CEFR</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filteredStudents.length > 0 ? (
                  filteredStudents.map((student: any) => (
                    <tr key={student.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <p className="font-bold text-brand-dark">{student.name}</p>
                        <p className="text-xs text-muted-foreground font-medium">{student.email}</p>
                      </td>
                      <td className="p-4">
                        <span className="text-xs font-bold uppercase tracking-wider bg-muted px-2.5 py-1 rounded-full text-brand-dark">
                          {student.class}
                        </span>
                      </td>
                      <td className="p-4 text-center font-bold text-brand-dark">{student.readingScore || 0}%</td>
                      <td className="p-4 text-center font-bold text-brand-dark">{student.writingScore || 0}%</td>
                      <td className="p-4 text-center font-bold text-brand-dark">{student.speakingScore || 0}%</td>
                      <td className="p-4 text-center font-bold text-brand-dark">{student.listeningScore || 0}%</td>
                      <td className="p-4 text-center">
                        <span className="font-heading text-lg text-brand-info">{student.overallScore || 0}%</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="text-xs font-bold uppercase tracking-wider bg-brand-yellow text-brand-dark px-2.5 py-1 rounded-md">
                          {student.cefrLevel || 'N/A'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-muted-foreground font-medium">
                      No students found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          
          <div className="flex items-center justify-between pt-4 border-t border-border/40 text-xs font-medium text-muted-foreground">
            <p>Showing {filteredStudents.length} of {dbStudents.length} students</p>
            <p>Exporting will download the currently filtered list.</p>
          </div>
        </div>
      </motion.div>
    </MainLayout>
  );
}

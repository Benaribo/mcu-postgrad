import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  FileText, 
  Plus, 
  Search, 
  ChevronRight, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Download,
  Printer,
  X,
  Edit,
  Trash2,
  GraduationCap
} from 'lucide-react';

/**
 * CONFIGURATION & CONSTANTS
 * Defines the academic structure and logic.
 */
const PROGRAM_STRUCTURE = {
  PGD: {
    label: "Post Graduate Diploma (PGD)",
    stages: [
      { id: 'final', label: 'Final Project Defense' }
    ]
  },
  MSc: {
    label: "Master of Science (MSc)",
    stages: [
      { id: 'predata', label: 'Pre-Data Seminar' },
      { id: 'postdata', label: 'Post-Data Seminar' }
    ]
  },
  MPhil: {
    label: "Master of Philosophy (MPhil)",
    stages: [
      { id: 'predata', label: 'Pre-Data Seminar' },
      { id: 'postdata', label: 'Post-Data Seminar' }
    ]
  },
  PhD: {
    label: "Doctor of Philosophy (PhD)",
    stages: [
      { id: 'proposal', label: 'Proposal Defense' },
      { id: 'predata', label: 'Pre-Data Seminar' },
      { id: 'postdata', label: 'Post-Data Seminar' },
      { id: 'viva', label: 'Viva Voce' }
    ]
  }
};

const INITIAL_STUDENTS = [
  {
    id: '1',
    name: 'John Doe',
    regNumber: 'PG/2023/001',
    program: 'PhD',
    supervisor: 'Dr. A. Smith',
    status: 'Active',
    joinedDate: '2023-01-15',
    progress: {
      proposal: { status: 'completed', date: '2023-06-10', score: 'A', remarks: 'Excellent work' },
      predata: { status: 'scheduled', date: '2024-03-20', venue: 'Hall 3' }
    }
  },
  {
    id: '2',
    name: 'Jane Ubong',
    regNumber: 'PG/2024/055',
    program: 'MSc',
    supervisor: 'Prof. B. Johnson',
    status: 'Active',
    joinedDate: '2024-02-01',
    progress: {}
  }
];

/**
 * HELPER FUNCTIONS
 */
const generateId = () => Math.random().toString(36).substr(2, 9);

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleDateString('en-GB', {
    day: 'numeric', month: 'short', year: 'numeric'
  });
};

const calculateProgress = (student) => {
  const structure = PROGRAM_STRUCTURE[student.program];
  if (!structure) return 0;
  const totalStages = structure.stages.length;
  const completedStages = structure.stages.filter(stage => 
    student.progress[stage.id]?.status === 'completed'
  ).length;
  return Math.round((completedStages / totalStages) * 100);
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  // State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('pg_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  
  // Modal States
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  // Selection States
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  
  // Form States
  const [studentForm, setStudentForm] = useState({
    name: '', regNumber: '', program: 'PhD', supervisor: '', joinedDate: ''
  });
  
  const [scheduleForm, setScheduleForm] = useState({
    date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: ''
  });

  const [searchTerm, setSearchTerm] = useState('');

  // Persistence
  useEffect(() => {
    localStorage.setItem('pg_students', JSON.stringify(students));
  }, [students]);

  // Derived Data
  const filteredStudents = useMemo(() => {
    return students.filter(s => 
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      s.regNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [students, searchTerm]);

  const stats = useMemo(() => {
    return {
      total: students.length,
      phd: students.filter(s => s.program === 'PhD').length,
      msc: students.filter(s => s.program === 'MSc').length,
      active: students.filter(s => s.status === 'Active').length,
      upcoming: students.reduce((acc, curr) => {
        const hasUpcoming = Object.values(curr.progress).some(p => p.status === 'scheduled');
        return hasUpcoming ? acc + 1 : acc;
      }, 0)
    };
  }, [students]);

  // Actions
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (selectedStudent) {
      // Edit mode
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...studentForm } : s));
    } else {
      // Add mode
      setStudents(prev => [...prev, { ...studentForm, id: generateId(), progress: {}, status: 'Active' }]);
    }
    setIsStudentModalOpen(false);
    resetForms();
  };

  const handleDeleteStudent = (id) => {
    if (confirm('Are you sure you want to delete this student record?')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleScheduleSave = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedStageId) return;

    const updatedStudents = students.map(s => {
      if (s.id === selectedStudent.id) {
        return {
          ...s,
          progress: {
            ...s.progress,
            [selectedStageId]: { ...scheduleForm }
          }
        };
      }
      return s;
    });

    setStudents(updatedStudents);
    setIsScheduleModalOpen(false);
    resetForms();
  };

  const resetForms = () => {
    setStudentForm({ name: '', regNumber: '', program: 'PhD', supervisor: '', joinedDate: '' });
    setScheduleForm({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '' });
    setSelectedStudent(null);
    setSelectedStageId(null);
  };

  const openScheduleModal = (student, stageId) => {
    setSelectedStudent(student);
    setSelectedStageId(stageId);
    const existingData = student.progress[stageId];
    if (existingData) {
      setScheduleForm(existingData);
    } else {
      setScheduleForm({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '' });
    }
    setIsScheduleModalOpen(true);
  };

  const openStudentModal = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setStudentForm({
        name: student.name,
        regNumber: student.regNumber,
        program: student.program,
        supervisor: student.supervisor,
        joinedDate: student.joinedDate
      });
    } else {
      resetForms();
    }
    setIsStudentModalOpen(true);
  };

  // Export Functions
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Reg Number,Program,Supervisor,Status,Progress %\n";
    
    filteredStudents.forEach(s => {
      const row = `${s.name},${s.regNumber},${s.program},${s.supervisor},${s.status},${calculateProgress(s)}%`;
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "postgrad_students_report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => {
    window.print();
  };

  // --- VIEWS ---

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students', val: stats.total, icon: Users, color: 'bg-indigo-600' },
          { label: 'PhD Candidates', val: stats.phd, icon: GraduationCap, color: 'bg-purple-600' },
          { label: 'MSc/MPhil', val: stats.msc, icon: FileText, color: 'bg-emerald-600' },
          { label: 'Upcoming Events', val: stats.upcoming, icon: Calendar, color: 'bg-amber-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-800 mt-1">{stat.val}</h3>
            </div>
            <div className={`p-3 rounded-lg ${stat.color} text-white shadow-lg shadow-${stat.color}/30`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-gray-800">Recent Activity & Status</h2>
          <button onClick={() => setActiveTab('students')} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">View All</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Student</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Program</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Progress</th>
                <th className="px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Supervisor</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {students.slice(0, 5).map(s => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-600 mr-3">
                        {s.name.charAt(0)}
                      </div>
                      <div>
                        <div className="text-sm font-medium text-gray-900">{s.name}</div>
                        <div className="text-xs text-gray-500">{s.regNumber}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.program}</td>
                  <td className="px-6 py-4">
                    <div className="w-full bg-gray-200 rounded-full h-2 max-w-[100px]">
                      <div className="bg-indigo-600 h-2 rounded-full" style={{ width: `${calculateProgress(s)}%` }}></div>
                    </div>
                    <span className="text-xs text-gray-500 mt-1 block">{calculateProgress(s)}% Complete</span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.supervisor}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const StudentsView = () => (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Search students..." 
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <button 
          onClick={() => openStudentModal()}
          className="w-full sm:w-auto flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <Plus size={18} className="mr-2" /> Add Student
        </button>
      </div>

      <div className="grid gap-4">
        {filteredStudents.map(student => (
          <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
            <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center gap-4">
                <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-sm
                  ${student.program === 'PhD' ? 'bg-purple-600' : 'bg-indigo-600'}`}>
                  {student.program}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                  <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                    <span className="flex items-center"><FileText size={14} className="mr-1"/> {student.regNumber}</span>
                    <span className="hidden sm:inline">•</span>
                    <span className="flex items-center"><Users size={14} className="mr-1"/> {student.supervisor}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 w-full sm:w-auto">
                <button onClick={() => openStudentModal(student)} className="flex-1 sm:flex-none px-3 py-2 text-sm font-medium text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-lg border border-gray-200">
                  Edit
                </button>
                <button onClick={() => handleDeleteStudent(student.id)} className="px-3 py-2 text-sm text-red-600 bg-red-50 hover:bg-red-100 rounded-lg border border-red-200">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            <div className="p-4 sm:p-6 bg-gray-50/50">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Presentation Track</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {PROGRAM_STRUCTURE[student.program].stages.map((stage) => {
                  const data = student.progress[stage.id];
                  return (
                    <div 
                      key={stage.id} 
                      onClick={() => openScheduleModal(student, stage.id)}
                      className={`relative p-3 rounded-lg border cursor-pointer transition-all group
                        ${data?.status === 'completed' ? 'bg-white border-green-200 hover:border-green-300' : 
                          data?.status === 'scheduled' ? 'bg-white border-blue-200 hover:border-blue-300' : 
                          'bg-gray-50 border-gray-200 border-dashed hover:border-gray-300 hover:bg-white'}`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-semibold text-gray-700 truncate max-w-[80%]">{stage.label}</span>
                        {data?.status === 'completed' && <CheckCircle size={14} className="text-green-500" />}
                        {data?.status === 'scheduled' && <Clock size={14} className="text-blue-500" />}
                        {!data && <Plus size={14} className="text-gray-400 group-hover:text-indigo-500" />}
                      </div>
                      
                      {data ? (
                        <div className="text-xs">
                          {data.status === 'scheduled' && (
                            <div className="text-blue-600 font-medium">{formatDate(data.date)}</div>
                          )}
                          {data.status === 'completed' && (
                            <div className="text-green-600 font-medium">Done: {formatDate(data.date)}</div>
                          )}
                          <div className="text-gray-400 mt-1 truncate">{data.venue || 'No venue'}</div>
                        </div>
                      ) : (
                        <div className="text-xs text-gray-400 italic py-1">Click to schedule</div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        ))}

        {filteredStudents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No students found</h3>
            <p className="text-gray-500">Try adjusting your search or add a new student.</p>
          </div>
        )}
      </div>
    </div>
  );

  const ReportView = () => (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-4 no-print">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Generate Reports</h2>
          <p className="text-gray-500">Export student data and presentation schedules for the PG College.</p>
        </div>
        <div className="flex gap-3">
          <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm">
            <Download size={18} className="mr-2" /> Export Excel (CSV)
          </button>
          <button onClick={triggerPrint} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition-colors shadow-sm">
            <Printer size={18} className="mr-2" /> Print / Save PDF
          </button>
        </div>
      </div>

      <div id="printable-area" className="bg-white p-8 shadow-sm border border-gray-200 rounded-xl">
        <div className="text-center mb-8 border-b border-gray-200 pb-6">
          <h1 className="text-3xl font-bold text-gray-900 uppercase tracking-wide">McPherson University</h1>
          <h2 className="text-xl font-bold text-indigo-900 uppercase mt-2">College of Computing</h2>
          <div className="w-24 h-1 bg-indigo-900 mx-auto my-4"></div>
          <h3 className="text-lg text-gray-600 font-medium uppercase tracking-widest">Postgraduate Student Progress Report</h3>
          <p className="text-sm text-gray-400 mt-2">Generated on {new Date().toLocaleDateString()}</p>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b-2 border-gray-800">
                <th className="py-3 px-2 font-bold uppercase">Reg. Number</th>
                <th className="py-3 px-2 font-bold uppercase">Name</th>
                <th className="py-3 px-2 font-bold uppercase">Program</th>
                <th className="py-3 px-2 font-bold uppercase">Supervisor</th>
                <th className="py-3 px-2 font-bold uppercase">Status</th>
                <th className="py-3 px-2 font-bold uppercase text-right">Progress</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredStudents.map((s) => (
                <React.Fragment key={s.id}>
                  <tr className="bg-gray-50/50">
                    <td className="py-3 px-2 font-medium">{s.regNumber}</td>
                    <td className="py-3 px-2 font-bold">{s.name}</td>
                    <td className="py-3 px-2">{s.program}</td>
                    <td className="py-3 px-2">{s.supervisor}</td>
                    <td className="py-3 px-2"><span className="px-2 py-1 bg-gray-200 rounded text-xs">{s.status}</span></td>
                    <td className="py-3 px-2 text-right font-bold">{calculateProgress(s)}%</td>
                  </tr>
                  {/* Detailed Progress Row for Print */}
                  <tr className="print:table-row hidden">
                    <td colSpan="6" className="py-2 px-4 pb-4">
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                        {PROGRAM_STRUCTURE[s.program].stages.map(stage => {
                          const p = s.progress[stage.id];
                          return (
                            <div key={stage.id} className="border p-1 rounded">
                              <strong>{stage.label}:</strong> {p ? `${p.status.toUpperCase()} (${formatDate(p.date)})` : 'Pending'}
                            </div>
                          )
                        })}
                      </div>
                    </td>
                  </tr>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-12 pt-8 border-t border-gray-200 flex justify-between text-sm text-gray-500">
          <div>Dean, College of Computing</div>
          <div>PG Coordinator</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      {/* CSS for Printing */}
      <style>{`
        @media print {
          /* HIDE EVERYTHING by default using common classes */
          .no-print, aside, nav, .sidebar, .banner, header { 
            display: none !important; 
          }
          
          /* Reset layout containers */
          body, main, .min-h-screen { 
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            width: 100% !important;
            height: auto !important;
            overflow: visible !important;
          }

          /* Specifically target the main container to reset margins */
          main { 
            margin-left: 0 !important; 
          }

          /* Ensure the report is visible and styled for A4 */
          #printable-area {
            display: block !important;
            width: 100% !important;
            position: static !important;
            box-shadow: none !important;
            border: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          /* Force colors to print */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          
          /* Show table details row */
          .print\\:table-row {
            display: table-row !important;
          }
        }
      `}</style>

      {/* Sidebar - Mobile Responsive */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 md:translate-x-0 -translate-x-full no-print">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg">
              <GraduationCap className="text-white" size={24} />
            </div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">McU Postgrad</h1>
          </div>
          
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
              { id: 'students', icon: Users, label: 'Students' },
              { id: 'reports', icon: FileText, label: 'Reports' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <item.icon size={20} className="mr-3" />
                {item.label}
              </button>
            ))}
          </nav>

          <div className="p-4 border-t border-gray-100">
            <div className="bg-indigo-900 rounded-xl p-4 text-white">
              <p className="text-xs text-indigo-200 uppercase font-semibold mb-1">Current User</p>
              <p className="font-medium truncate">Admin User</p>
              <p className="text-xs text-indigo-300">PG Coordinator</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="md:ml-64 min-h-screen transition-all">
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-200 no-print">
          <div className="font-bold text-lg">McU Postgrad</div>
          {/* Simple toggle placeholder */}
          <button className="p-2 bg-gray-100 rounded">Menu</button>
        </div>

        {/* Custom Banner */}
        <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white px-8 py-8 no-print shadow-md banner">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner">
               <GraduationCap size={40} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">McPherson University</h1>
              <p className="text-indigo-100 font-medium text-lg mt-1 opacity-90">College of Computing — Postgraduate Management Portal</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'reports' && <ReportView />}
        </div>
      </main>

      {/* Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Reg Number</label>
                  <input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={studentForm.program} onChange={e => setStudentForm({...studentForm, program: e.target.value})}>
                    {Object.keys(PROGRAM_STRUCTURE).map(key => (
                      <option key={key} value={key}>{key}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label>
                  <input type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={studentForm.joinedDate} onChange={e => setStudentForm({...studentForm, joinedDate: e.target.value})} />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                <input required type="text" placeholder="e.g. Prof. X. Y. Z" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                  value={studentForm.supervisor} onChange={e => setStudentForm({...studentForm, supervisor: e.target.value})} />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div>
                <h3 className="text-lg font-bold text-gray-900">Manage Presentation</h3>
                <p className="text-sm text-gray-500">
                  {PROGRAM_STRUCTURE[selectedStudent.program].stages.find(s => s.id === selectedStageId)?.label}
                </p>
              </div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleScheduleSave} className="p-6 space-y-4">
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white"
                    value={scheduleForm.status} onChange={e => setScheduleForm({...scheduleForm, status: e.target.value})}>
                    <option value="scheduled">Scheduled</option>
                    <option value="completed">Completed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Venue</label>
                  <input type="text" placeholder="e.g. Hall 3" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={scheduleForm.venue} onChange={e => setScheduleForm({...scheduleForm, venue: e.target.value})} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                  <input required type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                  <input type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" 
                    value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} />
                </div>
              </div>

              {scheduleForm.status === 'completed' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Score / Grade</label>
                    <input type="text" className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white" 
                      value={scheduleForm.score} onChange={e => setScheduleForm({...scheduleForm, score: e.target.value})} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-green-800 mb-1">Remarks</label>
                    <textarea rows="2" className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white" 
                      value={scheduleForm.remarks} onChange={e => setScheduleForm({...scheduleForm, remarks: e.target.value})}></textarea>
                  </div>
                </div>
              )}

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">
                  {scheduleForm.status === 'scheduled' ? 'Book Schedule' : 'Update Record'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
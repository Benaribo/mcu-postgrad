import React, { useState, useEffect, useMemo, useRef } from 'react';
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
  GraduationCap,
  Globe,
  Mail,
  Settings,
  Save,
  Upload,
  ExternalLink,
  Bell,
  Link,
  BarChart2,
  PieChart,
  Filter,
  UserCheck,
  Clock3,
  Archive,
  UserPlus
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
    ],
    color: 'bg-emerald-500'
  },
  MSc: {
    label: "Master of Science (MSc)",
    stages: [
      { id: 'predata', label: 'Pre-Data Seminar' },
      { id: 'postdata', label: 'Post-Data Seminar' }
    ],
    color: 'bg-blue-500'
  },
  MPhil: {
    label: "Master of Philosophy (MPhil)",
    stages: [
      { id: 'predata', label: 'Pre-Data Seminar' },
      { id: 'postdata', label: 'Post-Data Seminar' }
    ],
    color: 'bg-cyan-500'
  },
  PhD: {
    label: "Doctor of Philosophy (PhD)",
    stages: [
      { id: 'proposal', label: 'Proposal Defense' },
      { id: 'predata', label: 'Pre-Data Seminar' },
      { id: 'postdata', label: 'Post-Data Seminar' },
      { id: 'viva', label: 'Viva Voce' }
    ],
    color: 'bg-purple-600'
  }
};

const INITIAL_STUDENTS = [
  {
    id: '1',
    name: 'John Doe',
    regNumber: 'PG/2023/001',
    email: 'john.doe@university.edu.ng',
    program: 'PhD',
    supervisor: 'Dr. A. Smith',
    coSupervisor: 'Prof. K. Mensah',
    status: 'Active',
    joinedDate: '2023-01-15',
    progress: {
      proposal: { status: 'completed', date: '2023-06-10', score: 'A', remarks: 'Excellent work', docLink: 'https://google.com' },
      predata: { status: 'scheduled', date: '2024-03-20', venue: 'Hall 3' }
    }
  },
  {
    id: '2',
    name: 'Jane Ubong',
    regNumber: 'PG/2024/055',
    email: 'jane.ubong@university.edu.ng',
    program: 'MSc',
    supervisor: 'Prof. B. Johnson',
    coSupervisor: '',
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

const getDuration = (dateString) => {
  if (!dateString) return '';
  const start = new Date(dateString);
  const now = new Date();
  const diffTime = Math.abs(now - start);
  const years = (diffTime / (1000 * 60 * 60 * 24 * 365)).toFixed(1);
  return `${years} yrs`;
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

// --- CUSTOM MINI CHART COMPONENTS (Zero Dependency) ---
const SimpleBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end h-32 gap-2 w-full pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group">
          <div className="relative w-full flex justify-center">
            <span className="absolute -top-6 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">
              {d.value}
            </span>
            <div 
              className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:opacity-80 ${d.color || color}`}
              style={{ height: `${(d.value / max) * 100}px` }}
            ></div>
          </div>
          <span className="text-[10px] text-gray-500 mt-2 font-medium truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

const SimpleDonutChart = ({ data }) => {
  let currentAngle = 0;
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  const segments = data.map(d => {
    const start = currentAngle;
    const degree = (d.value / total) * 360;
    currentAngle += degree;
    return `${d.color} ${start}deg ${currentAngle}deg`;
  });

  return (
    <div className="relative w-32 h-32 rounded-full mx-auto" style={{ background: `conic-gradient(${segments.join(', ')})` }}>
      <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col">
        <span className="text-xl font-bold text-gray-800">{total}</span>
        <span className="text-[10px] text-gray-400 uppercase">Students</span>
      </div>
    </div>
  );
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [students, setStudents] = useState(() => {
    const saved = localStorage.getItem('pg_students');
    return saved ? JSON.parse(saved) : INITIAL_STUDENTS;
  });
  
  const [selectedSupervisor, setSelectedSupervisor] = useState('All Supervisors');
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  
  const [studentForm, setStudentForm] = useState({
    name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: ''
  });
  
  const [scheduleForm, setScheduleForm] = useState({
    date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: ''
  });

  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  useEffect(() => {
    localStorage.setItem('pg_students', JSON.stringify(students));
  }, [students]);

  const uniqueSupervisors = useMemo(() => {
    const sups = new Set();
    students.forEach(s => {
      // Safe trim to prevent crashes on bad data
      if(s.supervisor) sups.add(String(s.supervisor).trim());
      if(s.coSupervisor) sups.add(String(s.coSupervisor).trim());
    });
    return ['All Supervisors', ...Array.from(sups).sort()];
  }, [students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            s.regNumber.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSupervisor = selectedSupervisor === 'All Supervisors' || 
                                (s.supervisor && String(s.supervisor).trim() === selectedSupervisor) || 
                                (s.coSupervisor && String(s.coSupervisor).trim() === selectedSupervisor);
      return matchesSearch && matchesSupervisor;
    });
  }, [students, searchTerm, selectedSupervisor]);

  // Derived subsets for views
  const activeStudents = useMemo(() => filteredStudents.filter(s => s.status !== 'Alumni'), [filteredStudents]);
  const alumniStudents = useMemo(() => filteredStudents.filter(s => s.status === 'Alumni'), [filteredStudents]);

  const stats = useMemo(() => {
    // Stats primarily focus on ACTIVE students
    const sourceData = students.filter(s => s.status !== 'Alumni'); 
    return {
      total: sourceData.length,
      phd: sourceData.filter(s => s.program === 'PhD').length,
      msc: sourceData.filter(s => s.program === 'MSc').length,
      alumni: students.filter(s => s.status === 'Alumni').length,
      upcoming: sourceData.reduce((acc, curr) => {
        const hasUpcoming = Object.values(curr.progress).some(p => p.status === 'scheduled');
        return hasUpcoming ? acc + 1 : acc;
      }, 0)
    };
  }, [students]);

  const analyticsData = useMemo(() => {
    const source = activeStudents;
    const programs = ['PhD', 'MSc', 'MPhil', 'PGD'].map(prog => ({
      label: prog,
      value: source.filter(s => s.program === prog).length,
      color: PROGRAM_STRUCTURE[prog]?.color?.replace('bg-', '') || 'gray-400' 
    })).filter(d => d.value > 0);
    const colorMap = { 'PhD': '#9333ea', 'MSc': '#3b82f6', 'MPhil': '#06b6d4', 'PGD': '#10b981' };
    const donutData = programs.map(p => ({ ...p, color: colorMap[p.label] || '#ccc' }));

    const stages = [
      { id: 'proposal', label: 'Proposal' },
      { id: 'predata', label: 'Pre-Data' },
      { id: 'postdata', label: 'Post-Data' },
      { id: 'viva', label: 'Viva Voce' }
    ];
    const pipelineData = stages.map(stage => {
      const count = source.filter(s => s.progress[stage.id]?.status === 'completed').length;
      return { label: stage.label, value: count, color: 'bg-indigo-500' };
    });
    return { donutData, pipelineData };
  }, [activeStudents]);

  // Actions
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (selectedStudent && selectedStudent.id) {
      // Edit mode logic
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...studentForm } : s));
    } else {
      // Add mode logic
      setStudents(prev => [...prev, { ...studentForm, id: generateId(), progress: {}, status: 'Active' }]);
    }
    setIsStudentModalOpen(false);
    resetForms();
  };

  const handleDeleteStudent = (id) => {
    if (confirm('Are you sure you want to delete this student record? This cannot be undone.')) {
      setStudents(prev => prev.filter(s => s.id !== id));
    }
  };

  const handleGraduate = (student) => {
    if(confirm(`Are you sure you want to graduate ${student.name}? They will be moved to the Alumni archive.`)) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'Alumni', graduationDate: new Date().toISOString().split('T')[0] } : s));
      setIsScheduleModalOpen(false);
      alert(`${student.name} has been successfully graduated!`);
    }
  };

  const handlePromote = (alumnus) => {
    // Open add modal pre-filled with alumni details but clean program data
    setSelectedStudent(null); // Clear selected student ID to treat as NEW entry
    setStudentForm({
      name: alumnus.name,
      regNumber: '', // Likely needs new reg number
      email: alumnus.email,
      program: 'MSc', // Default next step recommendation?
      supervisor: '',
      coSupervisor: '',
      joinedDate: new Date().toISOString().split('T')[0]
    });
    setIsStudentModalOpen(true);
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

  // Data Management Actions
  const handleExportData = () => {
    const dataStr = JSON.stringify(students, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `mcu_postgrad_backup_${new Date().toISOString().slice(0,10)}.json`;
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const handleImportClick = () => fileInputRef.current?.click();
  
  const handleImportFile = (event) => {
    const fileObj = event.target.files && event.target.files[0];
    if (!fileObj) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target.result);
        if (Array.isArray(json)) {
          if(confirm(`Overwrite data with ${json.length} records?`)) {
            setStudents(json);
            alert('Restored successfully!');
          }
        } else { alert('Invalid file format.'); }
      } catch (error) { alert('Error parsing file.'); }
    };
    reader.readAsText(fileObj);
    event.target.value = null;
  };

  // CSV Bulk Import Logic
  const handleDownloadTemplate = () => {
    const headers = "Full Name,Reg Number,Email,Program (PhD/MSc/MPhil/PGD),Supervisor,Co-Supervisor,Joined Date (YYYY-MM-DD)\n";
    const example = "Jane Doe,PG/2024/001,jane@test.com,PhD,Dr. A. Smith,Prof. B. Jones,2023-01-15";
    const content = "data:text/csv;charset=utf-8," + encodeURIComponent(headers + example);
    const link = document.createElement("a");
    link.setAttribute("href", content);
    link.setAttribute("download", "student_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCSVUploadClick = () => csvInputRef.current?.click();

  const handleBulkCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target.result;
      const lines = text.split('\n');
      const newStudents = [];
      
      for(let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        const parts = line.split(','); 
        if(parts.length < 4) continue; 

        const [name, regNumber, email, program, supervisor, coSupervisor, joinedDate] = parts;
        const cleanProgram = program?.trim();
        if (!PROGRAM_STRUCTURE[cleanProgram]) continue; 

        newStudents.push({
          id: generateId(),
          name: name?.trim(),
          regNumber: regNumber?.trim(),
          email: email?.trim(),
          program: cleanProgram,
          supervisor: supervisor?.trim(),
          coSupervisor: coSupervisor?.trim(),
          joinedDate: joinedDate?.trim(),
          status: 'Active',
          progress: {}
        });
      }

      if(newStudents.length > 0) {
        if(confirm(`Found ${newStudents.length} valid students. Import them?`)) {
          setStudents(prev => [...prev, ...newStudents]);
          alert('Import successful!');
        }
      } else {
        alert('No valid students found in CSV. Please check the template format.');
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  // --- External Integrations ---
  const handleAddToCalendar = () => {
    if (!scheduleForm.date || !selectedStudent) return;
    const stageLabel = PROGRAM_STRUCTURE[selectedStudent.program].stages.find(s => s.id === selectedStageId)?.label;
    const title = `${stageLabel}: ${selectedStudent.name} (${selectedStudent.regNumber})`;
    const details = `Student: ${selectedStudent.name}\nProgram: ${selectedStudent.program}\nSupervisor: ${selectedStudent.supervisor}\nCo-Supervisor: ${selectedStudent.coSupervisor || 'N/A'}`;
    const location = scheduleForm.venue || 'TBA';
    const startDate = new Date(`${scheduleForm.date}T${scheduleForm.time || '09:00'}`);
    const endDate = new Date(startDate.getTime() + 60*60*1000);
    const formatGCalDate = (date) => date.toISOString().replace(/-|:|\.\d\d\d/g, "");
    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatGCalDate(startDate)}/${formatGCalDate(endDate)}&details=${encodeURIComponent(details)}&location=${encodeURIComponent(location)}`;
    window.open(url, '_blank');
  };

  const handleSendEmail = () => {
    if (!selectedStudent) return;
    const stageLabel = PROGRAM_STRUCTURE[selectedStudent.program].stages.find(s => s.id === selectedStageId)?.label;
    const subject = `Presentation Scheduled: ${selectedStudent.name} - ${stageLabel}`;
    const supervisors = [selectedStudent.supervisor, selectedStudent.coSupervisor].filter(Boolean).join(" and ");
    const body = `Dear ${supervisors},\n\nThis is to notify you that the ${stageLabel} for ${selectedStudent.name} (${selectedStudent.regNumber}) has been scheduled.\n\nDate: ${formatDate(scheduleForm.date)}\nTime: ${scheduleForm.time || 'TBA'}\nVenue: ${scheduleForm.venue || 'TBA'}\n\nPlease ensure your availability.\n\nBest regards,\nPG Coordinator`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleNotifyStudent = () => {
    if (!selectedStudent) return;
    if (!selectedStudent.email) {
      alert("Please update the student record with an email address first.");
      return;
    }
    const stageLabel = PROGRAM_STRUCTURE[selectedStudent.program].stages.find(s => s.id === selectedStageId)?.label;
    const subject = `Upcoming Presentation: ${stageLabel}`;
    const body = `Dear ${selectedStudent.name},\n\nYou have been scheduled for your ${stageLabel}.\n\nDate: ${formatDate(scheduleForm.date)}\nTime: ${scheduleForm.time || 'TBA'}\nVenue: ${scheduleForm.venue || 'TBA'}\n\nPlease arrive 30 minutes early.\n\nBest regards,\nPG College`;
    window.location.href = `mailto:${selectedStudent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const resetForms = () => {
    setStudentForm({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' });
    setScheduleForm({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' });
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
      setScheduleForm({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' });
    }
    setIsScheduleModalOpen(true);
  };

  const openStudentModal = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setStudentForm({
        name: student.name,
        regNumber: student.regNumber,
        email: student.email || '',
        program: student.program,
        supervisor: student.supervisor,
        coSupervisor: student.coSupervisor || '', 
        joinedDate: student.joinedDate
      });
    } else {
      resetForms();
    }
    setIsStudentModalOpen(true);
  };

  const exportToCSV = () => {
    // Export ALL students or filtered view? Let's use filtered view which might include Alumni if tab is Alumni
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Name,Reg Number,Email,Program,Supervisor,Co-Supervisor,Status,Progress %\n";
    // Depending on tab, filteredStudents is either Active or Alumni
    const listToExport = activeTab === 'alumni' ? alumniStudents : activeStudents;
    
    listToExport.forEach(s => {
      const row = `${s.name},${s.regNumber},${s.email || ''},${s.program},${s.supervisor},${s.coSupervisor || ''},${s.status},${calculateProgress(s)}%`;
      csvContent += row + "\n";
    });
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mcu_students_${activeTab}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const triggerPrint = () => window.print();

  const SupervisorFilter = () => (
    <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
      <Filter size={16} className="text-gray-400" />
      <select 
        value={selectedSupervisor}
        onChange={(e) => setSelectedSupervisor(e.target.value)}
        className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer w-full sm:w-auto"
      >
        {uniqueSupervisors.map(sup => (
          <option key={sup} value={sup}>{sup}</option>
        ))}
      </select>
    </div>
  );

  // --- VIEWS ---

  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-800">Overview</h2>
        <SupervisorFilter />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Active Students', val: stats.total, icon: Users, color: 'bg-indigo-600' },
          { label: 'PhD Candidates', val: stats.phd, icon: GraduationCap, color: 'bg-purple-600' },
          { label: 'Total Alumni', val: stats.alumni, icon: Archive, color: 'bg-gray-600' },
          { label: 'Upcoming Events', val: stats.upcoming, icon: Calendar, color: 'bg-amber-600' },
        ].map((stat, idx) => (
          <div key={idx} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col items-center">
          <div className="flex items-center gap-2 self-start mb-6">
            <PieChart size={18} className="text-indigo-600" />
            <h3 className="font-bold text-gray-800">Program Distribution</h3>
          </div>
          {analyticsData.donutData.length > 0 ? (
            <SimpleDonutChart data={analyticsData.donutData} />
          ) : (
            <div className="h-32 flex items-center text-gray-400 text-sm">No data available</div>
          )}
          <div className="flex flex-wrap gap-3 justify-center mt-6">
            {analyticsData.donutData.map((d, i) => (
              <div key={i} className="flex items-center text-xs text-gray-600">
                <span className="w-2 h-2 rounded-full mr-1" style={{ backgroundColor: d.color }}></span>
                {d.label}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          <div className="flex items-center gap-2 mb-2">
            <BarChart2 size={18} className="text-indigo-600" />
            <h3 className="font-bold text-gray-800">Academic Pipeline (Completions)</h3>
          </div>
          <p className="text-sm text-gray-500 mb-4">Number of students who have completed each stage.</p>
          <div className="bg-gray-50 rounded-lg p-4">
            <SimpleBarChart data={analyticsData.pipelineData} color="bg-indigo-500" />
          </div>
        </div>
      </div>
    </div>
  );

  const StudentsView = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="flex flex-1 gap-4 w-full">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input 
              type="text" 
              placeholder="Search active students..." 
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="hidden md:block">
            <SupervisorFilter />
          </div>
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <button 
            onClick={() => openStudentModal()}
            className="flex-shrink-0 flex items-center justify-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} className="mr-2" /> <span className="hidden sm:inline">Add Student</span><span className="sm:hidden">Add</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {activeStudents.map(student => {
          const programConfig = PROGRAM_STRUCTURE[student.program] || { stages: [], color: 'bg-gray-500' };
          return (
            <div key={student.id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-4 sm:p-6 border-b border-gray-50 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-lg font-bold text-white shadow-sm
                    ${programConfig.color}`}>
                    {student.program}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">{student.name}</h3>
                    <div className="flex flex-wrap gap-2 text-sm text-gray-500">
                      <span className="flex items-center"><FileText size={14} className="mr-1"/> {student.regNumber}</span>
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center">
                        <Users size={14} className="mr-1"/> 
                        {student.supervisor}
                        {student.coSupervisor && <span className="text-gray-400 ml-1 text-xs"> (& {student.coSupervisor})</span>}
                      </span>
                      {/* Duration Badge */}
                      <span className="hidden sm:inline">•</span>
                      <span className="flex items-center text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full text-xs font-medium">
                        <Clock3 size={12} className="mr-1"/> 
                        {getDuration(student.joinedDate)}
                      </span>
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
                  {programConfig.stages.map((stage) => {
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

                        {data?.docLink && (
                          <a 
                            href={data.docLink} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            onClick={(e) => e.stopPropagation()}
                            className="absolute top-2 right-8 text-indigo-500 hover:bg-indigo-50 p-1 rounded-full transition-colors"
                            title="Open Linked Document"
                          >
                            <Link size={14} />
                          </a>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          );
        })}

        {activeStudents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Users size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No active students found</h3>
            <p className="text-gray-500">Try adjusting your filters or search.</p>
          </div>
        )}
      </div>
    </div>
  );

  const AlumniView = () => (
    <div className="space-y-4">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
        <h2 className="text-xl font-bold text-gray-800">Alumni Archive</h2>
        <p className="text-gray-500">View graduated students or promote them to new programs.</p>
      </div>

      <div className="grid gap-4">
        {alumniStudents.map(student => (
          <div key={student.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4 mb-4 md:mb-0">
              <div className="h-12 w-12 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600">
                <GraduationCap size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  {student.name}
                  <span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Alumni</span>
                </h3>
                <div className="text-sm text-gray-500">
                  {student.program} • {student.regNumber} • Graduated: {formatDate(student.graduationDate)}
                </div>
              </div>
            </div>
            
            <button 
              onClick={() => handlePromote(student)}
              className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all font-medium flex items-center shadow-sm"
            >
              <UserPlus size={18} className="mr-2" /> Start New Program
            </button>
          </div>
        ))}

        {alumniStudents.length === 0 && (
          <div className="text-center py-12 bg-gray-50 rounded-xl border border-dashed border-gray-200">
            <Archive size={48} className="mx-auto text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No Alumni Records</h3>
            <p className="text-gray-500">Students marked as "Graduated" will appear here.</p>
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
          <p className="text-gray-500">Export student data. Use the filter below to refine the report.</p>
          <div className="mt-4">
             <SupervisorFilter />
          </div>
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
          
          {selectedSupervisor !== 'All Supervisors' && (
             <p className="text-sm font-bold text-indigo-700 mt-2 bg-indigo-50 inline-block px-3 py-1 rounded-full border border-indigo-100">
               Supervisor: {selectedSupervisor}
             </p>
          )}
          
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
                    <td className="py-3 px-2">
                      <div>{s.supervisor}</div>
                      {s.coSupervisor && <div className="text-xs text-gray-500">Co: {s.coSupervisor}</div>}
                    </td>
                    <td className="py-3 px-2"><span className="px-2 py-1 bg-gray-200 rounded text-xs">{s.status}</span></td>
                    <td className="py-3 px-2 text-right font-bold">{calculateProgress(s)}%</td>
                  </tr>
                  {/* Detailed Progress Row for Print */}
                  <tr className="print:table-row hidden">
                    <td colSpan="6" className="py-2 px-4 pb-4">
                      <div className="grid grid-cols-4 gap-2 text-xs text-gray-500">
                        {/* SAFE ACCESS to stages */}
                        {(PROGRAM_STRUCTURE[s.program]?.stages || []).map(stage => {
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
              {filteredStudents.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-8 text-gray-400">No students found.</td>
                </tr>
              )}
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

  const SettingsView = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800 mb-2">System Settings & Data Management</h2>
        <p className="text-gray-500">Manage your application data locally. Ensure you backup regularly.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Backup Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
              <Save size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Backup Data</h3>
            <p className="text-gray-500 text-sm mb-6">
              Download a complete copy of your student database as a JSON file. 
              Save this file to your computer or cloud storage to prevent data loss.
            </p>
          </div>
          <button 
            onClick={handleExportData}
            className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium flex items-center justify-center gap-2"
          >
            <Download size={18} /> Download Backup
          </button>
        </div>

        {/* Restore Card */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-amber-50 rounded-lg flex items-center justify-center text-amber-600 mb-4">
              <Upload size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Restore Data</h3>
            <p className="text-gray-500 text-sm mb-6">
              Upload a previously saved backup file to restore your student records.
              <span className="block mt-2 text-red-500 font-medium text-xs bg-red-50 p-2 rounded">
                Warning: This will overwrite your current data.
              </span>
            </p>
          </div>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleImportFile} 
            accept=".json" 
            className="hidden" 
          />
          <button 
            onClick={handleImportClick}
            className="w-full py-3 bg-white border-2 border-gray-200 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Upload size={18} /> Restore from File
          </button>
        </div>

        {/* Bulk Import Card - Changed icon from FileSpreadsheet to FileText to fix crash */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between h-full">
          <div>
            <div className="w-12 h-12 bg-emerald-50 rounded-lg flex items-center justify-center text-emerald-600 mb-4">
              <FileText size={24} />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Bulk Import (CSV)</h3>
            <p className="text-gray-500 text-sm mb-6">
              Import multiple students from an Excel/CSV file. 
              <span className="text-emerald-600 cursor-pointer underline ml-1" onClick={handleDownloadTemplate}>Download Template</span>
            </p>
          </div>
          <input type="file" ref={csvInputRef} onChange={handleBulkCSVUpload} accept=".csv" className="hidden" />
          <button 
            onClick={handleCSVUploadClick}
            className="w-full py-3 bg-white border-2 border-emerald-200 text-emerald-700 rounded-lg hover:bg-emerald-50 transition-all font-medium flex items-center justify-center gap-2"
          >
            <Upload size={18} /> Import Students
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <style>{`
        @media print {
          .no-print, aside, nav, .sidebar, .banner, header, footer { display: none !important; }
          body, main, .min-h-screen { background: white !important; margin: 0 !important; padding: 0 !important; width: 100% !important; overflow: visible !important; }
          main { margin-left: 0 !important; }
          #printable-area { display: block !important; width: 100% !important; position: static !important; box-shadow: none !important; border: none !important; padding: 0 !important; margin: 0 !important; }
          * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
          .print\\:table-row { display: table-row !important; }
        }
      `}</style>

      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 md:translate-x-0 -translate-x-full no-print">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><GraduationCap className="text-white" size={24} /></div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">McU Postgrad</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            {[
              { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' }, 
              { id: 'students', icon: Users, label: 'Students' }, 
              { id: 'alumni', icon: Archive, label: 'Alumni / History' },
              { id: 'reports', icon: FileText, label: 'Reports' }, 
              { id: 'settings', icon: Settings, label: 'Settings' }
            ].map((item) => (
              <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all duration-200 ${activeTab === item.id ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                <item.icon size={20} className="mr-3" />{item.label}
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
      <main className="md:ml-64 min-h-screen transition-all flex flex-col">
        <div className="md:hidden bg-white p-4 flex items-center justify-between border-b border-gray-200 no-print">
          <div className="font-bold text-lg">McU Postgrad</div><button className="p-2 bg-gray-100 rounded">Menu</button>
        </div>
        <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white px-8 py-8 no-print shadow-md banner">
          <div className="flex items-center gap-5">
            <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner"><GraduationCap size={40} className="text-white" /></div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-white">McPherson University</h1>
              <p className="text-indigo-100 font-medium text-lg mt-1 opacity-90">College of Computing — Postgraduate Management Portal</p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'alumni' && <AlumniView />}
          {activeTab === 'reports' && <ReportView />}
          {activeTab === 'settings' && <SettingsView />}
        </div>

        <footer className="bg-white border-t border-gray-200 mt-auto no-print">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="text-sm text-gray-500 text-center md:text-left">
              <p className="font-medium text-gray-700">McPherson University</p>
              <p>&copy; {new Date().getFullYear()} College of Computing. All rights reserved.</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-gray-400"><GraduationCap size={14} /><span>Postgraduate Management Portal</span></div>
          </div>
        </footer>
      </main>

      {/* Modals are kept same as before */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <h3 className="text-lg font-bold text-gray-900">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3>
              <button onClick={() => setIsStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              {/* Form fields same as previous version */}
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reg Number</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Program</label>
                  <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={studentForm.program} onChange={e => setStudentForm({...studentForm, program: e.target.value})}>
                    {Object.keys(PROGRAM_STRUCTURE).map(key => (<option key={key} value={key}>{key}</option>))}
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label><input type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.joinedDate} onChange={e => setStudentForm({...studentForm, joinedDate: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email <span className="text-gray-400 font-normal">(Required for notifications)</span></label><input type="email" placeholder="student@university.edu.ng" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label><input required type="text" placeholder="e.g. Prof. X. Y. Z" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.supervisor} onChange={e => setStudentForm({...studentForm, supervisor: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Co-Supervisor <span className="text-gray-400 font-normal">(Optional)</span></label><input type="text" placeholder="e.g. Dr. A. B. C" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.coSupervisor} onChange={e => setStudentForm({...studentForm, coSupervisor: e.target.value})} /></div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Student</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal - Same logic as before */}
      {isScheduleModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
              <div><h3 className="text-lg font-bold text-gray-900">Manage Presentation</h3><p className="text-sm text-gray-500">{PROGRAM_STRUCTURE[selectedStudent.program].stages.find(s => s.id === selectedStageId)?.label}</p></div>
              <button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleScheduleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={scheduleForm.status} onChange={e => setScheduleForm({...scheduleForm, status: e.target.value})}>
                    <option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue</label><input type="text" placeholder="e.g. Hall 3" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.venue} onChange={e => setScheduleForm({...scheduleForm, venue: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input required type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} /></div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Link (Google Drive / Dropbox)</label>
                <div className="relative"><div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Link size={16} className="text-gray-400" /></div><input type="url" placeholder="https://docs.google.com/..." className="w-full pl-10 p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.docLink} onChange={e => setScheduleForm({...scheduleForm, docLink: e.target.value})} /></div>
              </div>
              {scheduleForm.status === 'scheduled' && scheduleForm.date && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 animate-in fade-in">
                  <h4 className="text-xs font-bold text-blue-800 uppercase tracking-wider mb-2 flex items-center gap-2"><Bell size={14} /> Communication & Scheduling</h4>
                  <div className="flex gap-2 flex-wrap">
                    <button type="button" onClick={handleAddToCalendar} className="flex-1 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"><ExternalLink size={14} /> Add to Calendar</button>
                    <button type="button" onClick={handleSendEmail} className="flex-1 py-2 bg-white border border-blue-200 text-blue-700 rounded-lg hover:bg-blue-50 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap"><Mail size={14} /> Notify Supervisor</button>
                    <button type="button" onClick={handleNotifyStudent} className="flex-1 py-2 bg-indigo-600 border border-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm font-medium flex items-center justify-center gap-2 transition-colors whitespace-nowrap shadow-sm"><UserCheck size={14} /> Notify Student</button>
                  </div>
                </div>
              )}
              {scheduleForm.status === 'completed' && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-3 animate-in fade-in">
                  <div><label className="block text-sm font-medium text-green-800 mb-1">Score / Grade</label><input type="text" className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white" value={scheduleForm.score} onChange={e => setScheduleForm({...scheduleForm, score: e.target.value})} /></div>
                  <div><label className="block text-sm font-medium text-green-800 mb-1">Remarks</label><textarea rows="2" className="w-full p-2 border border-green-200 rounded-lg focus:ring-2 focus:ring-green-500 outline-none bg-white" value={scheduleForm.remarks} onChange={e => setScheduleForm({...scheduleForm, remarks: e.target.value})}></textarea></div>
                </div>
              )}
              <div className="pt-4 flex justify-between gap-3">
                {/* Graduate Button - Only show for final stage of program if completed */}
                {selectedStudent && 
                 selectedStageId === PROGRAM_STRUCTURE[selectedStudent.program].stages[PROGRAM_STRUCTURE[selectedStudent.program].stages.length - 1].id &&
                 scheduleForm.status === 'completed' ? (
                   <button type="button" onClick={() => handleGraduate(selectedStudent)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-medium flex items-center shadow-sm">
                     <GraduationCap size={18} className="mr-2" /> Graduate Student
                   </button>
                 ) : <div></div>}
                
                <div className="flex gap-3">
                  <button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button>
                  <button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">{scheduleForm.status === 'scheduled' ? 'Book Schedule' : 'Update Record'}</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
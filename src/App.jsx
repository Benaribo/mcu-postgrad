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
  UserPlus,
  ArrowLeft,
  AlertTriangle,
  Lock,
  LogOut,
  Key,
  Shield,
  Briefcase
} from 'lucide-react';

/**
 * CONFIGURATION & CONSTANTS
 */
const PROGRAM_STRUCTURE = {
  PGD: { label: "Post Graduate Diploma (PGD)", stages: [{ id: 'final', label: 'Final Project Defense' }], color: 'bg-emerald-500', maxMonths: 18 },
  MSc: { label: "Master of Science (MSc)", stages: [{ id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }], color: 'bg-blue-500', maxMonths: 24 },
  MPhil: { label: "Master of Philosophy (MPhil)", stages: [{ id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }], color: 'bg-cyan-500', maxMonths: 24 },
  PhD: { label: "Doctor of Philosophy (PhD)", stages: [{ id: 'proposal', label: 'Proposal Defense' }, { id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }, { id: 'viva', label: 'Viva Voce' }], color: 'bg-purple-600', maxMonths: 48 }
};

const INITIAL_STUDENTS = [
  { id: '1', name: 'John Doe', regNumber: 'PG/2023/001', email: 'john.doe@university.edu.ng', program: 'PhD', supervisor: 'Dr. A. Smith', coSupervisor: 'Prof. K. Mensah', status: 'Active', joinedDate: '2023-01-15', progress: { proposal: { status: 'completed', date: '2023-06-10', score: 'A', remarks: 'Excellent work', docLink: 'https://google.com' }, predata: { status: 'scheduled', date: '2024-03-20', venue: 'Hall 3' } } },
  { id: '2', name: 'Jane Ubong', regNumber: 'PG/2024/055', email: 'jane.ubong@university.edu.ng', program: 'MSc', supervisor: 'Prof. B. Johnson', coSupervisor: '', status: 'Active', joinedDate: '2024-02-01', progress: {} }
];

const INITIAL_STAFF = [
  { id: 's1', name: 'Dr. A. Smith', email: 'a.smith@mcu.edu.ng', department: 'Computer Science', password: 'staff' },
  { id: 's2', name: 'Prof. B. Johnson', email: 'b.johnson@mcu.edu.ng', department: 'Computer Science', password: 'staff' }
];

/**
 * HELPER FUNCTIONS
 */
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (dateString) => dateString ? new Date(dateString).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '-';
const getDuration = (dateString) => {
  if (!dateString) return '';
  const diffTime = Math.abs(new Date() - new Date(dateString));
  return `${(diffTime / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} yrs`;
};
const getDurationStats = (dateString, program) => {
  if (!dateString) return { text: '', status: 'neutral' };
  const diffMonths = (new Date().getFullYear() - new Date(dateString).getFullYear()) * 12 + (new Date().getMonth() - new Date(dateString).getMonth());
  const limit = PROGRAM_STRUCTURE[program]?.maxMonths || 24;
  let status = 'good';
  if (diffMonths > limit) status = 'critical';
  else if (diffMonths > limit - 6) status = 'warning';
  return { text: `${(diffMonths / 12).toFixed(1)} yrs`, status, rawMonths: diffMonths };
};
const calculateProgress = (student) => {
  const structure = PROGRAM_STRUCTURE[student.program];
  if (!structure) return 0;
  const completed = structure.stages.filter(stage => student.progress[stage.id]?.status === 'completed').length;
  return Math.round((completed / structure.stages.length) * 100);
};

// --- CUSTOM MINI CHART COMPONENTS ---
const SimpleBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end h-32 gap-2 w-full pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group">
          <div className="relative w-full flex justify-center">
            <span className="absolute -top-6 text-xs font-bold text-gray-600 opacity-0 group-hover:opacity-100 transition-opacity">{d.value}</span>
            <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:opacity-80 ${d.color || color}`} style={{ height: `${(d.value / max) * 100}px` }}></div>
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
      <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col"><span className="text-xl font-bold text-gray-800">{total}</span><span className="text-[10px] text-gray-400 uppercase">Students</span></div>
    </div>
  );
};

// --- LOGIN COMPONENT ---
const LoginView = ({ onLogin, verifyCredentials }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = verifyCredentials(username, password);
    if (user) {
      onLogin(user);
    } else {
      setError('Invalid credentials.');
    }
  };

  // Add this reset function
  const handleReset = () => {
    if (confirm('This will reset the Admin password to default (password123). Your student data will remain safe. Continue?')) {
      localStorage.removeItem('pg_auth_config');
      window.location.reload();
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-900 to-purple-800 p-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm"><GraduationCap size={32} className="text-white" /></div>
          <h1 className="text-2xl font-bold text-white tracking-wide">McPherson University</h1>
          <p className="text-indigo-200 text-sm mt-1">Postgraduate Management Portal</p>
        </div>
        <div className="p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-6 text-center">Secure Access</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label><input type="text" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none transition-all" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center"><AlertCircle size={16} className="mr-2" /> {error}</div>}
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold transition-all shadow-md hover:shadow-lg mt-2">Login</button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400 space-y-1">
            <p><strong>Admin Default:</strong> admin / password123</p>
            <p><strong>Staff Default:</strong> [email] / staff</p>
            <button onClick={handleReset} type="button" className="text-indigo-400 hover:text-indigo-600 underline mt-4">Reset Admin Credentials</button>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN COMPONENT
 */
export default function App() {
  // Global State
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(sessionStorage.getItem('pg_current_user')) || null);
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('pg_students')) || INITIAL_STUDENTS);
  const [staff, setStaff] = useState(() => JSON.parse(localStorage.getItem('pg_staff')) || INITIAL_STAFF);
  
  // UI State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSupervisor, setSelectedSupervisor] = useState('All Supervisors');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  
  // Modal & Edit State
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false); // New
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null); // New
  const [reportStudent, setReportStudent] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  
  // Forms
  const [studentForm, setStudentForm] = useState({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', department: 'Computer Science', password: 'staff' }); // New
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' });
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('pg_auth_config')) || { username: 'admin', password: 'password123' });
  const [newPassword, setNewPassword] = useState('');

  // Refs & Search
  const [searchTerm, setSearchTerm] = useState('');
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  // Persistence
  useEffect(() => { localStorage.setItem('pg_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('pg_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { sessionStorage.setItem('pg_current_user', JSON.stringify(currentUser)); }, [currentUser]);

  // Auth Functions
  const verifyCredentials = (username, password) => {
    // 1. Check Admin
    if (username === adminConfig.username && password === adminConfig.password) {
      return { name: 'Administrator', role: 'admin', username: 'admin' };
    }
    // 2. Check Staff
    const foundStaff = staff.find(s => s.email.toLowerCase() === username.toLowerCase() && s.password === password);
    if (foundStaff) {
      return { name: foundStaff.name, role: 'staff', email: foundStaff.email, id: foundStaff.id };
    }
    return null;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setActiveTab('dashboard');
    sessionStorage.removeItem('pg_current_user');
  };

  const handleUpdateAdminPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 4) { alert("Password too short."); return; }
    const newConfig = { ...adminConfig, password: newPassword };
    setAdminConfig(newConfig);
    localStorage.setItem('pg_auth_config', JSON.stringify(newConfig));
    setNewPassword('');
    alert("Admin password updated successfully!");
  };

  // Derived Data
  const uniqueSupervisors = useMemo(() => {
    const sups = new Set(staff.map(s => s.name)); // Source from Staff list now
    return ['All Supervisors', ...Array.from(sups).sort()];
  }, [staff]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      // 1. Search Filter
      const matchesSearch = s.name.toLowerCase().includes(searchTerm.toLowerCase()) || s.regNumber.toLowerCase().includes(searchTerm.toLowerCase());
      
      // 2. Role-Based Filter (Security)
      let matchesRole = true;
      if (currentUser?.role === 'staff') {
        // Staff can only see students they supervise
        matchesRole = s.supervisor === currentUser.name || s.coSupervisor === currentUser.name;
      } else {
        // Admin matches dropdown selection
        matchesRole = selectedSupervisor === 'All Supervisors' || (s.supervisor && s.supervisor.trim() === selectedSupervisor) || (s.coSupervisor && s.coSupervisor.trim() === selectedSupervisor);
      }

      const matchesProgram = selectedProgram === 'All Programs' || s.program === selectedProgram;
      
      return matchesSearch && matchesRole && matchesProgram;
    });
  }, [students, searchTerm, selectedSupervisor, selectedProgram, currentUser]);

  const activeStudents = useMemo(() => filteredStudents.filter(s => s.status !== 'Alumni'), [filteredStudents]);
  const alumniStudents = useMemo(() => filteredStudents.filter(s => s.status === 'Alumni'), [filteredStudents]);

  const stats = useMemo(() => {
    const sourceData = students.filter(s => s.status !== 'Alumni'); 
    return {
      total: sourceData.length,
      phd: sourceData.filter(s => s.program === 'PhD').length,
      msc: sourceData.filter(s => s.program === 'MSc').length,
      alumni: students.filter(s => s.status === 'Alumni').length,
      delayed: sourceData.filter(s => getDurationStats(s.joinedDate, s.program).status === 'critical').length,
      upcoming: sourceData.reduce((acc, curr) => {
        return acc + Object.values(curr.progress).filter(p => p.status === 'scheduled').length;
      }, 0)
    };
  }, [students]);

  // Analytics (Same as before)
  const analyticsData = useMemo(() => {
    const source = activeStudents;
    const programs = ['PhD', 'MSc', 'MPhil', 'PGD'].map(prog => ({
      label: prog,
      value: source.filter(s => s.program === prog).length,
      color: PROGRAM_STRUCTURE[prog]?.color?.replace('bg-', '') || 'gray-400' 
    })).filter(d => d.value > 0);
    const colorMap = { 'PhD': '#9333ea', 'MSc': '#3b82f6', 'MPhil': '#06b6d4', 'PGD': '#10b981' };
    const donutData = programs.map(p => ({ ...p, color: colorMap[p.label] || '#ccc' }));
    const stages = [{ id: 'proposal', label: 'Proposal' }, { id: 'predata', label: 'Pre-Data' }, { id: 'postdata', label: 'Post-Data' }, { id: 'viva', label: 'Viva Voce' }];
    const pipelineData = stages.map(stage => {
      const count = source.filter(s => s.progress[stage.id]?.status === 'completed').length;
      return { label: stage.label, value: count, color: 'bg-indigo-500' };
    });
    return { donutData, pipelineData };
  }, [activeStudents]);

  // --- CRUD ACTIONS ---
  
  // Student CRUD
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!selectedStudent && students.some(s => s.regNumber === studentForm.regNumber.trim())) {
      alert('Error: Registration Number already exists.'); return;
    }
    if (selectedStudent && selectedStudent.id) {
      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...studentForm } : s));
    } else {
      setStudents(prev => [...prev, { ...studentForm, id: generateId(), progress: {}, status: 'Active' }]);
    }
    setIsStudentModalOpen(false);
  };

  const handleDeleteStudent = (id) => {
    if (confirm('Delete student record? This cannot be undone.')) setStudents(prev => prev.filter(s => s.id !== id));
  };

  // Staff CRUD
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (selectedStaff) {
      setStaff(prev => prev.map(s => s.id === selectedStaff.id ? { ...s, ...staffForm } : s));
    } else {
      setStaff(prev => [...prev, { ...staffForm, id: generateId() }]);
    }
    setIsStaffModalOpen(false);
  };

  const handleDeleteStaff = (id) => {
    if (confirm('Delete staff member?')) setStaff(prev => prev.filter(s => s.id !== id));
  };

  const openStaffModal = (staffMember = null) => {
    if (staffMember) {
      setSelectedStaff(staffMember);
      setStaffForm(staffMember);
    } else {
      setSelectedStaff(null);
      setStaffForm({ name: '', email: '', department: 'Computer Science', password: 'staff' });
    }
    setIsStaffModalOpen(true);
  };

  // Workflow Actions
  const handleGraduate = (student) => {
    if(confirm(`Graduate ${student.name}?`)) {
      setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'Alumni', graduationDate: new Date().toISOString().split('T')[0] } : s));
      setIsScheduleModalOpen(false);
    }
  };

  const handlePromote = (alumnus) => {
    setSelectedStudent(null); 
    setStudentForm({ name: alumnus.name, regNumber: '', email: alumnus.email, program: 'MSc', supervisor: '', coSupervisor: '', joinedDate: new Date().toISOString().split('T')[0] });
    setIsStudentModalOpen(true);
  };

  const handleScheduleSave = (e) => {
    e.preventDefault();
    if (!selectedStudent || !selectedStageId) return;
    const updatedStudents = students.map(s => s.id === selectedStudent.id ? { ...s, progress: { ...s.progress, [selectedStageId]: { ...scheduleForm } } } : s);
    setStudents(updatedStudents);
    setIsScheduleModalOpen(false);
  };

  // Modal Openers
  const openStudentModal = (student = null) => {
    if (student) {
      setSelectedStudent(student);
      setStudentForm(student);
    } else {
      setSelectedStudent(null);
      setStudentForm({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' });
    }
    setIsStudentModalOpen(true);
  };

  const openScheduleModal = (student, stageId) => {
    setSelectedStudent(student);
    setSelectedStageId(stageId);
    const existing = student.progress[stageId] || { date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' };
    setScheduleForm(existing);
    setIsScheduleModalOpen(true);
  };

  const handleOpenIndividualReport = (student) => { setReportStudent(student); setActiveTab('individual_report'); };

  // Utilities
  const handleExportData = () => {
    const dataStr = JSON.stringify({ students, staff }, null, 2);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    link.download = `mcu_postgrad_full_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };

  const handleImportClick = () => fileInputRef.current?.click();
  const handleImportFile = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = evt.target.result ? JSON.parse(evt.target.result) : null;
        if (json && (json.students || Array.isArray(json))) {
          if(confirm('Overwrite current data?')) {
            if (json.students) { setStudents(json.students); if(json.staff) setStaff(json.staff); }
            else { setStudents(json); }
            alert('Restored successfully!');
          }
        }
      } catch (err) { alert('Error parsing file.'); }
    };
    if (e.target.files[0]) reader.readAsText(e.target.files[0]);
    e.target.value = null;
  };

  const FiltersBar = () => (
    <div className="flex flex-col sm:flex-row gap-2">
      {currentUser?.role === 'admin' && (
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
          <Filter size={16} className="text-gray-400" />
          <select value={selectedSupervisor} onChange={(e) => setSelectedSupervisor(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer w-full sm:w-auto">
            {uniqueSupervisors.map(sup => (<option key={sup} value={sup}>{sup}</option>))}
          </select>
        </div>
      )}
      <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200 shadow-sm">
        <GraduationCap size={16} className="text-gray-400" />
        <select value={selectedProgram} onChange={(e) => setSelectedProgram(e.target.value)} className="bg-transparent text-sm text-gray-700 outline-none cursor-pointer w-full sm:w-auto">
          <option value="All Programs">All Programs</option>
          {Object.keys(PROGRAM_STRUCTURE).map(prog => (<option key={prog} value={prog}>{prog}</option>))}
        </select>
      </div>
    </div>
  );

  // --- VIEWS ---

  if (!currentUser) return <LoginView onLogin={setCurrentUser} verifyCredentials={verifyCredentials} />;

  const StaffView = () => (
    <div className="space-y-4 animate-in fade-in">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <div><h2 className="text-xl font-bold text-gray-800">Staff Management</h2><p className="text-gray-500">Manage supervisors and their login credentials.</p></div>
        <button onClick={() => openStaffModal()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"><Plus size={18} className="mr-2" /> Add Staff</button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {staff.map(s => (
          <div key={s.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center font-bold text-lg">{s.name.charAt(0)}</div>
              <div>
                <h3 className="font-bold text-gray-900">{s.name}</h3>
                <p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12}/> {s.email}</p>
                <p className="text-xs text-gray-400 mt-1">{s.department}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => openStaffModal(s)} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"><Edit size={16} /></button>
              <button onClick={() => handleDeleteStaff(s.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  // Simplified views referencing components above...
  // (Reusing DashboardView, StudentsView logic but checking currentUser.role)

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <style>{`@media print { .no-print, aside, nav, .sidebar { display: none !important; } body, main { margin: 0 !important; width: 100% !important; } }`}</style>
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 transform transition-transform duration-300 md:translate-x-0 -translate-x-full no-print">
        <div className="h-full flex flex-col">
          <div className="p-6 border-b border-gray-100 flex items-center gap-3">
            <div className="bg-indigo-600 p-2 rounded-lg"><GraduationCap className="text-white" size={24} /></div>
            <h1 className="text-xl font-bold text-gray-900 tracking-tight">McU Postgrad</h1>
          </div>
          <nav className="flex-1 p-4 space-y-2">
            <button onClick={() => setActiveTab('dashboard')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><LayoutDashboard size={20} className="mr-3" /> Dashboard</button>
            <button onClick={() => setActiveTab('students')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'students' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><Users size={20} className="mr-3" /> Students</button>
            {currentUser.role === 'admin' && (
              <>
                <button onClick={() => setActiveTab('staff')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'staff' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><Briefcase size={20} className="mr-3" /> Staff</button>
                <button onClick={() => setActiveTab('alumni')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'alumni' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><Archive size={20} className="mr-3" /> Alumni</button>
                <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'reports' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><FileText size={20} className="mr-3" /> Reports</button>
                <button onClick={() => setActiveTab('settings')} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><Settings size={20} className="mr-3" /> Settings</button>
              </>
            )}
          </nav>
          <div className="p-4 border-t border-gray-100">
            <button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors mb-4 font-medium text-sm"><LogOut size={16} className="mr-2" /> Sign Out</button>
            <div className="bg-indigo-900 rounded-xl p-4 text-white">
              <p className="text-xs text-indigo-200 uppercase font-semibold mb-1">Current User</p>
              <p className="font-medium truncate">{currentUser.name}</p>
              <p className="text-xs text-indigo-300 capitalize">{currentUser.role}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="md:ml-64 min-h-screen transition-all flex flex-col">
        {activeTab !== 'individual_report' && (
          <div className="bg-gradient-to-r from-indigo-900 to-purple-800 text-white px-8 py-8 no-print shadow-md banner">
            <div className="flex items-center gap-5">
              <div className="bg-white/10 p-4 rounded-xl backdrop-blur-sm border border-white/20 shadow-inner"><GraduationCap size={40} className="text-white" /></div>
              <div><h1 className="text-3xl font-bold tracking-tight text-white">McPherson University</h1><p className="text-indigo-100 font-medium text-lg mt-1 opacity-90">College of Computing — Postgraduate Management Portal</p></div>
            </div>
          </div>
        )}

        <div className="p-4 sm:p-8 max-w-7xl mx-auto w-full flex-1">
          {activeTab === 'dashboard' && <DashboardView />}
          {activeTab === 'students' && <StudentsView />}
          {activeTab === 'staff' && <StaffView />}
          {activeTab === 'alumni' && <AlumniView />}
          {activeTab === 'reports' && <ReportView />}
          {activeTab === 'settings' && <SettingsView />}
          {activeTab === 'individual_report' && <IndividualReportView />}
        </div>
      </main>

      {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="text-lg font-bold text-gray-900">{selectedStaff ? 'Edit Staff' : 'Add New Staff'}</h3><button onClick={() => setIsStaffModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleAddStaff} className="p-6 space-y-4">
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email (Username)</label><input required type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Department</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} /></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Login Password</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} /></div>
              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Staff</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Student Modal (Updated Supervisor Dropdown) */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><h3 className="text-lg font-bold text-gray-900">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3><button onClick={() => setIsStudentModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleAddStudent} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} /></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Reg Number</label><input required type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Program</label><select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={studentForm.program} onChange={e => setStudentForm({...studentForm, program: e.target.value})}>{Object.keys(PROGRAM_STRUCTURE).map(key => (<option key={key} value={key}>{key}</option>))}</select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Joined Date</label><input type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.joinedDate} onChange={e => setStudentForm({...studentForm, joinedDate: e.target.value})} /></div>
              </div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Email</label><input type="email" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} /></div>
              
              {/* Dynamic Supervisor Dropdowns from Staff List */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Supervisor</label>
                  <select required className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={studentForm.supervisor} onChange={e => setStudentForm({...studentForm, supervisor: e.target.value})}>
                    <option value="">Select Supervisor...</option>
                    {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Co-Supervisor</label>
                  <select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={studentForm.coSupervisor} onChange={e => setStudentForm({...studentForm, coSupervisor: e.target.value})}>
                    <option value="">Select Co-Supervisor...</option>
                    {staff.map(s => <option key={s.id} value={s.name}>{s.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="pt-4 flex justify-end gap-3"><button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium">Save Student</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal (Same as before) */}
      {isScheduleModalOpen && selectedStudent && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm no-print">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50"><div><h3 className="text-lg font-bold text-gray-900">Manage Presentation</h3><p className="text-sm text-gray-500">{PROGRAM_STRUCTURE[selectedStudent.program].stages.find(s => s.id === selectedStageId)?.label}</p></div><button onClick={() => setIsScheduleModalOpen(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button></div>
            <form onSubmit={handleScheduleSave} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Status</label><select className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={scheduleForm.status} onChange={e => setScheduleForm({...scheduleForm, status: e.target.value})}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>
                <div><label className="block text-sm font-medium text-gray-700 mb-1">Venue</label><input type="text" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.venue} onChange={e => setScheduleForm({...scheduleForm, venue: e.target.value})} /></div>
              </div>
              <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm font-medium text-gray-700 mb-1">Date</label><input required type="date" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} /></div><div><label className="block text-sm font-medium text-gray-700 mb-1">Time</label><input type="time" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} /></div></div>
              <div><label className="block text-sm font-medium text-gray-700 mb-1">Document Link</label><input type="url" className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={scheduleForm.docLink} onChange={e => setScheduleForm({...scheduleForm, docLink: e.target.value})} /></div>
              {scheduleForm.status === 'completed' && <div className="bg-green-50 p-4 rounded-lg border border-green-100 space-y-3"><div><label className="block text-sm font-medium text-green-800 mb-1">Score</label><input type="text" className="w-full p-2 border border-green-200 rounded-lg bg-white" value={scheduleForm.score} onChange={e => setScheduleForm({...scheduleForm, score: e.target.value})} /></div><div><label className="block text-sm font-medium text-green-800 mb-1">Remarks</label><textarea rows="2" className="w-full p-2 border border-green-200 rounded-lg bg-white" value={scheduleForm.remarks} onChange={e => setScheduleForm({...scheduleForm, remarks: e.target.value})}></textarea></div></div>}
              <div className="pt-4 flex justify-between gap-3">
                {selectedStudent && selectedStageId === PROGRAM_STRUCTURE[selectedStudent.program].stages[PROGRAM_STRUCTURE[selectedStudent.program].stages.length - 1].id && scheduleForm.status === 'completed' ? <button type="button" onClick={() => handleGraduate(selectedStudent)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg flex items-center"><GraduationCap size={18} className="mr-2" /> Graduate</button> : <div></div>}
                <div className="flex gap-3"><button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg">Cancel</button><button type="submit" className="px-6 py-2 bg-indigo-600 text-white rounded-lg">{scheduleForm.status === 'scheduled' ? 'Book Schedule' : 'Update Record'}</button></div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
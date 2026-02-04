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
  Shield
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

const DEFAULT_STRUCTURE = { label: "Unknown Program", stages: [], color: 'bg-gray-500', maxMonths: 24 };

const INITIAL_STUDENTS = [
  { id: '1', name: 'John Doe', regNumber: 'PG/2023/001', email: 'john.doe@university.edu.ng', program: 'PhD', supervisor: 'Dr. A. Smith', coSupervisor: 'Prof. K. Mensah', status: 'Active', joinedDate: '2023-01-15', progress: { proposal: { status: 'completed', date: '2023-06-10', score: 'A', remarks: 'Excellent work', docLink: 'https://google.com' }, predata: { status: 'scheduled', date: '2024-03-20', venue: 'Hall 3' } } },
  { id: '2', name: 'Jane Ubong', regNumber: 'PG/2024/055', email: 'jane.ubong@university.edu.ng', program: 'MSc', supervisor: 'Prof. B. Johnson', coSupervisor: '', status: 'Active', joinedDate: '2024-02-01', progress: {} }
];

const INITIAL_STAFF = [
  { id: 's1', name: 'Dr. A. Smith', email: 'a.smith@mcu.edu.ng', department: 'Computer Science', password: 'staff' },
  { id: 's2', name: 'Prof. B. Johnson', email: 'b.johnson@mcu.edu.ng', department: 'Computer Science', password: 'staff' }
];

/**
 * HELPER FUNCTIONS (Safe Versions)
 */
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (dateString) => {
  if (!dateString) return '-';
  try {
    const d = new Date(dateString);
    return isNaN(d.getTime()) ? '-' : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
  } catch (e) { return '-'; }
};
const getDuration = (dateString) => {
  if (!dateString) return '';
  try {
    const diff = Math.abs(new Date() - new Date(dateString));
    return isNaN(diff) ? '' : `${(diff / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} yrs`;
  } catch(e) { return ''; }
};
const getDurationStats = (dateString, program) => {
  if (!dateString) return { text: '', status: 'neutral' };
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return { text: '', status: 'neutral' };
    const diffMonths = (new Date().getFullYear() - d.getFullYear()) * 12 + (new Date().getMonth() - d.getMonth());
    const limit = (PROGRAM_STRUCTURE[program] || DEFAULT_STRUCTURE).maxMonths;
    let status = 'good';
    if (diffMonths > limit) status = 'critical';
    else if (diffMonths > limit - 6) status = 'warning';
    return { text: `${(diffMonths / 12).toFixed(1)} yrs`, status, rawMonths: diffMonths };
  } catch(e) { return { text: '', status: 'neutral' }; }
};
const calculateProgress = (student) => {
  if (!student) return 0;
  const struct = PROGRAM_STRUCTURE[student.program] || DEFAULT_STRUCTURE;
  if (!struct.stages.length) return 0;
  const completed = struct.stages.filter(s => (student.progress || {})[s.id]?.status === 'completed').length;
  return Math.round((completed / struct.stages.length) * 100);
};

// --- CHART COMPONENTS ---
const SimpleBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1) || 1;
  return (
    <div className="flex items-end h-32 gap-2 w-full pt-4">
      {data.map((d, i) => (
        <div key={i} className="flex-1 flex flex-col items-center group">
          <div className="relative w-full flex justify-center">
            <div className={`w-full max-w-[40px] rounded-t-md transition-all duration-500 hover:opacity-80 ${d.color || color}`} style={{ height: `${(d.value / max) * 100}px`, minHeight: '4px' }}></div>
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

// --- LOGIN VIEW ---
const LoginView = ({ onLogin, verifyCredentials }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    const user = verifyCredentials(username, password);
    if (user) onLogin(user);
    else setError('Invalid credentials.');
  };

  const handleReset = () => {
    if (confirm('Reset Admin password to default (password123)? Data remains safe.')) {
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
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Username / Email</label><input type="text" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={username} onChange={(e) => setUsername(e.target.value)} /></div>
            <div><label className="block text-sm font-medium text-gray-700 mb-1">Password</label><input type="password" required className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none" value={password} onChange={(e) => setPassword(e.target.value)} /></div>
            {error && <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-center"><AlertCircle size={16} className="mr-2" /> {error}</div>}
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-bold shadow-md mt-2">Login</button>
          </form>
          <div className="mt-6 text-center text-xs text-gray-400 space-y-1"><p><strong>Admin Default:</strong> admin / password123</p><button onClick={handleReset} type="button" className="text-indigo-400 hover:text-indigo-600 underline mt-4">Reset Admin Credentials</button></div>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(sessionStorage.getItem('pg_current_user')) || null);
  const [students, setStudents] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pg_students'));
      return Array.isArray(saved) ? saved.filter(s => s && s.id) : INITIAL_STUDENTS;
    } catch { return INITIAL_STUDENTS; }
  });
  const [staff, setStaff] = useState(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('pg_staff'));
      return Array.isArray(saved) ? saved.filter(s => s && s.name) : INITIAL_STAFF;
    } catch { return INITIAL_STAFF; }
  });
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSupervisor, setSelectedSupervisor] = useState('All Supervisors');
  const [selectedProgram, setSelectedProgram] = useState('All Programs');
  
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState(null);
  const [reportStudent, setReportStudent] = useState(null);
  const [selectedStageId, setSelectedStageId] = useState(null);
  
  const [studentForm, setStudentForm] = useState({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' });
  const [staffForm, setStaffForm] = useState({ name: '', email: '', department: 'Computer Science', password: 'staff' });
  const [scheduleForm, setScheduleForm] = useState({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' });
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('pg_auth_config')) || { username: 'admin', password: 'password123' });
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('pg_students', JSON.stringify(students)); }, [students]);
  useEffect(() => { localStorage.setItem('pg_staff', JSON.stringify(staff)); }, [staff]);
  useEffect(() => { sessionStorage.setItem('pg_current_user', JSON.stringify(currentUser)); }, [currentUser]);

  // --- LOGIC ---
  const verifyCredentials = (u, p) => {
    if (u === adminConfig.username && p === adminConfig.password) return { name: 'Administrator', role: 'admin' };
    const s = staff.find(st => st.email.toLowerCase() === u.toLowerCase() && st.password === p);
    if (s) return { name: s.name, role: 'staff', email: s.email };
    return null;
  };

  const handleLogout = () => { setCurrentUser(null); setActiveTab('dashboard'); sessionStorage.removeItem('pg_current_user'); };

  const handleUpdateAdminPassword = (e) => {
    e.preventDefault();
    if (newPassword.length < 4) { alert("Password too short"); return; }
    const nc = { ...adminConfig, password: newPassword };
    setAdminConfig(nc);
    localStorage.setItem('pg_auth_config', JSON.stringify(nc));
    setNewPassword('');
    alert("Updated!");
  };

  const uniqueSupervisors = useMemo(() => {
    const sups = new Set();
    staff.forEach(s => s && s.name && sups.add(s.name.trim()));
    students.forEach(s => { 
      if(s && s.supervisor) sups.add(s.supervisor.trim()); 
      if(s && s.coSupervisor) sups.add(s.coSupervisor.trim()); 
    });
    return ['All Supervisors', ...Array.from(sups).sort()];
  }, [staff, students]);

  const filteredStudents = useMemo(() => {
    return students.filter(s => {
      if (!s) return false;
      const search = (s.name || '').toLowerCase().includes(searchTerm.toLowerCase()) || (s.regNumber || '').toLowerCase().includes(searchTerm.toLowerCase());
      let role = true;
      if (currentUser?.role === 'staff') role = s.supervisor === currentUser.name || s.coSupervisor === currentUser.name;
      else role = selectedSupervisor === 'All Supervisors' || (s.supervisor === selectedSupervisor) || (s.coSupervisor === selectedSupervisor);
      const prog = selectedProgram === 'All Programs' || s.program === selectedProgram;
      return search && role && prog;
    });
  }, [students, searchTerm, selectedSupervisor, selectedProgram, currentUser]);

  const activeStudents = useMemo(() => filteredStudents.filter(s => s.status !== 'Alumni'), [filteredStudents]);
  const alumniStudents = useMemo(() => filteredStudents.filter(s => s.status === 'Alumni'), [filteredStudents]);

  const stats = useMemo(() => {
    const active = students.filter(s => s && s.status !== 'Alumni');
    return {
      total: active.length,
      phd: active.filter(s => s.program === 'PhD').length,
      msc: active.filter(s => s.program === 'MSc').length,
      alumni: students.filter(s => s && s.status === 'Alumni').length,
      delayed: active.filter(s => getDurationStats(s.joinedDate, s.program).status === 'critical').length,
      upcoming: active.reduce((acc, curr) => acc + Object.values(curr.progress || {}).filter(p => p.status === 'scheduled').length, 0)
    };
  }, [students]);

  const analyticsData = useMemo(() => {
    const source = activeStudents;
    const progs = ['PhD', 'MSc', 'MPhil', 'PGD'].map(p => ({ label: p, value: source.filter(s => s.program === p).length, color: (PROGRAM_STRUCTURE[p] || DEFAULT_STRUCTURE).color.replace('bg-', '') }));
    const colorMap = { 'PhD': '#9333ea', 'MSc': '#3b82f6', 'MPhil': '#06b6d4', 'PGD': '#10b981' };
    const donut = progs.map(p => ({ ...p, color: colorMap[p.label] || '#ccc' }));
    const stages = [{ id: 'proposal', label: 'Proposal' }, { id: 'predata', label: 'Pre-Data' }, { id: 'postdata', label: 'Post-Data' }, { id: 'viva', label: 'Viva Voce' }];
    const pipeline = stages.map(st => ({ label: st.label, value: source.filter(s => (s.progress || {})[st.id]?.status === 'completed').length, color: 'bg-indigo-500' }));
    return { donutData: donut, pipelineData: pipeline };
  }, [activeStudents]);

  // --- ACTIONS ---
  const handleAddStudent = (e) => {
    e.preventDefault();
    if (!selectedStudent && students.some(s => s && s.regNumber === studentForm.regNumber.trim())) { alert('Reg Number exists.'); return; }
    if (selectedStudent) setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, ...studentForm } : s));
    else setStudents(prev => [...prev, { ...studentForm, id: generateId(), progress: {}, status: 'Active' }]);
    setIsStudentModalOpen(false);
    resetForms();
  };
  const handleDeleteStudent = (id) => { if(confirm('Delete student?')) setStudents(prev => prev.filter(s => s.id !== id)); };
  const handleAddStaff = (e) => {
    e.preventDefault();
    if (selectedStaff) setStaff(prev => prev.map(s => s.id === selectedStaff.id ? { ...s, ...staffForm } : s));
    else setStaff(prev => [...prev, { ...staffForm, id: generateId() }]);
    setIsStaffModalOpen(false);
  };
  const handleDeleteStaff = (id) => { if(confirm('Delete staff?')) setStaff(prev => prev.filter(s => s.id !== id)); };
  
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
    setStudents(prev => prev.map(s => s.id === selectedStudent.id ? { ...s, progress: { ...s.progress, [selectedStageId]: { ...scheduleForm } } } : s));
    setIsScheduleModalOpen(false);
  };
  
  // --- EXPORT/IMPORT ---
  const handleExportData = () => {
    const dataStr = JSON.stringify({ students, staff }, null, 2);
    const link = document.createElement('a');
    link.href = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    link.download = `mcu_backup_${new Date().toISOString().slice(0,10)}.json`;
    link.click();
  };
  const handleImportFile = (e) => {
    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const json = JSON.parse(evt.target.result);
        if(json.students || Array.isArray(json)) {
          if(confirm('Restore data?')) {
            if(json.students) { setStudents(json.students); if(json.staff) setStaff(json.staff); }
            else setStudents(json);
            alert('Success!');
          }
        }
      } catch { alert('Error parsing file.'); }
    };
    if(e.target.files[0]) reader.readAsText(e.target.files[0]);
    e.target.value = null;
  };
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
      const duplicateRegs = [];
      for(let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if(!line) continue;
        const parts = line.split(','); 
        if(parts.length < 4) continue; 
        const [name, regNumber, email, program, supervisor, coSupervisor, joinedDate] = parts;
        const cleanProgram = program?.trim();
        const cleanReg = regNumber?.trim();
        if (!PROGRAM_STRUCTURE[cleanProgram]) continue; 
        if (students.some(s => s.regNumber === cleanReg) || newStudents.some(s => s.regNumber === cleanReg)) {
          duplicateRegs.push(cleanReg);
          continue;
        }
        newStudents.push({ id: generateId(), name: name?.trim(), regNumber: cleanReg, email: email?.trim(), program: cleanProgram, supervisor: supervisor?.trim(), coSupervisor: coSupervisor?.trim(), joinedDate: joinedDate?.trim(), status: 'Active', progress: {} });
      }
      if(newStudents.length > 0) {
        if(confirm(`Found ${newStudents.length} valid new students. Import them?`)) {
          setStudents(prev => [...prev, ...newStudents]);
          alert('Import successful!');
        }
      }
    };
    reader.readAsText(file);
    e.target.value = null;
  };

  const handleAddToCalendar = () => {
    if (!scheduleForm.date || !selectedStudent) return;
    const stageLabel = (PROGRAM_STRUCTURE[selectedStudent.program] || DEFAULT_STRUCTURE).stages.find(s => s.id === selectedStageId)?.label;
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
    const stageLabel = (PROGRAM_STRUCTURE[selectedStudent.program] || DEFAULT_STRUCTURE).stages.find(s => s.id === selectedStageId)?.label;
    const subject = `Presentation Scheduled: ${selectedStudent.name} - ${stageLabel}`;
    const supervisors = [selectedStudent.supervisor, selectedStudent.coSupervisor].filter(Boolean).join(" and ");
    const body = `Dear ${supervisors},\n\nThis is to notify you that the ${stageLabel} for ${selectedStudent.name} (${selectedStudent.regNumber}) has been scheduled.\n\nDate: ${formatDate(scheduleForm.date)}\nTime: ${scheduleForm.time || 'TBA'}\nVenue: ${scheduleForm.venue || 'TBA'}\n\nPlease ensure your availability.`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const handleNotifyStudent = () => {
    if (!selectedStudent || !selectedStudent.email) { alert("Please update the student record with an email address."); return; }
    const stageLabel = (PROGRAM_STRUCTURE[selectedStudent.program] || DEFAULT_STRUCTURE).stages.find(s => s.id === selectedStageId)?.label;
    const subject = `Upcoming Presentation: ${stageLabel}`;
    const body = `Dear ${selectedStudent.name},\n\nYou have been scheduled for your ${stageLabel}.\n\nDate: ${formatDate(scheduleForm.date)}\nTime: ${scheduleForm.time || 'TBA'}\nVenue: ${scheduleForm.venue || 'TBA'}\n\nPlease arrive 30 minutes early.`;
    window.location.href = `mailto:${selectedStudent.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  const resetForms = () => {
    setStudentForm({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' });
    setScheduleForm({ date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' });
    setSelectedStudent(null);
    setSelectedStageId(null);
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

  // --- SUB-VIEWS ---
  const DashboardView = () => (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Overview</h2><FiltersBar /></div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { l: 'Active Students', v: stats.total, i: Users, c: 'bg-indigo-600', fn: () => setActiveTab('students') },
          { l: 'PhD Candidates', v: stats.phd, i: GraduationCap, c: 'bg-purple-600', fn: () => { setSelectedProgram('PhD'); setActiveTab('students'); } },
          { l: 'Alumni', v: stats.alumni, i: Archive, c: 'bg-gray-600', fn: () => setActiveTab('alumni') },
          { l: 'At Risk', v: stats.delayed, i: AlertTriangle, c: 'bg-red-500', fn: () => setActiveTab('students') }
        ].map((x, i) => (
          <div key={i} onClick={x.fn} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex justify-between cursor-pointer hover:shadow-md">
            <div><p className="text-gray-500 text-sm">{x.l}</p><h3 className="text-3xl font-bold text-gray-800">{x.v}</h3></div>
            <div className={`p-3 rounded-lg ${x.c} text-white`}><x.i size={24} /></div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><PieChart size={18} /> Program Distribution</h3>
          {analyticsData.donutData.length ? <SimpleDonutChart data={analyticsData.donutData} /> : <div className="h-32 flex items-center text-gray-400">No Data</div>}
        </div>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 md:col-span-2">
          <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2"><BarChart2 size={18} /> Academic Pipeline</h3>
          <div className="bg-gray-50 p-4 rounded-lg"><SimpleBarChart data={analyticsData.pipelineData} color="bg-indigo-500" /></div>
        </div>
      </div>
    </div>
  );

  const StudentsView = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
        <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
        <FiltersBar />
        <button onClick={() => { setSelectedStudent(null); setStudentForm({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' }); setIsStudentModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center"><Plus size={18} className="mr-2" /> Add</button>
      </div>
      <div className="grid gap-4">
        {activeStudents.map(s => {
          const struct = PROGRAM_STRUCTURE[s.program] || DEFAULT_STRUCTURE;
          const dur = getDurationStats(s.joinedDate, s.program);
          return (
            <div key={s.id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                  <div className={`h-12 w-12 rounded-lg flex items-center justify-center text-white font-bold ${struct.color}`}>{s.program}</div>
                  <div><h3 className="font-bold text-lg">{s.name}</h3><div className="text-sm text-gray-500 flex gap-2 items-center"><FileText size={14} /> {s.regNumber} • {s.supervisor} {s.coSupervisor && `& ${s.coSupervisor}`} <span className={`px-2 py-0.5 rounded-full text-xs text-white ${dur.status === 'critical' ? 'bg-red-500' : dur.status === 'warning' ? 'bg-yellow-500' : 'bg-green-500'}`}>{dur.text}</span></div></div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => { setReportStudent(s); setActiveTab('report_single'); }} className="p-2 text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"><Printer size={16} /></button>
                  <button onClick={() => { setSelectedStudent(s); setStudentForm(s); setIsStudentModalOpen(true); }} className="p-2 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50"><Edit size={16} /></button>
                  <button onClick={() => handleDeleteStudent(s.id)} className="p-2 text-red-600 border border-red-200 rounded-lg hover:bg-red-50"><Trash2 size={16} /></button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
                {struct.stages.map(st => {
                  const p = (s.progress || {})[st.id];
                  return (
                    <div key={st.id} onClick={() => { setSelectedStudent(s); setSelectedStageId(st.id); setScheduleForm(p || { date: '', time: '', venue: '', status: 'scheduled', score: '', remarks: '', docLink: '' }); setIsScheduleModalOpen(true); }} className={`p-3 rounded-lg border cursor-pointer ${p?.status === 'completed' ? 'bg-white border-green-300' : p?.status === 'scheduled' ? 'bg-white border-blue-300' : 'bg-gray-50 border-dashed'}`}>
                      <div className="flex justify-between mb-1"><span className="text-xs font-semibold">{st.label}</span>{p?.status === 'completed' ? <CheckCircle size={14} className="text-green-500"/> : p?.status === 'scheduled' ? <Clock size={14} className="text-blue-500"/> : <Plus size={14} className="text-gray-400"/>}</div>
                      {p && <div className="text-xs text-gray-500">{formatDate(p.date)}</div>}
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );

  const ReportView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 no-print">
        <h2 className="font-bold text-gray-800">Generate Report</h2>
        <div className="flex gap-2">
           <button onClick={exportToCSV} className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg"><Download size={18} className="mr-2" /> CSV</button>
           <button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-gray-800 text-white rounded-lg"><Printer size={18} className="mr-2" /> PDF</button>
        </div>
      </div>
      <div id="printable-area" className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="text-center mb-6 pb-6 border-b border-gray-800">
          <h1 className="text-3xl font-bold uppercase tracking-wide">McPherson University</h1>
          <h2 className="text-xl font-bold text-indigo-900 uppercase">College of Computing</h2>
          <h3 className="text-lg font-bold text-gray-600 mt-4 uppercase">Postgraduate Student Progress Report</h3>
          <p className="text-sm text-gray-400 mt-1">{new Date().toLocaleDateString()}</p>
        </div>
        <table className="w-full text-left text-sm">
          <thead><tr className="border-b-2 border-gray-800"><th className="p-2">Reg. No</th><th className="p-2">Name</th><th className="p-2">Program</th><th className="p-2">Supervisors</th><th className="p-2">Progress</th></tr></thead>
          <tbody>
            {filteredStudents.map(s => (
              <tr key={s.id} className="border-b border-gray-100">
                <td className="p-2 font-medium">{s.regNumber}</td>
                <td className="p-2 font-bold">{s.name}</td>
                <td className="p-2">{s.program}</td>
                <td className="p-2"><div>{s.supervisor}</div><div className="text-xs text-gray-500">{s.coSupervisor}</div></td>
                <td className="p-2 font-bold">{calculateProgress(s)}%</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const IndividualReportView = () => {
    if (!reportStudent) return null;
    const struct = PROGRAM_STRUCTURE[reportStudent.program] || DEFAULT_STRUCTURE;
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between no-print bg-white p-4 rounded-xl shadow-sm border border-gray-100"><button onClick={() => setActiveTab('students')} className="flex items-center text-gray-600"><ArrowLeft size={18} className="mr-2" /> Back</button><button onClick={() => window.print()} className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg"><Printer size={18} className="mr-2" /> Print</button></div>
        <div className="bg-white p-12 shadow-md border border-gray-200 min-h-[1000px]">
          <div className="text-center mb-10 pb-6 border-b-2 border-gray-800">
            <h1 className="text-3xl font-bold uppercase tracking-widest">McPherson University</h1>
            <h2 className="text-xl font-bold text-indigo-900 uppercase">College of Computing</h2>
            <h3 className="text-lg font-bold text-gray-700 uppercase mt-4">Individual Student Transcript</h3>
            <p className="text-sm text-gray-500">{new Date().toLocaleDateString()}</p>
          </div>
          <div className="grid grid-cols-2 gap-8 mb-8 text-sm">
            <div><p className="text-xs font-bold text-gray-500 uppercase">Name</p><p className="font-bold text-lg">{reportStudent.name}</p></div>
            <div><p className="text-xs font-bold text-gray-500 uppercase">Reg Number</p><p className="font-medium text-lg">{reportStudent.regNumber}</p></div>
            <div><p className="text-xs font-bold text-gray-500 uppercase">Program</p><p className="font-medium">Computer Science ({reportStudent.program})</p></div>
            <div><p className="text-xs font-bold text-gray-500 uppercase">Supervisors</p><p className="font-medium">{reportStudent.supervisor} {reportStudent.coSupervisor && `& ${reportStudent.coSupervisor}`}</p></div>
          </div>
          <table className="w-full text-left text-sm border-collapse mb-12">
            <thead><tr className="bg-gray-50"><th className="border p-3">Stage</th><th className="border p-3">Date</th><th className="border p-3">Status</th><th className="border p-3">Score</th><th className="border p-3">Remarks</th></tr></thead>
            <tbody>
              {struct.stages.map(st => {
                const p = (reportStudent.progress || {})[st.id];
                return (
                  <tr key={st.id}>
                    <td className="border p-3 font-medium">{st.label}</td>
                    <td className="border p-3">{p ? formatDate(p.date) : '-'}</td>
                    <td className="border p-3">{p ? <span className="uppercase font-bold text-xs">{p.status}</span> : 'PENDING'}</td>
                    <td className="border p-3 font-bold">{p?.score || '-'}</td>
                    <td className="border p-3 italic text-gray-600">{p?.remarks || '-'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
          <div className="grid grid-cols-2 gap-12 pt-8 border-t border-gray-200 mt-20">
            <div className="text-center"><div className="border-b border-gray-400 mb-2 h-16"></div><p className="font-bold">PG Coordinator</p></div>
            <div className="text-center"><div className="border-b border-gray-400 mb-2 h-16"></div><p className="font-bold">Dean, College of Computing</p></div>
          </div>
        </div>
      </div>
    )
  };

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
              <div><h3 className="font-bold text-gray-900">{s.name}</h3><p className="text-sm text-gray-500 flex items-center gap-1"><Mail size={12}/> {s.email}</p><p className="text-xs text-gray-400 mt-1">{s.department}</p></div>
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

  const AlumniView = () => (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-4">
        <div><h2 className="text-xl font-bold text-gray-800">Alumni Archive</h2><p className="text-gray-500">View graduated students or promote them to new programs.</p></div>
        <div className="flex gap-2"><div className="relative"><Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} /><input type="text" placeholder="Search alumni..." className="pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} /></div><div className="hidden md:block"><FiltersBar /></div></div>
      </div>
      <div className="grid gap-4">
        {alumniStudents.map(student => (
          <div key={student.id} className="bg-gray-50 rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-center opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-4 mb-4 md:mb-0"><div className="h-12 w-12 bg-gray-300 rounded-lg flex items-center justify-center text-gray-600"><GraduationCap size={24} /></div><div><h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">{student.name}<span className="px-2 py-0.5 bg-gray-200 text-gray-600 text-xs rounded-full">Alumni</span></h3><div className="text-sm text-gray-500">{student.program} • {student.regNumber} • Graduated: {formatDate(student.graduationDate)}</div></div></div>
            <div className="flex gap-2"><button onClick={() => handleOpenIndividualReport(student)} className="px-3 py-2 bg-white border border-gray-300 text-gray-600 rounded-lg hover:bg-gray-50 transition-all shadow-sm" title="Print Final Transcript"><Printer size={18} /></button><button onClick={() => handlePromote(student)} className="px-4 py-2 bg-white border border-indigo-200 text-indigo-700 rounded-lg hover:bg-indigo-50 hover:border-indigo-300 transition-all font-medium flex items-center shadow-sm"><UserPlus size={18} className="mr-2" /> Start New Program</button></div>
          </div>
        ))}
        {alumniStudents.length === 0 && <div className="p-8 text-center text-gray-500">No Alumni Records</div>}
      </div>
    </div>
  );

  const SettingsView = () => (
    <div className="grid gap-6 md:grid-cols-3">
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Save size={20}/> Data Backup</h3>
        <p className="text-sm text-gray-500 mb-4">Save a local copy of your database.</p>
        <button onClick={handleExportData} className="w-full py-2 bg-indigo-600 text-white rounded-lg">Download Backup</button>
        <div className="mt-4 pt-4 border-t">
          <p className="text-sm text-gray-500 mb-2">Restore from Backup:</p>
          <input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden" />
          <button onClick={handleImportClick} className="w-full py-2 border border-gray-300 rounded-lg text-gray-600">Upload File</button>
        </div>
      </div>
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Bulk Import</h3>
        <p className="text-sm text-gray-500 mb-4">Import students from CSV.</p>
        <button onClick={handleDownloadTemplate} className="text-indigo-600 text-sm mb-4 block underline">Download Template</button>
        <input type="file" ref={csvInputRef} onChange={handleBulkCSVUpload} className="hidden" />
        <button onClick={handleCSVUploadClick} className="w-full py-2 border border-emerald-600 text-emerald-600 rounded-lg">Import CSV</button>
      </div>
      {/* Security Settings */}
      <div className="bg-white p-6 rounded-xl border border-gray-100">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Lock size={20}/> Security</h3>
        <form onSubmit={handleUpdateAdminPassword}>
          <label className="text-sm text-gray-500">New Admin Password</label>
          <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-2 border rounded-lg mt-1 mb-4" />
          <button type="submit" className="w-full py-2 bg-gray-800 text-white rounded-lg">Update Password</button>
        </form>
      </div>
    </div>
  );

  // MAIN RENDER (Using if check from start of component)
  if (!currentUser) return <LoginView onLogin={setCurrentUser} verifyCredentials={verifyCredentials} />;

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <style>{`@media print { .no-print, aside, nav, .sidebar { display: none !important; } body, main { margin: 0 !important; width: 100% !important; } }`}</style>
      
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r border-gray-200 z-30 no-print flex flex-col">
        <div className="p-6 border-b flex items-center gap-3"><div className="bg-indigo-600 p-2 rounded-lg text-white"><GraduationCap size={24}/></div><h1 className="font-bold text-gray-900">McU Postgrad</h1></div>
        <nav className="flex-1 p-4 space-y-2">
          {[{id:'dashboard', l:'Dashboard', i:LayoutDashboard}, {id:'students', l:'Students', i:Users}, {id:'staff', l:'Staff', i:Shield}, {id:'alumni', l:'Alumni', i:Archive}, {id:'reports', l:'Reports', i:FileText}, {id:'settings', l:'Settings', i:Settings}].map(m => (
            (!['staff', 'alumni', 'reports', 'settings'].includes(m.id) || currentUser.role === 'admin') && 
            <button key={m.id} onClick={() => setActiveTab(m.id)} className={`w-full flex items-center px-4 py-3 rounded-xl transition-all ${activeTab === m.id ? 'bg-indigo-50 text-indigo-700 font-semibold' : 'text-gray-500 hover:bg-gray-50'}`}><m.i size={20} className="mr-3"/> {m.l}</button>
          ))}
        </nav>
        <div className="p-4 border-t"><button onClick={handleLogout} className="w-full flex items-center justify-center px-4 py-2 bg-red-50 text-red-600 rounded-lg mb-4 font-medium text-sm"><LogOut size={16} className="mr-2"/> Sign Out</button><div className="bg-indigo-900 rounded-xl p-4 text-white"><p className="text-xs text-indigo-200 font-semibold">User</p><p className="truncate">{currentUser.name}</p></div></div>
      </div>
      <main className="md:ml-64 min-h-screen p-8">
        {activeTab === 'dashboard' && <DashboardView />}
        {activeTab === 'students' && <StudentsView />}
        {activeTab === 'staff' && <StaffView />}
        {activeTab === 'alumni' && <AlumniView />}
        {activeTab === 'reports' && <ReportView />}
        {activeTab === 'settings' && <SettingsView />}
        {activeTab === 'report_single' && <IndividualReportView />}
        {activeTab === 'individual_report' && <IndividualReportView />}
      </main>
      
      {/* Student Modal */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">{selectedStudent ? 'Edit Student' : 'Add New Student'}</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <input required placeholder="Full Name" className="p-2 border rounded" value={studentForm.name} onChange={e => setStudentForm({...studentForm, name: e.target.value})} />
                <input required placeholder="Reg Number" className="p-2 border rounded" value={studentForm.regNumber} onChange={e => setStudentForm({...studentForm, regNumber: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <select className="p-2 border rounded" value={studentForm.program} onChange={e => setStudentForm({...studentForm, program: e.target.value})}>{Object.keys(PROGRAM_STRUCTURE).map(k => <option key={k} value={k}>{k}</option>)}</select>
                <input type="date" className="p-2 border rounded" value={studentForm.joinedDate} onChange={e => setStudentForm({...studentForm, joinedDate: e.target.value})} />
              </div>
              <input type="email" placeholder="Email" className="p-2 border rounded w-full" value={studentForm.email} onChange={e => setStudentForm({...studentForm, email: e.target.value})} />
              <div className="grid grid-cols-2 gap-4">
                <select className="p-2 border rounded" value={studentForm.supervisor} onChange={e => setStudentForm({...studentForm, supervisor: e.target.value})}><option value="">Select Supervisor</option>{uniqueSupervisors.filter(x => x !== 'All Supervisors').map(s => <option key={s} value={s}>{s}</option>)}</select>
                <select className="p-2 border rounded" value={studentForm.coSupervisor} onChange={e => setStudentForm({...studentForm, coSupervisor: e.target.value})}><option value="">Select Co-Supervisor</option>{uniqueSupervisors.filter(x => x !== 'All Supervisors').map(s => <option key={s} value={s}>{s}</option>)}</select>
              </div>
              <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setIsStudentModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Modal */}
      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="text-lg font-bold mb-4">Manage Presentation</h3>
            <form onSubmit={handleScheduleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <select className="p-2 border rounded" value={scheduleForm.status} onChange={e => setScheduleForm({...scheduleForm, status: e.target.value})}><option value="scheduled">Scheduled</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select>
                <input placeholder="Venue" className="p-2 border rounded" value={scheduleForm.venue} onChange={e => setScheduleForm({...scheduleForm, venue: e.target.value})} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <input type="date" required className="p-2 border rounded" value={scheduleForm.date} onChange={e => setScheduleForm({...scheduleForm, date: e.target.value})} />
                <input type="time" className="p-2 border rounded" value={scheduleForm.time} onChange={e => setScheduleForm({...scheduleForm, time: e.target.value})} />
              </div>
              <div><input placeholder="Doc Link" className="w-full p-2 border rounded" value={scheduleForm.docLink} onChange={e => setScheduleForm({...scheduleForm, docLink: e.target.value})} /></div>
              {scheduleForm.status === 'completed' && (
                <>
                  <input placeholder="Score" className="w-full p-2 border rounded" value={scheduleForm.score} onChange={e => setScheduleForm({...scheduleForm, score: e.target.value})} />
                  <textarea placeholder="Remarks" className="w-full p-2 border rounded" value={scheduleForm.remarks} onChange={e => setScheduleForm({...scheduleForm, remarks: e.target.value})} />
                </>
              )}
              <div className="flex justify-between mt-4">
                {selectedStudent && selectedStageId === (PROGRAM_STRUCTURE[selectedStudent.program]?.stages[PROGRAM_STRUCTURE[selectedStudent.program]?.stages.length - 1] || {}).id && scheduleForm.status === 'completed' ? <button type="button" onClick={() => handleGraduate(selectedStudent)} className="px-4 py-2 bg-emerald-600 text-white rounded">Graduate Student</button> : <div />}
                <div className="flex gap-2"><button type="button" onClick={() => setIsScheduleModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
              </div>
            </form>
          </div>
        </div>
      )}

       {/* Staff Modal */}
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold mb-4">{selectedStaff ? 'Edit Staff' : 'Add Staff'}</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
              <input required placeholder="Name" className="w-full p-2 border rounded" value={staffForm.name} onChange={e => setStaffForm({...staffForm, name: e.target.value})} />
              <input required type="email" placeholder="Email" className="w-full p-2 border rounded" value={staffForm.email} onChange={e => setStaffForm({...staffForm, email: e.target.value})} />
              <input required placeholder="Department" className="w-full p-2 border rounded" value={staffForm.department} onChange={e => setStaffForm({...staffForm, department: e.target.value})} />
              <input required placeholder="Password" className="w-full p-2 border rounded" value={staffForm.password} onChange={e => setStaffForm({...staffForm, password: e.target.value})} />
              <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={() => setIsStaffModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
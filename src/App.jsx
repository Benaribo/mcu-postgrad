import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  LayoutDashboard, Users, Calendar, FileText, Plus, Search, ChevronRight, CheckCircle, Clock, 
  AlertCircle, Download, Printer, X, Edit, Trash2, GraduationCap, Mail, Settings, Save, Upload, 
  ExternalLink, Bell, Link, BarChart2, PieChart, Filter, UserCheck, Clock3, Archive, UserPlus, 
  ArrowLeft, AlertTriangle, Lock, LogOut, Key, Shield, Briefcase
} from 'lucide-react';

// --- CONFIGURATION ---
const PROGRAM_STRUCTURE = {
  PGD: { label: "Post Graduate Diploma (PGD)", stages: [{ id: 'final', label: 'Final Project Defense' }], color: 'bg-emerald-500', maxMonths: 18 },
  MSc: { label: "Master of Science (MSc)", stages: [{ id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }], color: 'bg-blue-500', maxMonths: 24 },
  MPhil: { label: "Master of Philosophy (MPhil)", stages: [{ id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }], color: 'bg-cyan-500', maxMonths: 24 },
  PhD: { label: "Doctor of Philosophy (PhD)", stages: [{ id: 'proposal', label: 'Proposal Defense' }, { id: 'predata', label: 'Pre-Data Seminar' }, { id: 'postdata', label: 'Post-Data Seminar' }, { id: 'viva', label: 'Viva Voce' }], color: 'bg-purple-600', maxMonths: 48 }
};
const DEFAULT_STRUCTURE = { label: "Unknown", stages: [], color: 'bg-gray-500', maxMonths: 24 };

const INITIAL_STUDENTS = [
  { id: '1', name: 'John Doe', regNumber: 'PG/2023/001', email: 'john@mcu.edu.ng', program: 'PhD', supervisor: 'Dr. A. Smith', coSupervisor: 'Prof. K. Mensah', status: 'Active', joinedDate: '2023-01-15', progress: { proposal: { status: 'completed', date: '2023-06-10', score: 'A', remarks: 'Excellent', docLink: '' }, predata: { status: 'scheduled', date: '2024-03-20', venue: 'Hall 3' } } }
];
const INITIAL_STAFF = [
  { id: 's1', name: 'Dr. A. Smith', email: 'smith@mcu.edu.ng', department: 'Computer Science', password: 'staff' }
];

// --- HELPERS ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (d) => { try { return d ? new Date(d).toLocaleDateString('en-GB') : '-'; } catch { return '-'; } };
const getDuration = (d) => { try { const diff = Math.abs(new Date() - new Date(d)); return `${(diff / (1000 * 60 * 60 * 24 * 365)).toFixed(1)} yrs`; } catch { return ''; } };
const getDurationStats = (d, p) => {
  if (!d) return { text: '', status: 'neutral' };
  try {
    const diff = (new Date() - new Date(d)) / (1000 * 60 * 60 * 24 * 30.44);
    const limit = (PROGRAM_STRUCTURE[p] || DEFAULT_STRUCTURE).maxMonths;
    return { text: `${(diff/12).toFixed(1)} yrs`, status: diff > limit ? 'critical' : diff > limit-6 ? 'warning' : 'good' };
  } catch { return { text: '', status: 'neutral' }; }
};
const calculateProgress = (s) => {
  if(!s) return 0;
  const stages = (PROGRAM_STRUCTURE[s.program] || DEFAULT_STRUCTURE).stages;
  if(!stages.length) return 0;
  const completed = stages.filter(st => s.progress?.[st.id]?.status === 'completed').length;
  return Math.round((completed / stages.length) * 100);
};

// --- CHART COMPONENTS ---
const SimpleBarChart = ({ data, color }) => {
  const max = Math.max(...data.map(d => d.value), 1);
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
  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;
  let currentAngle = 0;
  const segments = data.map(d => {
    const degree = (d.value / total) * 360;
    const segment = `${d.color} ${currentAngle}deg ${currentAngle + degree}deg`;
    currentAngle += degree;
    return segment;
  });
  return (
    <div className="relative w-32 h-32 rounded-full mx-auto" style={{ background: `conic-gradient(${segments.join(', ')})` }}>
      <div className="absolute inset-4 bg-white rounded-full flex items-center justify-center flex-col"><span className="text-xl font-bold text-gray-800">{total}</span><span className="text-[10px] text-gray-400 uppercase">Students</span></div>
    </div>
  );
};

// --- LOGIN COMPONENT ---
const LoginView = ({ onLogin, verify }) => {
  const [u, setU] = useState(''); const [p, setP] = useState(''); const [err, setErr] = useState('');
  const handleReset = () => { if(confirm('Reset Admin password?')) { localStorage.removeItem('pg_auth_config'); window.location.reload(); }};
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4 font-sans">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-indigo-900 p-8 text-center text-white"><GraduationCap size={40} className="mx-auto mb-2"/><h1 className="text-2xl font-bold">McPherson University</h1><p>Postgraduate Portal</p></div>
        <div className="p-8">
          <form onSubmit={(e) => { e.preventDefault(); const user = verify(u, p); user ? onLogin(user) : setErr('Invalid credentials'); }}>
            <div className="mb-4"><label className="block text-sm font-bold mb-1">Username/Email</label><input className="w-full p-2 border rounded" value={u} onChange={e=>setU(e.target.value)} required/></div>
            <div className="mb-6"><label className="block text-sm font-bold mb-1">Password</label><input type="password" className="w-full p-2 border rounded" value={p} onChange={e=>setP(e.target.value)} required/></div>
            {err && <p className="text-red-500 text-sm mb-4">{err}</p>}
            <button className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700">Login</button>
          </form>
          <button onClick={handleReset} className="block w-full text-center text-xs text-indigo-500 mt-4 underline">Reset Admin Password</button>
        </div>
      </div>
    </div>
  );
};

/**
 * MAIN APP COMPONENT
 */
export default function App() {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(sessionStorage.getItem('pg_current_user')));
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('pg_students')) || INITIAL_STUDENTS);
  const [staff, setStaff] = useState(() => JSON.parse(localStorage.getItem('pg_staff')) || INITIAL_STAFF);
  const [adminConfig, setAdminConfig] = useState(() => JSON.parse(localStorage.getItem('pg_auth_config')) || { username: 'admin', password: 'password123' });
  
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
  
  const [studentForm, setStudentForm] = useState({});
  const [staffForm, setStaffForm] = useState({});
  const [scheduleForm, setScheduleForm] = useState({});
  const [newPassword, setNewPassword] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  useEffect(() => { localStorage.setItem('pg_students', JSON.stringify(students)) }, [students]);
  useEffect(() => { localStorage.setItem('pg_staff', JSON.stringify(staff)) }, [staff]);
  useEffect(() => { sessionStorage.setItem('pg_current_user', JSON.stringify(currentUser)) }, [currentUser]);

  // --- LOGIC ---
  const verifyCredentials = (u, p) => {
    if (u === adminConfig.username && p === adminConfig.password) return { name: 'Administrator', role: 'admin' };
    const s = staff.find(st => st.email === u && st.password === p);
    return s ? { name: s.name, role: 'staff', email: s.email } : null;
  };

  const handleUpdatePassword = (e) => { e.preventDefault(); setAdminConfig(prev => ({...prev, password: newPassword})); alert('Password Updated'); localStorage.setItem('pg_auth_config', JSON.stringify({...adminConfig, password: newPassword})); };
  const handleBackup = () => { const a = document.createElement('a'); a.href = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({students, staff})); a.download = 'backup.json'; a.click(); };
  const handleRestore = (e) => { const r = new FileReader(); r.onload = (ev) => { const d = JSON.parse(ev.target.result); if(confirm('Restore?')) { setStudents(d.students || []); setStaff(d.staff || []); }}; if(e.target.files[0]) r.readAsText(e.target.files[0]); };
  
  const uniqueSupervisors = useMemo(() => {
    const sups = new Set(staff.map(s => s.name));
    students.forEach(s => { if(s.supervisor) sups.add(s.supervisor); });
    return ['All Supervisors', ...Array.from(sups).sort()];
  }, [staff, students]);

  const filteredStudents = useMemo(() => students.filter(s => {
    const matchesSearch = (s.name+s.regNumber).toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = currentUser?.role === 'staff' ? (s.supervisor === currentUser.name || s.coSupervisor === currentUser.name) : (selectedSupervisor === 'All Supervisors' || s.supervisor === selectedSupervisor || s.coSupervisor === selectedSupervisor);
    const matchesProgram = selectedProgram === 'All Programs' || s.program === selectedProgram;
    return matchesSearch && matchesRole && matchesProgram;
  }), [students, searchTerm, selectedSupervisor, selectedProgram, currentUser]);

  const activeStudents = filteredStudents.filter(s => s.status !== 'Alumni');
  const alumniStudents = filteredStudents.filter(s => s.status === 'Alumni');

  const stats = {
    total: activeStudents.length,
    phd: activeStudents.filter(s => s.program === 'PhD').length,
    alumni: students.filter(s => s.status === 'Alumni').length,
    delayed: activeStudents.filter(s => getDurationStats(s.joinedDate, s.program).status === 'critical').length
  };

  const analytics = {
    donutData: ['PhD','MSc','MPhil','PGD'].map(p => ({ label: p, value: activeStudents.filter(s => s.program === p).length, color: PROGRAM_STRUCTURE[p].color.replace('bg-','') })),
    pipelineData: [{id:'proposal',label:'Proposal'},{id:'viva',label:'Viva'}].map(st => ({ label: st.label, value: activeStudents.filter(s => s.progress?.[st.id]?.status === 'completed').length, color: 'bg-indigo-500' }))
  };

  // --- ACTIONS ---
  const handleAddStudent = (e) => {
    e.preventDefault();
    if(selectedStudent) setStudents(prev => prev.map(s => s.id === selectedStudent.id ? {...s, ...studentForm} : s));
    else setStudents(prev => [...prev, { ...studentForm, id: generateId(), progress: {}, status: 'Active' }]);
    setIsStudentModalOpen(false);
  };
  const handleAddStaff = (e) => {
    e.preventDefault();
    if(selectedStaff) setStaff(prev => prev.map(s => s.id === selectedStaff.id ? {...s, ...staffForm} : s));
    else setStaff(prev => [...prev, { ...staffForm, id: generateId() }]);
    setIsStaffModalOpen(false);
  };
  const handleDeleteStudent = (id) => { if(confirm('Delete?')) setStudents(prev => prev.filter(s => s.id !== id)); };
  const handleDeleteStaff = (id) => { if(confirm('Delete?')) setStaff(prev => prev.filter(s => s.id !== id)); };
  const handleGraduate = (s) => { if(confirm('Graduate?')) { setStudents(prev => prev.map(x => x.id === s.id ? {...x, status: 'Alumni', graduationDate: new Date().toISOString()} : x)); setIsScheduleModalOpen(false); }};
  const handlePromote = (s) => { setSelectedStudent(null); setStudentForm({name:s.name, regNumber:'', email:s.email, program:'MSc', joinedDate: new Date().toISOString().split('T')[0]}); setIsStudentModalOpen(true); };
  const handleScheduleSave = (e) => { e.preventDefault(); setStudents(prev => prev.map(s => s.id === selectedStudent.id ? {...s, progress: {...s.progress, [selectedStageId]: scheduleForm}} : s)); setIsScheduleModalOpen(false); };
  const exportToCSV = () => {
    const rows = [["Name","Reg","Program","Status","Progress"]];
    (activeTab === 'alumni' ? alumniStudents : activeStudents).forEach(s => rows.push([s.name, s.regNumber, s.program, s.status, calculateProgress(s)+'%']));
    const csvContent = "data:text/csv;charset=utf-8," + rows.map(e => e.join(",")).join("\n");
    const link = document.createElement("a"); link.href = encodeURI(csvContent); link.download = "report.csv"; link.click();
  };

  // --- VIEWS ---
  if (!currentUser) return <LoginView onLogin={setCurrentUser} verify={verifyCredentials} />;

  const FiltersBarComponent = () => (
    <div className="flex gap-2">
      <select value={selectedSupervisor} onChange={e=>setSelectedSupervisor(e.target.value)} className="border rounded px-2 py-1 text-sm"><option>All Supervisors</option>{uniqueSupervisors.filter(x=>x!=='All Supervisors').map(x=><option key={x}>{x}</option>)}</select>
      <select value={selectedProgram} onChange={e=>setSelectedProgram(e.target.value)} className="border rounded px-2 py-1 text-sm"><option>All Programs</option>{Object.keys(PROGRAM_STRUCTURE).map(p=><option key={p}>{p}</option>)}</select>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans">
      <style>{`@media print { .no-print, aside, nav, .sidebar { display: none !important; } body, main { margin: 0 !important; width: 100% !important; } #printable-area { display: block !important; visibility: visible !important; } body * { visibility: hidden; } #printable-area * { visibility: visible; } #printable-area { position: absolute; left: 0; top: 0; width: 100%; } }`}</style>
      <div className="fixed inset-y-0 left-0 w-64 bg-white border-r no-print">
        <div className="p-6 border-b font-bold text-xl flex items-center gap-2"><GraduationCap className="text-indigo-600"/> McU Postgrad</div>
        <nav className="p-4 space-y-2">
          {['dashboard', 'students', 'staff', 'alumni', 'reports', 'settings'].map(t => (
            (!['staff', 'alumni', 'reports', 'settings'].includes(t) || currentUser.role === 'admin') && 
            <button key={t} onClick={() => setActiveTab(t)} className={`w-full text-left p-3 rounded capitalize ${activeTab === t ? 'bg-indigo-50 text-indigo-700' : 'text-gray-600'}`}>{t}</button>
          ))}
        </nav>
        <div className="p-4 border-t"><button onClick={() => setCurrentUser(null)} className="flex items-center text-red-600"><LogOut size={16} className="mr-2"/> Sign Out</button></div>
      </div>
      <main className="md:ml-64 p-8 min-h-screen">
        
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-in fade-in">
            <div className="flex justify-between items-center"><h2 className="text-xl font-bold">Overview</h2><FiltersBarComponent/></div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[{l:'Active',v:stats.total,c:'bg-indigo-600',fn:()=>setActiveTab('students')},{l:'PhD',v:stats.phd,c:'bg-purple-600',fn:()=>{setSelectedProgram('PhD');setActiveTab('students')}},{l:'Alumni',v:stats.alumni,c:'bg-gray-600',fn:()=>setActiveTab('alumni')},{l:'At Risk',v:stats.delayed,c:'bg-red-500',fn:()=>setActiveTab('students')}].map((x,i)=>(<div key={i} onClick={x.fn} className="bg-white p-6 rounded-xl border cursor-pointer hover:shadow-md"><div><p className="text-gray-500">{x.l}</p><h3 className="text-3xl font-bold">{x.v}</h3></div><div className={`h-2 mt-4 rounded ${x.c}`}></div></div>))}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white p-6 rounded-xl border text-center"><h3 className="font-bold mb-4">Distribution</h3><SimpleDonutChart data={analytics.donutData}/></div>
               <div className="bg-white p-6 rounded-xl border md:col-span-2"><h3 className="font-bold mb-4">Pipeline</h3><SimpleBarChart data={analytics.pipelineData} color="bg-indigo-500"/></div>
            </div>
          </div>
        )}

        {/* STUDENTS / ALUMNI */}
        {(activeTab === 'students' || activeTab === 'alumni') && (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
              <div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-gray-400" size={18} /><input className="w-full pl-10 pr-4 py-2 border rounded-lg" placeholder="Search..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} /></div>
              <FiltersBarComponent />
              {activeTab === 'students' && <button onClick={() => { setSelectedStudent(null); setStudentForm({ name: '', regNumber: '', email: '', program: 'PhD', supervisor: '', coSupervisor: '', joinedDate: '' }); setIsStudentModalOpen(true); }} className="px-4 py-2 bg-indigo-600 text-white rounded-lg flex items-center"><Plus size={18} className="mr-2" /> Add</button>}
            </div>
            <div className="grid gap-4">
              {(activeTab === 'students' ? activeStudents : alumniStudents).map(s => (
                <div key={s.id} className="bg-white p-6 rounded-xl border shadow-sm">
                  <div className="flex justify-between mb-4">
                    <div><h3 className="font-bold text-lg">{s.name}</h3><p className="text-sm text-gray-500">{s.program} • {s.regNumber}</p></div>
                    <div className="flex gap-2">
                      <button onClick={() => { setReportStudent(s); setActiveTab('report_single'); }} className="p-2 border rounded text-indigo-600"><Printer size={16}/></button>
                      {activeTab === 'students' ? <button onClick={()=>{setSelectedStudent(s); setStudentForm(s); setIsStudentModalOpen(true)}} className="p-2 border rounded text-gray-600"><Edit size={16}/></button> : <button onClick={()=>handlePromote(s)} className="px-3 py-1 border rounded text-sm">Promote</button>}
                      <button onClick={() => handleDeleteStudent(s.id)} className="p-2 border rounded text-red-600"><Trash2 size={16}/></button>
                    </div>
                  </div>
                  {activeTab === 'students' && <div className="grid grid-cols-4 gap-2">{(PROGRAM_STRUCTURE[s.program]||DEFAULT_STRUCTURE).stages.map(st=>(<div key={st.id} onClick={()=>{setSelectedStudent(s); setSelectedStageId(st.id); setScheduleForm(s.progress?.[st.id]||{}); setIsScheduleModalOpen(true)}} className={`p-2 border rounded cursor-pointer text-xs ${s.progress?.[st.id]?.status==='completed'?'bg-green-50 border-green-200':s.progress?.[st.id]?.status==='scheduled'?'bg-blue-50 border-blue-200':''}`}>{st.label}</div>))}</div>}
                </div>
              ))}
              {activeStudents.length === 0 && activeTab === 'students' && <div className="text-center p-8 text-gray-500">No students found</div>}
            </div>
          </div>
        )}

        {/* STAFF */}
        {activeTab === 'staff' && (
          <div className="space-y-4">
            <div className="flex justify-between bg-white p-4 rounded-xl border"><h2 className="font-bold">Staff</h2><button onClick={()=>{setSelectedStaff(null); setStaffForm({}); setIsStaffModalOpen(true)}} className="px-4 py-2 bg-indigo-600 text-white rounded">Add Staff</button></div>
            <div className="grid md:grid-cols-2 gap-4">{staff.map(s=>(<div key={s.id} className="bg-white p-4 rounded-xl border flex justify-between"><div><h3 className="font-bold">{s.name}</h3><p className="text-sm text-gray-500">{s.email}</p></div><div className="flex gap-2"><button onClick={()=>{setSelectedStaff(s); setStaffForm(s); setIsStaffModalOpen(true)}} className="p-2 border rounded"><Edit size={16}/></button><button onClick={()=>handleDeleteStaff(s.id)} className="p-2 border rounded text-red-600"><Trash2 size={16}/></button></div></div>))}</div>
          </div>
        )}

        {/* REPORTS */}
        {activeTab === 'reports' && (
          <div className="space-y-6">
            <div className="flex justify-between bg-white p-4 rounded-xl border no-print">
              <div><h2 className="font-bold">Reports</h2><FiltersBarComponent/></div>
              <div className="flex gap-2"><button onClick={exportToCSV} className="px-4 py-2 bg-green-600 text-white rounded">CSV</button><button onClick={()=>window.print()} className="px-4 py-2 bg-gray-800 text-white rounded">PDF</button></div>
            </div>
            <div id="printable-area" className="bg-white p-8 rounded-xl border">
               <div className="text-center mb-6 pb-6 border-b"><h1 className="text-2xl font-bold">McPherson University</h1><h2 className="text-xl">College of Computing</h2><p>Postgraduate Report</p></div>
               <table className="w-full text-left text-sm"><thead><tr className="border-b"><th>Reg</th><th>Name</th><th>Program</th><th>Progress</th></tr></thead><tbody>{filteredStudents.map(s=><tr key={s.id} className="border-b"><td className="p-2">{s.regNumber}</td><td className="p-2">{s.name}</td><td className="p-2">{s.program}</td><td className="p-2">{calculateProgress(s)}%</td></tr>)}</tbody></table>
            </div>
          </div>
        )}

        {/* SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid gap-6 md:grid-cols-3">
             <div className="bg-white p-6 rounded-xl border"><h3>Backup</h3><button onClick={handleExportData} className="w-full py-2 bg-indigo-600 text-white rounded mt-4">Download</button></div>
             <div className="bg-white p-6 rounded-xl border"><h3>Restore</h3><input type="file" ref={fileInputRef} onChange={handleImportFile} className="hidden"/><button onClick={()=>fileInputRef.current.click()} className="w-full py-2 border rounded mt-4">Upload File</button></div>
             <div className="bg-white p-6 rounded-xl border"><h3>Security</h3><form onSubmit={handleUpdatePassword} className="mt-4"><input type="password" placeholder="New Password" className="w-full p-2 border rounded mb-2" value={newPassword} onChange={e=>setNewPassword(e.target.value)}/><button className="w-full py-2 bg-gray-800 text-white rounded">Update</button></form></div>
          </div>
        )}

        {/* SINGLE REPORT */}
        {activeTab === 'report_single' && reportStudent && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between no-print bg-white p-4 rounded-xl border"><button onClick={()=>setActiveTab('students')} className="flex items-center"><ArrowLeft size={16}/> Back</button><button onClick={()=>window.print()} className="bg-indigo-600 text-white px-4 py-2 rounded">Print</button></div>
            <div id="printable-area" className="bg-white p-12 border min-h-[800px]">
              <div className="text-center mb-10 border-b pb-6"><h1 className="text-3xl font-bold">McPherson University</h1><h2 className="text-xl">College of Computing</h2><h3>Individual Transcript</h3></div>
              <div className="grid grid-cols-2 gap-8 mb-8"><div><p className="text-xs font-bold text-gray-500">Name</p><p className="text-lg">{reportStudent.name}</p></div><div><p className="text-xs font-bold text-gray-500">Program</p><p className="text-lg">{reportStudent.program}</p></div></div>
              <table className="w-full text-left text-sm border-collapse">
                <thead><tr className="bg-gray-50"><th className="border p-3">Stage</th><th className="border p-3">Date</th><th className="border p-3">Status</th></tr></thead>
                <tbody>{(PROGRAM_STRUCTURE[reportStudent.program]||DEFAULT_STRUCTURE).stages.map(st=>{ const p = reportStudent.progress?.[st.id]; return <tr key={st.id}><td className="border p-3">{st.label}</td><td className="border p-3">{formatDate(p?.date)}</td><td className="border p-3">{p?.status||'Pending'}</td></tr>})}</tbody>
              </table>
            </div>
          </div>
        )}

      </main>

      {/* MODALS */}
      {isStudentModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">{selectedStudent?'Edit':'Add'} Student</h3>
            <form onSubmit={handleAddStudent} className="space-y-4">
              <input required placeholder="Name" className="w-full p-2 border rounded" value={studentForm.name || ''} onChange={e=>setStudentForm({...studentForm, name:e.target.value})} />
              <input required placeholder="Reg Number" className="w-full p-2 border rounded" value={studentForm.regNumber || ''} onChange={e=>setStudentForm({...studentForm, regNumber:e.target.value})} />
              <select className="w-full p-2 border rounded" value={studentForm.program || 'PhD'} onChange={e=>setStudentForm({...studentForm, program:e.target.value})}>{Object.keys(PROGRAM_STRUCTURE).map(k=><option key={k}>{k}</option>)}</select>
              <div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsStudentModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}
      
      {isStaffModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl w-full max-w-md p-6">
            <h3 className="font-bold text-lg mb-4">{selectedStaff?'Edit':'Add'} Staff</h3>
            <form onSubmit={handleAddStaff} className="space-y-4">
               <input required placeholder="Name" className="w-full p-2 border rounded" value={staffForm.name || ''} onChange={e=>setStaffForm({...staffForm, name:e.target.value})} />
               <input required placeholder="Email" className="w-full p-2 border rounded" value={staffForm.email || ''} onChange={e=>setStaffForm({...staffForm, email:e.target.value})} />
               <div className="flex justify-end gap-2"><button type="button" onClick={()=>setIsStaffModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}

      {isScheduleModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 no-print">
          <div className="bg-white rounded-xl w-full max-w-lg p-6">
            <h3 className="font-bold text-lg mb-4">Manage Presentation</h3>
            <form onSubmit={handleScheduleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                 <select className="p-2 border rounded" value={scheduleForm.status || 'scheduled'} onChange={e=>setScheduleForm({...scheduleForm, status:e.target.value})}><option value="scheduled">Scheduled</option><option value="completed">Completed</option></select>
                 <input type="date" className="p-2 border rounded" value={scheduleForm.date || ''} onChange={e=>setScheduleForm({...scheduleForm, date:e.target.value})} />
              </div>
              <div className="flex gap-2">
                 <button type="button" className="flex-1 py-2 border rounded flex items-center justify-center gap-2" onClick={()=>{/* Logic handled in full version */}}><Mail size={16}/> Email</button>
                 <button type="button" className="flex-1 py-2 border rounded flex items-center justify-center gap-2" onClick={()=>{/* Logic handled in full version */}}><Calendar size={16}/> Calendar</button>
              </div>
              <div className="flex justify-end gap-2 mt-4"><button type="button" onClick={()=>setIsScheduleModalOpen(false)} className="px-4 py-2 text-gray-600">Cancel</button><button className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button></div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}